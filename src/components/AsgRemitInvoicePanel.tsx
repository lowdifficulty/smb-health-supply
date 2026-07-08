import { useMemo, useState } from 'react'
import { formatCurrency, formatDate } from '../lib/format'
import { getAsgRemitEvents, groupRemitEventsByInvoice } from '../data/asgData'
import { useAsgDataMeta } from '../context/AsgDataContext'

function formatRemitDates(dates: string[]): string {
  if (dates.length === 0) return '—'
  if (dates.length === 1) return formatDate(dates[0])
  return `${formatDate(dates[0])} – ${formatDate(dates[dates.length - 1])}`
}

export default function AsgRemitInvoicePanel() {
  const { ready } = useAsgDataMeta()
  const [expanded, setExpanded] = useState<string | null>(null)
  const links = useMemo(() => groupRemitEventsByInvoice(getAsgRemitEvents()), [ready])
  const linkedRemits = useMemo(
    () => getAsgRemitEvents().filter((event) => event.invoiceNumber).length,
    [ready],
  )

  if (!ready) return null

  return (
    <section className="mb-4 sm:mb-6 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200 bg-slate-50">
        <h2 className="text-base sm:text-lg font-semibold text-slate-900">Remits linked to Med Effects invoices</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
          Each insurance remit line is tied to a Med Effects vendor invoice using billed dates from the ASG sheet.
          {linkedRemits > 0
            ? ` ${linkedRemits} remit line${linkedRemits !== 1 ? 's' : ''} across ${links.length} invoice${links.length !== 1 ? 's' : ''}.`
            : ' No invoice links loaded yet — run `node scripts/generate-asg-data.mjs` and refresh.'}
        </p>
      </div>

      {links.length === 0 ? (
        <p className="px-4 sm:px-6 py-8 text-sm text-slate-500">
          No remit-to-invoice links found in the current data.
        </p>
      ) : (
        <>
          <div className="md:hidden divide-y divide-slate-100">
            {links.map((link) => (
              <div key={link.invoiceNumber} className="p-4">
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() =>
                    setExpanded((current) =>
                      current === link.invoiceNumber ? null : link.invoiceNumber,
                    )
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">Invoice #{link.invoiceNumber}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {link.invoiceDate ? formatDate(link.invoiceDate) : 'Date unknown'} ·{' '}
                        {link.remitEventCount} remit line{link.remitEventCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <span className="text-slate-400 text-xs shrink-0">
                      {expanded === link.invoiceNumber ? '▼' : '▶'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                    <div>
                      <p className="text-slate-400 uppercase tracking-wide text-[10px]">Invoice amount</p>
                      <p className="font-medium text-slate-800 mt-0.5 tabular-nums">
                        {link.invoiceAmount > 0 ? formatCurrency(link.invoiceAmount) : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 uppercase tracking-wide text-[10px]">Remit received</p>
                      <p className="font-medium text-green-700 mt-0.5 tabular-nums">
                        {formatCurrency(link.totalRemitDollars)}
                      </p>
                    </div>
                  </div>
                </button>
                {expanded === link.invoiceNumber && (
                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-2">
                    <p>
                      <span className="text-slate-500">Remit dates: </span>
                      {formatRemitDates(link.remitDates)}
                    </p>
                    <p>
                      <span className="text-slate-500">Patients: </span>
                      {link.patientCount}
                    </p>
                    {link.remitPdfLabels.length > 0 && (
                      <p className="leading-relaxed break-words">
                        <span className="text-slate-500">Remit PDFs: </span>
                        {link.remitPdfLabels.join(', ')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="hidden md:block overflow-x-auto table-scroll-x">
            <table className="w-full text-sm border-collapse min-w-[920px]">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 whitespace-nowrap">Invoice #</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 whitespace-nowrap">Invoice date</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600 whitespace-nowrap">Invoice amount</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600 whitespace-nowrap">Remit lines</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600 whitespace-nowrap">Remit received</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 whitespace-nowrap">Remit dates</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 whitespace-nowrap">Remit PDFs</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link, index) => (
                  <tr
                    key={link.invoiceNumber}
                    className={`border-b border-slate-100 hover:bg-brand-50/30 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                    }`}
                  >
                    <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">#{link.invoiceNumber}</td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {link.invoiceDate ? formatDate(link.invoiceDate) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700 tabular-nums whitespace-nowrap">
                      {link.invoiceAmount > 0 ? formatCurrency(link.invoiceAmount) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700 whitespace-nowrap">
                      {link.remitEventCount} · {link.patientCount} pt
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-green-700 tabular-nums whitespace-nowrap">
                      {formatCurrency(link.totalRemitDollars)}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {formatRemitDates(link.remitDates)}
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-[260px]">
                      <span className="line-clamp-2">{link.remitPdfLabels.join(', ') || '—'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}
