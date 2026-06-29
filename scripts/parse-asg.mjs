import XLSX from 'xlsx'
import fs from 'fs'
import path from 'path'

const xlsxPath = 'c:\\Users\\Admin\\Downloads\\ASG.xlsx'
const wb = XLSX.readFile(xlsxPath)
const sheet = wb.Sheets['ASG']
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })

// Row 1 is headers
const headers = rows[1]
console.log('Column headers with index:')
headers.forEach((h, i) => { if (h) console.log(i, h) })

const dataRows = rows.slice(2).filter(r => r[0] && r[1])
console.log('\nData rows:', dataRows.length)

// Unique remit PDFs
const remitPdfs = new Set()
dataRows.forEach(r => {
  if (r[18]) remitPdfs.add(String(r[18]).trim())
  if (r[25]) remitPdfs.add(String(r[25]).trim())
})
console.log('\nUnique primary remit PDFs:', [...remitPdfs].filter(p => p && !p.includes('BCBS')).length)
console.log('Unique secondary remit PDFs:', [...remitPdfs].filter(p => p && p.includes('BCBS')).length)
console.log('\nAll PDF names:')
;[...remitPdfs].sort().forEach(p => console.log(p))

// Sample aggregated by patient+DOS
function excelDate(serial) {
  if (!serial) return ''
  const d = XLSX.SSF.parse_date_code(serial)
  if (!d) return String(serial)
  return `${d.y}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`
}

const byKey = {}
dataRows.forEach(r => {
  const dos = excelDate(r[0])
  const patient = String(r[1]).trim()
  const key = `${patient}|${dos}`
  if (!byKey[key]) {
    byKey[key] = { patient, dos, billedAmt: 0, billedUnits: 0, primaryRemit: 0, qRemit: 0, secondaryRemit: 0, qSecondaryRemit: 0, rows: 0 }
  }
  const e = byKey[key]
  e.billedAmt += Number(r[2]) || 0
  e.billedUnits += Number(r[4]) || 0
  e.primaryRemit += Number(r[14]) || 0
  e.qRemit += Number(r[15]) || 0
  e.secondaryRemit += Number(r[22]) || 0
  e.qSecondaryRemit += Number(r[23]) || 0
  e.rows++
})

console.log('\nSample aggregated (first 5):')
Object.values(byKey).slice(0, 5).forEach(e => {
  const totalRemit = e.primaryRemit + e.secondaryRemit
  const leftDollars = e.billedAmt - totalRemit
  console.log(JSON.stringify({ ...e, totalRemit, leftDollars, leftUnits: e.billedUnits - (e.billedUnits * totalRemit / e.billedAmt) }))
})
