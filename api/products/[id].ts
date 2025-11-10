import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createServerClient, handleApiError } from '../utils/supabase-server';

/**
 * API Route: GET /api/products/[id]
 * 
 * Ottiene un prodotto per ID (bypass RLS per operazioni server-side)
 * Utile per webhook, cron jobs, o operazioni che richiedono accesso completo
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Solo GET method per questo esempio
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const supabase = createServerClient();
    
    // Query con SERVICE_ROLE_KEY bypassa RLS
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        games(slug, name),
        product_types(slug, name),
        product_images(url, sort_order)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.status(200).json({ product });
  } catch (error) {
    const { error: errorMessage, status } = handleApiError(error);
    return res.status(status).json({ error: errorMessage });
  }
}

