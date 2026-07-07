import type { Product } from '../types'

export const products: Product[] = [
  {
    id: 'prod-mw',
    name: 'Membrane Wrap',
    category: 'skin_sub',
    sku: 'SS-MW-011',
    manufacturer: 'SMB Health Supply',
    sizes: [
      '2x2cm',
      '2x3cm',
      '2x4cm',
      '4x4cm',
      '4x6cm',
      '4x8cm',
    ],
    description: 'Human amniotic membrane allograft (Q4205).',
  },
  {
    id: 'prod-001',
    name: 'Apligraf',
    category: 'skin_sub',
    sku: 'SS-APL-001',
    manufacturer: 'Organogenesis',
    sizes: ['5x5 cm', '7.5x10 cm'],
    description: 'Bilayered living cellular construct for venous leg ulcers and diabetic foot ulcers.',
  },
  {
    id: 'prod-002',
    name: 'Dermagraft',
    category: 'skin_sub',
    sku: 'SS-DMG-002',
    manufacturer: 'Organogenesis',
    sizes: ['2x3 in'],
    description: 'Human fibroblast-derived dermal substitute for diabetic foot ulcers.',
  },
  {
    id: 'prod-003',
    name: 'EpiFix',
    category: 'skin_sub',
    sku: 'SS-EPF-003',
    manufacturer: 'MiMedx',
    sizes: ['2x2 cm', '4x4 cm', '4x7 cm'],
    description: 'Dehydrated human amnion/chorion membrane allograft.',
  },
  {
    id: 'prod-004',
    name: 'PuraPly AM',
    category: 'skin_sub',
    sku: 'SS-PPA-004',
    manufacturer: 'Organogenesis',
    sizes: ['1.6x1.6 in', '2x2 in', '4x4 in', '7x7 in'],
    description: 'Antimicrobial bioengineered skin substitute for partial and full-thickness wounds.',
  },
  {
    id: 'prod-005',
    name: 'TheraSkin',
    category: 'skin_sub',
    sku: 'SS-THS-005',
    manufacturer: 'Solsys Medical',
    sizes: ['2x3 in', '4x4 in'],
    description: 'Human skin allograft for chronic and acute wounds.',
  },
  {
    id: 'prod-006',
    name: 'Integra Bilayer',
    category: 'skin_sub',
    sku: 'SS-INT-006',
    manufacturer: 'Integra LifeSciences',
    sizes: ['2x3 in', '4x5 in', '6x8 in'],
    description: 'Bilayer matrix wound dressing for deep partial and full-thickness wounds.',
  },
  {
    id: 'prod-007',
    name: 'HeliMend Collagen Membrane',
    category: 'collagen',
    sku: 'CL-HLM-007',
    manufacturer: 'Collagen Matrix',
    sizes: ['15x20 mm', '20x30 mm', '30x40 mm'],
    description: 'Absorbable collagen membrane for guided tissue regeneration.',
  },
  {
    id: 'prod-008',
    name: 'Helistat Collagen Sponge',
    category: 'collagen',
    sku: 'CL-HLS-008',
    manufacturer: 'Integra LifeSciences',
    sizes: ['1x1 in', '2x2 in'],
    description: 'Absorbable collagen hemostatic sponge for wound bed preparation.',
  },
  {
    id: 'prod-009',
    name: 'Oasis Wound Matrix',
    category: 'collagen',
    sku: 'CL-OAS-009',
    manufacturer: 'Smith & Nephew',
    sizes: ['2x2 in', '4x4 in', '7x7 in'],
    description: 'Porcine small intestinal submucosa collagen matrix.',
  },
  {
    id: 'prod-010',
    name: 'PriMatrix Dermal Repair',
    category: 'collagen',
    sku: 'CL-PRM-010',
    manufacturer: 'Integra LifeSciences',
    sizes: ['2x3 in', '4x5 in'],
    description: 'Acellular dermal matrix for soft tissue reinforcement and wound repair.',
  },
]

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id)
}

export function getPlaceOrderProducts(): Product[] {
  return products.filter((p) => p.id === 'prod-mw')
}

export function formatCategory(category: Product['category']): string {
  return category === 'skin_sub' ? 'Skin Substitute' : 'Collagen'
}
