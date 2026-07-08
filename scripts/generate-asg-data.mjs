import XLSX from 'xlsx'
import fs from 'fs'
import path from 'path'
import {
  ASG_SHEET_COLUMNS,
  finalizeInvoiceNumbers,
  findColumnIndex,
  normalizeInvoiceNumber,
} from './lib/asg-invoice-assign.mjs'

const resolvedXlsxPath = process.env.ASG_XLSX_PATH
  ? process.env.ASG_XLSX_PATH
  : fs.existsSync(path.join('data', 'asg-monitor', 'latest.xlsx'))
    ? path.join('data', 'asg-monitor', 'latest.xlsx')
    : 'c:\\Users\\Admin\\Downloads\\ASG.xlsx'
const outPath = path.join('src', 'data', 'asgData.json')

function excelDate(serial) {
  if (!serial || typeof serial !== 'number') return ''
  const d = XLSX.SSF.parse_date_code(serial)
  if (!d) return String(serial)
  return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`
}

function num(v) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function round2(n) {
  return Math.round(n * 100) / 100
}

function latestDate(...dates) {
  const valid = dates.filter(Boolean)
  if (valid.length === 0) return ''
  return valid.sort().pop()
}

function parseInvoicedFlag(value) {
  return String(value ?? '')
    .trim()
    .toUpperCase() === 'YES'
}

const wb = XLSX.readFile(resolvedXlsxPath, { cellStyles: true })
const sheet = wb.Sheets['ASG']
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
const headers = rows[1] ?? []
const invoiceCol = findColumnIndex(headers, [
  'invoice number',
  'invoice #',
  'primary invoice',
  'med effects invoice',
])
const dataRows = rows.slice(2).filter((r) => r[0] && r[1])

const COL_PRIMARY_PDF = 18
const COL_SECONDARY_PDF = 25

function cellHyperlinkUrl(col, row) {
  const cell = sheet[XLSX.utils.encode_cell({ c: col, r: row })]
  if (!cell?.l) return ''
  return cell.l.Target || cell.l.Rel?.Target || ''
}

const claims = dataRows.map((r, index) => {
  const billedAmount = num(r[2])
  const unitsBilled = num(r[4])
  const primaryRemit = num(r[14])
  const qCodeRemit = num(r[15])
  const secondaryRemit = num(r[22])
  const qSecondaryRemit = num(r[23])
  const totalRemitDollars = primaryRemit + secondaryRemit
  const remitUnits =
    totalRemitDollars > 0 && unitsBilled > 0 ? unitsBilled : 0
  const leftDollars = round2(billedAmount - totalRemitDollars)
  const leftUnits = round2(unitsBilled - remitUnits)

  const primaryRemitDate = excelDate(r[13])
  const secondaryRemitDate = excelDate(r[21])
  const sheetRow = index + 2
  const primaryRemitPdf = String(r[COL_PRIMARY_PDF] || '').trim()
  const secondaryRemitPdf = String(r[COL_SECONDARY_PDF] || '').trim()
  const primaryInvoicedRaw = r[ASG_SHEET_COLUMNS.PRIMARY_INVOICED]
  const explicitInvoice =
    invoiceCol >= 0 ? normalizeInvoiceNumber(r[invoiceCol]) : normalizeInvoiceNumber(primaryInvoicedRaw)

  return {
    id: `asg-claim-${index + 1}`,
    dos: excelDate(r[0]),
    patientName: String(r[1]).trim(),
    totalBilledAmount: round2(billedAmount),
    qCodeBilledAmount: round2(num(r[3])),
    unitsBilled: unitsBilled,
    qCode: String(r[5] || '').trim(),
    description: String(r[6] || '').trim(),
    submissionDate: excelDate(r[7]),
    submissionId: String(r[8] || '').trim(),
    submissionStatus: String(r[9] || '').trim(),
    remitDate: primaryRemitDate,
    dateOfRemit: primaryRemitDate || secondaryRemitDate,
    primaryRemitDollars: round2(primaryRemit),
    qCodeRemitDollars: round2(qCodeRemit),
    primaryRemitPdf,
    primaryRemitPdfUrl: cellHyperlinkUrl(COL_PRIMARY_PDF, sheetRow),
    secondaryInsurance: String(r[20] || '').trim(),
    secondaryRemitDate,
    secondaryRemitDollars: round2(secondaryRemit),
    qSecondaryRemitDollars: round2(qSecondaryRemit),
    secondaryRemitPdf,
    secondaryRemitPdfUrl: cellHyperlinkUrl(COL_SECONDARY_PDF, sheetRow),
    totalRemitDollars: round2(totalRemitDollars),
    remitUnitsSqCm: remitUnits,
    leftToRemitDollars: leftDollars,
    leftToRemitSqCm: leftUnits,
    notes: String(r[16] || '').trim(),
    billedDate: excelDate(r[ASG_SHEET_COLUMNS.BILLED_DATE]),
    primaryInvoiced: parseInvoicedFlag(primaryInvoicedRaw),
    secondaryInvoiced: parseInvoicedFlag(r[ASG_SHEET_COLUMNS.SECONDARY_INVOICED]),
    invoiceNumber: explicitInvoice,
  }
})

finalizeInvoiceNumbers(claims)

const rawEvents = []

for (const claim of claims) {
  if (claim.primaryRemitDollars > 0) {
    rawEvents.push({
      claimId: claim.id,
      patientName: claim.patientName,
      dos: claim.dos,
      dateOfRemit: claim.remitDate,
      remitAmountDollars: claim.primaryRemitDollars,
      remitUnitsSqCm: claim.unitsBilled > 0 ? claim.unitsBilled : 0,
      remitType: 'primary',
      remitPdf: { label: claim.primaryRemitPdf, url: claim.primaryRemitPdfUrl },
      billedAmount: claim.totalBilledAmount,
      unitsBilled: claim.unitsBilled,
      invoiceNumber: claim.invoiceNumber,
    })
  }
  if (claim.secondaryRemitDollars > 0) {
    rawEvents.push({
      claimId: claim.id,
      patientName: claim.patientName,
      dos: claim.dos,
      dateOfRemit: claim.secondaryRemitDate,
      remitAmountDollars: claim.secondaryRemitDollars,
      remitUnitsSqCm: 0,
      remitType: 'secondary',
      remitPdf: { label: claim.secondaryRemitPdf, url: claim.secondaryRemitPdfUrl },
      billedAmount: claim.totalBilledAmount,
      unitsBilled: claim.unitsBilled,
      invoiceNumber: claim.invoiceNumber,
    })
  }
}

const eventsByClaim = new Map()
for (const event of rawEvents) {
  if (!eventsByClaim.has(event.claimId)) eventsByClaim.set(event.claimId, [])
  eventsByClaim.get(event.claimId).push(event)
}

const remitEvents = []
let eventIndex = 0

for (const claim of claims) {
  const claimEvents = eventsByClaim.get(claim.id) ?? []
  claimEvents.sort((a, b) => {
    const d = a.dateOfRemit.localeCompare(b.dateOfRemit)
    if (d !== 0) return d
    return a.remitType === 'primary' ? -1 : 1
  })

  let remittedDollars = 0
  let remittedSqCm = 0

  for (const event of claimEvents) {
    remittedDollars = round2(remittedDollars + event.remitAmountDollars)
    remittedSqCm = round2(remittedSqCm + event.remitUnitsSqCm)
    eventIndex += 1
    remitEvents.push({
      id: `asg-remit-${eventIndex}`,
      claimId: event.claimId,
      patientName: event.patientName,
      dos: event.dos,
      dateOfRemit: event.dateOfRemit,
      remitAmountDollars: event.remitAmountDollars,
      remitUnitsSqCm: event.remitUnitsSqCm,
      remitType: event.remitType,
      remitPdf: event.remitPdf,
      billedAmount: event.billedAmount,
      unitsBilled: event.unitsBilled,
      remainingDollars: round2(claim.totalBilledAmount - remittedDollars),
      remainingSqCm: round2(claim.unitsBilled - remittedSqCm),
      invoiceNumber: event.invoiceNumber,
    })
  }
}

remitEvents.sort((a, b) => {
  const remitCmp = b.dateOfRemit.localeCompare(a.dateOfRemit)
  if (remitCmp !== 0) return remitCmp
  return a.patientName.localeCompare(b.patientName)
})

const output = {
  generatedAt: new Date().toISOString(),
  sourceFile: path.basename(resolvedXlsxPath),
  note:
    'One row per remit payment. Primary remits include billed sq cm; secondary remits are dollar-only. Remaining balance is per claim line after each remit.',
  claimCount: claims.length,
  remitEventCount: remitEvents.length,
  claims,
  remitEvents,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(output, null, 2))
console.log(`Wrote ${claims.length} claims and ${remitEvents.length} remit events to ${outPath}`)

const remitsDir = path.join('public', 'remits')
const downloadsDir = path.dirname(resolvedXlsxPath)
fs.mkdirSync(remitsDir, { recursive: true })

const pdfNames = new Set()
for (const claim of claims) {
  if (claim.primaryRemitPdf) pdfNames.add(claim.primaryRemitPdf)
  if (claim.secondaryRemitPdf) pdfNames.add(claim.secondaryRemitPdf)
}

let copied = 0
for (const name of pdfNames) {
  const src = path.join(downloadsDir, name)
  const dest = path.join(remitsDir, name)
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest)
    copied++
  }
}
console.log(`Copied ${copied}/${pdfNames.size} remit PDFs to ${remitsDir}`)
