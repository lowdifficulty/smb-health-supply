export type KanbanStatus = 'Consigned' | 'Appeals' | 'Applied' | 'Paid'

export type StatusFilter = 'All' | KanbanStatus

export interface SkinSubstituteRecord {
  id: string
  tissueId: string
  status: KanbanStatus
  orderDate: string
  brand: string
  product: string
  totalSqCm: number
  shipDate: string
  trackingNumber: string
  deliveryDate: string
  location: string
  applicationDate: string
  patientInitials: string
  patientBirthYear: string
  invoiceNumber: string
  invoiceDueDate: string
  invoicePaidDate: string
}

export interface SkinSubstituteFilters {
  tissueId: string
  applicationDateFrom: string
  applicationDateTo: string
  brand: string[]
  trackingNumber: string
  deliveryDateFrom: string
  deliveryDateTo: string
  invoiceDueDateFrom: string
  invoiceDueDateTo: string
  invoiceNumber: string
  invoicePaidDateFrom: string
  invoicePaidDateTo: string
  location: string[]
  orderDateFrom: string
  orderDateTo: string
  patientBirthYear: string
  patientInitials: string
  product: string[]
  shipDateFrom: string
  shipDateTo: string
  status: string[]
}

export type SortField =
  | 'tissueId'
  | 'orderDate'
  | 'brand'
  | 'product'
  | 'totalSqCm'
  | 'shipDate'
  | 'trackingNumber'
  | 'deliveryDate'
  | 'location'
  | 'applicationDate'
  | 'patientInitials'
  | 'patientBirthYear'
  | 'invoiceNumber'
  | 'invoiceDueDate'
  | 'invoicePaidDate'

export const KANBAN_ORDER: KanbanStatus[] = ['Consigned', 'Applied', 'Paid', 'Appeals']

export const EMPTY_FILTERS: SkinSubstituteFilters = {
  tissueId: '',
  applicationDateFrom: '',
  applicationDateTo: '',
  brand: [],
  trackingNumber: '',
  deliveryDateFrom: '',
  deliveryDateTo: '',
  invoiceDueDateFrom: '',
  invoiceDueDateTo: '',
  invoiceNumber: '',
  invoicePaidDateFrom: '',
  invoicePaidDateTo: '',
  location: [],
  orderDateFrom: '',
  orderDateTo: '',
  patientBirthYear: '',
  patientInitials: '',
  product: [],
  shipDateFrom: '',
  shipDateTo: '',
  status: [],
}
