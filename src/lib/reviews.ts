export type ReviewPlatform = 'Vinted' | 'CardTrader' | 'Wallapop';

export interface Review {
  id: string;
  platform: ReviewPlatform;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  text: string;
  author: string;
  date: Date;
  screenshotUrl?: string;
  published: boolean;
}

interface ReviewData {
  id: string;
  platform: ReviewPlatform;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  text: string;
  author: string;
  date: string; // ISO date string from JSON
  screenshotUrl?: string;
  published: boolean;
}

// Cache for reviews data
let reviewsCache: Review[] | null = null;

// Load reviews from JSON file
const loadReviews = async (): Promise<Review[]> => {
  if (reviewsCache !== null) {
    return reviewsCache;
  }

  try {
    const response = await fetch('/data/reviews_unificate.json');
    if (!response.ok) {
      throw new Error('Failed to load reviews');
    }
    const data: ReviewData[] = await response.json();
    
    // Convert to Review[] with Date objects
    reviewsCache = data.map((review) => ({
      ...review,
      date: new Date(review.date),
    }));
    
    return reviewsCache;
  } catch (error) {
    console.error('Error loading reviews:', error);
    // Return empty array on error
    reviewsCache = [];
    return reviewsCache;
  }
};

// Synchronous version that uses cache (for immediate access after first load)
const getReviewsSync = (): Review[] => {
  return reviewsCache || [];
};

// Get all published reviews
export const getPublishedReviews = async (): Promise<Review[]> => {
  const reviews = await loadReviews();
  return reviews.filter(r => r.published).sort((a, b) => b.date.getTime() - a.date.getTime());
};

// Get all published reviews (synchronous, uses cache)
export const getPublishedReviewsSync = (): Review[] => {
  const reviews = getReviewsSync();
  return reviews.filter(r => r.published).sort((a, b) => b.date.getTime() - a.date.getTime());
};

// Get all reviews (admin)
export const getAllReviews = async (): Promise<Review[]> => {
  const reviews = await loadReviews();
  return [...reviews].sort((a, b) => b.date.getTime() - a.date.getTime());
};

// Get all reviews (admin, synchronous)
export const getAllReviewsSync = (): Review[] => {
  const reviews = getReviewsSync();
  return [...reviews].sort((a, b) => b.date.getTime() - a.date.getTime());
};

// Get review by ID
export const getReviewById = async (id: string): Promise<Review | undefined> => {
  const reviews = await loadReviews();
  return reviews.find(r => r.id === id);
};

// Get review by ID (synchronous)
export const getReviewByIdSync = (id: string): Review | undefined => {
  const reviews = getReviewsSync();
  return reviews.find(r => r.id === id);
};

// Get average rating
export const getAverageRating = (): number => {
  const published = getPublishedReviewsSync();
  if (published.length === 0) return 0;
  const sum = published.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / published.length) * 10) / 10;
};

// Get total count
export const getTotalReviewsCount = (): number => {
  return getPublishedReviewsSync().length;
};

// Format date as gg/mm/aaaa
export const formatReviewDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// ============================================
// ADMIN FUNCTIONS (modifica cache in memoria)
// ============================================
// NOTA: Le modifiche sono solo in memoria e vengono perse al refresh.
// Per persistenza, integra con Supabase o un backend.

// Add review (modifica solo cache in memoria)
export const addReview = (review: Omit<Review, 'id'>): Review => {
  const newReview: Review = {
    ...review,
    id: Date.now().toString(),
  };
  
  // Aggiungi al cache se esiste
  if (reviewsCache !== null) {
    reviewsCache.push(newReview);
    // Riordina per data
    reviewsCache.sort((a, b) => b.date.getTime() - a.date.getTime());
  } else {
    // Se il cache non è ancora caricato, inizializza con questo elemento
    reviewsCache = [newReview];
  }
  
  return newReview;
};

// Update review (modifica solo cache in memoria)
export const updateReview = (id: string, updates: Partial<Omit<Review, 'id'>>): boolean => {
  if (reviewsCache === null) {
    return false;
  }
  
  const index = reviewsCache.findIndex(r => r.id === id);
  if (index !== -1) {
    reviewsCache[index] = { 
      ...reviewsCache[index], 
      ...updates,
      date: updates.date instanceof Date ? updates.date : reviewsCache[index].date,
    };
    // Riordina per data
    reviewsCache.sort((a, b) => b.date.getTime() - a.date.getTime());
    return true;
  }
  return false;
};

// Delete review (modifica solo cache in memoria)
export const deleteReview = (id: string): boolean => {
  if (reviewsCache === null) {
    return false;
  }
  
  const index = reviewsCache.findIndex(r => r.id === id);
  if (index !== -1) {
    reviewsCache.splice(index, 1);
    return true;
  }
  return false;
};

// Toggle published status (modifica solo cache in memoria)
export const toggleReviewPublished = (id: string): boolean => {
  if (reviewsCache === null) {
    return false;
  }
  
  const review = reviewsCache.find(r => r.id === id);
  if (review) {
    review.published = !review.published;
    return true;
  }
  return false;
};
