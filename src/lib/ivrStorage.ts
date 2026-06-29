import type { IvrRequest } from '../types/ivr'

const IVR_KEY = 'smb_ivr_requests'

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

export function getIvrRequestsLocal(): IvrRequest[] {
  return load<IvrRequest[]>(IVR_KEY, [])
}

export function getIvrByClientLocal(clientId: string): IvrRequest[] {
  return getIvrRequestsLocal().filter((r) => r.clientId === clientId)
}

export function addIvrRequestLocal(request: IvrRequest): void {
  const requests = getIvrRequestsLocal()
  requests.unshift(request)
  save(IVR_KEY, requests)
}

export function generateIvrNumber(existingCount?: number): string {
  const year = new Date().getFullYear()
  const count = existingCount ?? getIvrRequestsLocal().length
  const seq = String(count + 1).padStart(4, '0')
  return `IVR-${year}-${seq}`
}
