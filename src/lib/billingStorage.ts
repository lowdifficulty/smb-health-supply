import type { CardBrand, CreditCard, Payment } from '../types/billing'
import { generateId, getOrders } from './storage'

const CARDS_KEY = 'smb_credit_cards'
const PAYMENTS_KEY = 'smb_payments'

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

export function detectCardBrand(cardNumber: string): CardBrand {
  const digits = cardNumber.replace(/\D/g, '')
  if (digits.startsWith('4')) return 'Visa'
  if (digits.startsWith('34') || digits.startsWith('37')) return 'American Express'
  if (digits.startsWith('6011') || digits.startsWith('65')) return 'Discover'
  return 'Mastercard'
}

export function formatCardLabel(card: CreditCard): string {
  return `${card.brand} •••• ${card.last4}`
}

export function getCreditCards(): CreditCard[] {
  return load<CreditCard[]>(CARDS_KEY, [])
}

export function getCreditCardsByClient(clientId: string): CreditCard[] {
  return getCreditCards().filter((c) => c.clientId === clientId)
}

export function addCreditCard(card: CreditCard): void {
  const cards = getCreditCards()
  if (card.isDefault) {
    for (const existing of cards) {
      if (existing.clientId === card.clientId) existing.isDefault = false
    }
  }
  cards.unshift(card)
  save(CARDS_KEY, cards)
}

export function removeCreditCard(id: string): void {
  save(CARDS_KEY, getCreditCards().filter((c) => c.id !== id))
}

export function getPayments(): Payment[] {
  return load<Payment[]>(PAYMENTS_KEY, [])
}

export function getPaymentsByClient(clientId: string): Payment[] {
  return getPayments()
    .filter((p) => p.clientId === clientId)
    .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime())
}

export function addPayment(payment: Payment): void {
  const payments = getPayments()
  payments.unshift(payment)
  save(PAYMENTS_KEY, payments)
}

export function generatePaymentNumber(): string {
  const year = new Date().getFullYear()
  const seq = String(getPayments().length + 1).padStart(4, '0')
  return `PAY-${year}-${seq}`
}

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

export function seedBillingData(): void {
  const clientId = 'client-asg'
  const hasClientBilling =
    getPayments().some((p) => p.clientId === clientId) ||
    getCreditCards().some((c) => c.clientId === clientId)
  if (hasClientBilling) return

  addCreditCard({
    id: generateId('card'),
    clientId,
    cardholderName: 'ASG Team',
    last4: '4242',
    brand: 'Visa',
    expMonth: '12',
    expYear: '2028',
    isDefault: true,
    createdAt: daysAgo(45),
  })

  const deliveredOrder = getOrders().find((o) => o.id === 'order-004')
  if (deliveredOrder) {
    addPayment({
      id: generateId('pay'),
      clientId,
      paymentNumber: 'PAY-2026-0001',
      orderNumber: deliveredOrder.orderNumber,
      description: `Order ${deliveredOrder.orderNumber}`,
      amount: deliveredOrder.totalValue,
      status: 'paid',
      paymentMethod: 'Visa •••• 4242',
      paidAt: daysAgo(12),
    })
  }

  addPayment({
    id: generateId('pay'),
    clientId,
    paymentNumber: 'PAY-2025-0042',
    orderNumber: 'SMB-2025-0187',
    description: 'Order SMB-2025-0187',
    amount: 3120,
    status: 'paid',
    paymentMethod: 'Visa •••• 4242',
    paidAt: daysAgo(58),
  })

  addPayment({
    id: generateId('pay'),
    clientId,
    paymentNumber: 'PAY-2025-0031',
    orderNumber: 'SMB-2025-0142',
    description: 'Order SMB-2025-0142',
    amount: 2080,
    status: 'paid',
    paymentMethod: 'Visa •••• 4242',
    paidAt: daysAgo(92),
  })

  const processingOrder = getOrders().find((o) => o.id === 'order-001')
  if (processingOrder) {
    addPayment({
      id: generateId('pay'),
      clientId,
      paymentNumber: 'PAY-2026-0002',
      orderNumber: processingOrder.orderNumber,
      description: `Order ${processingOrder.orderNumber}`,
      amount: processingOrder.totalValue,
      status: 'paid',
      paymentMethod: 'Visa •••• 4242',
      paidAt: daysAgo(2),
    })
  }
}

export function normalizeBillingData(): void {
  const payments = getPayments()
  const cards = getCreditCards()
  let changed = false

  const migratedPayments = payments.map((p) => {
    if (p.clientId !== 'client-001') return p
    changed = true
    return { ...p, clientId: 'client-asg' }
  })

  const migratedCards = cards.map((c) => {
    if (c.clientId !== 'client-001') return c
    changed = true
    return { ...c, clientId: 'client-asg' }
  })

  const updated = migratedPayments.map((p) => {
    let payment = p.status === 'paid' ? p : { ...p, status: 'paid' as const }
    if (payment.orderNumber) {
      const order = getOrders().find((o) => o.orderNumber === payment.orderNumber)
      if (order && payment.amount !== order.totalValue) {
        payment = { ...payment, amount: order.totalValue }
        changed = true
      }
    }
    if (p.status !== 'paid') changed = true
    return payment
  })
  if (changed) {
    save(PAYMENTS_KEY, updated)
    save(CARDS_KEY, migratedCards)
  }
}
