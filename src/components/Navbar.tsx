import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { usePortal } from '../context/PortalContext'
import { useAuth } from '../context/AuthContext'
import AsgPaymentDueBanner from './AsgPaymentDueBanner'
import { useAsgPaymentOwed } from '../hooks/useAsgPaymentOwed'

const clientNav = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/tracking', label: 'Track Orders' },
  { to: '/order', label: 'Place Order' },
  { to: '/billing', label: 'Billing' },
  { to: '/ivr', label: 'IVR' },
]

const adminNav = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/asg-data', label: 'ASG' },
  { to: '/accounts', label: 'Create Account' },
  { to: '/alerts', label: 'Alerts' },
  { to: '/ivr', label: 'IVR' },
]

function navLinkClass(active: boolean, mobile = false) {
  if (mobile) {
    return `flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium transition-colors ${
      active ? 'bg-brand-600 text-white' : 'text-slate-700 hover:bg-slate-100'
    }`
  }
  return `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    active ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
  }`
}

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { portal } = usePortal()
  const { isAuthenticated, logout } = useAuth()
  const { hasBalance } = useAsgPaymentOwed()
  const [menuOpen, setMenuOpen] = useState(false)
  const navItems = portal === 'admin' ? adminNav : clientNav

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  function handleLogout() {
    setMenuOpen(false)
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm safe-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
          <Link to="/dashboard" className="flex items-center gap-2.5 group shrink-0 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm group-hover:bg-brand-700 transition-colors shrink-0">
              ASG
            </div>
            <div className="min-w-0 hidden sm:block">
              <p className="font-semibold text-slate-900 leading-tight text-sm sm:text-base truncate">ASG</p>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-tight truncate">
                {portal === 'admin' ? 'Admin Portal' : 'Client Portal'}
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2 shrink-0">
            {portal === 'client' && <AsgPaymentDueBanner compact />}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          <nav className="hidden md:flex flex-1 items-center justify-end gap-1">
            {navItems.map((item) => {
              const active = location.pathname === item.to
              return (
                <Link key={item.to} to={item.to} className={navLinkClass(active)}>
                  {item.label}
                  {portal === 'client' && item.to === '/billing' && hasBalance && (
                    <span className="ml-1.5 inline-flex h-2 w-2 rounded-full bg-blue-500" aria-label="Payment due" />
                  )}
                </Link>
              )
            })}
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              >
                Log out
              </button>
            ) : (
              <Link to="/login" className={navLinkClass(location.pathname === '/login')}>
                Login
              </Link>
            )}
          </nav>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden fixed inset-0 top-14 z-40">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <nav
            className="absolute top-0 left-0 right-0 max-h-[calc(100dvh-3.5rem)] overflow-y-auto bg-white border-b border-slate-200 shadow-lg px-4 py-4 pb-safe space-y-1"
            aria-label="Mobile navigation"
          >
            {navItems.map((item) => {
              const active = location.pathname === item.to
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={navLinkClass(active, true)}
                  onClick={() => setMenuOpen(false)}
                >
                  <span>{item.label}</span>
                  {portal === 'client' && item.to === '/billing' && hasBalance && (
                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-blue-500 shrink-0" aria-hidden />
                  )}
                </Link>
              )
            })}
            {isAuthenticated ? (
              <button type="button" onClick={handleLogout} className={navLinkClass(false, true)}>
                <span>Log out</span>
              </button>
            ) : (
              <Link
                to="/login"
                className={navLinkClass(location.pathname === '/login', true)}
                onClick={() => setMenuOpen(false)}
              >
                <span>Login</span>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
