import { Link } from 'react-router-dom'
import { getNotesDue } from '../lib/storage'
import { usePortal } from '../context/PortalContext'

export default function OverdueWarnings() {
  const { portal, demoClientId } = usePortal()
  const allDue = getNotesDue()

  const due = portal === 'client'
    ? allDue.filter(({ order }) => order.clientId === demoClientId)
    : allDue

  if (due.length === 0) return null

  return (
    <div className="bg-red-50 border-b border-red-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800">
              {due.length} overdue note{due.length !== 1 ? 's' : ''} require attention
            </p>
            <ul className="mt-1 space-y-0.5">
              {due.slice(0, 3).map(({ order, note }) => (
                <li key={note.id} className="text-xs text-red-700">
                  {order.orderNumber}: {note.text}
                </li>
              ))}
              {due.length > 3 && (
                <li className="text-xs text-red-600">
                  +{due.length - 3} more —{' '}
                  <Link to={portal === 'admin' ? '/alerts' : '/tracking'} className="underline font-medium">
                    view all
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
