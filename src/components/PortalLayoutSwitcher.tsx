import { usePortal } from '../context/PortalContext'
import Layout from './Layout'
import FyfClientLayout from './fyf/FyfClientLayout'

export default function PortalLayoutSwitcher() {
  const { portal } = usePortal()
  return portal === 'client' ? <FyfClientLayout /> : <Layout />
}
