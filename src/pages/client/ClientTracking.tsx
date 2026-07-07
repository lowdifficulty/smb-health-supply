import { Link } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'
import { usePortal } from '../../context/PortalContext'
import { getClientOrders } from '../../lib/stats'
import { formatCurrency, formatDate } from '../../lib/format'

const STATUS_LABELS: Record<string, string> = {
  submitted: 'Submitted',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export default function ClientTracking() {
  const { demoClientId } = usePortal()
  const orders = getClientOrders(demoClientId)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <PageHeader
        title="Track Orders"
        description="View your Membrane Wrap orders and shipment status."
        action={{ label: 'Place Order', to: '/order' }}
      />

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 px-6 py-12 text-center">
          <p className="text-slate-600">No orders yet.</p>
          <Link to="/order" className="mt-3 inline-block text-sm font-medium text-brand-700 hover:underline">
            Place your first order →
          </Link>
        </div>
      ) : (
        <>
          <div className="md:hidden bg-white rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
            {orders.map((order) => (
              <div key={order.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{order.orderNumber}</p>
                    <p className="text-sm text-slate-600 mt-0.5 truncate">{order.patientName || '—'}</p>
                  </div>
                  <span className="text-sm font-medium text-slate-700 shrink-0 tabular-nums">
                    {formatCurrency(order.totalValue)}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                  <span>{STATUS_LABELS[order.status] ?? order.status}</span>
                  <span>{formatDate(order.createdAt)}</span>
                  {order.trackingNumber && (
                    <span className="truncate">
                      {order.shippingCarrier ?? 'Carrier'} · {order.trackingNumber}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto table-scroll-x">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-left text-slate-500">
                    <th className="px-6 py-3 font-medium">Order #</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Patient</th>
                    <th className="px-4 py-3 font-medium">Placed</th>
                    <th className="px-4 py-3 font-medium text-right">Value</th>
                    <th className="px-4 py-3 font-medium">Tracking</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-6 py-3 font-medium text-slate-900">{order.orderNumber}</td>
                      <td className="px-4 py-3 text-slate-600">{STATUS_LABELS[order.status] ?? order.status}</td>
                      <td className="px-4 py-3 text-slate-600">{order.patientName || '—'}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(order.createdAt)}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatCurrency(order.totalValue)}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {order.trackingNumber ? (
                          <span>{order.shippingCarrier ?? 'Carrier'} · {order.trackingNumber}</span>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
