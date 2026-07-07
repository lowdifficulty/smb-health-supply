import XLSX from 'xlsx'

const wb = XLSX.readFile('c:\\Users\\Admin\\Downloads\\ASG.xlsx', { cellStyles: true })
const sheet = wb.Sheets['ASG']
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })

function excelDate(serial) {
  if (!serial || typeof serial !== 'number') return ''
  const d = XLSX.SSF.parse_date_code(serial)
  if (!d) return String(serial)
  return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`
}

console.log('Headers:', rows[1].map((h, i) => `[${i}]${h}`).filter((_, i) => rows[1][i]).join('\n'))

const dataRows = rows.slice(2).filter((r) => r[0] && r[1])

const jasica = dataRows.filter((r) => String(r[1]).toLowerCase().includes('jasica'))
jasica.forEach((r) => {
  console.log('\nPatient:', r[1], 'DOS:', excelDate(r[0]))
  console.log('Units billed:', r[4], 'Total billed:', r[2], 'Q billed:', r[3])
  console.log('Total remit:', r[14], 'Q remit:', r[15], 'Remit date:', excelDate(r[13]))
  console.log('PDF:', r[18])
})

const remit61 = dataRows.filter((r) => String(r[18]).includes('6.1.26'))
console.log('\n--- All rows on ASG Remit 6.1.26.pdf:', remit61.length)
remit61.forEach((r) => {
  const units = r[4]
  const billed = r[2]
  const remit = Number(r[14]) || 0
  const prop = billed > 0 ? (units * remit / billed).toFixed(2) : 0
  console.log(
    excelDate(r[0]),
    String(r[1]).slice(0, 25),
    'units',
    units,
    'remit$',
    remit,
    'propSqCm',
    prop,
  )
})
