import { runAsgSheetCheck } from '../api/lib/asg-sheet/runCheck.js'

const saveBaseline = process.argv.includes('--save-baseline')

runAsgSheetCheck({ saveBaseline, skipRedis: !process.env.UPSTASH_REDIS_REST_URL })
  .then((report) => {
    console.log(report.reportText)
    console.log('')
    if (report.liveDataUpdated) console.log('Live data updated in Redis.')
    if (report.diff.hasChanges) process.exit(2)
  })
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err)
    process.exit(1)
  })
