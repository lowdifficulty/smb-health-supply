import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import PortalToggle from '../PortalToggle'
import type { StatusFilter } from '../../types/skinSubstitute'

interface FyfNavbarProps {
  activeTab: StatusFilter
  onTabChange: (tab: StatusFilter) => void
}

const statusTabs: { id: StatusFilter; label: string }[] = [
  { id: 'All', label: 'All' },
  { id: 'Consigned', label: 'Consigned' },
  { id: 'Applied', label: 'Applied' },
  { id: 'Paid', label: 'Paid' },
  { id: 'Appeals', label: 'Appeals' },
]

export default function FyfNavbar({ activeTab, onTabChange }: FyfNavbarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [otherOpen, setOtherOpen] = useState(false)
  const [ivrOpen, setIvrOpen] = useState(false)
  const [paymentsOpen, setPaymentsOpen] = useState(false)
  const [orderOpen, setOrderOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOtherOpen(false)
        setIvrOpen(false)
        setPaymentsOpen(false)
        setOrderOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const onSkinSubPage = location.pathname === '/skin-substitutes' || location.pathname === '/dashboard'

  return (
    <div className="fyf-nav-wrap">
      <div className="fyf-top-bar">
        <div className="fyf-top-bar-inner">
          <div className="fyf-brand">
            <span className="fyf-brand-logo">SMB</span>
            <span className="fyf-brand-text">SMB Health Supply</span>
          </div>
          <PortalToggle />
        </div>
      </div>

      <ul className="fyf-tabs">
        <li>
          <Link to="/skin-substitutes" className={`fyf-tab ${onSkinSubPage ? 'active' : ''}`}>
            Skin Substitutes
          </Link>
        </li>
        {statusTabs.map((tab) => (
          <li key={tab.id}>
            <button
              type="button"
              className={`fyf-tab ${onSkinSubPage && activeTab === tab.id ? 'active' : ''}`}
              onClick={() => {
                onTabChange(tab.id)
                if (!onSkinSubPage) navigate('/skin-substitutes')
              }}
            >
              {tab.label}
            </button>
          </li>
        ))}
        <li className="fyf-dropdown-wrap">
          <div ref={dropdownRef} className="fyf-dropdown-inner">
          <button
            type="button"
            className={`fyf-tab fyf-tab-dropdown ${otherOpen ? 'active' : ''}`}
            onClick={() => setOtherOpen(!otherOpen)}
          >
            Other Links
            <span className="fyf-caret">▾</span>
          </button>
          {otherOpen && (
            <ul className="fyf-dropdown-menu">
              <li className="fyf-dropdown-parent">
                <button type="button" onClick={() => setIvrOpen(!ivrOpen)}>
                  IVR Portals {ivrOpen ? '▴' : '▾'}
                </button>
                {ivrOpen && (
                  <ul className="fyf-dropdown-submenu">
                    <li><a href="#" onClick={(e) => e.preventDefault()}>Provider Advantage</a></li>
                    <li><a href="#" onClick={(e) => e.preventDefault()}>Provider Part B</a></li>
                    <li><a href="#" onClick={(e) => e.preventDefault()}>Rep Advantage</a></li>
                    <li><a href="#" onClick={(e) => e.preventDefault()}>Rep Part B</a></li>
                  </ul>
                )}
              </li>
              <li className="fyf-dropdown-parent">
                <button type="button" onClick={() => setPaymentsOpen(!paymentsOpen)}>
                  Payments {paymentsOpen ? '▴' : '▾'}
                </button>
                {paymentsOpen && (
                  <ul className="fyf-dropdown-submenu">
                    <li><a href="#" onClick={(e) => e.preventDefault()}>Invoice Payment Portal</a></li>
                  </ul>
                )}
              </li>
              <li className="fyf-dropdown-parent">
                <button type="button" onClick={() => setOrderOpen(!orderOpen)}>
                  Order {orderOpen ? '▴' : '▾'}
                </button>
                {orderOpen && (
                  <ul className="fyf-dropdown-submenu">
                    <li><Link to="/order" onClick={() => setOtherOpen(false)}>Order Products Here</Link></li>
                  </ul>
                )}
              </li>
              <li>
                <a href="mailto:support@smbhealthsupply.com">Contact Us</a>
              </li>
            </ul>
          )}
          </div>
        </li>
      </ul>
    </div>
  )
}
