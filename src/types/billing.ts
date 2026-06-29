export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded'

export type CardBrand = 'Visa' | 'Mastercard' | 'American Express' | 'Discover'

export interface CreditCard {
  id: string
  clientId: string
  cardholderName: string
  last4: string
  brand: CardBrand
  expMonth: string
  expYear: string
  isDefault: boolean
  createdAt: string
}

export interface Payment {
  id: string
  clientId: string
  paymentNumber: string
  orderNumber?: string
  description: string
  amount: number
  status: PaymentStatus
  paymentMethod: string
  paidAt: string
}

export interface CreditCardFormData {
  cardholderName: string
  cardNumber: string
  expMonth: string
  expYear: string
  cvv: string
}

export const EMPTY_CARD_FORM: CreditCardFormData = {
  cardholderName: '',
  cardNumber: '',
  expMonth: '',
  expYear: '',
  cvv: '',
}
