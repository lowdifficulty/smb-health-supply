import type { IvrRequest, IvrRequestType, PlanType } from '../types/ivr'

const CLIENT_ID = 'client-asg'
const CLIENT_NAME = 'ASG'
const FACILITY_NPI = '1234567890'
const PROVIDER_NPI = '1987654321'
const PRODUCT = 'Membrane Wrap'
const HCPCS = 'Q4205'

type SampleRow = {
  requestNumber: string
  requestType: IvrRequestType
  submittedAt: string
  patientFirstName: string
  patientLastName: string
  patientDob: string
  memberId: string
  primaryCarrier: string
  primaryPolicyNumber: string
  planType: PlanType
  dateOfService?: string
  icd10Primary?: string
}

const ROWS: SampleRow[] = [
  { requestNumber: 'IVR-2026-0001', requestType: 'prior_auth', submittedAt: '2026-01-08T10:15:00.000Z', patientFirstName: 'Robert', patientLastName: 'Chen', patientDob: '1958-03-15', memberId: '1EG4-TE5-MK72', primaryCarrier: 'Medicare Part B', primaryPolicyNumber: '1EG4-TE5-MK72', planType: 'Medicare', dateOfService: '2026-01-20', icd10Primary: 'E11.621' },
  { requestNumber: 'IVR-2026-0002', requestType: 'simple', submittedAt: '2026-01-10T14:30:00.000Z', patientFirstName: 'Maria', patientLastName: 'Santos', patientDob: '1962-07-22', memberId: 'FLM-8847291', primaryCarrier: 'Florida Medicaid', primaryPolicyNumber: 'FLM-8847291', planType: 'Medicaid' },
  { requestNumber: 'IVR-2026-0003', requestType: 'predetermination', submittedAt: '2026-01-14T09:45:00.000Z', patientFirstName: 'James', patientLastName: 'Wilson', patientDob: '1949-11-03', memberId: 'HUM-5520198', primaryCarrier: 'Humana Medicare Advantage', primaryPolicyNumber: 'HUM-5520198', planType: 'Medicare Advantage', dateOfService: '2026-01-28', icd10Primary: 'L97.529' },
  { requestNumber: 'IVR-2026-0004', requestType: 'prior_auth', submittedAt: '2026-01-18T11:20:00.000Z', patientFirstName: 'Patricia', patientLastName: 'Moore', patientDob: '1955-04-18', memberId: '2CD4-EF5-GH67', primaryCarrier: 'Medicare Part B', primaryPolicyNumber: '2CD4-EF5-GH67', planType: 'Medicare', dateOfService: '2026-02-01', icd10Primary: 'L97.412' },
  { requestNumber: 'IVR-2026-0005', requestType: 'simple', submittedAt: '2026-01-22T16:05:00.000Z', patientFirstName: 'David', patientLastName: 'Kim', patientDob: '1971-09-30', memberId: 'FLM-7782341', primaryCarrier: 'Florida Medicaid', primaryPolicyNumber: 'FLM-7782341', planType: 'Medicaid' },
  { requestNumber: 'IVR-2026-0006', requestType: 'predetermination', submittedAt: '2026-01-25T08:50:00.000Z', patientFirstName: 'Linda', patientLastName: 'Garcia', patientDob: '1968-12-08', memberId: '2AB3-CD4-EF56', primaryCarrier: 'Medicare Part B', primaryPolicyNumber: '2AB3-CD4-EF56', planType: 'Medicare', dateOfService: '2026-02-05', icd10Primary: 'I87.2' },
  { requestNumber: 'IVR-2026-0007', requestType: 'prior_auth', submittedAt: '2026-01-29T13:40:00.000Z', patientFirstName: 'Michael', patientLastName: 'Brown', patientDob: '1943-06-25', memberId: 'UHC-9021457', primaryCarrier: 'UnitedHealthcare Medicare Advantage', primaryPolicyNumber: 'UHC-9021457', planType: 'Medicare Advantage', dateOfService: '2026-02-10', icd10Primary: 'L89.153' },
  { requestNumber: 'IVR-2026-0008', requestType: 'simple', submittedAt: '2026-02-02T10:25:00.000Z', patientFirstName: 'Susan', patientLastName: 'Taylor', patientDob: '1959-01-14', memberId: '3FG7-HI8-JK90', primaryCarrier: 'Medicare Part B', primaryPolicyNumber: '3FG7-HI8-JK90', planType: 'Medicare' },
  { requestNumber: 'IVR-2026-0009', requestType: 'predetermination', submittedAt: '2026-02-06T15:10:00.000Z', patientFirstName: 'Richard', patientLastName: 'Martinez', patientDob: '1950-08-07', memberId: '4LM5-NO6-PQ78', primaryCarrier: 'Medicare Part B', primaryPolicyNumber: '4LM5-NO6-PQ78', planType: 'Medicare', dateOfService: '2026-02-18', icd10Primary: 'E11.622' },
  { requestNumber: 'IVR-2026-0010', requestType: 'prior_auth', submittedAt: '2026-02-10T09:55:00.000Z', patientFirstName: 'Jennifer', patientLastName: 'Lee', patientDob: '1965-05-19', memberId: 'FLM-6678123', primaryCarrier: 'Florida Medicaid', primaryPolicyNumber: 'FLM-6678123', planType: 'Medicaid', dateOfService: '2026-02-22', icd10Primary: 'L97.809' },
  { requestNumber: 'IVR-2026-0011', requestType: 'simple', submittedAt: '2026-02-14T12:30:00.000Z', patientFirstName: 'William', patientLastName: 'Davis', patientDob: '1947-10-11', memberId: 'FLM-1189045', primaryCarrier: 'Florida Medicaid', primaryPolicyNumber: 'FLM-1189045', planType: 'Medicaid' },
  { requestNumber: 'IVR-2026-0012', requestType: 'predetermination', submittedAt: '2026-02-18T14:15:00.000Z', patientFirstName: 'Elizabeth', patientLastName: 'Miller', patientDob: '1953-02-28', memberId: 'AET-3345012', primaryCarrier: 'Aetna Medicare Advantage', primaryPolicyNumber: 'AET-3345012', planType: 'Medicare Advantage', dateOfService: '2026-03-01', icd10Primary: 'L97.519' },
  { requestNumber: 'IVR-2026-0013', requestType: 'prior_auth', submittedAt: '2026-02-22T08:40:00.000Z', patientFirstName: 'Thomas', patientLastName: 'Anderson', patientDob: '1960-07-04', memberId: 'FLM-7723401', primaryCarrier: 'Florida Medicaid', primaryPolicyNumber: 'FLM-7723401', planType: 'Medicaid', dateOfService: '2026-03-05', icd10Primary: 'E11.621' },
  { requestNumber: 'IVR-2026-0014', requestType: 'simple', submittedAt: '2026-02-26T11:05:00.000Z', patientFirstName: 'Nancy', patientLastName: 'Thomas', patientDob: '1956-12-21', memberId: '5RS9-TU0-VW12', primaryCarrier: 'Medicare Part B', primaryPolicyNumber: '5RS9-TU0-VW12', planType: 'Medicare' },
  { requestNumber: 'IVR-2026-0015', requestType: 'predetermination', submittedAt: '2026-03-02T16:50:00.000Z', patientFirstName: 'Charles', patientLastName: 'Jackson', patientDob: '1941-03-09', memberId: 'HUM-5590123', primaryCarrier: 'Humana Medicare Advantage', primaryPolicyNumber: 'HUM-5590123', planType: 'Medicare Advantage', dateOfService: '2026-03-12', icd10Primary: 'L97.412' },
  { requestNumber: 'IVR-2026-0016', requestType: 'prior_auth', submittedAt: '2026-03-06T10:35:00.000Z', patientFirstName: 'Barbara', patientLastName: 'White', patientDob: '1964-09-17', memberId: 'FLM-2209876', primaryCarrier: 'Florida Medicaid', primaryPolicyNumber: 'FLM-2209876', planType: 'Medicaid', dateOfService: '2026-03-18', icd10Primary: 'I83.009' },
  { requestNumber: 'IVR-2026-0017', requestType: 'simple', submittedAt: '2026-03-10T13:20:00.000Z', patientFirstName: 'Joseph', patientLastName: 'Harris', patientDob: '1952-06-02', memberId: '6WX1-YZ2-AB34', primaryCarrier: 'Medicare Part B', primaryPolicyNumber: '6WX1-YZ2-AB34', planType: 'Medicare' },
  { requestNumber: 'IVR-2026-0018', requestType: 'predetermination', submittedAt: '2026-03-14T09:10:00.000Z', patientFirstName: 'Margaret', patientLastName: 'Clark', patientDob: '1948-11-26', memberId: 'CIG-4456789', primaryCarrier: 'Cigna Medicare Advantage', primaryPolicyNumber: 'CIG-4456789', planType: 'Medicare Advantage', dateOfService: '2026-03-24', icd10Primary: 'L97.529' },
  { requestNumber: 'IVR-2026-0019', requestType: 'prior_auth', submittedAt: '2026-03-18T15:45:00.000Z', patientFirstName: 'Daniel', patientLastName: 'Lewis', patientDob: '1957-04-13', memberId: 'UHC-8812034', primaryCarrier: 'UnitedHealthcare Medicare Advantage', primaryPolicyNumber: 'UHC-8812034', planType: 'Medicare Advantage', dateOfService: '2026-03-28', icd10Primary: 'E11.621' },
  { requestNumber: 'IVR-2026-0020', requestType: 'simple', submittedAt: '2026-03-22T11:30:00.000Z', patientFirstName: 'Dorothy', patientLastName: 'Robinson', patientDob: '1945-08-31', memberId: 'FLM-9901234', primaryCarrier: 'Florida Medicaid', primaryPolicyNumber: 'FLM-9901234', planType: 'Medicaid' },
  { requestNumber: 'IVR-2026-0021', requestType: 'predetermination', submittedAt: '2026-03-26T14:00:00.000Z', patientFirstName: 'Christopher', patientLastName: 'Walker', patientDob: '1969-01-05', memberId: 'WCR-1123987', primaryCarrier: 'WellCare Medicare Advantage', primaryPolicyNumber: 'WCR-1123987', planType: 'Medicare Advantage', dateOfService: '2026-04-02', icd10Primary: 'L97.809' },
]

export const SAMPLE_IVR_COUNT = ROWS.length

export function buildSampleIvrRequests(): IvrRequest[] {
  return ROWS.map((row, index) => {
    const isFullForm = row.requestType !== 'simple'
    return {
      id: `ivr-sample-${String(index + 1).padStart(3, '0')}`,
      requestNumber: row.requestNumber,
      requestType: row.requestType,
      clientId: CLIENT_ID,
      clientName: CLIENT_NAME,
      status: 'Verified',
      submittedAt: row.submittedAt,
      patientFirstName: row.patientFirstName,
      patientLastName: row.patientLastName,
      patientDob: row.patientDob,
      memberId: row.memberId,
      primaryCarrier: row.primaryCarrier,
      primaryPolicyNumber: row.primaryPolicyNumber,
      planType: row.planType,
      facilityNpi: FACILITY_NPI,
      renderingProviderNpi: isFullForm ? PROVIDER_NPI : '',
      dateOfService: isFullForm ? (row.dateOfService ?? '') : '',
      productName: isFullForm ? PRODUCT : '',
      hcpcsCode: isFullForm ? HCPCS : '',
      icd10Primary: isFullForm ? (row.icd10Primary ?? '') : '',
    }
  })
}
