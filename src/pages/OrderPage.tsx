import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { products, formatCategory } from '../data/products'
import { getClients, addOrder, generateId, generateOrderNumber } from '../lib/storage'
import { getProductById } from '../data/products'
import { formatCurrency } from '../lib/format'
import { PRICE_PER_SQ_CM, SQCM_ABBREV, calculateLineTotal, calculateUnitPrice } from '../lib/pricing'
import type { OrderLineItem } from '../types'

interface CartItem {
  productId: string
  size: string
  quantity: number
}

export default function OrderPage() {
  const clients = getClients()
  const [clientId, setClientId] = useState(clients[0]?.id ?? '')
  const [patientName, setPatientName] = useState('')
  const [patientDob, setPatientDob] = useState('')
  const [woundType, setWoundType] = useState('')
  const [icd10, setIcd10] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')
  const [noteText, setNoteText] = useState('')
  const [noteDueDate, setNoteDueDate] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'skin_sub' | 'collagen'>('all')
  const [submitted, setSubmitted] = useState<string | null>(null)
  const [error, setError] = useState('')

  const filteredProducts = products.filter(
    (p) => categoryFilter === 'all' || p.category === categoryFilter,
  )

  const selectedClient = clients.find((c) => c.id === clientId)

  function addToCart(productId: string, size: string) {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === productId && i.size === size)
      if (existing) {
        return prev.map((i) =>
          i.productId === productId && i.size === size
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        )
      }
      return [...prev, { productId, size, quantity: 1 }]
    })
  }

  function updateQuantity(productId: string, size: string, quantity: number) {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((i) => !(i.productId === productId && i.size === size)))
    } else {
      setCart((prev) =>
        prev.map((i) =>
          i.productId === productId && i.size === size ? { ...i, quantity } : i,
        ),
      )
    }
  }

  function cartTotal(): number {
    return cart.reduce((sum, item) => sum + calculateLineTotal(item.size, item.quantity), 0)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!clientId) {
      setError('Please select a client or register a new one.')
      return
    }
    if (cart.length === 0) {
      setError('Please add at least one product to the order.')
      return
    }

    const items: OrderLineItem[] = cart.map((item) => {
      const product = getProductById(item.productId)!
      return {
        productId: item.productId,
        productName: product.name,
        sku: product.sku,
        size: item.size,
        quantity: item.quantity,
        unitPrice: calculateUnitPrice(item.size),
      }
    })

    const orderNumber = generateOrderNumber()
    const order = {
      id: generateId('order'),
      orderNumber,
      clientId,
      clientName: selectedClient?.facilityName ?? '',
      status: 'submitted' as const,
      items,
      totalValue: cartTotal(),
      patientName: patientName || undefined,
      patientDob: patientDob || undefined,
      woundType: woundType || undefined,
      icd10: icd10 || undefined,
      shippingAddress: shippingAddress || `${selectedClient?.address}, ${selectedClient?.city}, ${selectedClient?.state} ${selectedClient?.zip}`,
      notes: noteText
        ? [
            {
              id: generateId('note'),
              text: noteText,
              dueDate: noteDueDate || new Date().toISOString().split('T')[0],
              completed: false,
              createdAt: new Date().toISOString(),
            },
          ]
        : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    addOrder(order)
    setSubmitted(orderNumber)
  }

  if (clients.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900">No Clients Registered</h2>
        <p className="text-slate-600 mt-2">Register a client facility before placing an order.</p>
        <Link to="/sign-on" className="inline-block mt-6 px-6 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700">
          New Client Sign On
        </Link>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mt-6">Order Submitted</h2>
        <p className="text-slate-600 mt-2">
          Order <strong>{submitted}</strong> has been placed successfully.
        </p>
        <div className="flex justify-center gap-3 mt-8">
          <Link to="/tracking" className="px-6 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700">
            Track Order
          </Link>
          <button
            onClick={() => { setSubmitted(null); setCart([]); setPatientName(''); setNoteText('') }}
            className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
          >
            Place Another Order
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Place Order"
        description="Order skin substitutes and collagen products for your patients."
      />

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Client &amp; Patient</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700">Client Facility</span>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="input mt-1.5"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.facilityName}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Patient Name</span>
                  <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} className="input mt-1.5" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Patient DOB</span>
                  <input type="date" value={patientDob} onChange={(e) => setPatientDob(e.target.value)} className="input mt-1.5" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Wound Type</span>
                  <input type="text" value={woundType} onChange={(e) => setWoundType(e.target.value)} className="input mt-1.5" placeholder="Diabetic Foot Ulcer" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">ICD-10 Code</span>
                  <input type="text" value={icd10} onChange={(e) => setIcd10(e.target.value)} className="input mt-1.5" placeholder="E11.621" />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700">Shipping Address</span>
                  <input
                    type="text"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="input mt-1.5"
                    placeholder={selectedClient ? `${selectedClient.address}, ${selectedClient.city}, ${selectedClient.state} ${selectedClient.zip}` : ''}
                  />
                </label>
              </div>
            </section>

            <section className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-900">Products</h2>
                <div className="flex gap-2">
                  {(['all', 'skin_sub', 'collagen'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        categoryFilter === cat
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat === 'all' ? 'All' : cat === 'skin_sub' ? 'Skin Subs' : 'Collagen'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="border border-slate-100 rounded-lg p-4 hover:border-brand-200 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900">{product.name}</p>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {formatCategory(product.category)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{product.sku} · {product.manufacturer}</p>
                        <p className="text-sm text-brand-700 mt-1">{formatCurrency(PRICE_PER_SQ_CM)} / {SQCM_ABBREV}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          id={`size-${product.id}`}
                          className="input text-sm py-1.5"
                          defaultValue={product.sizes[0]}
                        >
                          {product.sizes.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            const select = document.getElementById(`size-${product.id}`) as HTMLSelectElement
                            addToCart(product.id, select.value)
                          }}
                          className="px-3 py-1.5 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700 whitespace-nowrap"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Order Note (Optional)</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700">Note</span>
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="input mt-1.5"
                    rows={2}
                    placeholder="e.g. Submit prior authorization documentation"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Note Due Date</span>
                  <input type="date" value={noteDueDate} onChange={(e) => setNoteDueDate(e.target.value)} className="input mt-1.5" />
                </label>
              </div>
            </section>
          </div>

          <div>
            <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-24">
              <h2 className="font-semibold text-slate-900 mb-4">Order Summary</h2>
              {cart.length === 0 ? (
                <p className="text-sm text-slate-500">No items added yet.</p>
              ) : (
                <ul className="space-y-3">
                  {cart.map((item) => {
                    const product = getProductById(item.productId)!
                    return (
                      <li key={`${item.productId}-${item.size}`} className="text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium text-slate-900">{product.name}</span>
                          <span className="text-slate-600">{formatCurrency(calculateLineTotal(item.size, item.quantity))}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-slate-500">{item.size}</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                              className="w-6 h-6 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs"
                            >
                              −
                            </button>
                            <span className="text-xs w-4 text-center">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                              className="w-6 h-6 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
              <div className="border-t border-slate-100 mt-4 pt-4 flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-brand-700">{formatCurrency(cartTotal())}</span>
              </div>
              <button
                type="submit"
                disabled={cart.length === 0}
                className="w-full mt-6 px-4 py-2.5 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Submit Order
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
