export type SortDirection = 'asc' | 'desc'

export function sortRows<T>(
  rows: T[],
  getValue: (row: T) => string | number,
  direction: SortDirection,
): T[] {
  return [...rows].sort((a, b) => {
    const av = getValue(a)
    const bv = getValue(b)
    const cmp =
      typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv), undefined, { sensitivity: 'base', numeric: true })
    return direction === 'asc' ? cmp : -cmp
  })
}

export function nextSortDirection(
  currentKey: string,
  clickedKey: string,
  currentDir: SortDirection,
): SortDirection {
  if (currentKey === clickedKey) return currentDir === 'asc' ? 'desc' : 'asc'
  return 'asc'
}
