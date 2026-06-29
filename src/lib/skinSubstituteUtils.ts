import type { SkinSubstituteFilters, SkinSubstituteRecord, SortField, StatusFilter } from '../types/skinSubstitute'
import { SQCM_ABBREV } from './pricing'

export function formatPortalDate(iso: string): string {
  if (!iso || iso === '1900-01-01') return '01/01/1900'
  const [y, m, d] = iso.split('-')
  return `${m}/${d}/${y}`
}

function inDateRange(value: string, from: string, to: string): boolean {
  if (!from && !to) return true
  if (!value || value === '1900-01-01') return false
  if (from && value < from) return false
  if (to && value > to) return false
  return true
}

export function filterRecords(
  records: SkinSubstituteRecord[],
  filters: SkinSubstituteFilters,
  tabFilter: StatusFilter,
): SkinSubstituteRecord[] {
  return records.filter((r) => {
    if (tabFilter !== 'All' && r.status !== tabFilter) return false
    if (filters.tissueId && !r.tissueId.toLowerCase().includes(filters.tissueId.toLowerCase())) return false
    if (!inDateRange(r.applicationDate, filters.applicationDateFrom, filters.applicationDateTo)) return false
    if (filters.brand.length && !filters.brand.includes(r.brand)) return false
    if (filters.trackingNumber && !r.trackingNumber.includes(filters.trackingNumber)) return false
    if (!inDateRange(r.deliveryDate, filters.deliveryDateFrom, filters.deliveryDateTo)) return false
    if (filters.invoiceNumber && !r.invoiceNumber.includes(filters.invoiceNumber)) return false
    if (!inDateRange(r.orderDate, filters.orderDateFrom, filters.orderDateTo)) return false
    if (filters.patientBirthYear && r.patientBirthYear !== filters.patientBirthYear) return false
    if (filters.patientInitials && !r.patientInitials.toLowerCase().includes(filters.patientInitials.toLowerCase())) return false
    if (filters.product.length && !filters.product.includes(r.product)) return false
    if (!inDateRange(r.shipDate, filters.shipDateFrom, filters.shipDateTo)) return false
    if (filters.location.length && !filters.location.includes(r.location)) return false
    if (filters.status.length && !filters.status.includes(r.status)) return false
    return true
  })
}

export function sortRecords(
  records: SkinSubstituteRecord[],
  field: SortField,
  direction: 'asc' | 'desc',
): SkinSubstituteRecord[] {
  return [...records].sort((a, b) => {
    const av = a[field] ?? ''
    const bv = b[field] ?? ''
    if (typeof av === 'number' && typeof bv === 'number') {
      return direction === 'asc' ? av - bv : bv - av
    }
    const cmp = String(av).localeCompare(String(bv))
    return direction === 'asc' ? cmp : -cmp
  })
}

export function downloadCsv(records: SkinSubstituteRecord[]) {
  const headers = [
    'Tissue ID / Lot Number', 'Status', 'Order Date', 'Brand', 'Product', `Total ${SQCM_ABBREV}`,
    'Ship Date', 'Carrier Tracking Number', 'Delivery Date', 'Location (Address)',
    'Application Date', 'Patient Initials', 'Patient Birth Year',
    'Invoice Number', 'Invoice Due Date', 'Invoice Paid Date',
  ]
  const rows = records.map((r) => [
    r.tissueId, r.status, formatPortalDate(r.orderDate), r.brand, r.product, r.totalSqCm,
    formatPortalDate(r.shipDate), r.trackingNumber, formatPortalDate(r.deliveryDate), r.location,
    formatPortalDate(r.applicationDate), r.patientInitials, r.patientBirthYear,
    r.invoiceNumber, r.invoiceDueDate, r.invoicePaidDate,
  ])
  const csv = [headers, ...rows].map((row) => row.map((c) => `"${c}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'skin-substitutes.csv'
  a.click()
  URL.revokeObjectURL(url)
}
