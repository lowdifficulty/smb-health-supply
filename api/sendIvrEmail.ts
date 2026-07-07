import { Resend } from 'resend'

export interface IvrEmailPayload {
  requestNumber: string
  clientName: string
  submittedAt: string
  patientFirstName: string
  patientLastName: string
  patientDob: string
  memberId: string
  primaryCarrier: string
  primaryPolicyNumber: string
  planType: string
  facilityNpi: string
}

function formatField(label: string, value: string): string {
  return `<tr><td style="padding:6px 12px;color:#64748b;">${label}</td><td style="padding:6px 12px;font-weight:600;">${value || '—'}</td></tr>`
}

export async function sendIvrNotificationEmail(payload: IvrEmailPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set — skipping IVR email notification')
    return
  }

  const to = process.env.IVR_NOTIFY_EMAIL ?? 'mlewis@smbhealthsupply.com'
  const from = process.env.IVR_EMAIL_FROM ?? 'SMB Health Supply <notifications@smbhealthsupply.com>'
  const adminUrl = process.env.APP_URL ?? 'https://smb-health-supply.vercel.app'

  const patientName = `${payload.patientFirstName} ${payload.patientLastName}`.trim()
  const subject = `New Simple IVR — ${payload.requestNumber} (${patientName})`

  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#0f172a;">
      <h2 style="margin:0 0 16px;">New Simple IVR submission</h2>
      <table style="border-collapse:collapse;font-size:14px;">
        ${formatField('Request #', payload.requestNumber)}
        ${formatField('Client', payload.clientName)}
        ${formatField('Submitted', new Date(payload.submittedAt).toLocaleString('en-US', { timeZone: 'America/New_York' }))}
        ${formatField('Patient', patientName)}
        ${formatField('DOB', payload.patientDob)}
        ${formatField('Member ID', payload.memberId)}
        ${formatField('Provider / Carrier', payload.primaryCarrier)}
        ${formatField('Policy #', payload.primaryPolicyNumber)}
        ${formatField('Plan', payload.planType)}
        ${formatField('Facility NPI', payload.facilityNpi)}
      </table>
      <p style="margin:24px 0 0;">
        <a href="${adminUrl}/ivr" style="color:#2563eb;">View in admin portal →</a>
      </p>
    </div>
  `

  const text = [
    `New Simple IVR: ${payload.requestNumber}`,
    `Client: ${payload.clientName}`,
    `Patient: ${patientName}`,
    `DOB: ${payload.patientDob}`,
    `Member ID: ${payload.memberId}`,
    `Carrier: ${payload.primaryCarrier}`,
    `Policy: ${payload.primaryPolicyNumber}`,
    `Plan: ${payload.planType}`,
    `Admin: ${adminUrl}/ivr`,
  ].join('\n')

  const resend = new Resend(apiKey)
  await resend.emails.send({
    from,
    to: [to],
    subject,
    html,
    text,
  })
}
