import { useMemo } from 'react'
import { formatCurrency, formatDate } from '../lib/format'
import { SQCM_ABBREV } from '../lib/pricing'
import { getAsgRemitEvents } from '../data/asgData'
import { useAsgDataMeta } from '../context/AsgDataContext'
import { buildRemitLineOwedRows } from '../lib/asgRemitOwed'

export default function AsgRemitReconciliationPanel() {
  const { ready } = useAsgDataMeta()
  const rows = useMemo(() => {
    if (!ready) return []
    return buildRemitLineOwedRows(getAsgRemitEvents())
      .filter((row) => row.invoiceNumber || row.amountOwedToSmb > 0)
      .sort((a, b) => b.dateOfRemit.localeCompare(a.dateOfRemit))
  }, [ready])

  if (!ready || rows.length === 0) return null

  return (
    <section className="mb-4 sm:mb-6 rounded-xl border border-brand-200 bg-white overflow-hidden shadow-sm">
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-brand-200 bg-brand-50">
        <h2 className="text-base sm:text-lg font-semibold text-slate-900">
          Patient · remit · invoice reconciliation
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
          Each row ties a patient on a remit to a Med Effects invoice number and the amount owed to SMB
          for the exact {SQCM_ABBREV} remitted. Expand remit batches below for PDF-level detail.
        </p>
      </div>

      <div className="overflow-x-auto table-scroll-x">
        <table className="w-full text-sm border-collapse min-w-[980px]">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200">
              <th className="px-4 py-3 text-left font-semibold text-slate-600 whitespace-nowrap">Patient</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600 whitespace-nowrap">Remit date</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600 whitespace-nowrap">Remit PDF</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600 whitespace-nowrap">Invoice #</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-600 whitespace-nowrap">
                Remit ({SQCM_ABBREV})
              </th>
              <th className="px-4 py-3 text-right font-semibold text-slate-600 whitespace-nowrap">Insurance remit</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-600 whitespace-nowrap">Owed to SMB</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-600 whitespace-nowrap">$/ {SQCM_ABBREV}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.eventId}
                className={`border-b border-slate-100 hover:bg-brand-50/30 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                }`}
              >
                <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">{row.patientName}</td>
                <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{formatDate(row.dateOfRemit)}</td>
                <td className="px-4 py-3 text-slate-600 max-w-[220px]">
                  <span className="line-clamp-2">{row.remitPdfLabel || '—'}</span>
                </td>
                <td className="px-4 py-3 text-slate-800 font-medium whitespace-nowrap">
                  {row.invoiceNumber ? `#${row.invoiceNumber}` : '—'}
                </td>
                <td className="px-4 py-3 text-right text-slate-700 whitespace-nowrap">
                  {row.remitSqCm > 0 ? row.remitSqCm.toFixed(1) : '—'}
                </td>
                <td className="px-4 py-3 text-right text-slate-700 tabular-nums whitespace-nowrap">
                  {formatCurrency(row.remitAmountDollars)}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-brand-800 tabular-nums whitespace-nowrap">
                  {row.amountOwedToSmb > 0 ? formatCurrency(row.amountOwedToSmb) : '—'}
                </td>
                <td className="px-4 py-3 text-right text-slate-600 tabular-nums whitespace-nowrap">
                  {row.ratePerSqCm > 0 ? formatCurrency(row.ratePerSqCm) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
