import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Redis } from '@upstash/redis'
import { REDIS_LIVE_DATA_KEY, REDIS_LAST_REPORT_KEY } from '../lib/asg-sheet/config.js'

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const redis = getRedis()
  if (!redis) {
    return res.status(503).json({ error: 'Live data store not configured' })
  }

  const path = typeof req.query.path === 'string' ? req.query.path : 'data'

  if (path === 'report') {
    const report = await redis.get(REDIS_LAST_REPORT_KEY)
    return res.status(200).json(report ?? { message: 'No report yet' })
  }

  const liveData = await redis.get(REDIS_LIVE_DATA_KEY)
  if (!liveData) {
    return res.status(404).json({ error: 'No live ASG data yet. Run the daily check first.' })
  }

  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
  return res.status(200).json(liveData)
}
