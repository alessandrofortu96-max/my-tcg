// Costanti e utility per il sito
// Queste sono configurazioni statiche, non dati mock

export const gameNames = {
  pokemon: 'Pokémon',
  yugioh: 'Yu-Gi-Oh!',
  onepiece: 'One Piece',
  other: 'Altri prodotti',
} as const;

export const typeNames = {
  raw: 'Carte RAW',
  graded: 'Carte Gradate',
  sealed: 'Prodotti Sigillati',
} as const;

export const conditionNames = {
  'mint': 'Mint',
  'near-mint': 'Near Mint',
  'excellent': 'Excellent',
  'good': 'Good',
  'light-played': 'Light Played',
  'played': 'Played',
} as const;


