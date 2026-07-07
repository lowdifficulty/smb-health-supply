import type { IvrRequest } from '../types/ivr'
import { formatDate, formatDateTime } from '../lib/format'

const STATUS_COLORS: Record<IvrRequest['status'], string> = {
  Pending: 'bg-slate-100 text-slate-700',
  Submitted: 'bg-blue-100 text-blue-800',
  Verified: 'bg-green-100 text-green-800',
  Denied: 'bg-red-100 text-red-800',
  Partial: 'bg-amber-100 text-amber-800',
}

const COLUMNS: { key: keyof IvrRequest | 'patientName'; label: string }[] = [
  { key: 'requestNumber', label: 'Request #' },
  { key: 'submittedAt', label: 'Submitted' },
  { key: 'status', label: 'Status' },
  { key: 'patientName', label: 'Patient' },
  { key: 'patientDob', label: 'DOB' },
  { key: 'memberId', label: 'Member ID' },
  { key: 'primaryCarrier', label: 'Provider' },
  { key: 'primaryPolicyNumber', label: 'Policy #' },
  { key: 'planType', label: 'Plan' },
  { key: 'facilityNpi', label: 'Facility NPI' },
]

function cellValue(row: IvrRequest, key: keyof IvrRequest | 'patientName'): string {
  if (key === 'patientName') return `${row.patientFirstName} ${row.patientLastName}`
  if (key === 'submittedAt') return formatDateTime(row.submittedAt)
  if (key === 'patientDob') return row.patientDob ? formatDate(row.patientDob) : '—'
  const value = row[key as keyof IvrRequest]
  return value ? String(value) : '—'
}

export default function IvrRequestTable({
  requests,
  showClient = false,
  emptyMessage = 'No IVR requests yet.',
}: {
  requests: IvrRequest[]
  showClient?: boolean
  emptyMessage?: string
}) {
  const colSpan = COLUMNS.length + (showClient ? 1 : 0)

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="md:hidden divide-y divide-slate-100">
        {requests.length === 0 ? (
          <p className="px-4 py-12 text-center text-slate-500 text-sm">{emptyMessage}</p>
        ) : (
          requests.map((row) => (
            <div key={row.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-slate-900">
                    {row.patientFirstName} {row.patientLastName}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{row.requestNumber}</p>
                </div>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${STATUS_COLORS[row.status]}`}>
                  {row.status}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-slate-600">
                <p>{formatDateTime(row.submittedAt)}</p>
                <p className="text-right">{row.primaryCarrier}</p>
                <p>Member: {row.memberId}</p>
                <p className="text-right truncate">Policy: {row.primaryPolicyNumber}</p>
              </div>
              {showClient && (
                <p className="text-xs text-slate-500 mt-2">{row.clientName}</p>
              )}
            </div>
          ))
        )}
      </div>
      <div className="hidden md:block overflow-x-auto table-scroll-x">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200">
              {showClient && (
                <th className="px-3 py-2.5 text-left font-semibold text-slate-600 whitespace-nowrap border-r border-slate-200">
                  Client
                </th>
              )}
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className="px-3 py-2.5 text-left font-semibold text-slate-600 whitespace-nowrap border-r border-slate-200 last:border-r-0"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="px-6 py-12 text-center text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              requests.map((row, i) => (
                <tr
                  key={row.id}
                  className={`border-b border-slate-100 hover:bg-brand-50/30 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                >
                  {showClient && (
                    <td className="px-3 py-2 whitespace-nowrap border-r border-slate-100 text-slate-700">
                      {row.clientName}
                    </td>
                  )}
                  {COLUMNS.map((col) => (
                    <td
                      key={col.key}
                      className="px-3 py-2 whitespace-nowrap border-r border-slate-100 last:border-r-0 text-slate-700"
                    >
                      {col.key === 'status' ? (
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[row.status]}`}
                        >
                          {row.status}
                        </span>
                      ) : (
                        cellValue(row, col.key)
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
