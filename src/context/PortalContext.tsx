import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { PortalMode } from '../types'

const PORTAL_KEY = 'smb_portal_mode'
export const ASG_CLIENT_ID = 'client-asg'

interface PortalContextValue {
  portal: PortalMode
  setPortal: (mode: PortalMode) => void
  togglePortal: () => void
  demoClientId: string
}

const PortalContext = createContext<PortalContextValue | null>(null)

function loadPortal(): PortalMode {
  try {
    const stored = localStorage.getItem(PORTAL_KEY)
    return stored === 'admin' ? 'admin' : 'client'
  } catch {
    return 'client'
  }
}

export function PortalProvider({ children }: { children: ReactNode }) {
  const [portal, setPortalState] = useState<PortalMode>(loadPortal)

  const setPortal = useCallback((mode: PortalMode) => {
    setPortalState(mode)
    localStorage.setItem(PORTAL_KEY, mode)
  }, [])

  const togglePortal = useCallback(() => {
    setPortal(portal === 'admin' ? 'client' : 'admin')
  }, [portal, setPortal])

  return (
    <PortalContext.Provider
      value={{ portal, setPortal, togglePortal, demoClientId: ASG_CLIENT_ID }}
    >
      {children}
    </PortalContext.Provider>
  )
}

export function usePortal() {
  const ctx = useContext(PortalContext)
  if (!ctx) throw new Error('usePortal must be used within PortalProvider')
  return ctx
}
