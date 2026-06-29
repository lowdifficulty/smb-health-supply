import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { addClient, generateId } from '../lib/storage'
import type { NewClientForm } from '../types'

const facilityTypes = [
  'Wound Care Clinic',
  'Hospital',
  'Home Health',
  'Skilled Nursing Facility',
  'Physician Office',
  'Ambulatory Surgery Center',
  'Other',
]

const emptyForm: NewClientForm = {
  facilityName: '',
  contactName: '',
  email: '',
  phone: '',
  npi: '',
  facilityType: 'Wound Care Clinic',
  address: '',
  city: '',
  state: '',
  zip: '',
}

export default function SignOn() {
  const navigate = useNavigate()
  const [form, setForm] = useState<NewClientForm>(emptyForm)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  function update(field: keyof NewClientForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.facilityName || !form.contactName || !form.email || !form.npi) {
      setError('Please fill in all required fields.')
      return
    }

    const client = {
      id: generateId('client'),
      ...form,
      signedOnDate: new Date().toISOString(),
    }

    addClient(client)
    setSubmitted(true)
    setTimeout(() => navigate('/order'), 2000)
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mt-6">Client Registered Successfully</h2>
        <p className="text-slate-600 mt-2">
          <strong>{form.facilityName}</strong> has been added. Redirecting to order page...
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="New Client Sign On"
        description="Register a healthcare facility to begin ordering wound care products."
      />

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Facility Information</h2>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Facility Name" required>
            <input
              type="text"
              value={form.facilityName}
              onChange={(e) => update('facilityName', e.target.value)}
              className="input"
              placeholder="Encompass Wound"
            />
          </Field>
          <Field label="Facility Type" required>
            <select
              value={form.facilityType}
              onChange={(e) => update('facilityType', e.target.value)}
              className="input"
            >
              {facilityTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="NPI Number" required>
            <input
              type="text"
              value={form.npi}
              onChange={(e) => update('npi', e.target.value)}
              className="input"
              placeholder="1234567890"
              maxLength={10}
            />
          </Field>
          <Field label="Contact Name" required>
            <input
              type="text"
              value={form.contactName}
              onChange={(e) => update('contactName', e.target.value)}
              className="input"
              placeholder="Dr. Jane Smith"
            />
          </Field>
          <Field label="Email" required>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className="input"
              placeholder="contact@facility.com"
            />
          </Field>
          <Field label="Phone">
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              className="input"
              placeholder="(555) 123-4567"
            />
          </Field>
        </div>

        <div className="p-6 border-t border-slate-100">
          <h2 className="font-semibold text-slate-900 mb-5">Address</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <Field label="Street Address" required>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => update('address', e.target.value)}
                  className="input"
                  placeholder="123 Medical Parkway"
                />
              </Field>
            </div>
            <Field label="City" required>
              <input
                type="text"
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
                className="input"
              />
            </Field>
            <Field label="State" required>
              <input
                type="text"
                value={form.state}
                onChange={(e) => update('state', e.target.value)}
                className="input"
                maxLength={2}
                placeholder="TX"
              />
            </Field>
            <Field label="ZIP Code" required>
              <input
                type="text"
                value={form.zip}
                onChange={(e) => update('zip', e.target.value)}
                className="input"
                maxLength={10}
              />
            </Field>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors"
          >
            Register Client
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  )
}
