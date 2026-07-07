import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import { getOrders, updateOrder } from '../lib/storage'
import { formatCurrency, formatDate, formatDateTime, daysUntil } from '../lib/format'
import type { Order, OrderStatus } from '../types'

export default function Tracking() {
  const [orders, setOrders] = useState(getOrders())
  const [selectedId, setSelectedId] = useState<string | null>(orders[0]?.id ?? null)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [search, setSearch] = useState('')

  const filtered = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      o.orderNumber.toLowerCase().includes(q) ||
      o.clientName.toLowerCase().includes(q) ||
      o.patientName?.toLowerCase().includes(q)
    return matchesStatus && matchesSearch
  })

  const selected = orders.find((o) => o.id === selectedId)

  function refresh() {
    setOrders(getOrders())
  }

  function toggleNoteComplete(order: Order, noteId: string) {
    const updated = {
      ...order,
      notes: order.notes.map((n) =>
        n.id === noteId ? { ...n, completed: !n.completed } : n,
      ),
      updatedAt: new Date().toISOString(),
    }
    updateOrder(updated)
    refresh()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Order Tracking"
        description="View and manage all orders with full details, notes, and shipment status."
        action={{ label: 'Place Order', to: '/order' }}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order #, client, or patient..."
          className="input flex-1"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
          className="input sm:w-48"
        >
          <option value="all">All Statuses</option>
          <option value="submitted">Submitted</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
              <p className="text-sm font-medium text-slate-700">
                {filtered.length} order{filtered.length !== 1 ? 's' : ''}
              </p>
            </div>
            <ul className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {filtered.length === 0 ? (
                <li className="p-6 text-sm text-slate-500 text-center">No orders found.</li>
              ) : (
                filtered.map((order) => (
                  <li key={order.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(order.id)}
                      className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors ${
                        selectedId === order.id ? 'bg-brand-50 border-l-4 border-brand-600' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-900 text-sm">{order.orderNumber}</span>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{order.clientName}</p>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-slate-400">{formatDate(order.createdAt)}</span>
                        <span className="text-xs font-medium text-brand-700">{formatCurrency(order.totalValue)}</span>
                      </div>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3">
          {selected ? (
            <OrderDetail order={selected} onToggleNote={toggleNoteComplete} />
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
              Select an order to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function OrderDetail({
  order,
  onToggleNote,
}: {
  order: Order
  onToggleNote: (order: Order, noteId: string) => void
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{order.orderNumber}</h2>
          <p className="text-sm text-slate-500">{order.clientName}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="p-6 space-y-6">
        <section>
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Order Info</h3>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <dt className="text-slate-500">Created</dt>
            <dd className="text-slate-900">{formatDateTime(order.createdAt)}</dd>
            <dt className="text-slate-500">Last Updated</dt>
            <dd className="text-slate-900">{formatDateTime(order.updatedAt)}</dd>
            <dt className="text-slate-500">Total Value</dt>
            <dd className="font-semibold text-brand-700">{formatCurrency(order.totalValue)}</dd>
            {order.expectedDelivery && (
              <>
                <dt className="text-slate-500">Expected Delivery</dt>
                <dd className="text-slate-900">{formatDate(order.expectedDelivery)}</dd>
              </>
            )}
            {order.trackingNumber && (
              <>
                <dt className="text-slate-500">Tracking #</dt>
                <dd className="text-slate-900 font-mono text-xs">{order.trackingNumber}</dd>
              </>
            )}
          </dl>
        </section>

        {(order.patientName || order.woundType) && (
          <section>
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Patient &amp; Clinical</h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {order.patientName && (
                <>
                  <dt className="text-slate-500">Patient</dt>
                  <dd className="text-slate-900">{order.patientName}</dd>
                </>
              )}
              {order.patientDob && (
                <>
                  <dt className="text-slate-500">DOB</dt>
                  <dd className="text-slate-900">{formatDate(order.patientDob)}</dd>
                </>
              )}
              {order.woundType && (
                <>
                  <dt className="text-slate-500">Wound Type</dt>
                  <dd className="text-slate-900">{order.woundType}</dd>
                </>
              )}
              {order.icd10 && (
                <>
                  <dt className="text-slate-500">ICD-10</dt>
                  <dd className="text-slate-900">{order.icd10}</dd>
                </>
              )}
            </dl>
          </section>
        )}

        <section>
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Shipping</h3>
          <p className="text-sm text-slate-900">{order.shippingAddress}</p>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Line Items</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-slate-500">
                  <th className="pb-2 font-medium">Product</th>
                  <th className="pb-2 font-medium">SKU</th>
                  <th className="pb-2 font-medium">Size</th>
                  <th className="pb-2 font-medium text-right">Qty</th>
                  <th className="pb-2 font-medium text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className="py-2 text-slate-900">{item.productName}</td>
                    <td className="py-2 text-slate-500 font-mono text-xs">{item.sku}</td>
                    <td className="py-2 text-slate-600">{item.size}</td>
                    <td className="py-2 text-right">{item.quantity}</td>
                    <td className="py-2 text-right font-medium">{formatCurrency(item.unitPrice * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {order.notes.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Notes</h3>
            <ul className="space-y-2">
              {order.notes.map((note) => {
                const overdue = !note.completed && daysUntil(note.dueDate) < 0
                const dueToday = !note.completed && daysUntil(note.dueDate) === 0
                return (
                  <li
                    key={note.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      note.completed
                        ? 'bg-slate-50 border-slate-100'
                        : overdue
                          ? 'bg-red-50 border-red-200'
                          : dueToday
                            ? 'bg-amber-50 border-amber-200'
                            : 'bg-white border-slate-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={note.completed}
                      onChange={() => onToggleNote(order, note.id)}
                      className="mt-1 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    <div className="flex-1">
                      <p className={`text-sm ${note.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {note.text}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Due {formatDate(note.dueDate)}
                        {overdue && !note.completed && (
                          <span className="ml-2 text-red-600 font-medium">Overdue</span>
                        )}
                        {dueToday && !note.completed && (
                          <span className="ml-2 text-amber-600 font-medium">Due today</span>
                        )}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}
