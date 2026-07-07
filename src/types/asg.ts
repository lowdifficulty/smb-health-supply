export interface AsgRemitPdfLink {
  label: string
  url: string
}

export type AsgRemitType = 'primary' | 'secondary'

export interface AsgRemitPdfLink {
  label: string
  url: string
}

export interface AsgClaim {
  id: string
  dos: string
  patientName: string
  totalBilledAmount: number
  qCodeBilledAmount: number
  unitsBilled: number
  qCode: string
  description: string
  submissionDate: string
  submissionId: string
  submissionStatus: string
  remitDate: string
  dateOfRemit: string
  primaryRemitDollars: number
  qCodeRemitDollars: number
  primaryRemitPdf: string
  primaryRemitPdfUrl: string
  secondaryInsurance: string
  secondaryRemitDate: string
  secondaryRemitDollars: number
  qSecondaryRemitDollars: number
  secondaryRemitPdf: string
  secondaryRemitPdfUrl: string
  totalRemitDollars: number
  remitUnitsSqCm: number
  leftToRemitDollars: number
  leftToRemitSqCm: number
  notes: string
}

/** One row per remit payment (primary or secondary), with running balance for that claim line. */
export interface AsgRemitEvent {
  id: string
  claimId: string
  patientName: string
  dos: string
  dateOfRemit: string
  remitAmountDollars: number
  remitUnitsSqCm: number
  remitType: AsgRemitType
  remitPdf: AsgRemitPdfLink
  billedAmount: number
  unitsBilled: number
  remainingDollars: number
  remainingSqCm: number
}

export interface AsgRemitPdfGroup {
  id: string
  dateOfRemit: string
  remitType: AsgRemitType
  remitPdf: AsgRemitPdfLink
  events: AsgRemitEvent[]
  totalRemitDollars: number
  totalRemitSqCm: number
  totalUnitsBilled: number
  totalRemainingDollars: number
  lineCount: number
  patientCount: number
  patientNames: string[]
  earliestDos: string
  latestDos: string
  blendedRemitPerSqCm: number
}

export interface AsgPatientRemitGroup {
  patientName: string
  events: AsgRemitEvent[]
  totalRemitDollars: number
  totalRemitSqCm: number
  totalUnitsBilled: number
  remainingDollars: number
  remitCount: number
  latestRemitDate: string
  earliestDos: string
  latestDos: string
  blendedRemitPerSqCm: number
}

export interface AsgPatientTotals {
  patientName: string
  placedSqCm: number
  remittedSqCm: number
  remainingSqCm: number
  billedDollars: number
  remittedDollars: number
  remainingDollars: number
  remitEventCount: number
  claimLineCount: number
}

export interface AsgRemitRateSummary {
  year: string
  remitType: AsgRemitType
  remitCount: number
  totalRemitDollars: number
  totalSqCm: number
  blendedPerSqCm: number
  medianPerSqCm: number
  avgPerSqCm: number
}

export interface AsgData {
  generatedAt: string
  sourceFile: string
  note: string
  claimCount: number
  remitEventCount: number
  claims: AsgClaim[]
  remitEvents: AsgRemitEvent[]
}
