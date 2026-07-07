import PageHeader from '../../components/PageHeader'
import AsgDataView from '../../components/AsgDataView'

export default function AsgAdminPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <PageHeader
        title="ASG Billing & Remits"
        description="Remit summary by patient and date of service, loaded from ASG.xlsx."
      />

      <AsgDataView />
    </div>
  )
}
