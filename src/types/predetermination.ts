export interface WoundDetail {
  location: string
  laterality: string
  lengthCm: string
  widthCm: string
  depthCm: string
  surfaceAreaCm2: string
  hasUndermining: string
  underminingDescription: string
  hasTunneling: string
  tunnelingDescription: string
  stageGrade: string
  bedTissueType: string
  granulationPercent: string
  sloughPercent: string
  necroticPercent: string
  exposedStructure: string
  exposedStructureDescription: string
  drainageAmount: string
  drainageType: string
  odorPresent: string
  periwoundCondition: string
  periwoundOther: string
  painLevel: string
  measurementDate: string
  woundPhotosAttached: string
}

export interface PredeterminationFormData {
  requestSubtype: string
  isUrgent: string
  urgentReason: string
  requestedStartDate: string
  requestedEndDate: string
  requestedVisitsApplications: string
  requestedFrequency: string
  placeOfService: string
  placeOfServiceOther: string

  patientFirstName: string
  patientLastName: string
  patientDob: string
  patientGender: string
  patientPhone: string
  patientAddress: string
  patientCity: string
  patientState: string
  patientZip: string
  patientEmail: string
  patientPreferredLanguage: string
  patientMbi: string
  patientMemberId: string
  patientGroupNumber: string
  patientPlanName: string
  patientIsSubscriber: string
  subscriberName: string
  subscriberDob: string
  subscriberRelationship: string

  primaryInsuranceCarrier: string
  primaryInsurancePhone: string
  primaryInsurancePortal: string
  primaryPolicyType: string
  primaryPolicyTypeOther: string
  secondaryInsuranceCarrier: string
  secondaryInsuranceMemberId: string
  eligibleOnDos: string
  eligibilityVerificationDate: string
  eligibilityVerificationRef: string
  requiresReferral: string
  referralObtained: string
  referralNumber: string
  requiresPriorAuth: string
  priorAuthPhoneOrPortal: string
  insuranceRepName: string
  insuranceCallRef: string

  renderingProviderName: string
  renderingProviderNpi: string
  renderingProviderTaxId: string
  renderingProviderSpecialty: string
  renderingProviderPhone: string
  renderingProviderFax: string
  renderingProviderAddress: string
  renderingProviderCity: string
  renderingProviderState: string
  renderingProviderZip: string
  renderingProviderInNetwork: string
  requestingProviderName: string
  requestingProviderNpi: string
  facilityName: string
  facilityNpi: string
  facilityTaxId: string
  facilityAddress: string
  authContactName: string
  authContactPhone: string
  authContactFax: string
  authContactEmail: string

  primaryDiagnosisCode: string
  primaryDiagnosisDescription: string
  secondaryDiagnosisCode: string
  secondaryDiagnosisDescription: string
  additionalDiagnosisCodes: string
  woundType: string
  woundTypeOther: string
  underlyingCondition: string
  underlyingConditionOther: string
  woundIsChronic: string
  woundDuration: string
  woundFirstAppearedDate: string
  patientFirstEvaluatedDate: string
  failedStandardCare: string
  failedStandardCareDescription: string

  numberOfWounds: string
  wounds: WoundDetail[]

  standardCareFourWeeks: string
  standardCareStartDate: string
  standardCareEndDate: string
  standardCareTreatments: string[]
  standardCareTreatmentsOther: string
  currentDressingRegimen: string
  dressingChangeFrequency: string
  woundDecreasedInSize: string
  woundAreaReductionPercent: string
  woundStalled: string
  healingProgressDescription: string
  patientCompliant: string
  complianceExplanation: string
  debridementPerformed: string
  lastDebridementDate: string
  debridementType: string
  debridementTypeOther: string
  debridementCptCode: string

  offloadingUsed: string
  offloadingType: string
  offloadingTypeOther: string
  compressionUsed: string
  compressionType: string
  compressionTypeOther: string
  compressionStrength: string
  vascularStatusEvaluated: string
  vascularEvaluationDate: string
  abiResult: string
  tbiResult: string
  dopplerResult: string
  pedalPulses: string
  adequatePerfusion: string
  vascularReferralMade: string

