import { Link } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'
import { SQCM_ABBREV } from '../../lib/pricing'
import StatCard from '../../components/StatCard'
import { usePortal } from '../../context/PortalContext'
import { getClientById } from '../../lib/storage'
import { getClientNotesDue } from '../../lib/stats'
import { skinSubstituteRecords, CLIENT_PORTAL_NAME } from '../../data/skinSubstitutes'

export default function ClientDashboard() {
  const { demoClientId } = usePortal()
  const client = getClientById(demoClientId)
  const notesDue = getClientNotesDue(demoClientId)

  const consigned = skinSubstituteRecords.filter((r) => r.status === 'Consigned').length
  const applied = skinSubstituteRecords.filter((r) => r.status === 'Applied').length
  const appeals = skinSubstituteRecords.filter((r) => r.status === 'Appeals').length
  const paid = skinSubstituteRecords.filter((r) => r.status === 'Paid').length
  const totalSqCm = skinSubstituteRecords.reduce((s, r) => s + r.totalSqCm, 0)
  const recent = [...skinSubstituteRecords]
    .sort((a, b) => b.orderDate.localeCompare(a.orderDate))
    .slice(0, 5)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title={client?.facilityName ?? CLIENT_PORTAL_NAME}
        description={`Welcome, ${client?.contactName ?? 'User'}. Manage your wound care orders and products.`}
        action={{ label: 'Place Order', to: '/order' }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label={`Total ${SQCM_ABBREV}`} value={totalSqCm.toFixed(1)} subtext={`${skinSubstituteRecords.length} tissue records`} accent="brand" />
        <StatCard label="Consigned" value={String(consigned)} subtext={`${applied} applied · ${paid} paid`} accent="blue" />
        <StatCard label="Appeals" value={String(appeals)} subtext={appeals > 0 ? 'Needs attention' : 'None'} accent="amber" />
        <StatCard
          label="Overdue Notes"
          value={String(notesDue.length)}
          subtext={notesDue.length > 0 ? 'Action required' : 'All clear'}
          accent={notesDue.length > 0 ? 'red' : 'green'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-xl border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-semibold text-slate-900">Recent Skin Substitutes</h2>
            <Link to="/tracking" className="text-sm text-brand-600 font-medium">View all</Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {recent.map((record) => (
              <li key={record.id} className="px-6 py-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-slate-900 text-sm font-mono">{record.tissueId}</p>
                  <p className="text-xs text-slate-500">{record.brand} · {record.product}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-brand-700">{record.totalSqCm.toFixed(1)} {SQCM_ABBREV}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    record.status === 'Consigned' ? 'bg-blue-100 text-blue-800'
                      : record.status === 'Appeals' ? 'bg-amber-100 text-amber-800'
                      : record.status === 'Applied' ? 'bg-purple-100 text-purple-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {record.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white rounded-xl border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-semibold text-slate-900">Quick Actions</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { to: '/order', label: 'Place Order', desc: 'Order skin subs & collagen' },
              { to: '/tracking', label: 'Track Orders', desc: 'Full tissue, shipping & invoice data' },
            ].map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="p-4 rounded-lg border border-slate-200 hover:border-brand-300 hover:bg-brand-50/50 transition-colors"
              >
                <p className="font-medium text-slate-900 text-sm">{action.label}</p>
                <p className="text-xs text-slate-500 mt-1">{action.desc}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
