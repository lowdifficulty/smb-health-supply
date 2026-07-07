import type { Client } from '../types'
import { addClient, getClients } from '../lib/storage'

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

const asgClient: Client = {
  id: 'client-asg',
  facilityName: 'ASG',
  contactName: 'Matt Lewis',
  email: 'mattlewis06@gmail.com',
  phone: '',
  npi: '1548293017',
  facilityType: 'Wound Care Clinic',
  address: '',
  city: '',
  state: '',
  zip: '',
  signedOnDate: daysAgo(7),
}

/** Ensures the ASG client record exists (no demo orders or other facilities). */
export function seedSampleData(): void {
  const clients = getClients()
  const asg = clients.find((c) => c.id === 'client-asg')

  if (!asg) {
    addClient(asgClient)
    return
  }

  const updated = clients
    .filter((c) => c.id === 'client-asg')
    .map((c) =>
      c.id === 'client-asg'
        ? {
            ...c,
            facilityName: 'ASG',
            contactName: asgClient.contactName,
            email: asgClient.email,
            npi: asgClient.npi,
          }
        : c,
    )

  if (updated.length !== clients.length) {
    localStorage.setItem('smb_clients', JSON.stringify(updated))
  }
}
