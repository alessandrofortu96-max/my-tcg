import { supabase, isSupabaseConfigured } from './supabase';

const PRODUCT_IMAGES_BUCKET = 'product-images';

/**
 * Converti un File in base64
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Rimuovi il prefisso "data:image/...;base64," se presente
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Upload un'immagine su Supabase Storage usando l'API route server-side
 * @param file Il file da caricare
 * @param productId ID del prodotto (opzionale, per organizzare i file)
 * @param abortSignal Signal per cancellare l'upload
 * @returns URL pubblico dell'immagine caricata
 */
export const uploadProductImage = async (
  file: File,
  productId?: string,
  abortSignal?: AbortSignal
): Promise<string> => {
  // Verifica se l'upload è stato cancellato
  if (abortSignal?.aborted) {
    throw new DOMException('Upload cancelled', 'AbortError');
  }
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase non configurato');
  }

  try {
    // Verifica che l'utente sia autenticato
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Devi essere autenticato per caricare immagini');
    }

    // Genera un nome file univoco
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${timestamp}-${randomString}.${fileExtension}`;
    
    // Crea il path: se c'è productId, organizza per prodotto, altrimenti in una cartella temporanea
    const folder = productId ? `products/${productId}` : 'temp';
    const filePath = `${folder}/${fileName}`;

    // Converti il file in base64
    const fileBase64 = await fileToBase64(file);

    // Ottieni il token di autenticazione
    const token = session.access_token;

    // Prova prima con l'API route server-side (funziona in produzione su Vercel)
    let response: Response | null = null;
    try {
      // Verifica se l'upload è stato cancellato prima di iniziare
      if (abortSignal?.aborted) {
        throw new DOMException('Upload cancelled', 'AbortError');
      }

      // Usa direttamente l'AbortSignal se disponibile
      response = await fetch('/api/storage/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          bucket: PRODUCT_IMAGES_BUCKET,
          path: filePath,
          file: fileBase64,
          contentType: file.type || 'image/jpeg',
        }),
        signal: abortSignal, // Usa il signal per cancellare la richiesta
      });

      // Verifica se l'upload è stato cancellato durante la risposta
      if (abortSignal?.aborted) {
        throw new DOMException('Upload cancelled', 'AbortError');
      }

      if (response.ok) {
        const data = await response.json();
        // Verifica di nuovo dopo il parsing della risposta
        if (abortSignal?.aborted) {
          throw new DOMException('Upload cancelled', 'AbortError');
        }
        if (data.success && data.url) {
          return data.url;
        }
      }
      
      // Se l'API route non è disponibile (404), fallback a upload diretto
      if (response.status === 404) {
        console.warn('API route non disponibile (404), uso upload diretto');
        throw new Error('API_ROUTE_NOT_AVAILABLE');
      }
      
      // Se c'è un errore diverso da 404, prova a leggere il messaggio
      const errorData = await response.json().catch(() => ({ error: 'Errore sconosciuto' }));
      throw new Error(errorData.error || `Errore durante l'upload: ${response.statusText}`);
    } catch (apiError: any) {
      // Se l'upload è stato cancellato, rilancia l'errore
      if (apiError.name === 'AbortError' || abortSignal?.aborted) {
        throw new DOMException('Upload cancelled', 'AbortError');
      }
      
      // Fallback: upload diretto (richiede policy di storage corrette)
      if (apiError.message === 'API_ROUTE_NOT_AVAILABLE' || apiError.message?.includes('Failed to fetch') || response?.status === 404) {
        // Verifica se l'upload è stato cancellato prima del fallback
        if (abortSignal?.aborted) {
          throw new DOMException('Upload cancelled', 'AbortError');
        }
        
        console.warn('Upload diretto (sviluppo locale - richiede policy di storage)');
        
        // Verifica che il file sia valido
        if (!file || !(file instanceof File)) {
          throw new Error('File non valido');
        }

        // Upload diretto su Supabase Storage
        // NOTA: Supabase storage non supporta AbortSignal direttamente,
        // ma possiamo verificare prima e dopo la chiamata
        if (abortSignal?.aborted) {
          throw new DOMException('Upload cancelled', 'AbortError');
        }

        const { data, error: uploadError } = await supabase.storage
          .from(PRODUCT_IMAGES_BUCKET)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type || 'image/jpeg', // Specifica il content type esplicitamente
          });

        // Verifica se l'upload è stato cancellato dopo la chiamata
        if (abortSignal?.aborted) {
          // Se l'upload è stato completato ma cancellato dopo, elimina il file
          if (data?.path) {
            await supabase.storage
              .from(PRODUCT_IMAGES_BUCKET)
              .remove([data.path])
              .catch(err => console.warn('Error cleaning up cancelled upload:', err));
          }
          throw new DOMException('Upload cancelled', 'AbortError');
        }

        if (uploadError) {
          console.error('Error uploading file directly:', uploadError);
          
          // Se l'errore è RLS, fornisci istruzioni più dettagliate
          if (uploadError.message?.includes('row-level security') || uploadError.message?.includes('policy')) {
            throw new Error(
              `Errore RLS: ${uploadError.message}. ` +
              `Esegui la migration SQL: Supabase/Migrations/2025-11-10_storage_policies.sql ` +
              `nel dashboard Supabase → SQL Editor`
            );
          }
          
          // Se l'errore è MIME type, verifica le policy
          if (uploadError.message?.includes('mime type') || uploadError.message?.includes('not supported')) {
            throw new Error(
              `Tipo file non supportato: ${file.type}. ` +
              `Verifica che le policy di storage permettano il tipo ${file.type}. ` +
              `Esegui la migration SQL: Supabase/Migrations/2025-11-10_storage_policies.sql`
            );
          }
          
          throw new Error(
            `Errore durante l'upload: ${uploadError.message}. ` +
            `Assicurati di aver eseguito la migration SQL per le policy di storage. ` +
            `Vedi: Supabase/Migrations/2025-11-10_storage_policies.sql`
          );
        }

        if (!data) {
          throw new Error('Nessun dato ricevuto dall\'upload');
        }

        // Ottieni l'URL pubblico
        const { data: { publicUrl } } = supabase.storage
          .from(PRODUCT_IMAGES_BUCKET)
          .getPublicUrl(data.path);

        if (!publicUrl) {
          throw new Error('Impossibile ottenere l\'URL pubblico dell\'immagine');
        }

        return publicUrl;
      }
      
      // Rilancia altri errori
      throw apiError;
    }
  } catch (error: any) {
    console.error('Error in uploadProductImage:', error);
    throw error;
  }
};

