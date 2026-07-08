import XLSX from 'xlsx'
import fs from 'fs'

function excelDate(serial) {
  if (!serial || typeof serial !== 'number') return ''
  const d = XLSX.SSF.parse_date_code(serial)
  return d ? `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}` : String(serial)
}

const inv = JSON.parse(fs.readFileSync('src/data/medEffectsInvoices.json', 'utf8'))
const asg = JSON.parse(fs.readFileSync('src/data/asgData.json', 'utf8'))
const rows = XLSX.utils.sheet_to_json(
  XLSX.readFile('c:/Users/Admin/Downloads/ASG.xlsx').Sheets['ASG'],
  { header: 1, defval: '' },
)

const usedInvoices = new Set(asg.claims.filter((c) => c.invoiceNumber).map((c) => c.invoiceNumber))
const unmatched = inv.filter((i) => i.date >= '2026-03-01' && !usedInvoices.has(i.number))

console.log('Unmatched invoices since Mar 2026:')
for (const invoice of unmatched) {
  console.log(`  #${invoice.number} ${invoice.date} $${invoice.amount}`)
}

console.log('\nClaims with remit but no invoice:')
for (const c of asg.claims.filter((x) => x.remitUnitsSqCm > 0 && !x.invoiceNumber)) {
  console.log(`  ${c.patientName} dos ${c.dos} billed ${c.billedDate} ${c.remitUnitsSqCm} sqcm remit ${c.remitDate}`)
}

console.log('\nHeuristic matches (invoice amount / sqcm):')
for (const invoice of unmatched) {
  const candidates = asg.claims.filter((c) => c.unitsBilled > 0 && c.billedDate && !c.invoiceNumber)
  let best = null
  for (const c of candidates) {
    const dayDiff = Math.abs(new Date(invoice.date) - new Date(c.billedDate)) / 86400000
    if (dayDiff > 45) continue
    const rate = invoice.amount / c.unitsBilled
    const score = dayDiff + Math.abs(invoice.amount - c.totalBilledAmount) / 10000
    if (!best || score < best.score) best = { score, c, rate, dayDiff }
  }
  if (best) {
    console.log(
      `  #${invoice.number} -> ${best.c.patientName} (${best.c.unitsBilled} sqcm, billed ${best.c.billedDate}, ${best.dayDiff.toFixed(0)}d, $/sqcm ${best.rate.toFixed(2)})`,
    )
  }
}

console.log('\nKnown Maus reference: #1809 $10850 / 21 sqcm =', (10850 / 21).toFixed(2))
console.log('Jasica 72 sqcm at Maus rate =', (10850 / 21) * 72)
console.log('Jasica payment owed $5040 / 72 =', (5040 / 72).toFixed(2))
