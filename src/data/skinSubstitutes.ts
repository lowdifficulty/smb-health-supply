import type { SkinSubstituteRecord } from '../types/skinSubstitute'

export const CLIENT_PORTAL_NAME = 'ASG'

export const MEMBRANE_WRAP_BRAND = 'Membrane Wrap (Q4205)'

export const BRANDS = [MEMBRANE_WRAP_BRAND]

export const PRODUCTS = [
  '2x2cm (MW0202)',
  '2x3cm (MW0203)',
  '2x4cm (MW0204)',
  '4x4cm (MW0404)',
  '4x6cm (MW0406)',
  '4x8cm (MW0408)',
]

export const LOCATIONS = [
  '1234 Palm Breeze Drive Suite 205, Clearwater, FL, 33760',
  '1257 Willow Creek Lane Suite 200, Riverview, FL, 99999',
]

export const skinSubstituteRecords: SkinSubstituteRecord[] = [
  // Consigned — newest orders, awaiting application
  { id: '1', tissueId: 'MW10024520', status: 'Consigned', orderDate: '2026-02-24', brand: MEMBRANE_WRAP_BRAND, product: '2x3cm (MW0203)', totalSqCm: 6, shipDate: '2026-02-24', trackingNumber: '190283746501', deliveryDate: '2026-02-26', location: LOCATIONS[1], applicationDate: '1900-01-01', patientInitials: '', patientBirthYear: '', invoiceNumber: '', invoiceDueDate: '', invoicePaidDate: '' },
  { id: '2', tissueId: 'MW74291560', status: 'Consigned', orderDate: '2026-02-24', brand: MEMBRANE_WRAP_BRAND, product: '2x2cm (MW0202)', totalSqCm: 4, shipDate: '2026-02-24', trackingNumber: '384750219384', deliveryDate: '2026-02-26', location: LOCATIONS[0], applicationDate: '1900-01-01', patientInitials: '', patientBirthYear: '', invoiceNumber: '', invoiceDueDate: '', invoicePaidDate: '' },
  { id: '3', tissueId: 'MW31874265', status: 'Consigned', orderDate: '2026-02-24', brand: MEMBRANE_WRAP_BRAND, product: '4x4cm (MW0404)', totalSqCm: 16, shipDate: '2026-02-24', trackingNumber: '384750219384', deliveryDate: '2026-02-26', location: LOCATIONS[0], applicationDate: '1900-01-01', patientInitials: '', patientBirthYear: '', invoiceNumber: '', invoiceDueDate: '', invoicePaidDate: '' },
  { id: '4', tissueId: 'MW48612093', status: 'Consigned', orderDate: '2026-03-10', brand: MEMBRANE_WRAP_BRAND, product: '4x8cm (MW0408)', totalSqCm: 32, shipDate: '2026-03-10', trackingNumber: '708394621509', deliveryDate: '2026-03-12', location: LOCATIONS[0], applicationDate: '1900-01-01', patientInitials: '', patientBirthYear: '', invoiceNumber: '', invoiceDueDate: '', invoicePaidDate: '' },
  { id: '5', tissueId: 'MW95062731', status: 'Consigned', orderDate: '2026-03-10', brand: MEMBRANE_WRAP_BRAND, product: '2x4cm (MW0204)', totalSqCm: 8, shipDate: '2026-03-10', trackingNumber: '708394621509', deliveryDate: '2026-03-12', location: LOCATIONS[0], applicationDate: '1900-01-01', patientInitials: '', patientBirthYear: '', invoiceNumber: '', invoiceDueDate: '', invoicePaidDate: '' },
  // Applied — ordered, delivered, and applied
  { id: '7', tissueId: 'MW10024503', status: 'Applied', orderDate: '2026-01-20', brand: MEMBRANE_WRAP_BRAND, product: '4x4cm (MW0404)', totalSqCm: 16, shipDate: '2026-01-20', trackingNumber: '938472615093', deliveryDate: '2026-01-22', location: LOCATIONS[1], applicationDate: '2026-02-18', patientInitials: 'DD', patientBirthYear: '1970', invoiceNumber: '', invoiceDueDate: '', invoicePaidDate: '' },
  { id: '8', tissueId: 'MW10024504', status: 'Applied', orderDate: '2026-01-20', brand: MEMBRANE_WRAP_BRAND, product: '4x6cm (MW0406)', totalSqCm: 24, shipDate: '2026-01-20', trackingNumber: '938472615093', deliveryDate: '2026-01-22', location: LOCATIONS[1], applicationDate: '2026-03-05', patientInitials: 'CB', patientBirthYear: '1954', invoiceNumber: '', invoiceDueDate: '', invoicePaidDate: '' },
  { id: '9', tissueId: 'MW20471639', status: 'Applied', orderDate: '2026-02-03', brand: MEMBRANE_WRAP_BRAND, product: '2x3cm (MW0203)', totalSqCm: 6, shipDate: '2026-02-04', trackingNumber: '609384752198', deliveryDate: '2026-02-06', location: LOCATIONS[1], applicationDate: '2026-04-20', patientInitials: 'JS', patientBirthYear: '1949', invoiceNumber: '', invoiceDueDate: '', invoicePaidDate: '' },
  { id: '10', tissueId: 'MW10024502', status: 'Applied', orderDate: '2026-02-03', brand: MEMBRANE_WRAP_BRAND, product: '4x8cm (MW0408)', totalSqCm: 32, shipDate: '2026-02-04', trackingNumber: '609384752198', deliveryDate: '2026-02-06', location: LOCATIONS[1], applicationDate: '2026-05-28', patientInitials: 'DF', patientBirthYear: '1945', invoiceNumber: '', invoiceDueDate: '', invoicePaidDate: '' },
  // Paid — completed billing cycle
  { id: '11', tissueId: 'MW10938475', status: 'Paid', orderDate: '2026-01-06', brand: MEMBRANE_WRAP_BRAND, product: '4x4cm (MW0404)', totalSqCm: 16, shipDate: '2026-01-06', trackingNumber: '987654321098', deliveryDate: '2026-01-08', location: LOCATIONS[1], applicationDate: '2026-01-14', patientInitials: 'GM', patientBirthYear: '1952', invoiceNumber: '01/14/2026', invoiceDueDate: '04/14/2026', invoicePaidDate: '02/01/2026' },
  { id: '12', tissueId: 'MW10024501', status: 'Paid', orderDate: '2026-01-06', brand: MEMBRANE_WRAP_BRAND, product: '2x2cm (MW0202)', totalSqCm: 4, shipDate: '2026-01-06', trackingNumber: '475628193745', deliveryDate: '2026-01-08', location: LOCATIONS[1], applicationDate: '2026-01-14', patientInitials: 'GM', patientBirthYear: '1952', invoiceNumber: '01/14/2026', invoiceDueDate: '04/14/2026', invoicePaidDate: '02/01/2026' },
  // Appeals — applied, under appeal
  { id: '6', tissueId: 'MW87329014', status: 'Appeals', orderDate: '2026-01-12', brand: MEMBRANE_WRAP_BRAND, product: '2x4cm (MW0204)', totalSqCm: 8, shipDate: '2026-01-12', trackingNumber: '102345678901', deliveryDate: '2026-01-14', location: LOCATIONS[0], applicationDate: '2026-02-03', patientInitials: 'LL', patientBirthYear: '1963', invoiceNumber: '', invoiceDueDate: '', invoicePaidDate: '' },
]
