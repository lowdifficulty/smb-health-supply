import fs from 'fs'
import XLSX from 'xlsx'

const xlsxPath = 'c:\\Users\\Admin\\Downloads\\ASG.xlsx'
const jsonPath = 'src/data/asgData.json'

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

const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
const wb = XLSX.readFile(xlsxPath, { cellStyles: true })
const sheet = wb.Sheets['ASG']
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
const dataRows = rows.slice(2).filter((r) => r[0] && r[1])

const claimMismatches = []

for (let i = 0; i < dataRows.length; i++) {
  const r = dataRows[i]
  const claim = json.claims[i]
  if (!claim) {
    claimMismatches.push({ sheetRow: i + 3, issue: 'missing claim in JSON' })
    continue
  }

  const expected = {
    dos: excelDate(r[0]),
    patientName: String(r[1]).trim(),
    totalBilledAmount: round2(num(r[2])),
    unitsBilled: num(r[4]),
    primaryRemitDollars: round2(num(r[14])),
    secondaryRemitDollars: round2(num(r[22])),
    primaryRemitPdf: String(r[18] || '').trim(),
    secondaryRemitPdf: String(r[25] || '').trim(),
    remitDate: excelDate(r[13]),
    secondaryRemitDate: excelDate(r[21]),
  }

  const fields = Object.keys(expected)
  const diff = {}
  for (const f of fields) {
    if (claim[f] !== expected[f]) diff[f] = { json: claim[f], sheet: expected[f] }
  }
  if (Object.keys(diff).length) {
    claimMismatches.push({ sheetRow: i + 3, patient: expected.patientName, diff })
  }
}

let sheetPrimaryTotal = 0
let sheetSecondaryTotal = 0
let sheetPrimaryCount = 0
let sheetSecondaryCount = 0
let sheetBilledTotal = 0
let sheetUnitsTotal = 0

for (const r of dataRows) {
  sheetBilledTotal += num(r[2])
  sheetUnitsTotal += num(r[4])
  const p = num(r[14])
  const s = num(r[22])
  if (p > 0) {
    sheetPrimaryTotal += p
    sheetPrimaryCount++
  }
  if (s > 0) {
    sheetSecondaryTotal += s
    sheetSecondaryCount++
  }
}

const jsonPrimary = json.remitEvents.filter((e) => e.remitType === 'primary')
const jsonSecondary = json.remitEvents.filter((e) => e.remitType === 'secondary')

const jsonPrimaryTotal = jsonPrimary.reduce((a, e) => a + e.remitAmountDollars, 0)
const jsonSecondaryTotal = jsonSecondary.reduce((a, e) => a + e.remitAmountDollars, 0)

let pdfUrlMismatch = 0
let pdfUrlMissingInJson = 0
for (let i = 0; i < dataRows.length; i++) {
  const sheetRow = i + 2
  const claim = json.claims[i]
  const cell = sheet[XLSX.utils.encode_cell({ c: 18, r: sheetRow })]
  const url = cell?.l?.Target || cell?.l?.Rel?.Target || ''
  if (claim.primaryRemitPdf && claim.primaryRemitPdfUrl !== url) pdfUrlMismatch++
  if (claim.primaryRemitPdf && !claim.primaryRemitPdfUrl && url) pdfUrlMissingInJson++
}

let leftDollarsIssues = 0
for (const claim of json.claims) {
  const expectedLeft = round2(
    claim.totalBilledAmount - claim.primaryRemitDollars - claim.secondaryRemitDollars,
  )
  if (claim.leftToRemitDollars !== expectedLeft) leftDollarsIssues++
}

// Event-level: each primary/secondary amount should match claim columns
let eventAmountMismatch = 0
for (const event of json.remitEvents) {
  const claim = json.claims.find((c) => c.id === event.claimId)
  if (!claim) continue
  const expected =
    event.remitType === 'primary' ? claim.primaryRemitDollars : claim.secondaryRemitDollars
  if (event.remitAmountDollars !== expected) eventAmountMismatch++
}

console.log(JSON.stringify({
  sheetClaimRows: dataRows.length,
  jsonClaims: json.claims.length,
  sheetPrimaryRemits: sheetPrimaryCount,
  jsonPrimaryEvents: jsonPrimary.length,
  sheetSecondaryRemits: sheetSecondaryCount,
  jsonSecondaryEvents: jsonSecondary.length,
  jsonRemitEvents: json.remitEvents.length,
  totals: {
    sheetBilled: round2(sheetBilledTotal),
    jsonBilled: round2(json.claims.reduce((s, c) => s + c.totalBilledAmount, 0)),
    sheetPrimaryRemit: round2(sheetPrimaryTotal),
    jsonPrimaryRemit: round2(jsonPrimaryTotal),
    sheetSecondaryRemit: round2(sheetSecondaryTotal),
    jsonSecondaryRemit: round2(jsonSecondaryTotal),
    sheetUnits: round2(sheetUnitsTotal),
    jsonUnits: round2(json.claims.reduce((s, c) => s + c.unitsBilled, 0)),
  },
  claimFieldMismatches: claimMismatches.length,
  sampleClaimMismatches: claimMismatches.slice(0, 3),
  primaryPdfUrlMismatches: pdfUrlMismatch,
  primaryPdfUrlsMissingInJson: pdfUrlMissingInJson,
  leftToRemitDollarsIssues: leftDollarsIssues,
  remitEventAmountMismatches: eventAmountMismatch,
  jsonGeneratedAt: json.generatedAt,
}, null, 2))
