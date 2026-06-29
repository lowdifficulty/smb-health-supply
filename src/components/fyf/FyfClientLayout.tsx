import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import FyfNavbar from './FyfNavbar'
import type { StatusFilter } from '../../types/skinSubstitute'

export default function FyfClientLayout() {
  const [activeTab, setActiveTab] = useState<StatusFilter>('All')

  return (
    <div className="fyf-portal min-h-screen flex flex-col">
      <FyfNavbar activeTab={activeTab} onTabChange={setActiveTab} />
      <Outlet context={{ activeTab, setActiveTab }} />
      <footer className="fyf-footer">
        <p>&copy; {new Date().getFullYear()} SMB Health Supply. All rights reserved.</p>
      </footer>
    </div>
  )
}
