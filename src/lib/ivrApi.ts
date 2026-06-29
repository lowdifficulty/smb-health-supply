import type { IvrRequest } from '../types/ivr'
import { addIvrRequestLocal, getIvrByClientLocal, getIvrRequestsLocal } from './ivrStorage'

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text()
  if (!text) return [] as T
  return JSON.parse(text) as T
}

export async function fetchIvrRequests(): Promise<IvrRequest[]> {
  try {
    const res = await fetch('/api/ivr', { headers: { Accept: 'application/json' } })
    if (res.ok) {
      const data = await parseJson<IvrRequest[]>(res)
      return Array.isArray(data) ? data : []
    }
  } catch {
    // API unavailable in local dev without vercel dev
  }
  return getIvrRequestsLocal()
}

export async function fetchIvrByClient(clientId: string): Promise<IvrRequest[]> {
  try {
    const res = await fetch(`/api/ivr?clientId=${encodeURIComponent(clientId)}`, {
      headers: { Accept: 'application/json' },
    })
    if (res.ok) {
      const data = await parseJson<IvrRequest[]>(res)
      return Array.isArray(data) ? data : []
    }
  } catch {
    // fallback below
  }
  return getIvrByClientLocal(clientId)
}

export async function submitIvrRequest(request: IvrRequest): Promise<{ ok: boolean; error?: string }> {
  addIvrRequestLocal(request)

  try {
    const res = await fetch('/api/ivr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(request),
    })

    if (!res.ok) {
      const body = await res.text()
      return { ok: false, error: body || `Server error (${res.status})` }
    }
    return { ok: true }
  } catch {
    return {
      ok: false,
      error: 'Could not reach the server. Your request was saved locally; retry when online.',
    }
  }
}