  signsOfInfection: string
  infectionSigns: string[]
  infectionSignsOther: string
  woundCulturePerformed: string
  cultureDate: string
  cultureResult: string
  onAntibiotics: string
  antibioticName: string
  antibioticStartDate: string
  antibioticEndDate: string
  osteomyelitisRuledOut: string
  osteomyelitisEvaluationMethod: string
  osteomyelitisEvaluationOther: string

  requestedService: string
  requestedServiceOther: string
  requestedCptCode: string
  requestedSecondaryCptCode: string
  requestedHcpcsCode: string
  requestedProductName: string
  productManufacturer: string
  productSize: string
  productUnitsRequested: string
  totalSqCmRequested: string
  applicationsRequested: string
  applicationFrequency: string
  productWastageExpected: string
  estimatedWastage: string
  jwJzModifierRequired: string
  kxModifierRequired: string
  productFdaCleared: string
  productPerPayerPolicy: string
  medicalNecessityRationale: string
  expectedClinicalBenefit: string
  alternativesConsidered: string
  whyAlternativesNotAppropriate: string

  attachClinicalNote: string
  attachWoundMeasurements: string
  attachWoundPhotos: string
  attachTreatmentHistory: string
  attachDebridementNotes: string
  attachVascularTesting: string
  attachLabResults: string
  attachCultureResults: string
  attachImaging: string
  attachMedicationList: string
  attachProductInfo: string
  attachLetterMedicalNecessity: string
  attachPayerPaForm: string

  submissionMethod: string
  submissionMethodOther: string
  dateSubmitted: string
  submittedBy: string
  payerReferenceNumber: string
  authorizationTrackingNumber: string
  expectedTurnaround: string
  authorizationStatus: string
  authorizationNumber: string
  approvedCptCodes: string
  approvedHcpcsCodes: string
  approvedUnits: string
  approvedVisitsApplications: string
  approvedStartDate: string
  approvedEndDate: string
  approvedPlaceOfService: string
  denialReason: string
  appealDeadline: string
  peerToPeerDeadline: string
  additionalInfoRequested: string
  followUpDate: string
  internalNotes: string

  attestationAccurate: string
  completedByName: string
  completedByTitle: string
  dateCompleted: string
  electronicSignature: string
}

export function emptyWound(): WoundDetail {
  return {
    location: '', laterality: '', lengthCm: '', widthCm: '', depthCm: '', surfaceAreaCm2: '',
    hasUndermining: '', underminingDescription: '', hasTunneling: '', tunnelingDescription: '',
    stageGrade: '', bedTissueType: '', granulationPercent: '', sloughPercent: '', necroticPercent: '',
    exposedStructure: '', exposedStructureDescription: '', drainageAmount: '', drainageType: '',
    odorPresent: '', periwoundCondition: '', periwoundOther: '', painLevel: '', measurementDate: '',
    woundPhotosAttached: '',
  }
}

