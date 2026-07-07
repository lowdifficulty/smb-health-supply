import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Redis } from '@upstash/redis'
import { sendIvrNotificationEmail } from './sendIvrEmail.js'

const KV_KEY = 'ivr_requests'

interface StoredIvrRequest {
  id: string
  requestNumber: string
  requestType: string
  clientId: string
  clientName: string
  status: string
  submittedAt: string
  patientFirstName: string
  patientLastName: string
  patientDob: string
  memberId: string
  primaryCarrier: string
  primaryPolicyNumber: string
  planType: string
  facilityNpi: string
  renderingProviderNpi: string
  dateOfService: string
  productName: string
  hcpcsCode: string
  icd10Primary: string
}

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

async function loadRequests(): Promise<StoredIvrRequest[]> {
  const redis = getRedis()
  if (!redis) return []
  const data = await redis.get<StoredIvrRequest[]>(KV_KEY)
  return Array.isArray(data) ? data : []
}

async function saveRequests(requests: StoredIvrRequest[]): Promise<void> {
  const redis = getRedis()
  if (!redis) {
    throw new Error('Redis not configured (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN)')
  }
  await redis.set(KV_KEY, requests)
}

function isValidRequest(body: unknown): body is StoredIvrRequest {
  if (!body || typeof body !== 'object') return false
  const r = body as Record<string, unknown>
  return (
    typeof r.id === 'string' &&
    typeof r.requestNumber === 'string' &&
    typeof r.clientId === 'string' &&
    typeof r.patientFirstName === 'string' &&
    typeof r.patientLastName === 'string' &&
    typeof r.memberId === 'string'
  )
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const clientId = typeof req.query.clientId === 'string' ? req.query.clientId : undefined
    const requests = await loadRequests()
    const filtered = clientId ? requests.filter((r) => r.clientId === clientId) : requests
    return res.status(200).json(filtered)
  }

  if (req.method === 'POST') {
    if (!isValidRequest(req.body)) {
      return res.status(400).json({ error: 'Invalid IVR payload' })
    }

    const request = req.body as StoredIvrRequest
    const normalized: StoredIvrRequest = {
      ...request,
      requestType: 'simple',
      status: request.status || 'Submitted',
      renderingProviderNpi: '',
      dateOfService: '',
      productName: '',
      hcpcsCode: '',
      icd10Primary: '',
    }

    try {
      const existing = await loadRequests()
      const withoutDup = existing.filter((r) => r.id !== normalized.id)
      const updated = [normalized, ...withoutDup]
      await saveRequests(updated)
    } catch (err) {
      console.error('Redis save failed:', err)
      return res.status(503).json({
        error: 'Server storage not configured. Add Upstash Redis from the Vercel Marketplace.',
      })
    }

    try {
      await sendIvrNotificationEmail({
        requestNumber: normalized.requestNumber,
        clientName: normalized.clientName,
        submittedAt: normalized.submittedAt,
        patientFirstName: normalized.patientFirstName,
        patientLastName: normalized.patientLastName,
        patientDob: normalized.patientDob,
        memberId: normalized.memberId,
        primaryCarrier: normalized.primaryCarrier,
        primaryPolicyNumber: normalized.primaryPolicyNumber,
        planType: normalized.planType,
        facilityNpi: normalized.facilityNpi,
      })
    } catch (err) {
      console.error('Email send failed:', err)
    }

    return res.status(201).json(normalized)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
