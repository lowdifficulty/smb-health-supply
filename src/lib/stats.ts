import type { Client, Order, ClientStats } from '../types'
import { getClients, getOrders } from './storage'

export function getClientStats(clientId: string): ClientStats {
  const orders = getOrders().filter((o) => o.clientId === clientId)
  const open = orders.filter((o) => ['submitted', 'processing', 'shipped'].includes(o.status))
  const totalSpend = orders.reduce((s, o) => s + o.totalValue, 0)
  const openValue = open.reduce((s, o) => s + o.totalValue, 0)
  const productCount = orders.reduce((s, o) => s + o.items.reduce((si, i) => si + i.quantity, 0), 0)
  const overdueNotes = orders.reduce(
    (s, o) => s + o.notes.filter((n) => !n.completed && n.dueDate <= new Date().toISOString().split('T')[0]).length,
    0,
  )
  const lastOrder = orders[0]

  return {
    clientId,
    totalOrders: orders.length,
    totalSpend,
    openOrders: open.length,
    openOrderValue: openValue,
    avgOrderValue: orders.length ? totalSpend / orders.length : 0,
    ytdSpend: totalSpend,
    monthlyGrowth: 0,
    productsOrdered: productCount,
    overdueNotes,
    lastOrderDate: lastOrder?.createdAt ?? '',
  }
}

export function getAllClientStats(): (ClientStats & { client: Client })[] {
  return getClients().map((client) => ({
    ...getClientStats(client.id),
    client,
  }))
}

export function getAdminSummary() {
  const allStats = getAllClientStats()
  const orders = getOrders()
  const openOrders = orders.filter((o) => ['submitted', 'processing', 'shipped'].includes(o.status))

  return {
    totalClients: getClients().length,
    totalOrders: orders.length,
    totalRevenue: allStats.reduce((s, c) => s + c.totalSpend, 0),
    ytdRevenue: allStats.reduce((s, c) => s + c.ytdSpend, 0),
    openOrderValue: openOrders.reduce((s, o) => s + o.totalValue, 0),
    openOrders: openOrders.length,
    overdueNotes: allStats.reduce((s, c) => s + c.overdueNotes, 0),
    avgClientSpend: allStats.length
      ? allStats.reduce((s, c) => s + c.totalSpend, 0) / allStats.length
      : 0,
  }
}

export function getClientOrders(clientId: string): Order[] {
  return getOrders().filter((o) => o.clientId === clientId)
}

export function getClientNotesDue(clientId: string) {
  const today = new Date().toISOString().split('T')[0]
  const results: { order: Order; note: Order['notes'][0] }[] = []

  for (const order of getClientOrders(clientId)) {
    for (const note of order.notes) {
      if (!note.completed && note.dueDate <= today) {
        results.push({ order, note })
      }
    }
  }

  return results.sort(
    (a, b) => new Date(a.note.dueDate).getTime() - new Date(b.note.dueDate).getTime(),
  )
}
