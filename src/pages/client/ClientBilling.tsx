import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'
import AsgPaymentDueBanner, { asgPayNowButtonClass } from '../../components/AsgPaymentDueBanner'
import { useAsgPaymentOwed } from '../../hooks/useAsgPaymentOwed'
import { usePortal } from '../../context/PortalContext'
import { getClientById } from '../../lib/storage'
import { generateId } from '../../lib/storage'
import {
  addCreditCard,
  addPayment,
  detectCardBrand,
  formatCardLabel,
  generatePaymentNumber,
  getCreditCardsByClient,
  getPaymentsByClient,
  removeCreditCard,
} from '../../lib/billingStorage'
import { formatCurrency, formatDate } from '../../lib/format'
import { markRemitPaymentsPaid } from '../../lib/asgRemitPayments'
import { EMPTY_CARD_FORM, type CreditCard, type CreditCardFormData, type Payment, type PaymentStatus } from '../../types/billing'

const STATUS_COLORS: Record<PaymentStatus, string> = {
  paid: 'bg-green-100 text-green-800',
  pending: 'bg-amber-100 text-amber-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-slate-100 text-slate-700',
}

const STATUS_LABELS: Record<PaymentStatus, string> = {
  paid: 'Paid',
  pending: 'Pending',
  failed: 'Failed',
  refunded: 'Refunded',
}

const BRAND_COLORS: Record<CreditCard['brand'], string> = {
  Visa: 'bg-blue-600',
  Mastercard: 'bg-slate-800',
  'American Express': 'bg-sky-700',
  Discover: 'bg-orange-600',
}

function Field({ label, required, children }: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  )
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

function validateCardForm(form: CreditCardFormData): string | null {
  const digits = form.cardNumber.replace(/\D/g, '')
  if (!form.cardholderName.trim()) return 'Cardholder name is required.'
  if (digits.length < 15) return 'Enter a valid card number.'
  if (!form.expMonth || !form.expYear) return 'Expiration date is required.'
  if (!/^\d{3,4}$/.test(form.cvv)) return 'Enter a valid security code.'
  return null
}

