import { Resend } from 'resend'
import {
  ASG_GOOGLE_SHEET_URL,
  REDIS_LAST_REPORT_KEY,
  REDIS_LIVE_DATA_KEY,
  REDIS_SNAPSHOT_KEY,
} from './config.js'
import { buildAsgLiveData } from './buildAsgData.js'
import { diffSnapshots, formatDiffReport, type AsgDiffResult } from './diff.js'
import { fetchAsgSheetXlsx } from './fetchGoogle.js'
import { buildSnapshot, parseAsgWorkbook, type AsgSnapshot } from './parse.js'
import { Redis } from '@upstash/redis'
import XLSX from 'xlsx'

export interface CheckReport {
  checkedAt: string
  sheetUrl: string
  totals: AsgSnapshot['totals']
  diff: AsgDiffResult
  reportText: string
  liveDataUpdated: boolean
}

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

async function sendChangeEmail(reportText: string, summary: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.ASG_NOTIFY_EMAIL || process.env.IVR_NOTIFY_EMAIL
  if (!apiKey || !to) return false

  const from = process.env.IVR_EMAIL_FROM || 'SMB Health Supply <notifications@smbhealthsupply.com>'
  const resend = new Resend(apiKey)
  await resend.emails.send({
    from,
    to: [to],
    subject: `ASG sheet updated — ${summary}`,
    text: `${reportText}\n\nSheet: ${ASG_GOOGLE_SHEET_URL}\nPortal: https://smb-health-supply.vercel.app`,
    html: `<pre style="font-family:system-ui,sans-serif;font-size:14px;line-height:1.5;white-space:pre-wrap">${reportText.replace(/</g, '&lt;')}</pre>
      <p><a href="${ASG_GOOGLE_SHEET_URL}">Open sheet</a> · <a href="https://smb-health-supply.vercel.app">Open portal</a></p>`,
  })
  return true
}

export async function runAsgSheetCheck(options: {
  saveBaseline?: boolean
  skipRedis?: boolean
}): Promise<CheckReport> {
  const xlsxBuffer = await fetchAsgSheetXlsx()
  const wb = XLSX.read(xlsxBuffer, { type: 'buffer', cellStyles: true })
  const { claims } = parseAsgWorkbook(wb, XLSX)

  const snapshot = buildSnapshot(claims, {
    source: 'google-sheets',
    sheetUrl: ASG_GOOGLE_SHEET_URL,
  })

  const redis = options.skipRedis ? null : getRedis()
  let previous: AsgSnapshot | null = null

  if (redis && !options.saveBaseline) {
    previous = (await redis.get<AsgSnapshot>(REDIS_SNAPSHOT_KEY)) ?? null
  }

  const diff = diffSnapshots(options.saveBaseline ? null : previous, snapshot)
  const reportText = formatDiffReport(diff)

  const report: CheckReport = {
    checkedAt: new Date().toISOString(),
    sheetUrl: ASG_GOOGLE_SHEET_URL,
    totals: snapshot.totals,
    diff,
    reportText,
    liveDataUpdated: false,
  }

  let liveDataUpdated = false

  if (redis) {
    await redis.set(REDIS_SNAPSHOT_KEY, snapshot)
    await redis.set(REDIS_LAST_REPORT_KEY, report)

    if (options.saveBaseline || diff.hasChanges || diff.firstRun) {
      const liveData = buildAsgLiveData(claims, ASG_GOOGLE_SHEET_URL)
      await redis.set(REDIS_LIVE_DATA_KEY, liveData)
      liveDataUpdated = true
      report.liveDataUpdated = true
    }
  }

  if (!options.saveBaseline && diff.hasChanges) {
    await sendChangeEmail(reportText, diff.summary)
  }

  return report
}
