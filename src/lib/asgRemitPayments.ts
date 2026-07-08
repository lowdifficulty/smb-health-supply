import { getAsgRemitEvents, groupRemitEventsByPdf } from '../data/asgData'
import type { AsgRemitPdfLink } from '../types/asg'
import {
  REMIT_PAYMENT_CONFIGS,
  getNetRemitPaymentDue,
  getPayNowLineItems,
  type RemitLineOwed,
} from './asgRemitOwed'

export interface AsgPaymentDueItem {
  dateOfRemit: string
  amount: number
  grossAmount: number
  prepaymentCredit: number
  remitPdfLabel: string
  remitSqCm?: number
  note?: string
}

export interface AsgPaymentDueBreakdown extends AsgPaymentDueItem {
  insuranceRemitDollars: number
  insuranceRemitSqCm: number
  lineCount: number
  patientCount: number
  remitPdf: AsgRemitPdfLink
  blendedRemitPerSqCm: number
  patientNames: string[]
  lineItems: RemitLineOwed[]
}

const PAID_REMITS_KEY = 'smb_asg_paid_remit_dates'
const PAYMENT_UPDATED_EVENT = 'asg-payment-updated'

function getPaidRemitDates(): Set<string> {
  try {
    const raw = localStorage.getItem(PAID_REMITS_KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set()
  }
}

function buildPaymentDueItems(): AsgPaymentDueItem[] {
  return REMIT_PAYMENT_CONFIGS.map((config) => ({
    dateOfRemit: config.dateOfRemit,
    grossAmount: config.grossAmount,
    prepaymentCredit: config.prepaymentCredit ?? 0,
    amount: getNetRemitPaymentDue(config),
    remitPdfLabel: config.remitPdfLabel,
    note: config.note,
  }))
}

export function getOutstandingPaymentItems(): AsgPaymentDueItem[] {
  const paid = getPaidRemitDates()
  return buildPaymentDueItems().filter((item) => !paid.has(item.dateOfRemit))
}

export function getOutstandingPaymentBreakdown(): AsgPaymentDueBreakdown[] {
  const events = getAsgRemitEvents()
  const groups = groupRemitEventsByPdf(events)
  const payNowLines = getPayNowLineItems(events)

  return getOutstandingPaymentItems().map((item) => {
    const group = groups.find(
      (entry) => entry.dateOfRemit === item.dateOfRemit && entry.remitPdf.label === item.remitPdfLabel,
    )

    return {
      ...item,
      remitSqCm: group?.totalRemitSqCm,
      insuranceRemitDollars: group?.totalRemitDollars ?? 0,
      insuranceRemitSqCm: group?.totalRemitSqCm ?? 0,
      lineCount: group?.lineCount ?? 0,
      patientCount: group?.patientCount ?? 0,
      remitPdf: group?.remitPdf ?? { label: item.remitPdfLabel, url: '' },
      blendedRemitPerSqCm: group?.blendedRemitPerSqCm ?? 0,
      patientNames: group?.patientNames ?? [],
      lineItems: payNowLines.filter(
        (line) =>
          line.dateOfRemit === item.dateOfRemit && line.remitPdfLabel === item.remitPdfLabel,
      ),
    }
  })
}

export function getTotalPaymentOwed(): number {
  const paid = getPaidRemitDates()
  return buildPaymentDueItems()
    .filter((item) => !paid.has(item.dateOfRemit))
    .reduce((sum, item) => sum + item.amount, 0)
}

export function getTotalRemitsReceived(): number {
  return getOutstandingPaymentBreakdown().reduce(
    (sum, item) => sum + item.insuranceRemitDollars,
    0,
  )
}

export function markRemitPaymentsPaid(dates: string[]): void {
  const paid = getPaidRemitDates()
  for (const date of dates) paid.add(date)
  localStorage.setItem(PAID_REMITS_KEY, JSON.stringify([...paid]))
  window.dispatchEvent(new Event(PAYMENT_UPDATED_EVENT))
}

export function subscribePaymentOwed(listener: () => void): () => void {
  const handler = () => listener()
  window.addEventListener(PAYMENT_UPDATED_EVENT, handler)
  return () => window.removeEventListener(PAYMENT_UPDATED_EVENT, handler)
}

export { getPayNowLineItems, type RemitLineOwed }