export default function ClientBilling() {
  const { demoClientId } = usePortal()
  const client = getClientById(demoClientId)
  const [searchParams] = useSearchParams()
  const paySectionRef = useRef<HTMLElement>(null)
  const { breakdown: owedRemits, paymentOwed: owedTotal, hasBalance } = useAsgPaymentOwed()
  const [cards, setCards] = useState<CreditCard[]>(() => getCreditCardsByClient(demoClientId))
  const [payments, setPayments] = useState<Payment[]>(() => getPaymentsByClient(demoClientId))
  const [form, setForm] = useState<CreditCardFormData>({
    ...EMPTY_CARD_FORM,
    cardholderName: client?.contactName ?? '',
  })
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    if (searchParams.get('pay') === '1' && paySectionRef.current) {
      paySectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [searchParams])

  function refresh() {
    setCards(getCreditCardsByClient(demoClientId))
    setPayments(getPaymentsByClient(demoClientId))
  }

  function update(field: keyof CreditCardFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleAddCard(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    const validationError = validateCardForm(form)
    if (validationError) {
      setError(validationError)
      return
    }

    const digits = form.cardNumber.replace(/\D/g, '')
    const card = {
      id: generateId('card'),
      clientId: demoClientId,
      cardholderName: form.cardholderName.trim(),
      last4: digits.slice(-4),
      brand: detectCardBrand(digits),
      expMonth: form.expMonth.padStart(2, '0'),
      expYear: form.expYear,
      isDefault: cards.length === 0,
      createdAt: new Date().toISOString(),
    }

    addCreditCard(card)
    setForm({ ...EMPTY_CARD_FORM, cardholderName: client?.contactName ?? '' })
    setShowForm(false)
    setSuccess('Card saved successfully.')
    refresh()
  }

  function handleRemoveCard(id: string) {
    removeCreditCard(id)
    refresh()
    setSuccess('Card removed.')
  }

  async function handlePayBalance() {
    setError('')
    setSuccess('')

    if (!hasBalance) return

    const defaultCard = cards.find((c) => c.isDefault) ?? cards[0]
    if (!defaultCard) {
      setError('Add a credit card below before paying your balance.')
      setShowForm(true)
      return
    }

    setPaying(true)
    await new Promise((r) => setTimeout(r, 600))

    const remitLabels = owedRemits.map((item) => formatDate(item.dateOfRemit)).join(', ')

    addPayment({
      id: generateId('pay'),
      clientId: demoClientId,
      paymentNumber: generatePaymentNumber(),
      description: `ASG remit payment (${remitLabels})`,
      amount: owedTotal,
      status: 'paid',
      paymentMethod: formatCardLabel(defaultCard),
      paidAt: new Date().toISOString(),
    })

    markRemitPaymentsPaid(owedRemits.map((item) => item.dateOfRemit))
    setPaying(false)
    setSuccess(`Payment of ${formatCurrency(owedTotal)} submitted successfully. Thank you!`)
    refresh()
  }

  const paymentTotal = payments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <PageHeader
        title="Billing"
        description={`Manage payment methods and view payment history for ${client?.facilityName ?? 'your facility'}.`}
      />

      {hasBalance && (
        <section ref={paySectionRef} id="pay-balance" className="mb-6 sm:mb-8 scroll-mt-20 sm:scroll-mt-24">
          <AsgPaymentDueBanner
            footer={
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-slate-600">
                  {cards.length > 0 ? (
                    <>
                      Pay with{' '}
                      <span className="font-medium text-slate-900">
                        {formatCardLabel(cards.find((c) => c.isDefault) ?? cards[0])}
                      </span>
                    </>
                  ) : (
                    'Add a card below to complete payment.'
                  )}
                </div>
                <button
                  type="button"
                  onClick={handlePayBalance}
                  disabled={paying || cards.length === 0}
                  className={asgPayNowButtonClass}
                >
                  <span className="text-white">
                    {paying ? 'Processing…' : `Pay ${formatCurrency(owedTotal)} now`}
                  </span>
                </button>
              </div>
            }
          />
        </section>
      )}

      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
      {success && <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{success}</div>}

      <section className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Payment Methods</h2>
          <button
            type="button"
            onClick={() => { setShowForm((v) => !v); setError(''); setSuccess('') }}
            className="w-full sm:w-auto px-4 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 active:bg-brand-800"
          >
            {showForm ? 'Cancel' : 'Add Card'}
          </button>
        </div>

        {cards.length === 0 && !showForm ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
            No cards on file. Add a credit card to enable payments.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cards.map((card) => (
              <div key={card.id} className="bg-white rounded-xl border border-slate-200 p-5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-8 rounded ${BRAND_COLORS[card.brand]} flex items-center justify-center text-white text-[10px] font-bold`}>
                    {card.brand === 'American Express' ? 'AMEX' : card.brand.slice(0, 4).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{formatCardLabel(card)}</p>
                    <p className="text-sm text-slate-600 mt-0.5">{card.cardholderName}</p>
                    <p className="text-sm text-slate-500 mt-0.5">Expires {card.expMonth}/{card.expYear}</p>
                    {card.isDefault && (
                      <span className="inline-flex mt-2 px-2 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700">
                        Default
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveCard(card.id)}
                  className="text-sm text-slate-500 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleAddCard} className="mt-4 bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Add Credit Card</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Cardholder Name" required>
                <input className="input" value={form.cardholderName} onChange={(e) => update('cardholderName', e.target.value)} />
              </Field>
              <Field label="Card Number" required>
                <input
                  className="input"
                  inputMode="numeric"
                  placeholder="4242 4242 4242 4242"
                  value={formatCardNumber(form.cardNumber)}
                  onChange={(e) => update('cardNumber', e.target.value.replace(/\D/g, '').slice(0, 16))}
                />
              </Field>
              <Field label="Expiration Month" required>
                <select className="input" value={form.expMonth} onChange={(e) => update('expMonth', e.target.value)}>
                  <option value="">Month</option>
                  {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </Field>
              <Field label="Expiration Year" required>
                <select className="input" value={form.expYear} onChange={(e) => update('expYear', e.target.value)}>
                  <option value="">Year</option>
                  {Array.from({ length: 8 }, (_, i) => String(new Date().getFullYear() + i)).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </Field>
              <Field label="Security Code" required>
                <input
                  className="input"
                  inputMode="numeric"
                  placeholder="123"
                  value={form.cvv}
                  onChange={(e) => update('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                />
              </Field>
            </div>
            <div className="mt-6 flex justify-end">
              <button type="submit" className="px-6 py-2.5 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700">
                Save Card
              </button>
            </div>
          </form>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Payment History</h2>
          <p className="text-sm text-slate-500">{payments.length} payment{payments.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="md:hidden divide-y divide-slate-100">
            {payments.length === 0 ? (
              <p className="px-4 py-12 text-center text-slate-500 text-sm">No payments yet.</p>
            ) : (
              payments.map((payment) => (
                <div key={payment.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 tabular-nums">{formatCurrency(payment.amount)}</p>
                      <p className="text-sm text-slate-600 mt-0.5">{payment.description}</p>
                    </div>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${STATUS_COLORS[payment.status]}`}>
                      {STATUS_LABELS[payment.status]}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-500">
                    <p>{formatDate(payment.paidAt)}</p>
                    <p className="text-right truncate">{payment.paymentMethod}</p>
                    <p className="truncate">{payment.paymentNumber}</p>
                    <p className="text-right truncate">{payment.orderNumber ?? '—'}</p>
                  </div>
                </div>
              ))
            )}
            {payments.length > 0 && (
              <div className="px-4 py-3 bg-slate-50 flex justify-between items-center font-semibold text-sm">
                <span className="text-slate-700">Total</span>
                <span className="text-brand-700 tabular-nums">{formatCurrency(paymentTotal)}</span>
              </div>
            )}
          </div>
          <div className="hidden md:block overflow-x-auto table-scroll-x">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 whitespace-nowrap">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 whitespace-nowrap">Payment #</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 whitespace-nowrap">Order #</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 whitespace-nowrap">Description</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 whitespace-nowrap">Method</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600 whitespace-nowrap">Amount</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      No payments yet.
                    </td>
                  </tr>
                ) : (
                  payments.map((payment, i) => (
                    <tr key={payment.id} className={`border-b border-slate-100 hover:bg-brand-50/30 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-700">{formatDate(payment.paidAt)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-700">{payment.paymentNumber}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-700">{payment.orderNumber ?? '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-700">{payment.description}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-700">{payment.paymentMethod}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-right font-medium text-slate-900">{formatCurrency(payment.amount)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[payment.status]}`}>
                          {STATUS_LABELS[payment.status]}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {payments.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-100 border-t border-slate-200 font-semibold">
                    <td colSpan={5} className="px-4 py-3 text-right text-slate-700">Total</td>
                    <td className="px-4 py-3 text-right text-brand-700">{formatCurrency(paymentTotal)}</td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
