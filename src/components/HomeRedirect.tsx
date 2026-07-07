import { Navigate } from 'react-router-dom'
import { usePortal } from '../context/PortalContext'

export default function HomeRedirect() {
  const { portal } = usePortal()
  return <Navigate to={portal === 'client' ? '/skin-substitutes' : '/dashboard'} replace />
}
