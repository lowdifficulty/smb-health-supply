import StatCard from './StatCard'
import { formatCurrency, formatDate } from '../lib/format'
import { SQCM_ABBREV } from '../lib/pricing'
import { getRemitBalancesForYears } from '../data/asgData'
import { MED_EFFECTS_STATEMENT } from '../data/medEffectsStatement'

const REMIT_YEARS = ['2025', '2026']

function AgingRow({
  label,
  amount,
  emphasize,
}: {
  label: string
  amount: number
  emphasize?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className={emphasize ? 'font-medium text-slate-800' : 'text-slate-600'}>{label}</span>
      <span className={`tabular-nums ${emphasize ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
        {formatCurrency(amount)}
      </span>
    </div>
  )
}

export default function AsgDashboardAnalytics() {
  const yearBalances = getRemitBalancesForYears(REMIT_YEARS)
  const statement = MED_EFFECTS_STATEMENT

  return (
    <section className="mb-4 sm:mb-6 space-y-4 sm:space-y-6" aria-label="Account analytics">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200 bg-slate-50">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Vendor account</p>
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 mt-1">{statement.vendorName}</h2>
            <p className="text-xs text-slate-500 mt-1">
              Statement #{statement.statementNumber} · as of {formatDate(statement.statementDate)}
            </p>
          </div>
          <div className="px-4 sm:px-6 py-4 sm:py-5">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-600">Balance due to Med Effects</p>
                <p className="text-2xl sm:text-4xl font-bold text-slate-900 mt-1 tabular-nums tracking-tight">
                  {formatCurrency(statement.totalDue)}
                </p>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-1">{statement.billTo}</p>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                <p className="font-medium">90+ days past due</p>
                <p className="tabular-nums font-semibold mt-0.5">
                  {formatCurrency(statement.aging.days90plus)}
                </p>
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-slate-100 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Aging</p>
              <AgingRow label="Current" amount={statement.aging.current} />
              <AgingRow label="1–30 days past due" amount={statement.aging.days1to30} />
              <AgingRow label="31–60 days past due" amount={statement.aging.days31to60} />
              <AgingRow label="61–90 days past due" amount={statement.aging.days61to90} />
              <AgingRow label="90+ days past due" amount={statement.aging.days90plus} emphasize />
            </div>

            <div className="mt-5 pt-5 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Payments to Med Effects
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {statement.byYear.map((row) => (
                  <div key={row.year} className="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
                    <p className="text-xs font-medium text-slate-500">{row.year}</p>
                    <p className="text-sm font-semibold text-slate-900 mt-1 tabular-nums">
                      Paid {formatCurrency(row.paid)}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                      Invoiced {formatCurrency(row.invoiced)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200 bg-slate-50">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Insurance remits</p>
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 mt-1">2025 &amp; 2026 remit balances</h2>
            <p className="text-xs text-slate-500 mt-1">
              Remit received by year and remaining insurance balance on claim lines (by DOS year).
            </p>
          </div>
          <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4">
            {yearBalances.map((row) => (
              <div
                key={row.year}
                className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 sm:p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{row.year} remits</p>
                  <p className="text-xs text-slate-500">
                    {row.remitEventCount} payment{row.remitEventCount !== 1 ? 's' : ''} · {row.claimLineCount} claim
                    lines
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-slate-400 font-medium">Remit received</p>
                    <p className="text-lg sm:text-xl font-semibold text-green-700 mt-1 tabular-nums">
                      {formatCurrency(row.remitDollars)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 tabular-nums">
                      Primary {formatCurrency(row.primaryRemitDollars)}
                      {row.secondaryRemitDollars > 0 && (
                        <> · Secondary {formatCurrency(row.secondaryRemitDollars)}</>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-slate-400 font-medium">
                      Remaining to remit
                    </p>
                    <p className="text-lg sm:text-xl font-semibold text-amber-700 mt-1 tabular-nums">
                      {formatCurrency(row.remainingDollars)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {row.remainingSqCm.toFixed(1)} {SQCM_ABBREV} outstanding
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {yearBalances.map((row) => (
          <StatCard
            key={`stat-${row.year}`}
            label={`${row.year} remit received`}
            value={formatCurrency(row.remitDollars)}
            subtext={`${row.remitEventCount} insurance remit${row.remitEventCount !== 1 ? 's' : ''}`}
            accent="green"
          />
        ))}
        {yearBalances.map((row) => (
          <StatCard
            key={`remaining-${row.year}`}
            label={`${row.year} remaining balance`}
            value={formatCurrency(row.remainingDollars)}
            subtext={`${row.remainingSqCm.toFixed(1)} ${SQCM_ABBREV} on ${row.claimLineCount} lines`}
            accent="amber"
          />
        ))}
      </div>
    </section>
  )
}
