/** Med Effects LLC vendor statement #1284 — American Surgeons Group (as of 2026-07-02). */
export const MED_EFFECTS_STATEMENT = {
  vendorName: 'Med Effects, LLC',
  vendorContact: 'ken@medeffectsllc.com',
  vendorPhone: '8103351435',
  billTo: 'Dr Julia Shauger · American Surgeons Group',
  statementNumber: '1284',
  statementDate: '2026-07-02',
  totalDue: 2231160.29,
  aging: {
    current: 21280,
    days1to30: 18200,
    days31to60: 21700,
    days61to90: 0,
    days90plus: 2109433.15,
  },
  byYear: [
    {
      year: '2025',
      invoiced: 7503324.48,
      paid: 1488021.6,
    },
    {
      year: '2026',
      invoiced: 260802.38,
      paid: 4044944.97,
    },
  ],
  recentPayments: [
    { date: '2026-01-07', description: 'Wire payment (1.2.26)', amount: 1_363_000.0 },
    { date: '2026-01-15', description: 'Payment #8 Jan wire', amount: 1_156_780.8 },
    { date: '2026-01-21', description: 'Payment #21 Jan wire', amount: 504_561.29 },
    { date: '2026-02-04', description: 'Payment #4 Feb wire', amount: 547_902.94 },
    { date: '2026-02-05', description: 'Payment #5 Feb wire', amount: 400_000.0 },
    { date: '2026-03-09', description: 'Payment #9 Mar wire ASG', amount: 21_579.86 },
    { date: '2026-03-12', description: 'Payment #12 Mar ASG wire', amount: 49_980.0 },
  ],
} as const

export function getMedEffectsYearSummary(year: string) {
  return MED_EFFECTS_STATEMENT.byYear.find((row) => row.year === year)
}

export function getMedEffectsTotalPaid(): number {
  return MED_EFFECTS_STATEMENT.byYear.reduce((sum, row) => sum + row.paid, 0)
}

export function getMedEffectsTotalInvoiced(): number {
  return MED_EFFECTS_STATEMENT.byYear.reduce((sum, row) => sum + row.invoiced, 0)
}
