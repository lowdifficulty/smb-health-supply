import { Link } from 'react-router-dom'
import { getOpenOrderValue, getNotesDue, getOrders, getClients } from '../lib/storage'
import { formatCurrency } from '../lib/format'

export default function Home() {
  const openValue = getOpenOrderValue()
  const notesDue = getNotesDue()
  const orderCount = getOrders().length
  const clientCount = getClients().length

  return (
    <div>
      <section className="hero-banner">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-2xl">
            <p className="text-brand-200 text-sm font-medium uppercase tracking-wider mb-3">
              Wound Care Supply Portal
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              Skin Substitute &amp; Collagen Ordering
            </h1>
            <p className="text-brand-100 text-lg mt-4 leading-relaxed">
              Streamline ordering, tracking, and documentation for advanced wound care products.
              Built for clinics, hospitals, and home health providers.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                to="/order"
                className="px-6 py-3 bg-white text-brand-700 font-semibold rounded-lg hover:bg-brand-50 transition-colors"
              >
                Place an Order
              </Link>
              <Link
                to="/sign-on"
                className="px-6 py-3 border border-brand-300 text-white font-semibold rounded-lg hover:bg-brand-600/50 transition-colors"
              >
                New Client Sign On
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
            <p className="text-sm text-slate-500 font-medium">Open Order Value</p>
            <p className="text-3xl font-bold text-brand-700 mt-1">{formatCurrency(openValue)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
            <p className="text-sm text-slate-500 font-medium">Notes Due</p>
            <p className="text-3xl font-bold text-amber-600 mt-1">{notesDue.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
            <p className="text-sm text-slate-500 font-medium">Active Clients</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{clientCount}</p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-8">Platform Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'New Client Sign On',
              desc: 'Register healthcare facilities with NPI verification and contact details.',
              to: '/sign-on',
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              ),
            },
            {
              title: 'Place Orders',
              desc: 'Order skin substitutes and collagen products with patient and clinical details.',
              to: '/order',
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              ),
            },
            {
              title: 'Order Tracking',
              desc: 'Monitor order status, shipments, notes, and full order history in one place.',
              to: '/tracking',
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              ),
            },
            {
              title: 'Dashboard',
              desc: 'View open order value, notes due, and operational metrics at a glance.',
              to: '/dashboard',
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              ),
            },
          ].map((feature) => (
            <Link
              key={feature.to}
              to={feature.to}
              className="group bg-white rounded-xl border border-slate-200 p-6 hover:border-brand-300 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-slate-900 mt-4">{feature.title}</h3>
              <p className="text-sm text-slate-600 mt-2">{feature.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-slate-100 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Product Categories</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-500" />
                  Skin Substitutes — Apligraf, Dermagraft, EpiFix, PuraPly AM, and more
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-500" />
                  Collagen Products — HeliMend, Helistat, Oasis, PriMatrix
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Quick Stats</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>{orderCount} total orders in system</li>
                <li>{clientCount} registered client facilities</li>
                <li>10 wound care products available</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
