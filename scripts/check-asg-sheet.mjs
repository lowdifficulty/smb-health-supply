/**
 * Daily ASG Google Sheet change detector.
 *
 * Usage:
 *   node scripts/check-asg-sheet.mjs
 *   node scripts/check-asg-sheet.mjs --save-baseline   # reset snapshot without alerting
 *   node scripts/check-asg-sheet.mjs --regenerate      # also run generate-asg-data after changes
 *
 * Requires Google service account with Viewer access to the sheet.
 * Run: node scripts/setup-asg-google-access.mjs
 */
import fs from 'fs'
import path from 'path'
import XLSX from 'xlsx'
import { ASG_GOOGLE_SHEET_URL } from './lib/asg-sheet-config.mjs'
import { fetchAsgSheetXlsx } from './lib/fetch-asg-google-sheet.mjs'
import { buildSnapshot, parseAsgWorkbook } from './lib/asg-parse.mjs'
import { diffSnapshots, formatDiffReport } from './lib/asg-diff.mjs'

const MONITOR_DIR = path.join('data', 'asg-monitor')
const SNAPSHOT_PATH = path.join(MONITOR_DIR, 'snapshot.json')
const REPORT_PATH = path.join(MONITOR_DIR, 'last-report.json')
const CACHE_XLSX = path.join(MONITOR_DIR, 'latest.xlsx')

const args = new Set(process.argv.slice(2))
const saveBaseline = args.has('--save-baseline')
const regenerate = args.has('--regenerate')

async function maybeSendEmail(subject, body) {
  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.ASG_NOTIFY_EMAIL || process.env.IVR_NOTIFY_EMAIL
  if (!apiKey || !to) return false

  const { Resend } = await import('resend')
  const from =
    process.env.IVR_EMAIL_FROM || 'SMB Health Supply <notifications@smbhealthsupply.com>'

  const resend = new Resend(apiKey)
  await resend.emails.send({
    from,
    to: [to],
    subject,
    text: body,
    html: `<pre style="font-family:system-ui,sans-serif;font-size:14px;line-height:1.5">${body.replace(/</g, '&lt;')}</pre>`,
  })
  return true
}

function loadPreviousSnapshot() {
  if (!fs.existsSync(SNAPSHOT_PATH)) return null
  return JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf8'))
}

async function main() {
  console.log(`Fetching ASG sheet from Google…\n${ASG_GOOGLE_SHEET_URL}\n`)

  const xlsxBuffer = await fetchAsgSheetXlsx()
  fs.mkdirSync(MONITOR_DIR, { recursive: true })
  fs.writeFileSync(CACHE_XLSX, xlsxBuffer)

  const wb = XLSX.read(xlsxBuffer, { type: 'buffer', cellStyles: true })
  const { claims } = parseAsgWorkbook(wb, XLSX)
  const snapshot = buildSnapshot(claims, {
    source: 'google-sheets',
    sheetUrl: ASG_GOOGLE_SHEET_URL,
  })

  const previous = saveBaseline ? null : loadPreviousSnapshot()
  const diff = diffSnapshots(previous, snapshot)
  const reportText = formatDiffReport(diff)

  const report = {
    checkedAt: new Date().toISOString(),
    sheetUrl: ASG_GOOGLE_SHEET_URL,
    totals: snapshot.totals,
    diff,
    reportText,
  }

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2))
  fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2))

  console.log(reportText)
  console.log('')
  console.log(`Snapshot: ${SNAPSHOT_PATH}`)
  console.log(`Cached xlsx: ${CACHE_XLSX}`)

  if (!saveBaseline && diff.hasChanges) {
    const emailed = await maybeSendEmail(
      `ASG sheet updated — ${diff.summary}`,
      `${reportText}\n\nSheet: ${ASG_GOOGLE_SHEET_URL}`,
    )
    if (emailed) console.log('Email notification sent.')
    else console.log('No email sent (set RESEND_API_KEY and ASG_NOTIFY_EMAIL).')

    if (regenerate) {
      console.log('Regenerating asgData.json from cached sheet…')
      const { execSync } = await import('child_process')
      process.env.ASG_XLSX_PATH = path.resolve(CACHE_XLSX)
      execSync('node scripts/generate-asg-data.mjs', { stdio: 'inherit', env: process.env })
    }

    process.exitCode = 2
  } else if (saveBaseline) {
    console.log('Baseline snapshot saved.')
  } else {
    console.log('Sheet matches last snapshot.')
  }
}

main().catch((err) => {
  console.error('ASG sheet check failed:', err.message || err)
  if (err.message?.includes('Google service account')) {
    console.error('\nRun: node scripts/setup-asg-google-access.mjs')
  }
  process.exit(1)
})
