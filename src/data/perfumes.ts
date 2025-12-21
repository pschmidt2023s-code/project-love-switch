import { Perfume } from '@/types/perfume';

const bottleImage = '/images/aldenair-prestige.png';
const sampleImage = '/images/aldenair-testerkits.png';

export const perfumes: Perfume[] = [
  {
    id: '50ml-bottles',
    name: 'ALDENAIR Prestige Collection',
    brand: 'ALDENAIR',
    category: '50ML Bottles',
    size: '50ml',
    image: bottleImage,
    variants: [
      {
        id: '399',
        number: '399',
        name: 'ALDENAIR 399',
        description: 'Luxuriöser orientalischer Duft mit holzigen Akzenten.',
        price: 49.99,
        inStock: true,
        rating: 4.8,
        reviewCount: 156,
      },
      {
        id: '978',
        number: '978',
        name: 'ALDENAIR 978',
        description: 'Verführerischer süß-würziger Duft mit orientalischen Noten.',
        price: 49.99,
        inStock: true,
        rating: 4.9,
        reviewCount: 203,
      },
      {
        id: '999',
        number: '999',
        name: 'ALDENAIR 999',
        description: 'Eleganter Duft mit floralen und holzigen Akzenten.',
        price: 49.99,
        inStock: true,
        rating: 4.7,
        reviewCount: 178,
      },
      {
        id: '111',
        number: '111',
        name: 'ALDENAIR 111',
        description: 'Frischer, belebender Duft für den aktiven Mann.',
        price: 49.99,
        inStock: true,
        rating: 4.6,
        reviewCount: 134,
      },
      {
        id: '632',
        number: '632',
        name: 'ALDENAIR 632',
        description: 'Maskuliner Duft mit würzigen und ledrigen Noten.',
        price: 49.99,
        inStock: true,
        rating: 4.8,
        reviewCount: 189,
      },
      {
        id: '888',
        number: '888',
        name: 'ALDENAIR 888',
        description: 'Luxuriöser Abendduft mit intensiven Oud-Noten.',
        price: 49.99,
        inStock: true,
        rating: 4.9,
        reviewCount: 221,
      },
    ],
  },
  {
    id: 'sample-sets',
    name: 'ALDENAIR Testersets',
    brand: 'ALDENAIR',
    category: 'Sample Sets',
    size: '5ml',
    image: sampleImage,
    variants: [
      {
        id: 'sample-set-5',
        number: 'SET5',
        name: '5er Probeset',
        description: 'Entdecke 5 verschiedene ALDENAIR Düfte.',
        price: 24.99,
        inStock: true,
        rating: 4.9,
        reviewCount: 312,
      },
      {
        id: 'sample-set-10',
        number: 'SET10',
        name: '10er Probeset',
        description: 'Das komplette ALDENAIR Erlebnis mit 10 Düften.',
        price: 44.99,
        inStock: true,
        rating: 4.9,
        reviewCount: 198,
      },
    ],
  },
];

export function getPerfumeById(id: string): Perfume | undefined {
  return perfumes.find(p => p.id === id);
}

export function getVariantById(perfumeId: string, variantId: string) {
  const perfume = getPerfumeById(perfumeId);
  return perfume?.variants.find(v => v.id === variantId);
}
