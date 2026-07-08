import fs from 'fs'
import path from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const { PDFParse } = require('pdf-parse')

const defaultPdfPath =
  process.argv[2] ||
  'c:\\Users\\Admin\\Downloads\\Statement_1284_from_Med_Effects_LLC (1).pdf'

function parseStatementText(text) {
  const statementDateMatch = text.match(/DATE\s+(\d{2}\/\d{2}\/\d{4})/i)
  const totalDueMatch = text.match(/TOTAL DUE\s+\$?([\d,]+\.\d{2})/i)
  const agingMatch = text.match(
    /([\d,]+\.\d{2})\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})\s+\$([\d,]+\.\d{2})/,
  )

  const invoices = []
  const invoiceRe = /(\d{2}\/\d{2}\/\d{4})\s+Invoice\s+#(\d+)\s+([\d,]+\.\d{2})/g
  for (const match of text.matchAll(invoiceRe)) {
    const [, mmddyyyy, number, amountRaw] = match
    const [month, day, year] = mmddyyyy.split('/')
    invoices.push({
      date: `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`,
      number,
      amount: Number(amountRaw.replace(/,/g, '')),
    })
  }

  return {
    statementDate: statementDateMatch
      ? statementDateMatch[1].replace(
          /(\d{2})\/(\d{2})\/(\d{4})/,
          (_, m, d, y) => `${y}-${m}-${d}`,
        )
      : '',
    totalDue: totalDueMatch ? Number(totalDueMatch[1].replace(/,/g, '')) : 0,
    aging: agingMatch
      ? {
          current: Number(agingMatch[1].replace(/,/g, '')),
          days1to30: Number(agingMatch[2].replace(/,/g, '')),
          days31to60: Number(agingMatch[3].replace(/,/g, '')),
          days61to90: Number(agingMatch[4].replace(/,/g, '')),
          days90plus: Number(agingMatch[5].replace(/,/g, '')),
          total: Number(agingMatch[6].replace(/,/g, '')),
        }
      : null,
    invoices,
  }
}

async function readPdfText(pdfPath) {
  const buffer = fs.readFileSync(pdfPath)
  const parser = new PDFParse({ data: buffer })
  const result = await parser.getText()
  return result.text
}

function writeJson(relativePath, data) {
  const fullPath = path.join('src', 'data', relativePath)
  fs.writeFileSync(fullPath, `${JSON.stringify(data, null, 2)}\n`)
  console.log(`Updated ${fullPath} (${Array.isArray(data) ? data.length : 'object'} records)`)
}

function writeInvoicesTs(invoices) {
  const lines = invoices
    .map(
      (invoice) =>
        `  { date: '${invoice.date}', number: '${invoice.number}', amount: ${invoice.amount} },`,
    )
    .join('\n')

  const contents = `/** Med Effects LLC invoice lines from Statement #1284. */
export interface MedEffectsInvoice {
  date: string
  number: string
  amount: number
}

export const MED_EFFECTS_INVOICES: MedEffectsInvoice[] = [
${lines}
]
`

  fs.writeFileSync(path.join('src', 'data', 'medEffectsInvoices.ts'), contents)
  console.log('Updated src/data/medEffectsInvoices.ts')
}

function writeStatementTs(parsed) {
  const byYear = [
    { year: '2025', invoiced: 7_503_324.48, paid: 1_488_021.6 },
    { year: '2026', invoiced: 260_802.38, paid: 4_044_944.97 },
  ]

  const contents = `/** Med Effects LLC vendor statement #1284 — American Surgeons Group (as of ${parsed.statementDate}). */
export const MED_EFFECTS_STATEMENT = {
  vendorName: 'Med Effects, LLC',
  vendorContact: 'ken@medeffectsllc.com',
  vendorPhone: '8103351435',
  billTo: 'Dr Julia Shauger · American Surgeons Group',
  statementNumber: '1284',
  statementDate: '${parsed.statementDate}',
  totalDue: ${parsed.totalDue},
  aging: {
    current: ${parsed.aging?.current ?? 0},
    days1to30: ${parsed.aging?.days1to30 ?? 0},
    days31to60: ${parsed.aging?.days31to60 ?? 0},
    days61to90: ${parsed.aging?.days1to90 ?? 0},
    days90plus: ${parsed.aging?.days90plus ?? 0},
  },
  byYear: [
    {
      year: '2025',
      invoiced: ${byYear[0].invoiced},
      paid: ${byYear[0].paid},
    },
    {
      year: '2026',
      invoiced: ${byYear[1].invoiced},
      paid: ${byYear[1].paid},
    },
  ],
  recentPayments: [
    { date: '2026-01-07', description: 'Wire payment (1.2.26)', amount: 1_363_000.0 },
    { date: '2026-01-15', description: 'Payment #8 Jan wire', amount: 1_156_780.8 },
    { date: '2026-01-21', description: 'Payment #21 Jan wire', amount: 504_561.29 },
    { date: '2026-02-04', description: 'Payment #4 Feb wire', amount: 547_902.94 },
    { date: '2026-02-05', description: 'Payment #5 Feb wire', amount: 400_000.0 },
    { date: '2026-03-09', description: 'Payment #9 Mar wire ASG', amount: 21_579.86 },
    { date: '2026-03-12', description: 'Payment #12 Mar ASG wire', amount: 49_980.0 },
  ],
} as const

export function getMedEffectsYearSummary(year: string) {
  return MED_EFFECTS_STATEMENT.byYear.find((row) => row.year === year)
}

export function getMedEffectsTotalPaid(): number {
  return MED_EFFECTS_STATEMENT.byYear.reduce((sum, row) => sum + row.paid, 0)
}

export function getMedEffectsTotalInvoiced(): number {
  return MED_EFFECTS_STATEMENT.byYear.reduce((sum, row) => sum + row.invoiced, 0)
}
`

  fs.writeFileSync(path.join('src', 'data', 'medEffectsStatement.ts'), contents)
  console.log('Updated src/data/medEffectsStatement.ts')
}

const pdfPath = path.resolve(defaultPdfPath)
if (!fs.existsSync(pdfPath)) {
  console.error(`PDF not found: ${pdfPath}`)
  process.exit(1)
}

const text = await readPdfText(pdfPath)
const parsed = parseStatementText(text)
if (parsed.invoices.length === 0) {
  console.error('No invoices parsed from PDF')
  process.exit(1)
}

writeJson('medEffectsInvoices.json', parsed.invoices)
writeInvoicesTs(parsed.invoices)
writeStatementTs(parsed)

console.log(`\nStatement #1284 as of ${parsed.statementDate}`)
console.log(`Total due: $${parsed.totalDue.toLocaleString()}`)
console.log(`Invoices parsed: ${parsed.invoices.length}`)
console.log(`Latest invoice: #${parsed.invoices.at(-1).number} (${parsed.invoices.at(-1).date})`)
