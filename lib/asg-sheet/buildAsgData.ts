import type { AsgClaimRow } from './parse.js'
import { round2 } from './parse.js'

function buildClaims(parsed: AsgClaimRow[]) {
  return parsed.map((row, index) => {
    const remitUnits =
      row.totalRemitDollars > 0 && row.unitsBilled > 0 ? row.unitsBilled : 0
    return {
      id: `asg-claim-${index + 1}`,
      dos: row.dos,
      patientName: row.patientName,
      totalBilledAmount: row.totalBilledAmount,
      qCodeBilledAmount: row.qCodeBilledAmount,
      unitsBilled: row.unitsBilled,
      qCode: row.qCode,
      description: '',
      submissionDate: row.submissionDate,
      submissionId: row.submissionId,
      submissionStatus: row.submissionStatus,
      remitDate: row.remitDate,
      dateOfRemit: row.remitDate || row.secondaryRemitDate,
      primaryRemitDollars: row.primaryRemitDollars,
      qCodeRemitDollars: 0,
      primaryRemitPdf: row.primaryRemitPdf,
      primaryRemitPdfUrl: row.primaryRemitPdfUrl,
      secondaryInsurance: '',
      secondaryRemitDate: row.secondaryRemitDate,
      secondaryRemitDollars: row.secondaryRemitDollars,
      qSecondaryRemitDollars: 0,
      secondaryRemitPdf: row.secondaryRemitPdf,
      secondaryRemitPdfUrl: row.secondaryRemitPdfUrl,
      totalRemitDollars: row.totalRemitDollars,
      remitUnitsSqCm: remitUnits,
      leftToRemitDollars: row.leftToRemitDollars,
      leftToRemitSqCm: round2(row.unitsBilled - remitUnits),
      notes: '',
      billedDate: row.billedDate,
      primaryInvoiced: row.primaryInvoiced,
      secondaryInvoiced: row.secondaryInvoiced,
      invoiceNumber: row.invoiceNumber,
    }
  })
}

function buildRemitEvents(claims: ReturnType<typeof buildClaims>) {
  const rawEvents: Array<{
    claimId: string
    patientName: string
    dos: string
    dateOfRemit: string
    remitAmountDollars: number
    remitUnitsSqCm: number
    remitType: 'primary' | 'secondary'
    remitPdf: { label: string; url: string }
    billedAmount: number
    unitsBilled: number
    invoiceNumber: string
  }> = []

  for (const claim of claims) {
    if (claim.primaryRemitDollars > 0) {
      rawEvents.push({
        claimId: claim.id,
        patientName: claim.patientName,
        dos: claim.dos,
        dateOfRemit: claim.remitDate,
        remitAmountDollars: claim.primaryRemitDollars,
        remitUnitsSqCm: claim.unitsBilled > 0 ? claim.unitsBilled : 0,
        remitType: 'primary',
        remitPdf: { label: claim.primaryRemitPdf, url: claim.primaryRemitPdfUrl },
        billedAmount: claim.totalBilledAmount,
        unitsBilled: claim.unitsBilled,
        invoiceNumber: claim.invoiceNumber,
      })
    }
    if (claim.secondaryRemitDollars > 0) {
      rawEvents.push({
        claimId: claim.id,
        patientName: claim.patientName,
        dos: claim.dos,
        dateOfRemit: claim.secondaryRemitDate,
        remitAmountDollars: claim.secondaryRemitDollars,
        remitUnitsSqCm: 0,
        remitType: 'secondary',
        remitPdf: { label: claim.secondaryRemitPdf, url: claim.secondaryRemitPdfUrl },
        billedAmount: claim.totalBilledAmount,
        unitsBilled: claim.unitsBilled,
        invoiceNumber: claim.invoiceNumber,
      })
    }
  }

  const eventsByClaim = new Map<string, typeof rawEvents>()
  for (const event of rawEvents) {
    const list = eventsByClaim.get(event.claimId) ?? []
    list.push(event)
    eventsByClaim.set(event.claimId, list)
  }

  const remitEvents: Array<{
    id: string
    claimId: string
    patientName: string
    dos: string
    dateOfRemit: string
    remitAmountDollars: number
    remitUnitsSqCm: number
    remitType: 'primary' | 'secondary'
    remitPdf: { label: string; url: string }
    billedAmount: number
    unitsBilled: number
    remainingDollars: number
    remainingSqCm: number
    invoiceNumber: string
  }> = []

  let eventIndex = 0
  for (const claim of claims) {
    const claimEvents = eventsByClaim.get(claim.id) ?? []
    claimEvents.sort((a, b) => {
      const d = a.dateOfRemit.localeCompare(b.dateOfRemit)
      if (d !== 0) return d
      return a.remitType === 'primary' ? -1 : 1
    })

    let remittedDollars = 0
    let remittedSqCm = 0

    for (const event of claimEvents) {
      remittedDollars = round2(remittedDollars + event.remitAmountDollars)
      remittedSqCm = round2(remittedSqCm + event.remitUnitsSqCm)
      eventIndex += 1
      remitEvents.push({
        id: `asg-remit-${eventIndex}`,
        claimId: event.claimId,
        patientName: event.patientName,
        dos: event.dos,
        dateOfRemit: event.dateOfRemit,
        remitAmountDollars: event.remitAmountDollars,
        remitUnitsSqCm: event.remitUnitsSqCm,
        remitType: event.remitType,
        remitPdf: event.remitPdf,
        billedAmount: event.billedAmount,
        unitsBilled: event.unitsBilled,
        remainingDollars: round2(claim.totalBilledAmount - remittedDollars),
        remainingSqCm: round2(claim.unitsBilled - remittedSqCm),
        invoiceNumber: event.invoiceNumber,
      })
    }
  }

  remitEvents.sort((a, b) => {
    const remitCmp = b.dateOfRemit.localeCompare(a.dateOfRemit)
    if (remitCmp !== 0) return remitCmp
    return a.patientName.localeCompare(b.patientName)
  })

  return remitEvents
}

export interface AsgLiveData {
  generatedAt: string
  sourceFile: string
  sourceUrl: string
  note: string
  claimCount: number
  remitEventCount: number
  claims: ReturnType<typeof buildClaims>
  remitEvents: ReturnType<typeof buildRemitEvents>
}

export function buildAsgLiveData(
  parsed: AsgClaimRow[],
  sheetUrl: string,
): AsgLiveData {
  const claims = buildClaims(parsed)
  const remitEvents = buildRemitEvents(claims)

  return {
    generatedAt: new Date().toISOString(),
    sourceFile: 'Google Sheets ASG',
    sourceUrl: sheetUrl,
    note:
      'Live data from Google Sheets. Primary remits include billed sq cm; secondary remits are dollar-only.',
    claimCount: claims.length,
    remitEventCount: remitEvents.length,
    claims,
    remitEvents,
  }
}
