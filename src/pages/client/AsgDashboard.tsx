import PageHeader from '../../components/PageHeader'
import AsgDataView from '../../components/AsgDataView'
import AsgPaymentDueBanner from '../../components/AsgPaymentDueBanner'
import { usePortal } from '../../context/PortalContext'
import { getClientById } from '../../lib/storage'

export default function AsgDashboard() {
  const { demoClientId } = usePortal()
  const client = getClientById(demoClientId)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <PageHeader
        title={client?.facilityName ?? 'ASG'}
        description={
          client?.contactName
            ? `Welcome, ${client.contactName}. Billing and remit summary below.`
            : 'Billing and remit summary.'
        }
      />

      <AsgPaymentDueBanner />

      <AsgDataView />
    </div>
  )
}
