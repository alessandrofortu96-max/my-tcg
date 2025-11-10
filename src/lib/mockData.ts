import { Product } from './types';

// Mock data per il sito - da sostituire con dati reali dal backend
// In una app reale, questi dati verranno da Supabase
let productsData: Product[] = [
  {
    id: '1',
    name: 'Charizard VMAX',
    game: 'pokemon',
    type: 'raw',
    set: 'Shining Fates',
    cardCode: 'SV107',
    language: 'ENG',
    condition: 'near-mint',
    price: 85.00,
    images: ['/placeholder.svg'],
    status: 'available',
    featured: true,
    description: 'Carta in condizioni eccellenti dalla mia collezione privata.',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Dark Magician Girl',
    game: 'yugioh',
    type: 'graded',
    set: 'Magician\'s Force',
    cardCode: 'MFC-000',
    language: 'ENG',
    condition: 'mint',
    price: 320.00,
    images: ['/placeholder.svg'],
    status: 'available',
    featured: true,
    description: 'PSA 9 - Carta gradada in condizioni impeccabili.',
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14'),
  },
  {
    id: '3',
    name: 'Monkey D. Luffy Leader',
    game: 'onepiece',
    type: 'raw',
    set: 'Starter Deck',
    cardCode: 'ST01-001',
    language: 'ENG',
    condition: 'mint',
    price: 45.00,
    images: ['/placeholder.svg'],
    status: 'available',
    featured: true,
    description: 'Carta Leader in condizioni perfette.',
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-13'),
  },
  {
    id: '4',
    name: 'Pikachu VMAX Rainbow',
    game: 'pokemon',
    type: 'raw',
    set: 'Vivid Voltage',
    cardCode: '188/185',
    language: 'ENG',
    condition: 'mint',
    price: 120.00,
    images: ['/placeholder.svg'],
    status: 'available',
    featured: true,
    description: 'Secret Rare Rainbow in condizioni mint.',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
  },
];

// Mock API per gestire i prodotti
export const mockProducts = productsData;

export const toggleProductFeatured = (productId: string): boolean => {
  const product = productsData.find(p => p.id === productId);
  if (product) {
    product.featured = !product.featured;
    product.updatedAt = new Date();
    return true;
  }
  return false;
};

export const updateProductStatus = (productId: string, status: 'available' | 'sold'): boolean => {
  const product = productsData.find(p => p.id === productId);
  if (product) {
    product.status = status;
    product.updatedAt = new Date();
    return true;
  }
  return false;
};

export const gameNames = {
  pokemon: 'Pokémon',
  yugioh: 'Yu-Gi-Oh!',
  onepiece: 'One Piece',
  other: 'Altri prodotti',
};

export const typeNames = {
  raw: 'Carte RAW',
  graded: 'Carte Gradate',
  sealed: 'Prodotti Sigillati',
};

export const conditionNames = {
  'mint': 'Mint',
  'near-mint': 'Near Mint',
  'excellent': 'Excellent',
  'good': 'Good',
  'light-played': 'Light Played',
  'played': 'Played',
};
