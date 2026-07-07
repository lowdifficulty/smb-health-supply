import { Navigate } from 'react-router-dom'
import { usePortal } from '../context/PortalContext'
import type { ReactNode } from 'react'

export function PortalRoute({ admin, client }: { admin: ReactNode; client: ReactNode }) {
  const { portal } = usePortal()
  return <>{portal === 'admin' ? admin : client}</>
}

export function AdminOnly({ children }: { children: ReactNode }) {
  const { portal } = usePortal()
  if (portal !== 'admin') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export function ClientOnly({ children }: { children: ReactNode }) {
  const { portal } = usePortal()
  if (portal !== 'client') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}
