import { Product, GameType, ProductType, ProductStatus, Condition, Language } from './types';
import { supabase, isSupabaseConfigured } from './supabase';
import { auth } from './auth';

// Helper per mappare game slug a GameType
const mapGameSlugToGameType = (slug: string): GameType => {
  switch (slug) {
    case 'pokemon':
      return 'pokemon';
    case 'yu-gi-oh':
      return 'yugioh';
    case 'one-piece':
      return 'onepiece';
    default:
      return 'other';
  }
};

// Helper per mappare type slug a ProductType
const mapTypeSlugToProductType = (slug: string): ProductType => {
  switch (slug) {
    case 'raw':
      return 'raw';
    case 'graded':
      return 'graded';
    case 'sealed':
      return 'sealed';
    default:
      return 'raw';
  }
};

// Helper per mappare status DB a ProductStatus
const mapStatusToProductStatus = (status: string): ProductStatus => {
  switch (status) {
    case 'DISPONIBILE':
      return 'available';
    case 'VENDUTO':
      return 'sold';
    default:
      return 'available';
  }
};

// Helper per mappare ProductStatus a status DB
const mapProductStatusToStatus = (status: ProductStatus): string => {
  switch (status) {
    case 'available':
      return 'DISPONIBILE';
    case 'sold':
      return 'VENDUTO';
    default:
      return 'DISPONIBILE';
  }
};

// Helper per convertire Product DB a Product TypeScript
// NOTA: Questa funzione non è più usata, ma la manteniamo per riferimento
const mapDbProductToProduct = async (dbProduct: any): Promise<Product> => {
  // Carica game e type con gestione errori
  let gameSlug = 'other';
  try {
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('slug')
      .eq('id', dbProduct.game_id)
      .maybeSingle();
    
    if (!gameError && game) {
      gameSlug = game.slug;
    }
  } catch (error) {
    console.warn('Error fetching game:', error);
  }

  let typeSlug = 'raw';
  try {
    const { data: type, error: typeError } = await supabase
      .from('product_types')
      .select('slug')
      .eq('id', dbProduct.type_id)
      .maybeSingle();
    
    if (!typeError && type) {
      typeSlug = type.slug;
    }
  } catch (error) {
    console.warn('Error fetching product type:', error);
  }

  // Carica immagini con gestione errori
  let images: string[] = [];
  try {
    const { data: imagesData, error: imagesError } = await supabase
      .from('product_images')
      .select('url')
      .eq('product_id', dbProduct.id)
      .order('sort_order', { ascending: true });
    
    if (!imagesError && imagesData) {
      images = imagesData.map(img => img.url);
    }
  } catch (error) {
    console.warn('Error fetching images:', error);
  }

  // Verifica se è featured con gestione errori
  let featured = false;
  try {
    const { data: featuredData, error: featuredError } = await supabase
      .from('featured_products')
      .select('product_id')
      .eq('product_id', dbProduct.id)
      .maybeSingle();
    
    if (!featuredError && featuredData) {
      featured = true;
    }
  } catch (error) {
    console.warn('Error checking featured status:', error);
  }

  return {
    id: dbProduct.id,
    name: dbProduct.name,
    game: mapGameSlugToGameType(gameSlug),
    type: mapTypeSlugToProductType(typeSlug),
    set: dbProduct.set_name || '',
    cardCode: dbProduct.code || '',
    language: (dbProduct.language || 'ENG') as Language,
    condition: (dbProduct.condition || 'near-mint') as Condition,
    price: dbProduct.price_cents / 100,
    images: images,
    status: mapStatusToProductStatus(dbProduct.status),
    description: dbProduct.description || undefined,
    featured: featured,
    createdAt: new Date(dbProduct.created_at),
    updatedAt: new Date(dbProduct.updated_at),
  };
};

