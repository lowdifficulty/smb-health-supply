import type {
  AsgData,
  AsgClaim,
  AsgRemitEvent,
  AsgRemitPdfLink,
  AsgPatientTotals,
  AsgRemitRateSummary,
  AsgRemitType,
  AsgPatientRemitGroup,
  AsgRemitPdfGroup,
} from '../types/asg'
import raw from './asgData.json'
import { getRemitPdfUrl } from '../lib/asgRemitPdf'

let activeData = raw as AsgData

export const asgData = activeData

export function setAsgData(data: AsgData): void {
  activeData = data
}

export function getAsgData(): AsgData {
  return activeData
}

export function getAsgClaims(): AsgClaim[] {
  return activeData.claims ?? []
}

export function getAsgRemitEvents(): AsgRemitEvent[] {
  return activeData.remitEvents ?? []
}

export function getRemitPdfLink(link: AsgRemitPdfLink): AsgRemitPdfLink {
  if (link.url) return link
  return { label: link.label, url: getRemitPdfUrl(link.label) }
}

export function getPatientClaims(patientName: string): AsgClaim[] {
  return getAsgClaims().filter((c) => c.patientName === patientName)
}

export function getPatientRemitEvents(patientName: string): AsgRemitEvent[] {
  return getAsgRemitEvents()
    .filter((e) => e.patientName === patientName)
    .sort((a, b) => b.dateOfRemit.localeCompare(a.dateOfRemit))
}

export function getPatientTotals(patientName: string): AsgPatientTotals {
  const claims = getPatientClaims(patientName)
  const events = getPatientRemitEvents(patientName)

  const placedSqCm = claims.reduce((s, c) => s + c.unitsBilled, 0)
  const billedDollars = claims.reduce((s, c) => s + c.totalBilledAmount, 0)
  const remittedDollars = events.reduce((s, e) => s + e.remitAmountDollars, 0)
  const remittedSqCm = events.reduce((s, e) => s + e.remitUnitsSqCm, 0)

  const remainingDollars = claims.reduce((s, c) => s + c.leftToRemitDollars, 0)
  const remainingSqCm = claims.reduce((s, c) => s + c.leftToRemitSqCm, 0)

  return {
    patientName,
    placedSqCm: round2(placedSqCm),
    remittedSqCm: round2(remittedSqCm),
    remainingSqCm: round2(remainingSqCm),
    billedDollars: round2(billedDollars),
    remittedDollars: round2(remittedDollars),
    remainingDollars: round2(remainingDollars),
    remitEventCount: events.length,
    claimLineCount: claims.length,
  }
}

export function getUniquePatientNames(): string[] {
  const names = new Set(getAsgClaims().map((c) => c.patientName))
  return [...names].sort((a, b) => a.localeCompare(b))
}

export function getAsgTotals() {
  const claims = getAsgClaims()
  const events = getAsgRemitEvents()
  const primaryEvents = events.filter((e) => e.remitType === 'primary')
  const secondaryEvents = events.filter((e) => e.remitType === 'secondary')
  return {
    patients: getUniquePatientNames().length,
    remitEvents: events.length,
    claims: claims.length,
    billedDollars: claims.reduce((s, c) => s + c.totalBilledAmount, 0),
    remitDollars: events.reduce((s, e) => s + e.remitAmountDollars, 0),
    primaryRemitDollars: primaryEvents.reduce((s, e) => s + e.remitAmountDollars, 0),
    secondaryRemitDollars: secondaryEvents.reduce((s, e) => s + e.remitAmountDollars, 0),
    primaryRemitEvents: primaryEvents.length,
    secondaryRemitEvents: secondaryEvents.length,
    leftDollars: claims.reduce((s, c) => s + c.leftToRemitDollars, 0),
    billedSqCm: claims.reduce((s, c) => s + c.unitsBilled, 0),
    remitSqCm: primaryEvents.reduce((s, e) => s + e.remitUnitsSqCm, 0),
    leftSqCm: claims.reduce((s, c) => s + c.leftToRemitSqCm, 0),
  }
}

/** Remit dollars per placed sq cm on the claim line (secondary uses units billed, not remit sq cm). */
export function getRemitDollarsPerSqCm(event: AsgRemitEvent): number | null {
  if (event.remitAmountDollars <= 0 || event.unitsBilled <= 0) return null
  return round2(event.remitAmountDollars / event.unitsBilled)
}

function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

