export type IvrStatus = 'Pending' | 'Submitted' | 'Verified' | 'Denied' | 'Partial'

export type IvrRequestType = 'simple' | 'prior_auth' | 'predetermination'

export type PlanType = 'Medicare' | 'Medicaid' | 'Commercial' | 'Medicare Advantage' | 'Workers Comp' | 'Other'

export interface IvrRequest {
  id: string
  requestNumber: string
  requestType: IvrRequestType
  clientId: string
  clientName: string
  status: IvrStatus
  submittedAt: string
  patientFirstName: string
  patientLastName: string
  patientDob: string
  memberId: string
  primaryCarrier: string
  primaryPolicyNumber: string
  planType: PlanType
  facilityNpi: string
  renderingProviderNpi: string
  dateOfService: string
  productName: string
  hcpcsCode: string
  icd10Primary: string
}

export interface IvrFormData {
  patientFirstName: string
  patientLastName: string
  patientDob: string
  memberId: string
  primaryCarrier: string
  primaryPolicyNumber: string
  planType: PlanType
  facilityNpi: string
  renderingProviderNpi: string
  dateOfService: string
  productName: string
  hcpcsCode: string
  icd10Primary: string
}

export const EMPTY_IVR_FORM: IvrFormData = {
  patientFirstName: '',
  patientLastName: '',
  patientDob: '',
  memberId: '',
  primaryCarrier: '',
  primaryPolicyNumber: '',
  planType: 'Medicare',
  facilityNpi: '',
  renderingProviderNpi: '',
  dateOfService: '',
  productName: '',
  hcpcsCode: '',
  icd10Primary: '',
}
