import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import './marketing.css'
import { MarketingInquiryProvider, useMarketingInquiry } from './MarketingInquiryContext'

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/products', label: 'Products' },
  { to: '/partner-with-us', label: 'Partner With Us' },
  { to: '/contact', label: 'Contact' },
]

function MarketingChrome() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { openModal } = useMarketingInquiry()
  const location = useLocation()

  useEffect(() => {
    setMenuOpen(false)
    document.body.style.overflow = ''
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <div className="marketing-site">
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
            <img
              src="/wp-content/uploads/2026/01/logo-1-r9x4pqcr1en5j8nwpsmgbfyjwief9dy49ety9lo82s-1.png"
              alt="SMB Health Supply"
            />
          </Link>
          <nav className="nav-desktop" aria-label="Main">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => (isActive ? 'active' : undefined)}
              >
                {item.label}
              </NavLink>
            ))}
            <div className="header-actions">
              <Link to="/login" className="btn-login">Login</Link>
              <button type="button" className="btn btn-primary" onClick={openModal}>
                Get Started
              </button>
            </div>
          </nav>
          <button
            type="button"
            className={`menu-toggle${menuOpen ? ' open' : ''}`}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
          </button>
        </div>
        <nav className={`nav-mobile${menuOpen ? ' open' : ''}`} aria-label="Mobile">
          {NAV.map((item) => (
            <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)}>
              {item.label}
            </Link>
          ))}
          <Link to="/login" className="btn-login" onClick={() => setMenuOpen(false)}>
            Login
          </Link>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setMenuOpen(false)
              openModal()
            }}
          >
            Get Started
          </button>
        </nav>
      </header>

      <Outlet />

      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <div className="footer-logo-wrap">
              <img src="/wp-content/uploads/2026/01/logo2-2.png" alt="SMB Health Supply" />
            </div>
            <p>
              Premier distributor of advanced skin substitutes and wound care solutions for healthcare
              providers nationwide.
            </p>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/partner-with-us">Partner With Us</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Solutions</h4>
            <ul>
              <li><Link to="/products">Skin Substitutes</Link></li>
              <li><Link to="/products">Wound Care Management</Link></li>
              <li><Link to="/products">Reimbursement Support</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <ul>
              <li><a href="tel:+19133026065">(913) 302-6065</a></li>
              <li><a href="mailto:support@smbhealthsupply.com">support@smbhealthsupply.com</a></li>
            </ul>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© {new Date().getFullYear()} SMB Health. All rights reserved.</span>
          <div className="footer-links">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-of-service">Terms of Service</Link>
            <Link to="/login">Client Login</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function MarketingLayout() {
  return (
    <MarketingInquiryProvider>
      <MarketingChrome />
    </MarketingInquiryProvider>
  )
}
