import fs from 'fs'
import { google } from 'googleapis'
import { ASG_GOOGLE_SHEET_ID } from './asg-sheet-config.mjs'

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.readonly'

function loadServiceAccountCredentials() {
  const jsonEnv = process.env.ASG_GOOGLE_SERVICE_ACCOUNT_JSON
  if (jsonEnv) {
    return JSON.parse(jsonEnv)
  }

  const path =
    process.env.ASG_GOOGLE_SERVICE_ACCOUNT_PATH ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    'secrets/google-service-account.json'

  if (!fs.existsSync(path)) {
    throw new Error(
      `Google service account key not found at ${path}. Run: npm run setup-asg-google`,
    )
  }

  return JSON.parse(fs.readFileSync(path, 'utf8'))
}

export function getServiceAccountEmail() {
  try {
    return loadServiceAccountCredentials().client_email
  } catch {
    return null
  }
}

export async function fetchAsgSheetXlsx() {
  const credentials = loadServiceAccountCredentials()
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [DRIVE_SCOPE],
  })

  const drive = google.drive({ version: 'v3', auth })
  const res = await drive.files.export(
    {
      fileId: ASG_GOOGLE_SHEET_ID,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
    { responseType: 'arraybuffer' },
  )

  return Buffer.from(res.data)
}
