import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createServerClient, handleApiError, validateAuth } from '../utils/supabase-server';

/**
 * API Route: POST /api/storage/upload
 * 
 * Upload immagini su Supabase Storage usando SERVICE_ROLE_KEY
 * Utile per upload sicuro lato server (es. validazione, resize, ecc.)
 * 
 * NOTA: Per upload semplice, puoi anche usare il client client-side con RLS policies
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Valida autenticazione
    const authResult = await validateAuth(req.headers.authorization || null);
    if (!authResult.valid) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { bucket, path, file, contentType } = req.body;

    if (!bucket || !path || !file) {
      return res.status(400).json({ error: 'Missing required fields: bucket, path, file' });
    }

    const supabase = createServerClient();
    
    // Converte base64 a buffer se necessario
    const fileBuffer = Buffer.from(file, 'base64');

    // Upload su Supabase Storage (con SERVICE_ROLE_KEY bypassa RLS)
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, fileBuffer, {
        contentType: contentType || 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.error('Error uploading file:', error);
      return res.status(500).json({ error: error.message });
    }

    // Ottieni URL pubblico
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return res.status(200).json({
      success: true,
      path: data.path,
      url: publicUrl,
    });
  } catch (error) {
    const { error: errorMessage, status } = handleApiError(error);
    return res.status(status).json({ error: errorMessage });
  }
}

