export function num(v) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export function round2(n) {
  return Math.round(n * 100) / 100
}

const COL_PRIMARY_PDF = 18
const COL_SECONDARY_PDF = 25

/**
 * Parse ASG workbook (buffer or path) into normalized claim rows for diffing.
 */
export function parseAsgWorkbook(wb, XLSX) {
  const sheet = wb.Sheets.ASG
  if (!sheet) {
    throw new Error('Sheet "ASG" not found in workbook')
  }

  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
  const dataRows = rows.slice(2).filter((r) => r[0] && r[1])

  function excelDate(serial) {
    if (!serial || typeof serial !== 'number') return ''
    const d = XLSX.SSF.parse_date_code(serial)
    if (!d) return String(serial)
    return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`
  }

  function cellHyperlinkUrl(col, rowIndex) {
    const cell = sheet[XLSX.utils.encode_cell({ c: col, r: rowIndex })]
    if (!cell?.l) return ''
    return cell.l.Target || cell.l.Rel?.Target || ''
  }

  const claims = dataRows.map((r, index) => {
    const billedAmount = num(r[2])
    const unitsBilled = num(r[4])
    const primaryRemit = num(r[14])
    const secondaryRemit = num(r[22])
    const totalRemitDollars = primaryRemit + secondaryRemit
    const sheetRow = index + 2

    return {
      sheetRow,
      dos: excelDate(r[0]),
      patientName: String(r[1]).trim(),
      totalBilledAmount: round2(billedAmount),
      unitsBilled: unitsBilled,
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
    }
  })

  const totals = {
    rowCount: claims.length,
    billedDollars: round2(claims.reduce((s, c) => s + c.totalBilledAmount, 0)),
    unitsBilled: round2(claims.reduce((s, c) => s + c.unitsBilled, 0)),
    primaryRemitDollars: round2(claims.reduce((s, c) => s + c.primaryRemitDollars, 0)),
    secondaryRemitDollars: round2(claims.reduce((s, c) => s + c.secondaryRemitDollars, 0)),
  }

  return { claims, totals }
}

export function claimStableKey(claim) {
  return [
    claim.dos,
    claim.patientName,
    claim.submissionId,
    String(claim.unitsBilled),
    String(claim.totalBilledAmount),
  ].join('|')
}

export function buildSnapshot(claims, meta = {}) {
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