// Get all products (admin: tutti, pubblico: solo published)
// Supporta paginazione opzionale
export const getProducts = async (
  includeUnpublished: boolean = false,
  pagination?: PaginationParams
): Promise<PaginationResult<Product> | Product[]> => {
  if (!isSupabaseConfigured()) {
    return pagination ? createPaginationResult([], 0, pagination.page, pagination.limit) : [];
  }

  try {
    // Query base per contare il totale (solo se paginazione è richiesta)
    let count: number | null = null;
    if (pagination) {
      let countQuery = supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (!includeUnpublished) {
        countQuery = countQuery.eq('published', true);
      }

      const { count: countResult, error: countError } = await countQuery;
      
      if (countError) {
        console.error('Error counting products:', countError);
        // Ritorna errore se count fallisce e paginazione è richiesta
        return createPaginationResult([], 0, pagination.page, pagination.limit);
      }
      
      count = countResult;
    }

    // Query per i dati
    // Usa left join invece di inner join per evitare errori se i dati non esistono
    let query = supabase
      .from('products')
      .select(`
        *,
        games(slug),
        product_types(slug)
      `)
      .order('created_at', { ascending: false });

    if (!includeUnpublished) {
      query = query.eq('published', true);
    }

    // Applica paginazione se richiesta
    if (pagination) {
      const offset = getOffset(pagination.page, pagination.limit);
      query = query.range(offset, offset + pagination.limit - 1);
    }

    // Esegui la query con timeout di 15 secondi
    let data: any = null;
    let error: any = null;
    
    try {
      const queryPromise = query;
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout loading products')), 15000);
      });
      
      const result = await Promise.race([
        queryPromise,
        timeoutPromise,
      ]) as any;
      
      data = result.data;
      error = result.error;
    } catch (timeoutError: any) {
      console.error('Error or timeout fetching products:', timeoutError?.message || timeoutError);
      error = timeoutError;
      data = null;
    }

    if (error) {
      console.error('Error fetching products:', error);
      return pagination 
        ? createPaginationResult([], 0, pagination.page, pagination.limit)
        : [];
    }

    if (!data) {
      return pagination 
        ? createPaginationResult([], 0, pagination.page, pagination.limit)
        : [];
    }

    // Carica tutte le immagini in una volta (solo per i prodotti della pagina corrente)
    const productIds = data.map((p: any) => p.id);
    
    // Query immagini con gestione errori e timeout
    let allImages: any[] = [];
    try {
      const imagesPromise = supabase
        .from('product_images')
        .select('product_id, url, sort_order')
        .in('product_id', productIds)
        .order('sort_order', { ascending: true });
      
      // Timeout di 10 secondi per la query immagini
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout loading images')), 10000);
      });
      
      const { data: imagesData, error: imagesError } = await Promise.race([
        imagesPromise,
        timeoutPromise,
      ]) as any;
      
      if (imagesError) {
        console.warn('Error fetching images (continuing with empty array):', imagesError);
        allImages = [];
      } else {
        allImages = imagesData || [];
      }
    } catch (error: any) {
      console.warn('Error or timeout fetching images (continuing with empty array):', error?.message || error);
      allImages = [];
    }

    // Carica tutti i featured in una volta con gestione errori e timeout
    let allFeatured: any[] = [];
    try {
      const featuredPromise = supabase
        .from('featured_products')
        .select('product_id')
        .in('product_id', productIds);
      
      // Timeout di 10 secondi per la query featured
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout loading featured')), 10000);
      });
      
      const { data: featuredData, error: featuredError } = await Promise.race([
        featuredPromise,
        timeoutPromise,
      ]) as any;
      
      if (featuredError) {
        console.warn('Error fetching featured (continuing with empty array):', featuredError);
        allFeatured = [];
      } else {
        allFeatured = featuredData || [];
      }
    } catch (error: any) {
      console.warn('Error or timeout fetching featured (continuing with empty array):', error?.message || error);
      allFeatured = [];
    }

    const featuredSet = new Set(allFeatured.map((f: any) => f.product_id));
    const imagesMap = new Map<string, string[]>();
    allImages.forEach((img: any) => {
      if (!imagesMap.has(img.product_id)) {
        imagesMap.set(img.product_id, []);
      }
      imagesMap.get(img.product_id)!.push(img.url);
    });

    // Mappa i prodotti usando i dati già caricati
    const products: Product[] = data.map((dbProduct: any) => ({
      id: dbProduct.id,
      name: dbProduct.name,
      game: mapGameSlugToGameType(dbProduct.games?.slug || 'other'),
      type: mapTypeSlugToProductType(dbProduct.product_types?.slug || 'raw'),
      set: dbProduct.set_name || '',
      cardCode: dbProduct.code || '',
      language: (dbProduct.language || 'ENG') as Language,
      condition: (dbProduct.condition || 'near-mint') as Condition,
      price: dbProduct.price_cents / 100,
      images: imagesMap.get(dbProduct.id) || [],
      status: mapStatusToProductStatus(dbProduct.status),
      description: dbProduct.description || undefined,
      featured: featuredSet.has(dbProduct.id),
      createdAt: new Date(dbProduct.created_at),
      updatedAt: new Date(dbProduct.updated_at),
    }));

    // Ritorna con paginazione se richiesta
    if (pagination) {
      return createPaginationResult(
        products,
        count || 0,
        pagination.page,
        pagination.limit
      );
    }

    return products;
  } catch (error: any) {
    console.error('Error in getProducts:', error);
    // Se è un timeout, rilancia l'errore
    if (error.message?.includes('Timeout')) {
      throw error;
    }
    return pagination 
      ? createPaginationResult([], 0, pagination.page || 1, pagination?.limit || DEFAULT_PAGE_SIZE)
      : [];
  }
};