export function emptyPredeterminationForm(facilityNpi = ''): PredeterminationFormData {
  return {
    requestSubtype: '', isUrgent: '', urgentReason: '', requestedStartDate: '', requestedEndDate: '',
    requestedVisitsApplications: '', requestedFrequency: '', placeOfService: '', placeOfServiceOther: '',
    patientFirstName: '', patientLastName: '', patientDob: '', patientGender: '', patientPhone: '',
    patientAddress: '', patientCity: '', patientState: '', patientZip: '', patientEmail: '',
    patientPreferredLanguage: '', patientMbi: '', patientMemberId: '', patientGroupNumber: '',
    patientPlanName: '', patientIsSubscriber: '', subscriberName: '', subscriberDob: '', subscriberRelationship: '',
    primaryInsuranceCarrier: '', primaryInsurancePhone: '', primaryInsurancePortal: '', primaryPolicyType: '',
    primaryPolicyTypeOther: '', secondaryInsuranceCarrier: '', secondaryInsuranceMemberId: '',
    eligibleOnDos: '', eligibilityVerificationDate: '', eligibilityVerificationRef: '',
    requiresReferral: '', referralObtained: '', referralNumber: '', requiresPriorAuth: '',
    priorAuthPhoneOrPortal: '', insuranceRepName: '', insuranceCallRef: '',
    renderingProviderName: '', renderingProviderNpi: '', renderingProviderTaxId: '', renderingProviderSpecialty: '',
    renderingProviderPhone: '', renderingProviderFax: '', renderingProviderAddress: '', renderingProviderCity: '',
    renderingProviderState: '', renderingProviderZip: '', renderingProviderInNetwork: '',
    requestingProviderName: '', requestingProviderNpi: '', facilityName: '', facilityNpi: facilityNpi,
    facilityTaxId: '', facilityAddress: '', authContactName: '', authContactPhone: '', authContactFax: '',
    authContactEmail: '',
    primaryDiagnosisCode: '', primaryDiagnosisDescription: '', secondaryDiagnosisCode: '',
    secondaryDiagnosisDescription: '', additionalDiagnosisCodes: '', woundType: '', woundTypeOther: '',
    underlyingCondition: '', underlyingConditionOther: '', woundIsChronic: '', woundDuration: '',
    woundFirstAppearedDate: '', patientFirstEvaluatedDate: '', failedStandardCare: '', failedStandardCareDescription: '',
    numberOfWounds: '1', wounds: [emptyWound()],
    standardCareFourWeeks: '', standardCareStartDate: '', standardCareEndDate: '', standardCareTreatments: [],
    standardCareTreatmentsOther: '', currentDressingRegimen: '', dressingChangeFrequency: '',
    woundDecreasedInSize: '', woundAreaReductionPercent: '', woundStalled: '', healingProgressDescription: '',
    patientCompliant: '', complianceExplanation: '', debridementPerformed: '', lastDebridementDate: '',
    debridementType: '', debridementTypeOther: '', debridementCptCode: '',
    offloadingUsed: '', offloadingType: '', offloadingTypeOther: '', compressionUsed: '', compressionType: '',
    compressionTypeOther: '', compressionStrength: '', vascularStatusEvaluated: '', vascularEvaluationDate: '',
    abiResult: '', tbiResult: '', dopplerResult: '', pedalPulses: '', adequatePerfusion: '', vascularReferralMade: '',
    signsOfInfection: '', infectionSigns: [], infectionSignsOther: '', woundCulturePerformed: '',
    cultureDate: '', cultureResult: '', onAntibiotics: '', antibioticName: '', antibioticStartDate: '',
    antibioticEndDate: '', osteomyelitisRuledOut: '', osteomyelitisEvaluationMethod: '', osteomyelitisEvaluationOther: '',
    requestedService: '', requestedServiceOther: '', requestedCptCode: '', requestedSecondaryCptCode: '',
    requestedHcpcsCode: '', requestedProductName: '', productManufacturer: '', productSize: '',
    productUnitsRequested: '', totalSqCmRequested: '', applicationsRequested: '', applicationFrequency: '',
    productWastageExpected: '', estimatedWastage: '', jwJzModifierRequired: '', kxModifierRequired: '',
    productFdaCleared: '', productPerPayerPolicy: '', medicalNecessityRationale: '', expectedClinicalBenefit: '',
    alternativesConsidered: '', whyAlternativesNotAppropriate: '',
    attachClinicalNote: '', attachWoundMeasurements: '', attachWoundPhotos: '', attachTreatmentHistory: '',
    attachDebridementNotes: '', attachVascularTesting: '', attachLabResults: '', attachCultureResults: '',
    attachImaging: '', attachMedicationList: '', attachProductInfo: '', attachLetterMedicalNecessity: '',
    attachPayerPaForm: '',
    submissionMethod: '', submissionMethodOther: '', dateSubmitted: '', submittedBy: '',
    payerReferenceNumber: '', authorizationTrackingNumber: '', expectedTurnaround: '', authorizationStatus: '',
    authorizationNumber: '', approvedCptCodes: '', approvedHcpcsCodes: '', approvedUnits: '',
    approvedVisitsApplications: '', approvedStartDate: '', approvedEndDate: '', approvedPlaceOfService: '',
    denialReason: '', appealDeadline: '', peerToPeerDeadline: '', additionalInfoRequested: '',
    followUpDate: '', internalNotes: '',
    attestationAccurate: '', completedByName: '', completedByTitle: '', dateCompleted: '', electronicSignature: '',
  }
}
