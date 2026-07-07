import { Fragment } from 'react'
import type { SkinSubstituteRecord, SortField } from '../types/skinSubstitute'
import { KANBAN_ORDER } from '../types/skinSubstitute'
import { formatPortalDate } from '../lib/skinSubstituteUtils'
import { SQCM_ABBREV } from '../lib/pricing'

const COLUMNS: { field: SortField | null; label: string }[] = [
  { field: 'tissueId', label: 'Tissue ID / Lot Number' },
  { field: null, label: 'Update Applied Date' },
  { field: null, label: 'View Invoice' },
  { field: 'orderDate', label: 'Order Date' },
  { field: 'brand', label: 'Brand' },
  { field: 'product', label: 'Product' },
  { field: 'totalSqCm', label: `Total ${SQCM_ABBREV}` },
  { field: 'shipDate', label: 'Ship Date' },
  { field: 'trackingNumber', label: 'Carrier Tracking Number' },
  { field: 'deliveryDate', label: 'Delivery Date' },
  { field: 'location', label: 'Location (Address)' },
  { field: 'applicationDate', label: 'Application Date' },
  { field: 'patientInitials', label: 'Patient Initials' },
  { field: 'patientBirthYear', label: 'Patient Birth Year' },
  { field: 'invoiceNumber', label: 'Invoice Number' },
  { field: 'invoiceDueDate', label: 'Invoice Due Date' },
  { field: 'invoicePaidDate', label: 'Invoice Paid Date' },
]

const STATUSES_WITH_UPDATE_APPLIED = new Set(['Consigned'])

const STATUS_COLORS: Record<string, string> = {
  Consigned: 'bg-blue-100 text-blue-800',
  Appeals: 'bg-amber-100 text-amber-800',
  Applied: 'bg-purple-100 text-purple-800',
  Paid: 'bg-green-100 text-green-800',
}

function displayValue(value: string): string {
  if (!value) return '01/01/1900'
  return value
}

interface SkinSubstituteDataTableProps {
  records: SkinSubstituteRecord[]
  sortField: SortField
  sortDirection: 'asc' | 'desc'
  onSort: (field: SortField) => void
}

export default function SkinSubstituteDataTable({
  records,
  sortField,
  sortDirection,
  onSort,
}: SkinSubstituteDataTableProps) {
  const grouped = KANBAN_ORDER.map((status) => ({
    status,
    rows: records.filter((r) => r.status === status),
  })).filter((g) => g.rows.length > 0)

  const grandTotal = records.reduce((s, r) => s + r.totalSqCm, 0)

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="table-scroll-x">
        <table className="w-max min-w-full text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-left text-slate-600">
              {COLUMNS.map((col) => (
                <th key={col.label} className="px-3 py-3 font-semibold whitespace-nowrap">
                  {col.field ? (
                    <button
                      type="button"
                      className="hover:text-brand-700 transition-colors"
                      onClick={() => onSort(col.field!)}
                    >
                      {col.label}
                      {sortField === col.field && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grouped.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className="px-6 py-12 text-center text-slate-500">
                  No records match your filters.
                </td>
              </tr>
            ) : (
              grouped.map(({ status, rows }) => {
                const subtotal = rows.reduce((s, r) => s + r.totalSqCm, 0)
                return (
                  <Fragment key={status}>
                    <tr className="bg-slate-100">
                      <td colSpan={COLUMNS.length} className="px-3 py-2">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[status]}`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                    {rows.map((row) => (
                      <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-3 py-2.5 font-mono font-medium text-slate-900 whitespace-nowrap">{row.tissueId}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          {STATUSES_WITH_UPDATE_APPLIED.has(row.status) ? (
                            <a href="#" onClick={(e) => e.preventDefault()} className="text-brand-600 hover:text-brand-800">Update Applied Date</a>
                          ) : (
                            <span className="text-slate-700">{formatPortalDate(row.applicationDate)}</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <a href="#" onClick={(e) => e.preventDefault()} className="text-brand-600 hover:text-brand-800">View Invoice</a>
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">{formatPortalDate(row.orderDate)}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">{row.brand}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">{row.product}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">{row.totalSqCm.toFixed(1)}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">{formatPortalDate(row.shipDate)}</td>
                        <td className="px-3 py-2.5 font-mono whitespace-nowrap">{row.trackingNumber}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">{formatPortalDate(row.deliveryDate)}</td>
                        <td className="px-3 py-2.5 max-w-[200px] truncate" title={row.location}>{row.location}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">{formatPortalDate(row.applicationDate)}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">{displayValue(row.patientInitials)}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">{displayValue(row.patientBirthYear)}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">{displayValue(row.invoiceNumber)}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">{displayValue(row.invoiceDueDate)}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">{displayValue(row.invoicePaidDate)}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-semibold text-slate-700">
                      <td colSpan={6} className="px-3 py-2">Subtotal: {subtotal.toFixed(1)}</td>
                      <td colSpan={COLUMNS.length - 6} />
                    </tr>
                  </Fragment>
                )
              })
            )}
            {records.length > 0 && (
              <tr className="bg-brand-50 font-bold text-brand-800">
                <td colSpan={6} className="px-3 py-3">Total: {grandTotal.toFixed(1)}</td>
                <td colSpan={COLUMNS.length - 6} />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
