import { PRICE_PER_SQ_CM } from './pricing'
import type { AsgRemitEvent } from '../types/asg'

export interface RemitPaymentConfig {
  dateOfRemit: string
  remitPdfLabel: string
  grossAmount: number
  prepaymentCredit?: number
  note?: string
}

export interface RemitLineOwed {
  eventId: string
  patientName: string
  dos: string
  dateOfRemit: string
  remitPdfLabel: string
  invoiceNumber: string
  remitAmountDollars: number
  remitSqCm: number
  amountOwedToSmb: number
  ratePerSqCm: number
}

/** Remit batches with a fixed payment owed to SMB (portal pay-now section). */
export const REMIT_PAYMENT_CONFIGS: RemitPaymentConfig[] = [
  {
    dateOfRemit: '2026-04-27',
    remitPdfLabel: 'ASG Remit 4.27.26.pdf',
    grossAmount: 53_277,
    prepaymentCredit: 50_000,
    note: '$50,000 good-faith prepayment applied',
  },
  {
    dateOfRemit: '2026-06-01',
    remitPdfLabel: 'ASG Remit 6.1.26.pdf',
    grossAmount: 5_040,
  },
]

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export function findRemitPaymentConfig(
  dateOfRemit: string,
  remitPdfLabel: string,
): RemitPaymentConfig | undefined {
  return REMIT_PAYMENT_CONFIGS.find(
    (config) => config.dateOfRemit === dateOfRemit && config.remitPdfLabel === remitPdfLabel,
  )
}

export function getNetRemitPaymentDue(config: RemitPaymentConfig): number {
  return Math.max(0, round2(config.grossAmount - (config.prepaymentCredit ?? 0)))
}

export function allocatePaymentOwedToLines(
  events: AsgRemitEvent[],
  netBatchOwed: number,
): Map<string, number> {
  const lines = events.filter((event) => event.remitUnitsSqCm > 0)
  const totalSqCm = lines.reduce((sum, event) => sum + event.remitUnitsSqCm, 0)
  const allocation = new Map<string, number>()

  if (totalSqCm <= 0 || netBatchOwed <= 0) return allocation

  let allocated = 0
  lines.forEach((event, index) => {
    if (index === lines.length - 1) {
      allocation.set(event.id, round2(netBatchOwed - allocated))
      return
    }
    const share = round2(netBatchOwed * (event.remitUnitsSqCm / totalSqCm))
    allocation.set(event.id, share)
    allocated += share
  })

  return allocation
}

export function getConfiguredLineOwedMap(events: AsgRemitEvent[]): Map<string, number> {
  const owedByEvent = new Map<string, number>()

  for (const config of REMIT_PAYMENT_CONFIGS) {
    const batchEvents = events.filter(
      (event) =>
        event.dateOfRemit === config.dateOfRemit && event.remitPdf.label === config.remitPdfLabel,
    )
    if (batchEvents.length === 0) continue

    const allocation = allocatePaymentOwedToLines(batchEvents, getNetRemitPaymentDue(config))
    for (const [eventId, amount] of allocation) {
      owedByEvent.set(eventId, amount)
    }
  }

  return owedByEvent
}

export function getLineAmountOwedToSmb(
  event: AsgRemitEvent,
  configuredOwed?: Map<string, number>,
): number {
  const configured = configuredOwed?.get(event.id)
  if (configured != null) return configured

  if (event.remitType === 'primary' && event.remitUnitsSqCm > 0 && event.invoiceNumber) {
    return round2(event.remitUnitsSqCm * PRICE_PER_SQ_CM)
  }

  return 0
}

export function buildRemitLineOwedRows(events: AsgRemitEvent[]): RemitLineOwed[] {
  const configuredOwed = getConfiguredLineOwedMap(events)

  return events
    .map((event) => {
      const remitSqCm = event.remitUnitsSqCm
      const amountOwedToSmb = getLineAmountOwedToSmb(event, configuredOwed)
      return {
        eventId: event.id,
        patientName: event.patientName,
        dos: event.dos,
        dateOfRemit: event.dateOfRemit,
        remitPdfLabel: event.remitPdf.label,
        invoiceNumber: event.invoiceNumber,
        remitAmountDollars: event.remitAmountDollars,
        remitSqCm,
        amountOwedToSmb,
        ratePerSqCm: remitSqCm > 0 ? round2(amountOwedToSmb / remitSqCm) : 0,
      }
    })
    .filter((row) => row.amountOwedToSmb > 0 || row.invoiceNumber || row.remitSqCm > 0)
}

export function getPayNowLineItems(events: AsgRemitEvent[]): RemitLineOwed[] {
  const configuredOwed = getConfiguredLineOwedMap(events)
  const rows: RemitLineOwed[] = []

  for (const config of REMIT_PAYMENT_CONFIGS) {
    const batchEvents = events.filter(
      (event) =>
        event.dateOfRemit === config.dateOfRemit && event.remitPdf.label === config.remitPdfLabel,
    )
    for (const event of batchEvents) {
      const remitSqCm = event.remitUnitsSqCm
      const amountOwedToSmb = getLineAmountOwedToSmb(event, configuredOwed)
      rows.push({
        eventId: event.id,
        patientName: event.patientName,
        dos: event.dos,
        dateOfRemit: event.dateOfRemit,
        remitPdfLabel: event.remitPdf.label,
        invoiceNumber: event.invoiceNumber,
        remitAmountDollars: event.remitAmountDollars,
        remitSqCm,
        amountOwedToSmb,
        ratePerSqCm: remitSqCm > 0 ? round2(amountOwedToSmb / remitSqCm) : 0,
      })
    }
  }

  return rows
}

export function getTotalNetPaymentOwed(): number {
  return REMIT_PAYMENT_CONFIGS.reduce((sum, config) => sum + getNetRemitPaymentDue(config), 0)
}
