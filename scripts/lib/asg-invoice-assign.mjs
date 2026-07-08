import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const MED_EFFECTS_INVOICES = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../src/data/medEffectsInvoices.json'), 'utf8'),
)
export const ASG_INVOICE_OVERRIDES = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../src/data/asgInvoiceOverrides.json'), 'utf8'),
)

const invoicesByDate = new Map()
for (const invoice of MED_EFFECTS_INVOICES) {
  const list = invoicesByDate.get(invoice.date) ?? []
  list.push(invoice)
  invoicesByDate.set(invoice.date, list)
}

function daysBetween(a, b) {
  return Math.abs(new Date(a).getTime() - new Date(b).getTime()) / 86400000
}

export function normalizeInvoiceNumber(value) {
  const raw = String(value ?? '').trim()
  if (!raw || raw === 'YES' || raw === 'NO') return ''
  const match = raw.match(/#?\s*(\d{3,6})/)
  return match ? match[1] : raw
}

export function findColumnIndex(headers, patterns) {
  for (let i = 0; i < headers.length; i++) {
    const label = String(headers[i] ?? '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
    if (!label) continue
    if (patterns.some((pattern) => label.includes(pattern))) return i
  }
  return -1
}

export function pickInvoiceForBilledDate(billedDate, batchTotal) {
  if (!billedDate) return ''

  const sameDay = invoicesByDate.get(billedDate) ?? []
  if (sameDay.length === 1) return sameDay[0].number
  if (sameDay.length > 1) {
    const best = [...sameDay].sort(
      (a, b) => Math.abs(a.amount - batchTotal) - Math.abs(b.amount - batchTotal),
    )[0]
    return best.number
  }

  let best = null
  for (const invoice of MED_EFFECTS_INVOICES) {
    const distance = daysBetween(invoice.date, billedDate)
    if (distance > 14) continue
    const score = distance + Math.abs(invoice.amount - batchTotal) / 250000
    if (!best || score < best.score) best = { score, number: invoice.number }
  }
  return best?.number ?? ''
}

export function assignInvoiceNumbers(rows) {
  const groups = new Map()

  for (const row of rows) {
    if (row.invoiceNumber) continue
    if (!row.primaryInvoiced || !row.billedDate) continue
    const list = groups.get(row.billedDate) ?? []
    list.push(row)
    groups.set(row.billedDate, list)
  }

  for (const [billedDate, groupRows] of groups) {
    const batchTotal = groupRows.reduce((sum, row) => sum + row.totalBilledAmount, 0)
    const invoiceNumber = pickInvoiceForBilledDate(billedDate, batchTotal)
    if (!invoiceNumber) continue
    for (const row of groupRows) row.invoiceNumber = invoiceNumber
  }
}

export function applyAsgInvoiceOverrides(rows) {
  for (const override of ASG_INVOICE_OVERRIDES) {
    for (const row of rows) {
      if (row.invoiceNumber) continue
      if (row.patientName !== override.patientName) continue
      if (row.dos !== override.dos) continue
      row.invoiceNumber = override.invoiceNumber
    }
  }
}

export function finalizeInvoiceNumbers(rows) {
  assignInvoiceNumbers(rows)
  applyAsgInvoiceOverrides(rows)
}

export const ASG_SHEET_COLUMNS = {
  BILLED_DATE: 12,
  PRIMARY_INVOICED: 17,
  SECONDARY_INVOICED: 24,
}
