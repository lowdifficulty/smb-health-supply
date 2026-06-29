import { getAsgRemitEvents, groupRemitEventsByPdf } from '../data/asgData'

import type { AsgRemitPdfLink } from '../types/asg'



export interface AsgPaymentDueItem {

  dateOfRemit: string

  amount: number

  remitPdfLabel: string

  remitSqCm?: number

}



export interface AsgPaymentDueBreakdown extends AsgPaymentDueItem {

  insuranceRemitDollars: number

  insuranceRemitSqCm: number

  lineCount: number

  patientCount: number

  remitPdf: AsgRemitPdfLink

  blendedRemitPerSqCm: number

  patientNames: string[]

}



/** Only remits with a payment owed to SMB (portal). */

const PAYMENT_DUE_ITEMS: AsgPaymentDueItem[] = [

  {

    dateOfRemit: '2026-04-27',

    amount: 53277,

    remitPdfLabel: 'ASG Remit 4.27.26.pdf',

    remitSqCm: 21,

  },

  {

    dateOfRemit: '2026-06-01',

    amount: 5040,

    remitPdfLabel: 'ASG Remit 6.1.26.pdf',

    remitSqCm: 72,

  },

]



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



export function getOutstandingPaymentItems(): AsgPaymentDueItem[] {

  const paid = getPaidRemitDates()

  return PAYMENT_DUE_ITEMS.filter((item) => !paid.has(item.dateOfRemit))

}



export function getOutstandingPaymentBreakdown(): AsgPaymentDueBreakdown[] {

  const groups = groupRemitEventsByPdf(getAsgRemitEvents())

  return getOutstandingPaymentItems().map((item) => {

    const group = groups.find(

      (g) => g.dateOfRemit === item.dateOfRemit && g.remitPdf.label === item.remitPdfLabel,

    )

    return {

      ...item,

      insuranceRemitDollars: group?.totalRemitDollars ?? 0,

      insuranceRemitSqCm: group?.totalRemitSqCm ?? item.remitSqCm ?? 0,

      lineCount: group?.lineCount ?? 0,

      patientCount: group?.patientCount ?? 0,

      remitPdf: group?.remitPdf ?? { label: item.remitPdfLabel, url: '' },

      blendedRemitPerSqCm: group?.blendedRemitPerSqCm ?? 0,

      patientNames: group?.patientNames ?? [],

    }

  })

}



export function getTotalPaymentOwed(): number {

  return getOutstandingPaymentItems().reduce((sum, item) => sum + item.amount, 0)

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


