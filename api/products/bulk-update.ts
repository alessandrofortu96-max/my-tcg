import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createServerClient, handleApiError, validateAuth } from '../utils/supabase-server';

/**
 * API Route: POST /api/products/bulk-update
 * 
 * Aggiorna prodotti in bulk (es. aggiornamento prezzi, status)
 * Richiede autenticazione e SERVICE_ROLE_KEY per bypass RLS
 * 
 * Esempio di uso: webhook da sistema esterno, cron job per aggiornamento prezzi
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Opzionale: valida autenticazione se necessario
    // const authResult = await validateAuth(req.headers.authorization || null);
    // if (!authResult.valid) {
    //   return res.status(401).json({ error: 'Unauthorized' });
    // }

    const { updates } = req.body;

    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({ error: 'Updates array is required' });
    }

    const supabase = createServerClient();
    const results = [];

    // Esegui update in batch (con SERVICE_ROLE_KEY bypassa RLS)
    for (const update of updates) {
      const { id, ...data } = update;
      
      if (!id) {
        results.push({ id, error: 'Missing product ID' });
        continue;
      }

      const { data: updated, error } = await supabase
        .from('products')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        results.push({ id, error: error.message });
      } else {
        results.push({ id, success: true, product: updated });
      }
    }

    return res.status(200).json({ results });
  } catch (error) {
    const { error: errorMessage, status } = handleApiError(error);
    return res.status(status).json({ error: errorMessage });
  }
}


