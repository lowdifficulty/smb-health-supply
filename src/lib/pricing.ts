export const PRICE_PER_SQ_CM = 65
export const SQCM_ABBREV = 'sqcm'

export function parseSizeToSqCm(size: string): number {
  const match = size.toLowerCase().trim().match(/([\d.]+)\s*x\s*([\d.]+)\s*(cm|in|mm)?/)
  if (!match) return 0

  const width = parseFloat(match[1])
  const height = parseFloat(match[2])
  const unit = match[3] ?? 'cm'

  let widthCm = width
  let heightCm = height
  if (unit === 'in') {
    widthCm = width * 2.54
    heightCm = height * 2.54
  } else if (unit === 'mm') {
    widthCm = width / 10
    heightCm = height / 10
  }

  return widthCm * heightCm
}

export function calculateUnitPrice(size: string): number {
  return parseSizeToSqCm(size) * PRICE_PER_SQ_CM
}

export function calculateLineTotal(size: string, quantity: number): number {
  return calculateUnitPrice(size) * quantity
}

export function formatSizeLabel(size: string): string {
  const dimensions = size.replace(/\s*\([^)]*\)\s*$/, '').trim()
  return `${dimensions} (${parseSizeToSqCm(size).toFixed(1)} ${SQCM_ABBREV})`
}
