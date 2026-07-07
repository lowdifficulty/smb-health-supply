import { formatCurrency, formatDate } from '../lib/format'
import { SQCM_ABBREV } from '../lib/pricing'
import {
  getPatientClaims,
  getPatientRemitEvents,
  getPatientTotals,
  getRemitPdfLink,
} from '../data/asgData'
import RemitPdfLinks from './RemitPdfLinks'

export default function AsgPatientPanel({
  patientName,
  onClose,
}: {
  patientName: string
  onClose: () => void
}) {
  const totals = getPatientTotals(patientName)
  const events = getPatientRemitEvents(patientName)
  const claims = getPatientClaims(patientName).sort((a, b) => b.dos.localeCompare(a.dos))

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-8 bg-slate-900/40">
      <div
        className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        role="dialog"
        aria-labelledby="patient-panel-title"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-4">
          <div>
            <h2 id="patient-panel-title" className="text-xl font-bold text-slate-900">
              {patientName}
            </h2>
            <p className="text-sm text-slate-600 mt-1">Full remit history and balances</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-2xl leading-none px-2"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-4 border-b border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Placed ({SQCM_ABBREV})</p>
            <p className="text-lg font-semibold text-slate-900">{totals.placedSqCm.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-slate-500">Remitted ({SQCM_ABBREV})</p>
            <p className="text-lg font-semibold text-green-700">{totals.remittedSqCm.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-slate-500">Remaining ({SQCM_ABBREV})</p>
            <p className="text-lg font-semibold text-amber-700">{totals.remainingSqCm.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-slate-500">Billed</p>
            <p className="font-semibold">{formatCurrency(totals.billedDollars)}</p>
          </div>
          <div>
            <p className="text-slate-500">Remitted</p>
            <p className="font-semibold text-green-700">{formatCurrency(totals.remittedDollars)}</p>
          </div>
          <div>
            <p className="text-slate-500">Remaining</p>
            <p className="font-semibold text-amber-700">{formatCurrency(totals.remainingDollars)}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          <section>
            <h3 className="font-semibold text-slate-900 mb-3">Remit history ({events.length})</h3>
            {events.length === 0 ? (
              <p className="text-sm text-slate-500">No remits recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="border border-slate-200 rounded-lg p-4 text-sm bg-slate-50/50"
                  >
                    <div className="flex flex-wrap gap-x-6 gap-y-1 mb-2">
                      <span>
                        <span className="text-slate-500">DOS </span>
                        <span className="font-medium">{formatDate(event.dos)}</span>
                      </span>
                      <span>
                        <span className="text-slate-500">Remit </span>
                        <span className="font-medium">{formatDate(event.dateOfRemit)}</span>
                      </span>
                      <span className="text-slate-500 capitalize">{event.remitType}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-1">
                      <span className="text-green-700 font-medium">
                        {formatCurrency(event.remitAmountDollars)}
                      </span>
                      {event.remitUnitsSqCm > 0 && (
                        <span>{event.remitUnitsSqCm.toFixed(1)} {SQCM_ABBREV}</span>
                      )}
                      <span className="text-amber-700">
                        Remaining: {formatCurrency(event.remainingDollars)} · {event.remainingSqCm.toFixed(1)} {SQCM_ABBREV}
                      </span>
                    </div>
                    {event.remitPdf.label && (
                      <div className="mt-2">
                        <RemitPdfLinks links={[getRemitPdfLink(event.remitPdf)]} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h3 className="font-semibold text-slate-900 mb-3">All claim lines ({claims.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 text-left">
                    <th className="px-3 py-2 border-r border-slate-200">DOS</th>
                    <th className="px-3 py-2 border-r border-slate-200 text-right">Units</th>
                    <th className="px-3 py-2 border-r border-slate-200 text-right">Billed</th>
                    <th className="px-3 py-2 border-r border-slate-200">Status</th>
                    <th className="px-3 py-2 border-r border-slate-200 text-right">Remaining $</th>
                    <th className="px-3 py-2 text-right">Remaining {SQCM_ABBREV}</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map((claim) => (
                    <tr key={claim.id} className="border-b border-slate-100">
                      <td className="px-3 py-2 border-r border-slate-100">{formatDate(claim.dos)}</td>
                      <td className="px-3 py-2 border-r border-slate-100 text-right">{claim.unitsBilled}</td>
                      <td className="px-3 py-2 border-r border-slate-100 text-right">
                        {formatCurrency(claim.totalBilledAmount)}
                      </td>
                      <td className="px-3 py-2 border-r border-slate-100">{claim.submissionStatus || '—'}</td>
                      <td className="px-3 py-2 border-r border-slate-100 text-right text-amber-700">
                        {formatCurrency(claim.leftToRemitDollars)}
                      </td>
                      <td className="px-3 py-2 text-right">{claim.leftToRemitSqCm.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
