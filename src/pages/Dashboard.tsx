import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import {
  getOpenOrderValue,
  getOpenOrders,
  getNotesDue,
  getOrders,
  getClients,
} from '../lib/storage'
import { formatCurrency, formatDate, daysUntil } from '../lib/format'

export default function Dashboard() {
  const openValue = getOpenOrderValue()
  const openOrders = getOpenOrders()
  const notesDue = getNotesDue()
  const allOrders = getOrders()
  const clients = getClients()

  const statusCounts = allOrders.reduce(
    (acc, o) => {
      acc[o.status] = (acc[o.status] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Dashboard"
        description="Operational overview — open orders, notes due, and key metrics."
        action={{ label: 'Place Order', to: '/order' }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Open Order Value"
          value={formatCurrency(openValue)}
          subtext={`${openOrders.length} open order${openOrders.length !== 1 ? 's' : ''}`}
          accent="brand"
          icon={
            <svg className="w-8 h-8 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Notes Due"
          value={String(notesDue.length)}
          subtext={notesDue.length > 0 ? 'Action required' : 'All caught up'}
          accent="amber"
          icon={
            <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          }
        />
        <StatCard
          label="Total Orders"
          value={String(allOrders.length)}
          subtext="All time"
          accent="blue"
        />
        <StatCard
          label="Active Clients"
          value={String(clients.length)}
          subtext="Registered facilities"
          accent="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-xl border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Notes Due</h2>
            <Link to="/tracking" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
              View all orders
            </Link>
          </div>
          <div className="p-6">
            {notesDue.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No notes due. You're all caught up.</p>
            ) : (
              <ul className="space-y-3">
                {notesDue.map(({ order, note }) => {
                  const overdue = daysUntil(note.dueDate) < 0
                  return (
                    <li
                      key={note.id}
                      className={`p-4 rounded-lg border ${
                        overdue ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{note.text}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {order.orderNumber} · {order.clientName}
                          </p>
                        </div>
                        <span className={`text-xs font-semibold whitespace-nowrap ${overdue ? 'text-red-600' : 'text-amber-600'}`}>
                          {overdue ? 'Overdue' : 'Due today'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">Due {formatDate(note.dueDate)}</p>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Open Orders</h2>
          </div>
          <div className="p-6">
            {openOrders.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No open orders.</p>
            ) : (
              <ul className="space-y-3">
                {openOrders.map((order) => (
                  <li key={order.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-brand-200 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{order.orderNumber}</p>
                      <p className="text-xs text-slate-500">{order.clientName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-brand-700">{formatCurrency(order.totalValue)}</p>
                      <StatusBadge status={order.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-sm">
              <span className="text-slate-500">Total open value</span>
              <span className="font-bold text-brand-700">{formatCurrency(openValue)}</span>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 lg:col-span-2">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Order Status Breakdown</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {[
                { status: 'submitted', label: 'Submitted', color: 'bg-blue-500' },
                { status: 'processing', label: 'Processing', color: 'bg-amber-500' },
                { status: 'shipped', label: 'Shipped', color: 'bg-purple-500' },
                { status: 'delivered', label: 'Delivered', color: 'bg-green-500' },
                { status: 'draft', label: 'Draft', color: 'bg-slate-400' },
                { status: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
              ].map(({ status, label, color }) => (
                <div key={status} className="text-center">
                  <div className={`w-3 h-3 rounded-full ${color} mx-auto mb-2`} />
                  <p className="text-2xl font-bold text-slate-900">{statusCounts[status] ?? 0}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
