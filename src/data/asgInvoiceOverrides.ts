import overrides from './asgInvoiceOverrides.json'

export interface AsgInvoiceOverride {
  patientName: string
  dos: string
  invoiceNumber: string
  note?: string
}

export const ASG_INVOICE_OVERRIDES = overrides as AsgInvoiceOverride[]

export function applyAsgInvoiceOverrides<
  T extends { patientName: string; dos: string; invoiceNumber: string },
>(rows: T[]): void {
  for (const override of ASG_INVOICE_OVERRIDES) {
    for (const row of rows) {
      if (row.invoiceNumber) continue
      if (row.patientName !== override.patientName) continue
      if (row.dos !== override.dos) continue
      row.invoiceNumber = override.invoiceNumber
    }
  }
}
