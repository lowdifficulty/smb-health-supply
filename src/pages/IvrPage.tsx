import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader'
import IvrRequestTable from '../components/IvrRequestTable'
import { usePortal } from '../context/PortalContext'
import { getClientById } from '../lib/storage'
import { generateIvrNumber } from '../lib/ivrStorage'
import { fetchIvrByClient, fetchIvrRequests, submitIvrRequest } from '../lib/ivrApi'
import { generateId } from '../lib/storage'
import { EMPTY_IVR_FORM, type IvrFormData, type IvrRequest, type PlanType } from '../types/ivr'

const PLAN_TYPES: PlanType[] = ['Medicare', 'Medicaid', 'Commercial', 'Medicare Advantage', 'Workers Comp', 'Other']

const SIMPLE_REQUIRED = [
  ['patientFirstName', 'Patient first name'],
  ['patientLastName', 'Patient last name'],
  ['patientDob', 'Patient DOB'],
  ['memberId', 'Member ID'],
  ['primaryCarrier', 'Provider'],
  ['primaryPolicyNumber', 'Policy number'],
] as const

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

function emptyForm(clientNpi?: string): IvrFormData {
  return { ...EMPTY_IVR_FORM, facilityNpi: clientNpi ?? '' }
}

export default function IvrPage() {
  const { portal, demoClientId } = usePortal()
  const client = getClientById(demoClientId)
  const [form, setForm] = useState<IvrFormData>(() => emptyForm(client?.npi))
  const [requests, setRequests] = useState<IvrRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const load = portal === 'admin' ? fetchIvrRequests() : fetchIvrByClient(demoClientId)
    load
      .then((data) => {
        if (!cancelled) setRequests(data)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [portal, demoClientId])

  function update(field: keyof IvrFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function refresh() {
    const data =
      portal === 'admin' ? await fetchIvrRequests() : await fetchIvrByClient(demoClientId)
    setRequests(data)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    for (const [field, label] of SIMPLE_REQUIRED) {
      if (!form[field].trim()) {
        setError(`${label} is required.`)
        return
      }
    }

    setSubmitting(true)

    const submission: IvrFormData = {
      ...form,
      facilityNpi: client?.npi ?? form.facilityNpi,
      renderingProviderNpi: '',
      dateOfService: '',
      productName: '',
      hcpcsCode: '',
      icd10Primary: '',
    }

    const request: IvrRequest = {
      id: generateId('ivr'),
      requestNumber: generateIvrNumber(),
      requestType: 'simple',
      clientId: demoClientId,
      clientName: client?.facilityName ?? 'ASG',
      status: 'Submitted',
      submittedAt: new Date().toISOString(),
      ...submission,
    }

    const result = await submitIvrRequest(request)
    setSubmitting(false)

    if (!result.ok) {
      setError(result.error ?? 'Submission failed.')
      return
    }

    await refresh()
    setForm(emptyForm(client?.npi))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <PageHeader
        title="Simple IVR"
        description="Submit insurance verification requests for ASG patients."
      />

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm mb-8">
          {error && (
            <div className="m-6 mb-0 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          )}

          <div className="p-6 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900 mb-4">Patient</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Field label="First Name" required>
                <input className="input" value={form.patientFirstName} onChange={(e) => update('patientFirstName', e.target.value)} />
              </Field>
              <Field label="Last Name" required>
                <input className="input" value={form.patientLastName} onChange={(e) => update('patientLastName', e.target.value)} />
              </Field>
              <Field label="Date of Birth" required>
                <input type="date" className="input" value={form.patientDob} onChange={(e) => update('patientDob', e.target.value)} />
              </Field>
              <Field label="Member ID" required>
                <input className="input" value={form.memberId} onChange={(e) => update('memberId', e.target.value)} />
              </Field>
            </div>
          </div>

          <div className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Insurance</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="Provider" required>
                <input className="input" value={form.primaryCarrier} onChange={(e) => update('primaryCarrier', e.target.value)} />
              </Field>
              <Field label="Policy Number" required>
                <input className="input" value={form.primaryPolicyNumber} onChange={(e) => update('primaryPolicyNumber', e.target.value)} />
              </Field>
              <Field label="Plan Type" required>
                <select className="input" value={form.planType} onChange={(e) => update('planType', e.target.value)}>
                  {PLAN_TYPES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
            </div>
          </div>

          <div className="p-6 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setForm(emptyForm(client?.npi))}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 disabled:opacity-60"
            >
              {submitting ? 'Submitting…' : 'Submit Simple IVR'}
            </button>
          </div>
        </form>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">IVR Request Log</h2>
          <p className="text-sm text-slate-500">
            {loading ? 'Loading…' : `${requests.length} request${requests.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 px-6 py-12 text-center text-slate-500 text-sm">
            Loading requests…
          </div>
        ) : (
          <IvrRequestTable
            requests={requests}
            showClient={portal === 'admin'}
            emptyMessage="No IVR requests yet. Submit a form above to add one."
          />
        )}
      </section>
    </div>
  )
}