/**
 * Elimina un'immagine da Supabase Storage
 * @param imageUrl URL pubblico dell'immagine da eliminare
 */
export const deleteProductImage = async (imageUrl: string): Promise<void> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase non configurato');
  }

  try {
    // Estrai il path dal URL
    // URL formato: https://[project].supabase.co/storage/v1/object/public/product-images/path/to/file.jpg
    const urlParts = imageUrl.split('/');
    const pathIndex = urlParts.findIndex(part => part === PRODUCT_IMAGES_BUCKET);
    
    if (pathIndex === -1 || pathIndex === urlParts.length - 1) {
      throw new Error('URL immagine non valido');
    }

    const filePath = urlParts.slice(pathIndex + 1).join('/');

    // Elimina il file
    const { error } = await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file:', error);
      throw new Error(`Errore durante l'eliminazione: ${error.message}`);
    }
  } catch (error: any) {
    console.error('Error in deleteProductImage:', error);
    throw error;
  }
};

/**
 * Valida che un file sia un'immagine valida
 * @param file Il file da validare
 * @returns true se il file è valido
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Verifica il tipo MIME
  const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Formato file non supportato. Usa JPG, PNG o WebP.',
    };
  }

  // Verifica la dimensione (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File troppo grande. Dimensione massima: 10MB',
    };
  }

  return { valid: true };
};

