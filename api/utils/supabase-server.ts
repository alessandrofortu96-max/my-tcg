import { createClient } from '@supabase/supabase-js';

/**
 * Client Supabase server-side con SERVICE_ROLE_KEY
 * 
 * ⚠️ IMPORTANTE: Questo client bypassa RLS (Row Level Security)
 * Usare SOLO nelle API routes/serverless functions, MAI esporre al client
 */
export const createServerClient = () => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
      'Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

/**
 * Helper per gestire errori API
 */
export const handleApiError = (error: unknown) => {
  console.error('API Error:', error);
  
  if (error instanceof Error) {
    return {
      error: error.message,
      status: 500,
    };
  }

  return {
    error: 'Internal server error',
    status: 500,
  };
};

/**
 * Helper per validare autenticazione (opzionale, se vuoi verificare token)
 */
export const validateAuth = async (authHeader: string | null) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'Missing or invalid authorization header' };
  }

  const token = authHeader.replace('Bearer ', '');
  const client = createServerClient();
  
  try {
    const { data: { user }, error } = await client.auth.getUser(token);
    
    if (error || !user) {
      return { valid: false, error: 'Invalid token' };
    }

    return { valid: true, user };
  } catch (error) {
    return { valid: false, error: 'Token validation failed' };
  }
};

