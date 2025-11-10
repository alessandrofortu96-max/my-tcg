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
    
    // Converte base64 a buffer
    let fileBuffer: Buffer;
    try {
      // Rimuovi il prefisso "data:..." se presente
      const base64Data = file.includes(',') ? file.split(',')[1] : file;
      fileBuffer = Buffer.from(base64Data, 'base64');
    } catch (error) {
      console.error('Error decoding base64:', error);
      return res.status(400).json({ error: 'Invalid base64 file data' });
    }

    // Upload su Supabase Storage (con SERVICE_ROLE_KEY bypassa RLS)
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, fileBuffer, {
        contentType: contentType || 'image/jpeg',
        upsert: false, // Non sovrascrivere file esistenti
        cacheControl: '3600',
      });

    if (error) {
      console.error('Error uploading file:', error);
      // Se il file esiste già, prova con un nome diverso
      if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
        const pathParts = path.split('/');
        const fileName = pathParts[pathParts.length - 1];
        const newFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${fileName.split('-').slice(2).join('-')}`;
        pathParts[pathParts.length - 1] = newFileName;
        const newPath = pathParts.join('/');
        
        const { data: retryData, error: retryError } = await supabase.storage
          .from(bucket)
          .upload(newPath, fileBuffer, {
            contentType: contentType || 'image/jpeg',
            upsert: false,
            cacheControl: '3600',
          });
        
        if (retryError) {
          return res.status(500).json({ error: retryError.message });
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(newPath);
        
        return res.status(200).json({
          success: true,
          path: retryData.path,
          url: publicUrl,
        });
      }
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

