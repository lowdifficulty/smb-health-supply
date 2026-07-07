import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'
import { addClient, generateId } from '../../lib/storage'
import type { NewClientForm } from '../../types'

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

export default function CreateAccount() {
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

    addClient({
      id: generateId('client'),
      ...form,
      signedOnDate: new Date().toISOString(),
    })
    setSubmitted(true)
    setForm(emptyForm)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Create Client Account"
        description="Register a new healthcare facility on the platform."
      />

      {submitted && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm flex items-center justify-between">
          <span>Account created successfully.</span>
          <button type="button" onClick={() => setSubmitted(false)} className="text-green-700 underline text-xs">
            Create another
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Facility Information</h2>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Facility Name" required>
            <input type="text" value={form.facilityName} onChange={(e) => update('facilityName', e.target.value)} className="input" />
          </Field>
          <Field label="Facility Type" required>
            <select value={form.facilityType} onChange={(e) => update('facilityType', e.target.value)} className="input">
              {facilityTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="NPI Number" required>
            <input type="text" value={form.npi} onChange={(e) => update('npi', e.target.value)} className="input" maxLength={10} />
          </Field>
          <Field label="Contact Name" required>
            <input type="text" value={form.contactName} onChange={(e) => update('contactName', e.target.value)} className="input" />
          </Field>
          <Field label="Email" required>
            <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="input" />
          </Field>
          <Field label="Phone">
            <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} className="input" />
          </Field>
        </div>
        <div className="p-6 border-t border-slate-100">
          <h2 className="font-semibold text-slate-900 mb-5">Address</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <Field label="Street Address" required>
                <input type="text" value={form.address} onChange={(e) => update('address', e.target.value)} className="input" />
              </Field>
            </div>
            <Field label="City" required>
              <input type="text" value={form.city} onChange={(e) => update('city', e.target.value)} className="input" />
            </Field>
            <Field label="State" required>
              <input type="text" value={form.state} onChange={(e) => update('state', e.target.value)} className="input" maxLength={2} />
            </Field>
            <Field label="ZIP Code" required>
              <input type="text" value={form.zip} onChange={(e) => update('zip', e.target.value)} className="input" maxLength={10} />
            </Field>
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 flex justify-between items-center">
          <Link to="/dashboard" className="text-sm text-slate-500 hover:text-slate-700">← Back to dashboard</Link>
          <button type="submit" className="px-6 py-2.5 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors">
            Create Account
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
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  )
}
