import { Link } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/StatusBadge'
import { getNotesDue } from '../../lib/storage'
import { formatDate, daysUntil } from '../../lib/format'

export default function AdminAlerts() {
  const alerts = getNotesDue()

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Alerts"
        description="Overdue notes across all client accounts requiring follow-up."
      />

      {alerts.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-slate-600 mt-4">No overdue notes. All clients are up to date.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map(({ order, note }) => {
            const overdue = daysUntil(note.dueDate) < 0
            const days = Math.abs(daysUntil(note.dueDate))
            return (
              <div
                key={note.id}
                className={`bg-white rounded-xl border p-5 ${
                  overdue ? 'border-red-200 bg-red-50/50' : 'border-amber-200 bg-amber-50/50'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      overdue ? 'bg-red-100' : 'bg-amber-100'
                    }`}>
                      <svg className={`w-5 h-5 ${overdue ? 'text-red-600' : 'text-amber-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{note.text}</p>
                      <p className="text-sm text-slate-600 mt-1">
                        {order.clientName} · {order.orderNumber}
                        {order.patientName && ` · Patient: ${order.patientName}`}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Due {formatDate(note.dueDate)}
                        {overdue
                          ? ` · ${days} day${days !== 1 ? 's' : ''} overdue`
                          : ' · Due today'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <StatusBadge status={order.status} />
                    <Link
                      to="/dashboard"
                      className="block text-xs text-brand-600 hover:text-brand-700 mt-2 font-medium"
                    >
                      View client →
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
