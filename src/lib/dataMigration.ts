const DATA_VERSION_KEY = 'smb_data_version'
const CURRENT_DATA_VERSION = 4

/** Clears demo/sample localStorage data; keeps only ASG client shell. */
export function runDataMigration(): void {
  const stored = localStorage.getItem(DATA_VERSION_KEY)
  if (stored === String(CURRENT_DATA_VERSION)) return

  localStorage.removeItem('smb_ivr_requests')
  localStorage.removeItem('smb_ivr_sample_version')
  localStorage.removeItem('smb_orders')
  localStorage.removeItem('smb_credit_cards')
  localStorage.removeItem('smb_payments')

  const clientsRaw = localStorage.getItem('smb_clients')
  if (clientsRaw) {
    try {
      const clients = JSON.parse(clientsRaw) as { id: string }[]
      const asgOnly = clients.filter((c) => c.id === 'client-asg')
      localStorage.setItem('smb_clients', JSON.stringify(asgOnly))
    } catch {
      localStorage.removeItem('smb_clients')
    }
  }

  localStorage.setItem(DATA_VERSION_KEY, String(CURRENT_DATA_VERSION))
}
