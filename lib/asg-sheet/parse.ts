import type { WorkBook } from 'xlsx'
import {
  ASG_SHEET_COLUMNS,
  finalizeInvoiceNumbers,
  findColumnIndex,
  normalizeInvoiceNumber,
} from '../../src/lib/asgInvoiceAssign.js'

export function num(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100
}

const COL_PRIMARY_PDF = 18
const COL_SECONDARY_PDF = 25

export interface AsgClaimRow {
  sheetRow: number
  dos: string
  patientName: string
  totalBilledAmount: number
  unitsBilled: number
  submissionDate: string
  submissionId: string
  submissionStatus: string
  remitDate: string
  primaryRemitDollars: number
  secondaryRemitDate: string
  secondaryRemitDollars: number
  totalRemitDollars: number
  primaryRemitPdf: string
  secondaryRemitPdf: string
  primaryRemitPdfUrl: string
  secondaryRemitPdfUrl: string
  leftToRemitDollars: number
  qCode: string
  qCodeBilledAmount: number
  billedDate: string
  primaryInvoiced: boolean
  secondaryInvoiced: boolean
  invoiceNumber: string
}

function parseInvoicedFlag(value: unknown): boolean {
  return String(value ?? '')
    .trim()
    .toUpperCase() === 'YES'
}

export function parseAsgWorkbook(wb: WorkBook, XLSX: typeof import('xlsx')) {
  const sheet = wb.Sheets.ASG
  if (!sheet) throw new Error('Sheet "ASG" not found')

  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as unknown[][]

  function excelDate(serial: unknown): string {
    if (!serial || typeof serial !== 'number') return ''
    const d = XLSX.SSF.parse_date_code(serial)
    if (!d) return String(serial)
    return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`
  }

  function cellHyperlinkUrl(col: number, rowIndex: number): string {
    const cell = sheet[XLSX.utils.encode_cell({ c: col, r: rowIndex })]
    const link = cell?.l as { Target?: string; Rel?: { Target?: string } } | undefined
    if (!link) return ''
    return link.Target || link.Rel?.Target || ''
  }

  const dataRows = rows.slice(2).filter((r) => r[0] && r[1])
  const headers = rows[1] ?? []
  const invoiceCol = findColumnIndex(headers, [
    'invoice number',
    'invoice #',
    'primary invoice',
    'med effects invoice',
  ])

  const claims: AsgClaimRow[] = dataRows.map((r, index) => {
    const billedAmount = num(r[2])
    const unitsBilled = num(r[4])
    const primaryRemit = num(r[14])
    const secondaryRemit = num(r[22])
    const totalRemitDollars = primaryRemit + secondaryRemit
    const sheetRow = index + 2
    const primaryInvoicedRaw = r[ASG_SHEET_COLUMNS.PRIMARY_INVOICED]
    const explicitInvoice =
      invoiceCol >= 0 ? normalizeInvoiceNumber(r[invoiceCol]) : normalizeInvoiceNumber(primaryInvoicedRaw)

    return {
      sheetRow,
      dos: excelDate(r[0]),
      patientName: String(r[1]).trim(),
      totalBilledAmount: round2(billedAmount),
      unitsBilled,
      submissionDate: excelDate(r[7]),
      submissionId: String(r[8] || '').trim(),
      submissionStatus: String(r[9] || '').trim(),
      remitDate: excelDate(r[13]),
      primaryRemitDollars: round2(primaryRemit),
      secondaryRemitDate: excelDate(r[21]),
      secondaryRemitDollars: round2(secondaryRemit),
      totalRemitDollars: round2(totalRemitDollars),
      primaryRemitPdf: String(r[COL_PRIMARY_PDF] || '').trim(),
      secondaryRemitPdf: String(r[COL_SECONDARY_PDF] || '').trim(),
      primaryRemitPdfUrl: cellHyperlinkUrl(COL_PRIMARY_PDF, sheetRow),
      secondaryRemitPdfUrl: cellHyperlinkUrl(COL_SECONDARY_PDF, sheetRow),
      leftToRemitDollars: round2(billedAmount - totalRemitDollars),
      qCode: String(r[5] || '').trim(),
      qCodeBilledAmount: round2(num(r[3])),
      billedDate: excelDate(r[ASG_SHEET_COLUMNS.BILLED_DATE]),
      primaryInvoiced: parseInvoicedFlag(primaryInvoicedRaw),
      secondaryInvoiced: parseInvoicedFlag(r[ASG_SHEET_COLUMNS.SECONDARY_INVOICED]),
      invoiceNumber: explicitInvoice,
    }
  })

  finalizeInvoiceNumbers(claims)

  return { claims }
}

export function claimStableKey(claim: AsgClaimRow): string {
  return [
    claim.dos,
    claim.patientName,
    claim.submissionId,
    String(claim.unitsBilled),
    String(claim.totalBilledAmount),
  ].join('|')
}

export interface AsgSnapshot {
  capturedAt: string
  source: string
  sheetUrl: string
  claims: AsgClaimRow[]
  totals: {
    rowCount: number
    billedDollars: number
    unitsBilled: number
    primaryRemitDollars: number
    secondaryRemitDollars: number
  }
}

export function buildSnapshot(
  claims: AsgClaimRow[],
  meta: { source: string; sheetUrl: string },
): AsgSnapshot {
  return {
    capturedAt: new Date().toISOString(),
    ...meta,
    claims,
    totals: {
      rowCount: claims.length,
      billedDollars: round2(claims.reduce((s, c) => s + c.totalBilledAmount, 0)),
      unitsBilled: round2(claims.reduce((s, c) => s + c.unitsBilled, 0)),
      primaryRemitDollars: round2(claims.reduce((s, c) => s + c.primaryRemitDollars, 0)),
      secondaryRemitDollars: round2(claims.reduce((s, c) => s + c.secondaryRemitDollars, 0)),
    },
  }
}