// Get products by game
export const getProductsByGame = async (game: GameType, includeUnpublished: boolean = false): Promise<Product[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    // Mappa GameType a slug
    const gameSlugMap: Record<GameType, string> = {
      pokemon: 'pokemon',
      yugioh: 'yu-gi-oh',
      onepiece: 'one-piece',
      other: 'other',
    };

    const gameSlug = gameSlugMap[game];

    // Trova game_id (se non esiste "other", ritorna array vuoto)
    const { data: gameData, error: gameError } = await supabase
      .from('games')
      .select('id')
      .eq('slug', gameSlug)
      .single();

    // Se "other" non esiste, ritorna array vuoto (non possiamo filtrare per qualcosa che non esiste)
    if (!gameData || gameError) {
      if (game === 'other') {
        // "other" potrebbe non esistere, ritorna array vuoto
        return [];
      }
      console.error('Error fetching game:', gameError);
      return [];
    }

                let query = supabase
                  .from('products')
                  .select(`
                    *,
                    games(slug),
                    product_types(slug)
                  `)
                  .eq('game_id', gameData.id)
                  .order('created_at', { ascending: false });

    if (!includeUnpublished) {
      query = query.eq('published', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products by game:', error);
      return [];
    }

    if (!data) return [];

    // Carica immagini e featured in batch
    const productIds = data.map(p => p.id);
    const { data: allImages } = await supabase
      .from('product_images')
      .select('product_id, url, sort_order')
      .in('product_id', productIds)
      .order('sort_order', { ascending: true });

    const { data: allFeatured } = await supabase
      .from('featured_products')
      .select('product_id')
      .in('product_id', productIds);

    const featuredSet = new Set(allFeatured?.map(f => f.product_id) || []);
    const imagesMap = new Map<string, string[]>();
    allImages?.forEach(img => {
      if (!imagesMap.has(img.product_id)) {
        imagesMap.set(img.product_id, []);
      }
      imagesMap.get(img.product_id)!.push(img.url);
    });

    const products: Product[] = data.map(dbProduct => ({
      id: dbProduct.id,
      name: dbProduct.name,
      game: mapGameSlugToGameType(dbProduct.games?.slug || 'other'),
      type: mapTypeSlugToProductType(dbProduct.product_types?.slug || 'raw'),
      set: dbProduct.set_name || '',
      cardCode: dbProduct.code || '',
      language: (dbProduct.language || 'ENG') as Language,
      condition: (dbProduct.condition || 'near-mint') as Condition,
      price: dbProduct.price_cents / 100,
      images: imagesMap.get(dbProduct.id) || [],
      status: mapStatusToProductStatus(dbProduct.status),
      description: dbProduct.description || undefined,
      featured: featuredSet.has(dbProduct.id),
      createdAt: new Date(dbProduct.created_at),
      updatedAt: new Date(dbProduct.updated_at),
    }));

    return products;
  } catch (error) {
    console.error('Error in getProductsByGame:', error);
    return [];
  }
};

// Get products by type
export const getProductsByType = async (type: ProductType, includeUnpublished: boolean = false): Promise<Product[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    // Mappa ProductType a type_id
    const typeIdMap: Record<ProductType, number> = {
      raw: 1,
      graded: 2,
      sealed: 3,
    };

    const typeId = typeIdMap[type];

    let query = supabase
      .from('products')
      .select(`
        *,
        games(slug),
        product_types(slug)
      `)
      .eq('type_id', typeId)
      .order('created_at', { ascending: false });

    if (!includeUnpublished) {
      query = query.eq('published', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products by type:', error);
      return [];
    }

    if (!data) return [];

    // Carica immagini e featured in batch
    const productIds = data.map(p => p.id);
    const { data: allImages } = await supabase
      .from('product_images')
      .select('product_id, url, sort_order')
      .in('product_id', productIds)
      .order('sort_order', { ascending: true });

    const { data: allFeatured } = await supabase
      .from('featured_products')
      .select('product_id')
      .in('product_id', productIds);

    const featuredSet = new Set(allFeatured?.map(f => f.product_id) || []);
    const imagesMap = new Map<string, string[]>();
    allImages?.forEach(img => {
      if (!imagesMap.has(img.product_id)) {
        imagesMap.set(img.product_id, []);
      }
      imagesMap.get(img.product_id)!.push(img.url);
    });

    const products: Product[] = data.map(dbProduct => ({
      id: dbProduct.id,
      name: dbProduct.name,
      game: mapGameSlugToGameType(dbProduct.games?.slug || 'other'),
      type: mapTypeSlugToProductType(dbProduct.product_types?.slug || 'raw'),
      set: dbProduct.set_name || '',
      cardCode: dbProduct.code || '',
      language: (dbProduct.language || 'ENG') as Language,
      condition: (dbProduct.condition || 'near-mint') as Condition,
      price: dbProduct.price_cents / 100,
      images: imagesMap.get(dbProduct.id) || [],
      status: mapStatusToProductStatus(dbProduct.status),
      description: dbProduct.description || undefined,
      featured: featuredSet.has(dbProduct.id),
      createdAt: new Date(dbProduct.created_at),
      updatedAt: new Date(dbProduct.updated_at),
    }));

    return products;
  } catch (error) {
    console.error('Error in getProductsByType:', error);
    return [];
  }
};

