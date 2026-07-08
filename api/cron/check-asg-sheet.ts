import type { VercelRequest, VercelResponse } from '@vercel/node'
import { runAsgSheetCheck } from '../../lib/asg-sheet/runCheck.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers.authorization
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const saveBaseline = req.query.baseline === '1' || req.query.baseline === 'true'
    const report = await runAsgSheetCheck({ saveBaseline })

    return res.status(report.diff.hasChanges ? 200 : 200).json({
      ok: true,
      summary: report.diff.summary,
      hasChanges: report.diff.hasChanges,
      liveDataUpdated: report.liveDataUpdated,
      checkedAt: report.checkedAt,
      totals: report.totals,
      reportText: report.reportText,
    })
  } catch (err) {
    console.error('ASG cron check failed:', err)
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Check failed',
    })
  }
}
