import { useNavigate } from 'react-router-dom'
import { usePortal } from '../context/PortalContext'

export default function PortalToggle() {
  const { portal, setPortal } = usePortal()
  const navigate = useNavigate()

  function switchTo(mode: 'admin' | 'client') {
    setPortal(mode)
    navigate('/dashboard')
  }

  return (
    <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-xs font-medium">
      <button
        type="button"
        onClick={() => switchTo('client')}
        className={`px-3 py-1.5 rounded-md transition-colors ${
          portal === 'client'
            ? 'bg-white text-brand-700 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        Client
      </button>
      <button
        type="button"
        onClick={() => switchTo('admin')}
        className={`px-3 py-1.5 rounded-md transition-colors ${
          portal === 'admin'
            ? 'bg-white text-brand-700 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        Admin
      </button>
    </div>
  )
}