// Get product by ID
export const getProductById = async (id: string, includeUnpublished: boolean = false): Promise<Product | null> => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    // Prova prima con join (più efficiente)
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        games(slug),
        product_types(slug)
      `)
      .eq('id', id)
      .maybeSingle(); // Usa maybeSingle per gestire meglio i casi in cui il record non esiste

    // Se c'è un errore 406 o problemi con il join, usa fallback senza join
    if (error && (error.code === 'PGRST116' || error.message?.includes('406') || error.message?.includes('Not Acceptable') || error.code === '42883')) {
      console.warn('Join query failed, using fallback query without joins:', error.message);
      
      // Fallback: carica prodotto senza join
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (fallbackError || !fallbackData) {
        console.error('Error fetching product (fallback):', fallbackError);
        return null;
      }
      
      // Se non è published e non è richiesto, ritorna null
      if (!fallbackData.published && !includeUnpublished) {
        return null;
      }
      
      // Carica game, type, immagini e featured separatamente
      let gameSlug = 'other';
      try {
        const { data: gameData } = await supabase
          .from('games')
          .select('slug')
          .eq('id', fallbackData.game_id)
          .maybeSingle();
        if (gameData) gameSlug = gameData.slug;
      } catch (e) {
        console.warn('Error fetching game:', e);
      }
      
      let typeSlug = 'raw';
      try {
        const { data: typeData } = await supabase
          .from('product_types')
          .select('slug')
          .eq('id', fallbackData.type_id)
          .maybeSingle();
        if (typeData) typeSlug = typeData.slug;
      } catch (e) {
        console.warn('Error fetching product type:', e);
      }
      
      let images: string[] = [];
      try {
        const { data: imagesData } = await supabase
          .from('product_images')
          .select('url, sort_order')
          .eq('product_id', id)
          .order('sort_order', { ascending: true });
        if (imagesData) images = imagesData.map(img => img.url);
      } catch (e) {
        console.warn('Error fetching images:', e);
      }
      
      let featured = false;
      try {
        const { data: featuredData } = await supabase
          .from('featured_products')
          .select('product_id')
          .eq('product_id', id)
          .maybeSingle();
        if (featuredData) featured = true;
      } catch (e) {
        console.warn('Error checking featured status:', e);
      }
      
      return {
        id: fallbackData.id,
        name: fallbackData.name,
        game: mapGameSlugToGameType(gameSlug),
        type: mapTypeSlugToProductType(typeSlug),
        set: fallbackData.set_name || '',
        cardCode: fallbackData.code || '',
        language: (fallbackData.language || 'ENG') as Language,
        condition: (fallbackData.condition || 'near-mint') as Condition,
        price: fallbackData.price_cents / 100,
        images: images,
        status: mapStatusToProductStatus(fallbackData.status),
        description: fallbackData.description || undefined,
        featured: featured,
        createdAt: new Date(fallbackData.created_at),
        updatedAt: new Date(fallbackData.updated_at),
      };
    }

    if (error) {
      console.error('Error fetching product by id:', error);
      return null;
    }

    if (!data) return null;

    // Se non è published e non è richiesto, ritorna null
    if (!data.published && !includeUnpublished) {
      return null;
    }

    // Carica immagini e featured con gestione errori
    let images: string[] = [];
    try {
      const { data: imagesData, error: imagesError } = await supabase
        .from('product_images')
        .select('url, sort_order')
        .eq('product_id', id)
        .order('sort_order', { ascending: true });
      
      if (!imagesError && imagesData) {
        images = imagesData.map(img => img.url);
      }
    } catch (e) {
      console.warn('Error fetching images:', e);
    }

    let featured = false;
    try {
      const { data: featuredData, error: featuredError } = await supabase
        .from('featured_products')
        .select('product_id')
        .eq('product_id', id)
        .maybeSingle();
      
      if (!featuredError && featuredData) {
        featured = true;
      }
    } catch (e) {
      console.warn('Error checking featured status:', e);
    }

    return {
      id: data.id,
      name: data.name,
      game: mapGameSlugToGameType((data.games as any)?.slug || 'other'),
      type: mapTypeSlugToProductType((data.product_types as any)?.slug || 'raw'),
      set: data.set_name || '',
      cardCode: data.code || '',
      language: (data.language || 'ENG') as Language,
      condition: (data.condition || 'near-mint') as Condition,
      price: data.price_cents / 100,
      images: images,
      status: mapStatusToProductStatus(data.status),
      description: data.description || undefined,
      featured: featured,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  } catch (error) {
    console.error('Error in getProductById:', error);
    return null;
  }
};

// Get featured products
export const getFeaturedProducts = async (): Promise<Product[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    // Carica featured products con rank
    const { data: featuredData, error: featuredError } = await supabase
      .from('featured_products')
      .select('product_id, rank')
      .order('rank', { ascending: true });

    if (featuredError) {
      console.error('Error fetching featured products:', featuredError);
      return [];
    }

    if (!featuredData || featuredData.length === 0) return [];

    // Carica i prodotti associati (solo pubblicati)
    const productIds = featuredData.map(item => item.product_id);
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds)
      .eq('published', true);

    if (productsError) {
      console.error('Error fetching featured products data:', productsError);
      return [];
    }

    if (!productsData) return [];

    // Crea una mappa per mantenere l'ordine di rank
    const productMap = new Map(productsData.map(p => [p.id, p]));
    const orderedProducts = featuredData
      .map(item => productMap.get(item.product_id))
      .filter(Boolean) as any[];

    // Mappa i prodotti
    const products = await Promise.all(orderedProducts.map(mapDbProductToProduct));
    return products;
  } catch (error) {
    console.error('Error in getFeaturedProducts:', error);
    return [];
  }
};

// Helper per eseguire operazioni Supabase con retry su errori di autenticazione
const executeWithAuthRetry = async <T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> => {
  try {
    // Verifica e aggiorna la sessione prima dell'operazione
    const { session, error: sessionError } = await auth.ensureValidSession();
    if (sessionError || !session) {
      console.error(`${operationName}: Session error:`, sessionError);
      throw new Error('Sessione scaduta. Effettua il login di nuovo.');
    }

    // Esegui l'operazione
    return await operation();
  } catch (error: any) {
    // Se l'errore è di autenticazione (JWT, token), prova a fare refresh e riprova
    if (
      error?.message?.includes('JWT') ||
      error?.message?.includes('token') ||
      error?.message?.includes('expired') ||
      error?.message?.includes('unauthorized') ||
      error?.message?.includes('authentication') ||
      error?.code === 'PGRST301' || // Supabase auth error
      error?.status === 401
    ) {
      console.warn(`${operationName}: Auth error detected, attempting refresh and retry...`);
      try {
        // Prova a fare refresh della sessione
        const { session: refreshedSession, error: refreshError } = await auth.ensureValidSession();
        if (refreshError || !refreshedSession) {
          console.error(`${operationName}: Failed to refresh session:`, refreshError);
          throw new Error('Sessione scaduta. Effettua il login di nuovo.');
        }

        // Riprova l'operazione dopo il refresh
        console.log(`${operationName}: Retrying after session refresh...`);
        return await operation();
      } catch (retryError: any) {
        console.error(`${operationName}: Retry failed:`, retryError);
        throw new Error('Errore di autenticazione. Effettua il login di nuovo.');
      }
    }

    // Rilancia altri errori
    throw error;
  }
};

// Create product
export const createProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product | null> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  return executeWithAuthRetry(async () => {
    console.log('[createProduct] Starting product creation...');
    console.log('[createProduct] Product data:', {
      name: product.name,
      game: product.game,
      type: product.type,
      imagesCount: product.images?.length || 0,
    });
    try {
    // Trova o crea game_id
    console.log('[createProduct] Step 1: Finding game_id...');
    const gameSlugMap: Record<GameType, string> = {
      pokemon: 'pokemon',
      yugioh: 'yu-gi-oh',
      onepiece: 'one-piece',
      other: 'other',
    };
    const gameSlug = gameSlugMap[product.game];
    console.log('[createProduct] Looking for game with slug:', gameSlug);
    const gameNameMap: Record<GameType, string> = {
      pokemon: 'Pokémon',
      yugioh: 'Yu-Gi-Oh!',
      onepiece: 'One Piece',
      other: 'Altri prodotti',
    };

    let { data: gameData, error: gameQueryError } = await supabase
      .from('games')
      .select('id')
      .eq('slug', gameSlug)
      .single();
    
    console.log('[createProduct] Game query result:', { gameData, error: gameQueryError });

    // Se non esiste, prova a crearlo (potrebbe fallire se non hai permessi, usa pokemon come fallback)
    if (!gameData && gameSlug === 'other') {
      const { data: createdGame, error: createError } = await supabase
        .from('games')
        .insert({ slug: 'other', name: 'Altri prodotti' })
        .select()
        .single();
      
      if (createError || !createdGame) {
        // Se non si può creare, usa pokemon come fallback
        console.warn('Cannot create "other" game, using pokemon as fallback');
        const { data: fallbackGame } = await supabase
          .from('games')
          .select('id')
          .eq('slug', 'pokemon')
          .single();
        gameData = fallbackGame;
      } else {
        gameData = createdGame;
      }
    }

    if (!gameData) {
      throw new Error(`Game ${product.game} not found and cannot be created`);
    }

    // Trova type_id
    console.log('[createProduct] Step 2: Finding type_id...');
    const typeIdMap: Record<ProductType, number> = {
      raw: 1,
      graded: 2,
      sealed: 3,
    };
    const typeId = typeIdMap[product.type];
    console.log('[createProduct] Type ID:', typeId);

    // Genera slug
    console.log('[createProduct] Step 3: Generating slug...');
    const slug = `${product.name.toLowerCase().replace(/\s+/g, '-')}-${product.cardCode || Date.now()}`;
    console.log('[createProduct] Generated slug:', slug);

    // Crea prodotto
    console.log('[createProduct] Step 4: Creating product in database...');
    const { data: newProduct, error: productError } = await supabase
      .from('products')
      .insert({
        slug,
        name: product.name,
        set_name: product.set || null,
        code: product.cardCode || null,
        language: product.language,
        condition: product.condition,
        description: product.description || null,
        price_cents: Math.round(product.price * 100),
        currency: 'EUR',
        status: mapProductStatusToStatus(product.status),
        published: true,
        game_id: gameData.id,
        type_id: typeId,
      })
      .select()
      .single();

    if (productError || !newProduct) {
      console.error('[createProduct] Error creating product:', productError);
      console.error('[createProduct] Product data:', {
        slug,
        name: product.name,
        game_id: gameData.id,
        type_id,
        status: mapProductStatusToStatus(product.status),
      });
      throw new Error(productError?.message || 'Error creating product');
    }

    console.log(`[createProduct] Product created successfully with ID: ${newProduct.id}`);

    // Aggiungi immagini
    console.log('[createProduct] Step 5: Processing images...');
    if (product.images && product.images.length > 0) {
      console.log(`[createProduct] Inserting ${product.images.length} images for product ${newProduct.id}`);
      console.log('[createProduct] Image URLs:', product.images.map((url, idx) => `[${idx}] ${url?.substring(0, 80)}...`));
      
      // Filtra URL vuoti o non validi
      const validImages = product.images.filter((url, index) => {
        if (!url || typeof url !== 'string' || url.trim() === '') {
          console.warn(`[createProduct] Skipping invalid image URL [${index}]:`, url);
          return false;
        }
        
        // Rimuovi caratteri strani alla fine (come €, spazi, etc.)
        const cleanedUrl = url.trim();
        
        try {
          const urlObj = new URL(cleanedUrl);
          // Verifica che l'URL sia valido
          if (!urlObj.protocol || !urlObj.hostname) {
            console.warn(`[createProduct] Skipping invalid image URL [${index}] (missing protocol/host):`, cleanedUrl);
            return false;
          }
          return true;
        } catch (e) {
          console.warn(`[createProduct] Skipping invalid image URL [${index}] (not a valid URL):`, cleanedUrl, e);
          return false;
        }
      });
      
      console.log(`[createProduct] Valid images after filtering: ${validImages.length}/${product.images.length}`);

      if (validImages.length === 0) {
        console.warn('[createProduct] No valid images to insert');
      } else {
        const imagesToInsert = validImages.map((url, index) => ({
          product_id: newProduct.id,
          url: url.trim(), // Assicurati che l'URL sia pulito
          alt: product.name,
          sort_order: index,
        }));

        console.log(`[createProduct] Step 5.1: Inserting ${imagesToInsert.length} valid images into database...`);
        console.log('[createProduct] Images to insert:', imagesToInsert.map(img => ({ url: img.url.substring(0, 60) + '...', sort_order: img.sort_order })));
        
        const { data: insertedImages, error: imagesError } = await supabase
          .from('product_images')
          .insert(imagesToInsert)
          .select();
        
        console.log('[createProduct] Images insert result:', { 
          insertedCount: insertedImages?.length || 0, 
          error: imagesError 
        });

        if (imagesError) {
          console.error('[createProduct] Error creating product images:', imagesError);
          console.error('[createProduct] Images data:', imagesToInsert);
          // Se è un errore critico (es. constraint violation), fallisci
          if (
            imagesError.code === '23505' || // Unique violation
            imagesError.code === '23503' || // Foreign key violation
            imagesError.message?.includes('permission') ||
            imagesError.message?.includes('policy') ||
            imagesError.message?.includes('RLS')
          ) {
            throw new Error(`Errore nel salvataggio delle immagini: ${imagesError.message}`);
          }
          // Altrimenti, continua ma avvisa (potrebbe essere un problema di rete temporaneo)
          console.warn('[createProduct] Continuing despite image insertion error');
        } else {
          console.log(`[createProduct] Successfully inserted ${insertedImages?.length || 0} images`);
        }
      }
    }

    // Se featured, aggiungi a featured_products
    console.log('[createProduct] Step 6: Checking featured status...');
    if (product.featured) {
      console.log('[createProduct] Adding product to featured_products...');
      const { error: featuredError } = await supabase
        .from('featured_products')
        .insert({
          product_id: newProduct.id,
          rank: 0,
        });

      if (featuredError) {
        console.error('[createProduct] Error adding to featured:', featuredError);
        // Non fallire se featured non si può aggiungere
      } else {
        console.log('[createProduct] Product added to featured successfully');
      }
    }

      console.log(`[createProduct] Step 7: Fetching created product ${newProduct.id}...`);
      const createdProduct = await getProductById(newProduct.id, true);
      if (!createdProduct) {
        console.error('[createProduct] Failed to fetch created product');
        throw new Error('Prodotto creato ma impossibile recuperarlo');
      }
      console.log(`[createProduct] Product creation completed successfully: ${createdProduct.id}`);
      console.log('[createProduct] Final product data:', {
        id: createdProduct.id,
        name: createdProduct.name,
        imagesCount: createdProduct.images?.length || 0,
        featured: createdProduct.featured,
      });
      return createdProduct;
    } catch (error: any) {
      console.error('[createProduct] Error in createProduct:', error);
      console.error('[createProduct] Error stack:', error?.stack);
      throw error;
    }
  }, 'createProduct');
};

// Update product
export const updateProduct = async (id: string, updates: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Product | null> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  return executeWithAuthRetry(async () => {
    try {
    const updateData: any = {
      updated_at: new Date().toISOString(), // Aggiorna sempre il timestamp
    };

    // Costruisci updateData solo con i campi definiti (non undefined)
    if (updates.name !== undefined && updates.name !== null) updateData.name = updates.name;
    if (updates.set !== undefined) updateData.set_name = updates.set || null; // Permetti null per campi opzionali
    if (updates.cardCode !== undefined) updateData.code = updates.cardCode || null;
    if (updates.language !== undefined && updates.language !== null) updateData.language = updates.language;
    if (updates.condition !== undefined && updates.condition !== null) updateData.condition = updates.condition;
    if (updates.description !== undefined) updateData.description = updates.description || null;
    if (updates.price !== undefined && updates.price !== null) {
      updateData.price_cents = Math.round(updates.price * 100);
    }
    if (updates.status !== undefined && updates.status !== null) {
      updateData.status = mapProductStatusToStatus(updates.status);
    }

    // Se cambia game, aggiorna game_id
    if (updates.game !== undefined && updates.game !== null) {
      const gameSlugMap: Record<GameType, string> = {
        pokemon: 'pokemon',
        yugioh: 'yu-gi-oh',
        onepiece: 'one-piece',
        other: 'other',
      };
      const gameSlug = gameSlugMap[updates.game];

      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('id')
        .eq('slug', gameSlug)
        .maybeSingle();

      // Se non esiste "other", prova a crearlo (ma probabilmente fallirà per RLS)
      if (!gameData && !gameError && gameSlug === 'other') {
        const { data: createdGame } = await supabase
          .from('games')
          .insert({ slug: 'other', name: 'Altri prodotti' })
          .select()
          .maybeSingle();
        if (createdGame) {
          updateData.game_id = createdGame.id;
        }
      } else if (gameData) {
        updateData.game_id = gameData.id;
      } else if (gameError) {
        console.warn('Error fetching game:', gameError);
        // Non fallire se il game non viene trovato, usa quello esistente
      }
    }

    // Se cambia type, aggiorna type_id
    if (updates.type !== undefined && updates.type !== null) {
      const typeIdMap: Record<ProductType, number> = {
        raw: 1,
        graded: 2,
        sealed: 3,
      };
      updateData.type_id = typeIdMap[updates.type];
    }

    // Verifica che ci sia almeno un campo da aggiornare (oltre a updated_at)
    // Nota: featured e images vengono gestiti separatamente, quindi non sono in updateData
    const fieldsToUpdate = Object.keys(updateData).filter(key => key !== 'updated_at');
    const hasUpdatesInTable = fieldsToUpdate.length > 0;
    const hasUpdatesOutsideTable = updates.featured !== undefined || updates.images !== undefined;
    
    // Se non ci sono campi da aggiornare nella tabella products E non ci sono aggiornamenti esterni,
    // allora non c'è nulla da fare (evita chiamate inutili al DB)
    if (!hasUpdatesInTable && !hasUpdatesOutsideTable) {
      // Silently return - non è un errore, semplicemente non c'è nulla da aggiornare
      return await getProductById(id, true);
    }
    
    // Se ci sono solo aggiornamenti esterni (featured/images) ma nessun campo nella tabella products,
    // aggiorna comunque updated_at per segnalare che il prodotto è stato modificato
    if (!hasUpdatesInTable && hasUpdatesOutsideTable) {
      // Aggiorna solo updated_at per segnalare la modifica
      const { error: timestampError } = await supabase
        .from('products')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (timestampError) {
        console.warn('Error updating timestamp:', timestampError);
      }
    } else if (hasUpdatesInTable) {
      // Aggiorna i campi nella tabella products
      const { data: updatedProduct, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating product:', error);
        console.error('Update data:', updateData);
        throw new Error(error.message || 'Errore durante l\'aggiornamento del prodotto');
      }
    }

    // Aggiorna featured PRIMA delle immagini (gestito separatamente dalla tabella products)
    if (updates.featured !== undefined) {
      try {
        const { data: existing, error: featuredCheckError } = await supabase
          .from('featured_products')
          .select('product_id')
          .eq('product_id', id)
          .maybeSingle();

        if (featuredCheckError && featuredCheckError.code !== 'PGRST116') {
          console.warn('Error checking featured status:', featuredCheckError);
          throw new Error('Errore durante il controllo dello stato featured');
        } else {
          if (updates.featured && !existing) {
            // Aggiungi
            const { error: insertError } = await supabase
              .from('featured_products')
              .insert({ product_id: id, rank: 999 });
            if (insertError) {
              console.error('Error adding to featured:', insertError);
              throw new Error('Impossibile aggiungere il prodotto agli featured');
            }
          } else if (!updates.featured && existing) {
            // Rimuovi
            const { error: deleteError } = await supabase
              .from('featured_products')
              .delete()
              .eq('product_id', id);
            if (deleteError) {
              console.error('Error removing from featured:', deleteError);
              throw new Error('Impossibile rimuovere il prodotto dagli featured');
            }
          }
        }
      } catch (featuredError: any) {
        console.error('Error updating featured status:', featuredError);
        // Se featured è l'unico aggiornamento, fallisci
        if (!hasUpdatesInTable && updates.images === undefined) {
          throw featuredError;
        }
        // Altrimenti, continua ma avvisa (non dovrebbe succedere)
        console.warn('Featured update failed but continuing with other updates');
      }
    }

    // Aggiorna immagini se presenti
    if (updates.images !== undefined) {
      try {
        // Elimina vecchie immagini
        const { error: deleteError } = await supabase
          .from('product_images')
          .delete()
          .eq('product_id', id);

        if (deleteError) {
          console.warn('Error deleting old images:', deleteError);
        }

        // Aggiungi nuove immagini
        if (updates.images && updates.images.length > 0) {
          // Prendi il nome del prodotto (dalle updates o dal prodotto esistente)
          let productName = updates.name || '';
          if (!productName) {
            const existingProduct = await getProductById(id, true);
            productName = existingProduct?.name || '';
          }

          const imagesToInsert = updates.images
            .filter(url => url && url.trim() !== '') // Filtra URL vuoti
            .map((url, index) => ({
              product_id: id,
              url: url.trim(),
              alt: productName,
              sort_order: index,
            }));

          if (imagesToInsert.length > 0) {
            const { error: insertError } = await supabase
              .from('product_images')
              .insert(imagesToInsert);

            if (insertError) {
              console.warn('Error inserting images:', insertError);
            }
          }
        }
      } catch (imagesError) {
        console.warn('Error updating images:', imagesError);
        // Non fallire l'update se le immagini falliscono
      }
    }

      // Ritorna il prodotto aggiornato
      return await getProductById(id, true);
    } catch (error: any) {
      console.error('Error in updateProduct:', error);
      // Fornisci un messaggio di errore più dettagliato
      const errorMessage = error?.message || 'Errore durante l\'aggiornamento del prodotto';
      throw new Error(errorMessage);
    }
  }, 'updateProduct');
};

// Delete product
export const deleteProduct = async (id: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  return executeWithAuthRetry(async () => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting product:', error);
        throw new Error(error.message);
      }

      return true;
    } catch (error) {
      console.error('Error in deleteProduct:', error);
      throw error;
    }
  }, 'deleteProduct');
};

// Toggle featured
export const toggleProductFeatured = async (id: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  return executeWithAuthRetry(async () => {
    try {
      // Carica il prodotto corrente per verificare lo stato featured
      const product = await getProductById(id, true);
      if (!product) {
        throw new Error('Product not found');
      }

      const newFeaturedStatus = !product.featured;

    // Aggiorna lo stato featured direttamente nella tabella featured_products
    // senza passare per updateProduct per evitare il problema "No fields to update"
    if (newFeaturedStatus) {
      // Aggiungi agli featured - verifica prima se esiste già
      const { data: existing, error: checkError } = await supabase
        .from('featured_products')
        .select('product_id')
        .eq('product_id', id)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking featured status:', checkError);
        throw new Error('Errore durante il controllo dello stato featured');
      }

      // Se non esiste, aggiungilo
      if (!existing) {
        const { error: insertError } = await supabase
          .from('featured_products')
          .insert({ product_id: id, rank: 999 });

        if (insertError) {
          console.error('Error adding to featured:', insertError);
          throw new Error('Impossibile aggiungere il prodotto agli featured');
        }
      }
      // Se esiste già, non fare nulla (idempotente)
    } else {
      // Rimuovi dagli featured - verifica prima se esiste
      const { data: existing, error: checkError } = await supabase
        .from('featured_products')
        .select('product_id')
        .eq('product_id', id)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking featured status before delete:', checkError);
        // Non fallire se non esiste già - potrebbe essere già stato rimosso
      }

      // Se esiste, rimuovilo
      if (existing) {
        const { error: deleteError } = await supabase
          .from('featured_products')
          .delete()
          .eq('product_id', id);

        if (deleteError) {
          console.error('Error removing from featured:', deleteError);
          throw new Error('Impossibile rimuovere il prodotto dagli featured');
        }
      }
      // Se non esiste già, non fare nulla (idempotente)
      }

      // Aggiorna il timestamp del prodotto per segnalare la modifica
      const { error: timestampError } = await supabase
        .from('products')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', id);

      if (timestampError) {
        console.warn('Error updating timestamp:', timestampError);
        // Non fallire se il timestamp non viene aggiornato
      }

      return newFeaturedStatus;
    } catch (error: any) {
      console.error('Error in toggleProductFeatured:', error);
      throw error;
    }
  }, 'toggleProductFeatured');
};

// Toggle status
export const toggleProductStatus = async (id: string): Promise<ProductStatus> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  // Usa updateProduct che già ha il retry con auth
  try {
    const product = await getProductById(id, true);
    if (!product) {
      throw new Error('Product not found');
    }

    const newStatus = product.status === 'available' ? 'sold' : 'available';
    await updateProduct(id, { status: newStatus });
    return newStatus;
  } catch (error) {
    console.error('Error in toggleProductStatus:', error);
    throw error;
  }
};
