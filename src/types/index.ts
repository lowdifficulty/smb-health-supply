export type PortalMode = 'admin' | 'client'

export type ProductCategory = 'skin_sub' | 'collagen'

export type OrderStatus =
  | 'draft'
  | 'submitted'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export interface Product {
  id: string
  name: string
  category: ProductCategory
  sku: string
  manufacturer: string
  sizes: string[]
  description: string
}

export interface Client {
  id: string
  facilityName: string
  contactName: string
  email: string
  phone: string
  npi: string
  facilityType: string
  address: string
  city: string
  state: string
  zip: string
  signedOnDate: string
}

export interface OrderLineItem {
  productId: string
  productName: string
  sku: string
  size: string
  quantity: number
  unitPrice: number
  lotNumber?: string
  serialNumber?: string
}

export interface OrderNote {
  id: string
  text: string
  dueDate: string
  completed: boolean
  createdAt: string
}

export interface Order {
  id: string
  orderNumber: string
  clientId: string
  clientName: string
  status: OrderStatus
  items: OrderLineItem[]
  totalValue: number
  patientName?: string
  patientDob?: string
  woundType?: string
  icd10?: string
  shippingAddress: string
  shippingCarrier?: string
  shippedDate?: string
  notes: OrderNote[]
  createdAt: string
  updatedAt: string
  expectedDelivery?: string
  trackingNumber?: string
}

export interface ClientStats {
  clientId: string
  totalOrders: number
  totalSpend: number
  openOrders: number
  openOrderValue: number
  avgOrderValue: number
  ytdSpend: number
  monthlyGrowth: number
  productsOrdered: number
  overdueNotes: number
  lastOrderDate: string
}

export interface NewClientForm {
  facilityName: string
  contactName: string
  email: string
  phone: string
  npi: string
  facilityType: string
  address: string
  city: string
  state: string
  zip: string
}
