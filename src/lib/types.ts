export type GameType = 'pokemon' | 'yugioh' | 'onepiece' | 'other';
export type ProductType = 'raw' | 'graded' | 'sealed';
export type ProductStatus = 'available' | 'sold';
export type Condition = 'mint' | 'near-mint' | 'excellent' | 'good' | 'light-played' | 'played';
export type Language = 'ITA' | 'ENG' | 'JAP' | 'GER' | 'FRA' | 'SPA';

export interface Product {
  id: string;
  name: string;
  game: GameType;
  type: ProductType;
  set: string;
  cardCode: string;
  language: Language;
  condition: Condition;
  price: number;
  images: string[];
  status: ProductStatus;
  description?: string;
  featured?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
  productId?: string;
}
