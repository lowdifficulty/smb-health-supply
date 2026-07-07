const REMIT_PDF_BASE = '/remits'

export function getRemitPdfUrl(filename: string): string {
  const trimmed = filename.trim()
  if (!trimmed) return ''
  return `${REMIT_PDF_BASE}/${encodeURIComponent(trimmed)}`
}
