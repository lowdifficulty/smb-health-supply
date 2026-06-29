import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import { AsgDataProvider } from '../context/AsgDataContext'

export default function Layout() {
  return (
    <AsgDataProvider>
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-slate-850 text-slate-400 text-xs sm:text-sm py-5 sm:py-6 pb-safe">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2 text-center sm:text-left">
          <p>&copy; {new Date().getFullYear()} SMB Health Supply · ASG Client Portal</p>
          <p className="text-slate-500">Wound Care Skin Substitute &amp; Collagen Ordering</p>
        </div>
      </footer>
    </div>
    </AsgDataProvider>
  )
}
