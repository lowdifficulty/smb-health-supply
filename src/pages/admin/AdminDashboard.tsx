import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import PageHeader from '../../components/PageHeader'
import StatCard from '../../components/StatCard'
import IvrRequestTable from '../../components/IvrRequestTable'
import { SQCM_ABBREV } from '../../lib/pricing'
import { formatCurrency } from '../../lib/format'
import { getAsgTotals } from '../../data/asgData'
import { fetchIvrRequests } from '../../lib/ivrApi'
import type { IvrRequest } from '../../types/ivr'

export default function AdminDashboard() {
  const asg = getAsgTotals()
  const [ivrRequests, setIvrRequests] = useState<IvrRequest[]>([])
  const [ivrLoading, setIvrLoading] = useState(true)

  useEffect(() => {
    fetchIvrRequests()
      .then(setIvrRequests)
      .finally(() => setIvrLoading(false))
  }, [])

  const pendingIvr = ivrRequests.filter((r) => r.status === 'Submitted' || r.status === 'Pending').length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <PageHeader
        title="Admin Dashboard"
        description="ASG remit data and Simple IVR submissions."
        action={{ label: 'ASG Remits', to: '/asg-data' }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        <StatCard label="ASG Patients" value={String(asg.patients)} subtext={`${asg.remitEvents} remit payments`} accent="brand" />
        <StatCard
          label="Total Remitted"
          value={formatCurrency(asg.remitDollars)}
          subtext={`${asg.remitSqCm.toFixed(1)} ${SQCM_ABBREV} on primary remits`}
          accent="green"
        />
        <StatCard
          label="Secondary Remits"
          value={formatCurrency(asg.secondaryRemitDollars)}
          subtext={
            asg.secondaryRemitEvents > 0
              ? `${asg.secondaryRemitEvents} secondary payment${asg.secondaryRemitEvents !== 1 ? 's' : ''}`
              : 'No secondary remits'
          }
          accent="blue"
        />
        <StatCard
          label="Remaining to Remit"
          value={formatCurrency(asg.leftDollars)}
          subtext={`${asg.leftSqCm.toFixed(1)} ${SQCM_ABBREV} outstanding`}
          accent="amber"
        />
        <StatCard
          label="IVR Submissions"
          value={String(ivrRequests.length)}
          subtext={pendingIvr > 0 ? `${pendingIvr} awaiting review` : 'All reviewed'}
          accent={pendingIvr > 0 ? 'blue' : 'green'}
        />
      </div>

      <section className="mb-8">
        <div className="px-6 py-4 border border-slate-200 rounded-xl bg-white flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-slate-900">ASG Remit Data</h2>
            <p className="text-sm text-slate-600 mt-1">
              {asg.claims} claim lines · {formatCurrency(asg.billedDollars)} billed
            </p>
          </div>
          <Link
            to="/asg-data"
            className="text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
          >
            Open remit summary →
          </Link>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Simple IVR Submissions</h2>
          <Link to="/ivr" className="text-sm font-medium text-brand-700 hover:text-brand-800">
            Full IVR page →
          </Link>
        </div>

        {ivrLoading ? (
          <div className="bg-white rounded-xl border border-slate-200 px-6 py-12 text-center text-slate-500 text-sm">
            Loading IVR submissions…
          </div>
        ) : (
          <IvrRequestTable
            requests={ivrRequests.slice(0, 25)}
            showClient
            emptyMessage="No Simple IVR submissions yet."
          />
        )}
        {ivrRequests.length > 25 && (
          <p className="text-xs text-slate-500 mt-2 text-center">
            Showing 25 of {ivrRequests.length}.{' '}
            <Link to="/ivr" className="text-brand-700 hover:underline">View all</Link>
          </p>
        )}
      </section>
    </div>
  )
}
