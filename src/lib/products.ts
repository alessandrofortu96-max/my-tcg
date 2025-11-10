import { Product, GameType, ProductType, ProductStatus, Condition, Language } from './types';
import { supabase, isSupabaseConfigured } from './supabase';

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

    const { data, error } = await query;

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
    const productIds = data.map(p => p.id);
    const { data: allImages } = await supabase
      .from('product_images')
      .select('product_id, url, sort_order')
      .in('product_id', productIds)
      .order('sort_order', { ascending: true });

    // Carica tutti i featured in una volta
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

    // Mappa i prodotti usando i dati già caricati
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
  } catch (error) {
    console.error('Error in getProducts:', error);
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

// Create product
export const createProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product | null> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  try {
    // Trova o crea game_id
    const gameSlugMap: Record<GameType, string> = {
      pokemon: 'pokemon',
      yugioh: 'yu-gi-oh',
      onepiece: 'one-piece',
      other: 'other',
    };
    const gameSlug = gameSlugMap[product.game];
    const gameNameMap: Record<GameType, string> = {
      pokemon: 'Pokémon',
      yugioh: 'Yu-Gi-Oh!',
      onepiece: 'One Piece',
      other: 'Altri prodotti',
    };

    let { data: gameData } = await supabase
      .from('games')
      .select('id')
      .eq('slug', gameSlug)
      .single();

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
    const typeIdMap: Record<ProductType, number> = {
      raw: 1,
      graded: 2,
      sealed: 3,
    };
    const typeId = typeIdMap[product.type];

    // Genera slug
    const slug = `${product.name.toLowerCase().replace(/\s+/g, '-')}-${product.cardCode || Date.now()}`;

    // Crea prodotto
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
      console.error('Error creating product:', productError);
      throw new Error(productError?.message || 'Error creating product');
    }

    // Aggiungi immagini
    if (product.images && product.images.length > 0) {
      const imagesToInsert = product.images.map((url, index) => ({
        product_id: newProduct.id,
        url,
        alt: product.name,
        sort_order: index,
      }));

      const { error: imagesError } = await supabase
        .from('product_images')
        .insert(imagesToInsert);

      if (imagesError) {
        console.error('Error creating product images:', imagesError);
        // Non fallire se le immagini non si possono aggiungere
      }
    }

    // Se featured, aggiungi a featured_products
    if (product.featured) {
      const { error: featuredError } = await supabase
        .from('featured_products')
        .insert({
          product_id: newProduct.id,
          rank: 0,
        });

      if (featuredError) {
        console.error('Error adding to featured:', featuredError);
        // Non fallire se featured non si può aggiungere
      }
    }

    return await getProductById(newProduct.id, true);
  } catch (error) {
    console.error('Error in createProduct:', error);
    throw error;
  }
};

// Update product
export const updateProduct = async (id: string, updates: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Product | null> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

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
    const fieldsToUpdate = Object.keys(updateData).filter(key => key !== 'updated_at');
    if (fieldsToUpdate.length === 0) {
      console.warn('No fields to update for product:', id);
      // Ritorna il prodotto esistente se non ci sono modifiche
      return await getProductById(id, true);
    }

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
          const productName = updates.name || updatedProduct?.name || '';
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

    // Aggiorna featured
    if (updates.featured !== undefined) {
      try {
        const { data: existing, error: featuredCheckError } = await supabase
          .from('featured_products')
          .select('product_id')
          .eq('product_id', id)
          .maybeSingle();

        if (featuredCheckError && featuredCheckError.code !== 'PGRST116') {
          console.warn('Error checking featured status:', featuredCheckError);
        } else {
          if (updates.featured && !existing) {
            // Aggiungi
            const { error: insertError } = await supabase
              .from('featured_products')
              .insert({ product_id: id, rank: 999 });
            if (insertError) {
              console.warn('Error adding to featured:', insertError);
            }
          } else if (!updates.featured && existing) {
            // Rimuovi
            const { error: deleteError } = await supabase
              .from('featured_products')
              .delete()
              .eq('product_id', id);
            if (deleteError) {
              console.warn('Error removing from featured:', deleteError);
            }
          }
        }
      } catch (featuredError) {
        console.warn('Error updating featured status:', featuredError);
        // Non fallire l'update se featured fallisce
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
};

// Delete product
export const deleteProduct = async (id: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

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
};

// Toggle featured
export const toggleProductFeatured = async (id: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  try {
    const product = await getProductById(id, true);
    if (!product) {
      throw new Error('Product not found');
    }

    await updateProduct(id, { featured: !product.featured });
    return !product.featured;
  } catch (error) {
    console.error('Error in toggleProductFeatured:', error);
    throw error;
  }
};

// Toggle status
export const toggleProductStatus = async (id: string): Promise<ProductStatus> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

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
