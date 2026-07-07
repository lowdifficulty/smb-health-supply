import type { Client, Order, OrderStatus } from '../types'

const CLIENTS_KEY = 'smb_clients'
const ORDERS_KEY = 'smb_orders'

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function save<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data))
}

export function getClients(): Client[] {
  return load<Client[]>(CLIENTS_KEY, [])
}

export function getClientById(id: string): Client | undefined {
  return getClients().find((c) => c.id === id)
}

export function addClient(client: Client): void {
  const clients = getClients()
  clients.push(client)
  save(CLIENTS_KEY, clients)
}

export function getOrders(): Order[] {
  return load<Order[]>(ORDERS_KEY, [])
}

export function getOrderById(id: string): Order | undefined {
  return getOrders().find((o) => o.id === id)
}

export function addOrder(order: Order): void {
  const orders = getOrders()
  orders.unshift(order)
  save(ORDERS_KEY, orders)
}

export function updateOrder(order: Order): void {
  const orders = getOrders()
  const idx = orders.findIndex((o) => o.id === order.id)
  if (idx >= 0) {
    orders[idx] = order
    save(ORDERS_KEY, orders)
  }
}

export function updateOrderStatus(id: string, status: OrderStatus): void {
  const order = getOrderById(id)
  if (order) {
    updateOrder({ ...order, status, updatedAt: new Date().toISOString() })
  }
}

export function getOpenOrders(): Order[] {
  return getOrders().filter((o) =>
    ['submitted', 'processing', 'shipped'].includes(o.status),
  )
}

export function getOpenOrderValue(): number {
  return getOpenOrders().reduce((sum, o) => sum + o.totalValue, 0)
}

export function getNotesDue(): { order: Order; note: Order['notes'][0] }[] {
  const today = new Date().toISOString().split('T')[0]
  const results: { order: Order; note: Order['notes'][0] }[] = []

  for (const order of getOrders()) {
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

export function generateOrderNumber(): string {
  const year = new Date().getFullYear()
  const orders = getOrders()
  const seq = String(orders.length + 1).padStart(4, '0')
  return `SMB-${year}-${seq}`
}

export function generateId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
}
