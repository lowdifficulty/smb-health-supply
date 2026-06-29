import fs from 'fs'
import { ASG_GOOGLE_SHEET_ID, ASG_GOOGLE_SHEET_URL } from '../api/lib/asg-sheet/config.js'
import { getServiceAccountEmail } from '../api/lib/asg-sheet/fetchGoogle.js'

const keyPath = 'secrets/google-service-account.json'

console.log('ASG Google Sheet — full setup\n')
console.log('Sheet:', ASG_GOOGLE_SHEET_URL)
console.log('')

const steps: string[] = []

if (!fs.existsSync(keyPath)) {
  steps.push(
    '1. Google Cloud: enable Drive API, create service account JSON → secrets/google-service-account.json',
  )
  steps.push('2. Share the Google Sheet with the service account email (Viewer)')
} else {
  const email = getServiceAccountEmail()
  console.log('✓ Local service account:', keyPath)
  console.log('  Share sheet with:', email)
  steps.push('Share the Google Sheet with the service account email if not already done')
}

steps.push('3. Vercel → Project → Settings → Environment Variables:')
steps.push('   ASG_GOOGLE_SERVICE_ACCOUNT_JSON = entire JSON file contents (Production)')
steps.push('   UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN (Upstash Redis from Marketplace)')
steps.push('   RESEND_API_KEY + ASG_NOTIFY_EMAIL=mlewis@smbhealthsupply.com')
steps.push('4. Deploy: npx vercel --prod')
steps.push('5. First baseline: curl -H "Authorization: Bearer $CRON_SECRET" https://smb-health-supply.vercel.app/api/cron/check-asg-sheet?baseline=1')

console.log('\nRemaining steps:\n')
steps.forEach((s) => console.log('  ' + s))
console.log('\nDaily cron: 8:00 AM ET (13:00 UTC) — /api/cron/check-asg-sheet')
console.log('Portal loads live data from /api/asg-data after first successful check.')
