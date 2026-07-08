import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import RemitPdfLinks from './RemitPdfLinks'
import { formatCurrency, formatDate } from '../lib/format'
import { SQCM_ABBREV } from '../lib/pricing'
import { getRemitPdfLink } from '../data/asgData'
import type { AsgPaymentDueBreakdown } from '../lib/asgRemitPayments'
import { useAsgPaymentOwed } from '../hooks/useAsgPaymentOwed'

const payButtonColors =
  'bg-brand-700 text-white hover:bg-brand-800 hover:text-white active:bg-brand-900 active:text-white shadow-none [&]:text-white'

const payButton =
  `inline-flex items-center justify-center w-full sm:w-auto px-6 sm:px-8 py-3.5 rounded-xl ${payButtonColors} text-base sm:text-lg font-bold transition-colors shrink-0`

const summarySurface = 'border-b border-green-200 bg-green-50'

function RemitDueRow({ item }: { item: AsgPaymentDueBreakdown }) {
  const [open, setOpen] = useState(false)

  return (
    <li className="text-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex flex-col gap-2 py-3.5 text-left rounded-lg hover:bg-slate-100/80 active:bg-slate-100 transition-colors px-2 -mx-2"
        aria-expanded={open}
      >
        <div className="flex items-start gap-2 min-w-0">
          <span className="text-slate-400 text-xs mt-0.5 shrink-0 w-4" aria-hidden>
            {open ? '▼' : '▶'}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-slate-900 leading-snug">
              Remit {formatDate(item.dateOfRemit)}
              {item.remitSqCm != null && (
                <span className="text-slate-500 font-normal">
                  {' '}
                  · {item.remitSqCm} {SQCM_ABBREV}
                </span>
              )}
            </p>
            <p className="text-slate-500 text-xs mt-0.5 break-words">{item.remitPdfLabel}</p>
            {item.prepaymentCredit > 0 && (
              <p className="text-amber-700 text-xs mt-1">
                Includes {formatCurrency(item.prepaymentCredit)} good-faith prepayment credit
              </p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 pl-6 sm:pl-0 sm:flex sm:justify-end sm:gap-6 sm:text-right">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-slate-400 font-medium">Received</p>
            <p className="text-slate-700 tabular-nums font-medium">{formatCurrency(item.insuranceRemitDollars)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-slate-400 font-medium">Owed</p>
            <p className="font-semibold text-slate-900 tabular-nums">{formatCurrency(item.amount)}</p>
            {item.prepaymentCredit > 0 && (
              <p className="text-[11px] text-slate-500 line-through tabular-nums">
                {formatCurrency(item.grossAmount)}
              </p>
            )}
          </div>
        </div>
      </button>

      {open && (
        <div className="ml-6 mr-1 mb-3 pb-3 pl-3 border-l-2 border-slate-200 space-y-3 text-xs text-slate-600">
          {item.lineItems.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse min-w-[640px]">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-2 pr-3 text-left font-semibold text-slate-500">Patient</th>
                    <th className="py-2 pr-3 text-left font-semibold text-slate-500">Invoice #</th>
                    <th className="py-2 pr-3 text-right font-semibold text-slate-500">{SQCM_ABBREV}</th>
                    <th className="py-2 text-right font-semibold text-slate-500">Owed to SMB</th>
                  </tr>
                </thead>
                <tbody>
                  {item.lineItems.map((line) => (
                    <tr key={line.eventId} className="border-b border-slate-100 last:border-b-0">
                      <td className="py-2 pr-3 text-slate-800 font-medium">{line.patientName}</td>
                      <td className="py-2 pr-3 text-slate-700">{line.invoiceNumber ? `#${line.invoiceNumber}` : '—'}</td>
                      <td className="py-2 pr-3 text-right text-slate-700">
                        {line.remitSqCm > 0 ? line.remitSqCm.toFixed(1) : '—'}
                      </td>
                      <td className="py-2 text-right font-semibold text-brand-800 tabular-nums">
                        {formatCurrency(line.amountOwedToSmb)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            <p>
              Insurance remit:{' '}
              <span className="font-medium text-slate-800">
                {formatCurrency(item.insuranceRemitDollars)}
              </span>
              {item.insuranceRemitSqCm > 0 && (
                <span className="text-slate-500">
                  {' '}
                  · {item.insuranceRemitSqCm.toFixed(1)} {SQCM_ABBREV}
                </span>
              )}
            </p>
            <p>
              Payment owed to SMB:{' '}
              <span className="font-semibold text-slate-900">{formatCurrency(item.amount)}</span>
            </p>
          </div>
          <p>
            <span className="text-slate-500">Remit PDF: </span>
            <RemitPdfLinks links={[getRemitPdfLink(item.remitPdf)]} />
          </p>
        </div>
      )}
    </li>
  )
}

export default function AsgPaymentDueBanner({
  compact = false,
  footer,
}: {
  compact?: boolean
  footer?: ReactNode
}) {
  const { breakdown, paymentOwed, remitsReceived, hasBalance } = useAsgPaymentOwed()

  if (!hasBalance) return null

  if (compact) {
    return (
      <Link
        to="/billing?pay=1"
        className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg ${payButtonColors} text-xs sm:text-sm font-semibold transition-colors max-w-[9rem] sm:max-w-none`}
      >
        <span className="truncate text-white">Pay {formatCurrency(paymentOwed)}</span>
        <span className="text-white shrink-0" aria-hidden>→</span>
      </Link>
    )
  }

  return (
    <section
      className="mb-4 sm:mb-6 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
      aria-label="Remit payments"
    >
      <div className={`px-4 py-4 sm:px-6 sm:py-5 ${summarySurface}`}>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 sm:gap-8">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-slate-600">Remits received</p>
              <p className="text-2xl sm:text-4xl font-bold text-slate-900 mt-0.5 sm:mt-1 tabular-nums tracking-tight">
                {formatCurrency(remitsReceived)}
              </p>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
                {breakdown.length} remit{breakdown.length !== 1 ? 's' : ''} with payment due
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-slate-600">Payment owed</p>
              <p className="text-2xl sm:text-4xl font-bold text-slate-900 mt-0.5 sm:mt-1 tabular-nums tracking-tight">
                {formatCurrency(paymentOwed)}
              </p>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Due to SMB Health Supply</p>
            </div>
          </div>
          {!footer && (
            <Link to="/billing?pay=1" className={payButton}>
              <span className="text-white">Pay now</span>
            </Link>
          )}
        </div>
      </div>

      <ul className="divide-y divide-slate-200 px-4 sm:px-6 py-1 bg-slate-50">
        {breakdown.map((item) => (
          <RemitDueRow key={item.dateOfRemit} item={item} />
        ))}
      </ul>

      {footer && (
        <div className="px-4 sm:px-6 py-4 border-t border-slate-200 bg-slate-50">
          {footer}
        </div>
      )}
    </section>
  )
}

export const asgPayNowButtonClass =
  `inline-flex items-center justify-center w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3 rounded-xl ${payButtonColors} text-base sm:text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors`
