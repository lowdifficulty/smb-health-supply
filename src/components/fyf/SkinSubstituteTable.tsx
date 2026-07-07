import { Fragment } from 'react'
import type { SkinSubstituteRecord, SortField } from '../../types/skinSubstitute'
import { KANBAN_ORDER } from '../../types/skinSubstitute'
import { formatPortalDate } from '../../lib/skinSubstituteUtils'

interface SkinSubstituteTableProps {
  records: SkinSubstituteRecord[]
  sortField: SortField
  sortDirection: 'asc' | 'desc'
  onSort: (field: SortField) => void
}

const COLUMNS: { field: SortField | null; label: string }[] = [
  { field: 'tissueId', label: 'Tissue ID / Lot Number' },
  { field: null, label: 'Update Applied Date' },
  { field: null, label: 'View Invoice' },
  { field: 'orderDate', label: 'Order Date' },
  { field: 'brand', label: 'Brand' },
  { field: 'product', label: 'Product' },
  { field: 'totalSqCm', label: 'Total SqCM' },
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

function displayValue(value: string): string {
  if (!value) return '01/01/1900'
  return value
}

export default function SkinSubstituteTable({ records, sortField, sortDirection, onSort }: SkinSubstituteTableProps) {
  const grouped = KANBAN_ORDER.map((status) => ({
    status,
    rows: records.filter((r) => r.status === status),
  })).filter((g) => g.rows.length > 0)

  const grandTotal = records.reduce((s, r) => s + r.totalSqCm, 0)

  return (
    <div className="fyf-table-wrap">
      <table className="fyf-table">
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th key={col.label}>
                {col.field ? (
                  <button type="button" className="fyf-sort-link" onClick={() => onSort(col.field!)}>
                    {col.label}
                    {sortField === col.field && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                  </button>
                ) : (
                  col.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grouped.map(({ status, rows }) => {
            const subtotal = rows.reduce((s, r) => s + r.totalSqCm, 0)
            return (
              <Fragment key={status}>
                <tr className="fyf-group-row">
                  <td colSpan={COLUMNS.length}>
                    <a href="#" onClick={(e) => e.preventDefault()}>{status}</a>
                  </td>
                </tr>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.tissueId}</td>
                    <td className="fyf-action-cell">
                      <a href="#" onClick={(e) => e.preventDefault()} title="Mark as Applied (if used)">
                        Update Applied Date
                      </a>
                      <br />
                      <a href="mailto:support@smbhealthsupply.com">Contact Support</a>
                    </td>
                    <td>
                      <a href="#" onClick={(e) => e.preventDefault()}>View Invoice</a>
                    </td>
                    <td>{formatPortalDate(row.orderDate)}</td>
                    <td>{row.brand}</td>
                    <td>{row.product}</td>
                    <td>{row.totalSqCm.toFixed(1)}</td>
                    <td>{formatPortalDate(row.shipDate)}</td>
                    <td>{row.trackingNumber}</td>
                    <td>{formatPortalDate(row.deliveryDate)}</td>
                    <td>{row.location}</td>
                    <td>{formatPortalDate(row.applicationDate)}</td>
                    <td>{displayValue(row.patientInitials)}</td>
                    <td>{displayValue(row.patientBirthYear)}</td>
                    <td>{displayValue(row.invoiceNumber)}</td>
                    <td>{displayValue(row.invoiceDueDate)}</td>
                    <td>{displayValue(row.invoicePaidDate)}</td>
                  </tr>
                ))}
                <tr className="fyf-subtotal-row">
                  <td colSpan={6} className="fyf-subtotal-label">Subtotal: {subtotal.toFixed(1)}</td>
                  <td colSpan={COLUMNS.length - 6} />
                </tr>
              </Fragment>
            )
          })}
          <tr className="fyf-total-row">
            <td colSpan={6} className="fyf-total-label">Total: {grandTotal.toFixed(1)}</td>
            <td colSpan={COLUMNS.length - 6} />
          </tr>
        </tbody>
      </table>
    </div>
  )
}