export function getRemitRateSummary(year: string, remitType: AsgRemitType): AsgRemitRateSummary {
  const events = getAsgRemitEvents().filter(
    (e) => e.dos.startsWith(year) && e.remitType === remitType && e.remitAmountDollars > 0 && e.unitsBilled > 0,
  )
  const rates = events.map((e) => e.remitAmountDollars / e.unitsBilled)
  const totalRemitDollars = events.reduce((s, e) => s + e.remitAmountDollars, 0)
  const totalSqCm = events.reduce((s, e) => s + e.unitsBilled, 0)

  return {
    year,
    remitType,
    remitCount: events.length,
    totalRemitDollars: round2(totalRemitDollars),
    totalSqCm: round2(totalSqCm),
    blendedPerSqCm: totalSqCm > 0 ? round2(totalRemitDollars / totalSqCm) : 0,
    medianPerSqCm: round2(median(rates)),
    avgPerSqCm: rates.length > 0 ? round2(rates.reduce((s, r) => s + r, 0) / rates.length) : 0,
  }
}

export function getRemitRateSummariesForYears(years: string[]): AsgRemitRateSummary[] {
  const types: AsgRemitType[] = ['primary', 'secondary']
  return years.flatMap((year) => types.map((remitType) => getRemitRateSummary(year, remitType)))
}

export function groupRemitEventsByPdf(events: AsgRemitEvent[]): AsgRemitPdfGroup[] {
  const byPdf = new Map<string, AsgRemitEvent[]>()

  for (const event of events) {
    const key = `${event.dateOfRemit}|${event.remitPdf.label}|${event.remitType}|${event.remitPdf.url}`
    const list = byPdf.get(key) ?? []
    list.push(event)
    byPdf.set(key, list)
  }

  return [...byPdf.entries()].map(([key, batchEvents]) => {
    const sortedEvents = [...batchEvents].sort((a, b) => {
      const patientCmp = a.patientName.localeCompare(b.patientName)
      if (patientCmp !== 0) return patientCmp
      return a.dos.localeCompare(b.dos)
    })
    const first = sortedEvents[0]
    const totalRemitDollars = round2(sortedEvents.reduce((s, e) => s + e.remitAmountDollars, 0))
    const totalRemitSqCm = round2(sortedEvents.reduce((s, e) => s + e.remitUnitsSqCm, 0))
    const totalUnitsBilled = round2(sortedEvents.reduce((s, e) => s + e.unitsBilled, 0))
    const totalRemainingDollars = round2(sortedEvents.reduce((s, e) => s + e.remainingDollars, 0))
    const dosDates = sortedEvents.map((e) => e.dos).sort()
    const patientNames = [...new Set(sortedEvents.map((e) => e.patientName))].sort()

    return {
      id: key,
      dateOfRemit: first.dateOfRemit,
      remitType: first.remitType,
      remitPdf: first.remitPdf,
      events: sortedEvents,
      totalRemitDollars,
      totalRemitSqCm,
      totalUnitsBilled,
      totalRemainingDollars,
      lineCount: sortedEvents.length,
      patientCount: patientNames.length,
      patientNames,
      earliestDos: dosDates[0] ?? '',
      latestDos: dosDates[dosDates.length - 1] ?? '',
      blendedRemitPerSqCm:
        totalUnitsBilled > 0 ? round2(totalRemitDollars / totalUnitsBilled) : 0,
    }
  })
}

export function groupRemitEventsByPatient(events: AsgRemitEvent[]): AsgPatientRemitGroup[] {
  const byPatient = new Map<string, AsgRemitEvent[]>()

  for (const event of events) {
    const list = byPatient.get(event.patientName) ?? []
    list.push(event)
    byPatient.set(event.patientName, list)
  }

  return [...byPatient.entries()].map(([patientName, patientEvents]) => {
    const sortedEvents = [...patientEvents].sort((a, b) => b.dateOfRemit.localeCompare(a.dateOfRemit))
    const totalRemitDollars = round2(sortedEvents.reduce((s, e) => s + e.remitAmountDollars, 0))
    const totalRemitSqCm = round2(sortedEvents.reduce((s, e) => s + e.remitUnitsSqCm, 0))
    const totalUnitsBilled = round2(sortedEvents.reduce((s, e) => s + e.unitsBilled, 0))
    const dosDates = sortedEvents.map((e) => e.dos).sort()
    const patientTotals = getPatientTotals(patientName)

    return {
      patientName,
      events: sortedEvents,
      totalRemitDollars,
      totalRemitSqCm,
      totalUnitsBilled,
      remainingDollars: patientTotals.remainingDollars,
      remitCount: sortedEvents.length,
      latestRemitDate: sortedEvents[0]?.dateOfRemit ?? '',
      earliestDos: dosDates[0] ?? '',
      latestDos: dosDates[dosDates.length - 1] ?? '',
      blendedRemitPerSqCm:
        totalUnitsBilled > 0 ? round2(totalRemitDollars / totalUnitsBilled) : 0,
    }
  })
}

function round2(n: number) {
  return Math.round(n * 100) / 100
}
