import { supabase, isSupabaseConfigured } from './supabase';
import { User } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  isAdmin: boolean;
}

// Convert Supabase User to AuthUser
const convertUser = (user: User | null): AuthUser | null => {
  if (!user) return null;
  
  return {
    id: user.id,
    email: user.email || '',
    isAdmin: true, // Per ora solo admin, in futuro si può aggiungere un campo nel database
  };
};

export const auth = {
  // Get current user (with session refresh)
  getCurrentUser: async (): Promise<AuthUser | null> => {
    if (!isSupabaseConfigured()) {
      return null;
    }
    
    try {
      // Prima verifica/aggiorna la sessione
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('No session found');
        return null;
      }

      // Verifica se il token è scaduto o sta per scadere (entro 60 secondi)
      const expiresAt = session.expires_at;
      if (expiresAt) {
        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = expiresAt - now;
        
        // Se il token scade entro 60 secondi o è già scaduto, prova a fare refresh
        if (timeUntilExpiry < 60) {
          console.log('Token expiring soon or expired, attempting refresh...');
          try {
            const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
              console.error('Error refreshing session:', refreshError);
              return null;
            }
            if (!refreshedSession) {
              console.warn('No session after refresh');
              return null;
            }
          } catch (refreshErr) {
            console.error('Error during session refresh:', refreshErr);
            return null;
          }
        }
      }

      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error getting user:', error);
        // Se l'errore è di autenticazione, prova a fare refresh
        if (error.message?.includes('JWT') || error.message?.includes('token')) {
          try {
            const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
            if (!refreshError && refreshedSession) {
              // Riprova dopo il refresh
              const { data: { user: retryUser }, error: retryError } = await supabase.auth.getUser();
              if (!retryError && retryUser) {
                return convertUser(retryUser);
              }
            }
          } catch (refreshErr) {
            console.error('Error during session refresh retry:', refreshErr);
          }
        }
        return null;
      }
      if (!user) return null;
      return convertUser(user);
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Get current session (with auto refresh if needed)
  getSession: async () => {
    if (!isSupabaseConfigured()) {
      return { session: null, error: new Error('Supabase not configured') };
    }
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        return { session: null, error };
      }

      // Se non c'è sessione, ritorna null
      if (!session) {
        return { session: null, error: null };
      }

      // Verifica se il token è scaduto o sta per scadere
      const expiresAt = session.expires_at;
      if (expiresAt) {
        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = expiresAt - now;
        
        // Se il token scade entro 60 secondi o è già scaduto, prova a fare refresh
        if (timeUntilExpiry < 60) {
          console.log('Token expiring soon, refreshing session...');
          try {
            const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
              console.error('Error refreshing session:', refreshError);
              // Se il refresh fallisce, ritorna la sessione originale (potrebbe ancora funzionare)
              return { session, error: refreshError };
            }
            if (refreshedSession) {
              return { session: refreshedSession, error: null };
            }
          } catch (refreshErr) {
            console.error('Error during session refresh:', refreshErr);
            // In caso di errore, ritorna la sessione originale
            return { session, error: refreshErr };
          }
        }
      }

      return { session, error: null };
    } catch (error: any) {
      console.error('Error in getSession:', error);
      return { session: null, error };
    }
  },

  // Ensure valid session (refresh if needed) - with timeout protection
  // SEMPLIFICATO: Non fare refresh preventivo, solo verifica la sessione esistente
  ensureValidSession: async (): Promise<{ session: any; error: any }> => {
    if (!isSupabaseConfigured()) {
      console.error('[ensureValidSession] Supabase not configured');
      return { session: null, error: new Error('Supabase not configured') };
    }

    // Helper per aggiungere timeout a una promise
    const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, operationName: string): Promise<T> => {
      return Promise.race([
        promise,
        new Promise<T>((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Timeout: ${operationName} ha impiegato più di ${timeoutMs}ms`));
          }, timeoutMs);
        }),
      ]);
    };

    try {
      console.log('[ensureValidSession] Getting current session (no preventive refresh)...');
      
      // Verifica la sessione corrente con timeout di 3 secondi (più corto)
      // NON facciamo refresh preventivo per evitare blocchi
      let session: any = null;
      let sessionError: any = null;
      
      try {
        const getSessionPromise = supabase.auth.getSession();
        const result = await withTimeout(
          getSessionPromise,
          3000,
          'getSession'
        );
        session = result.data?.session || null;
        sessionError = result.error || null;
      } catch (timeoutError: any) {
        console.error('[ensureValidSession] Timeout getting session after 3s:', timeoutError);
        // Timeout: ritorna errore invece di provare fallback complessi
        return { 
          session: null, 
          error: new Error('Timeout: impossibile ottenere la sessione. Verifica la connessione internet.') 
        };
      }
      
      console.log('[ensureValidSession] Session retrieved:', { 
        hasSession: !!session, 
        error: sessionError?.message,
        expiresAt: session?.expires_at 
      });
      
      if (sessionError || !session) {
        console.error('[ensureValidSession] No session or error:', sessionError);
        return { session: null, error: sessionError || new Error('No session') };
      }

      // Verifica se il token è già scaduto (ma NON fare refresh preventivo)
      const expiresAt = session.expires_at;
      if (expiresAt) {
        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = expiresAt - now;
        
        console.log('[ensureValidSession] Token expiry check:', {
          expiresAt,
          now,
          timeUntilExpiry,
          isExpired: timeUntilExpiry <= 0
        });
        
        // Se il token è già scaduto da più di 5 minuti, ritorna errore
        if (timeUntilExpiry <= -300) {
          console.error('[ensureValidSession] Token expired more than 5 minutes ago');
          return { session: null, error: new Error('Sessione scaduta. Effettua il login di nuovo.') };
        }
        
        // Se il token è scaduto ma da meno di 5 minuti, prova a usarlo comunque
        // (il refresh verrà fatto automaticamente da Supabase se necessario)
        if (timeUntilExpiry <= 0) {
          console.warn('[ensureValidSession] Token expired but less than 5 minutes ago. Using session (Supabase will auto-refresh if needed).');
        } else {
          console.log('[ensureValidSession] Token still valid');
        }
      } else {
        console.warn('[ensureValidSession] No expires_at in session, using session as-is');
      }

      console.log('[ensureValidSession] Returning session (no preventive refresh)');
      return { session, error: null };
    } catch (error: any) {
      console.error('[ensureValidSession] Error in ensureValidSession:', error);
      console.error('[ensureValidSession] Error message:', error?.message);
      console.error('[ensureValidSession] Error stack:', error?.stack);
      return { session: null, error };
    }
  },

  // Sign in with email and password
  signIn: async (email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> => {
    if (!isSupabaseConfigured()) {
      return { user: null, error: 'Supabase non configurato. Controlla le variabili d\'ambiente.' };
    }
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, error: 'Nessun utente trovato' };
      }

      return { user: convertUser(data.user), error: null };
    } catch (error: any) {
      return { user: null, error: error.message || 'Errore durante il login' };
    }
  },

  // Sign out
  signOut: async (): Promise<void> => {
    if (!isSupabaseConfigured()) {
      return;
    }
    
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  },

  // Check if user is authenticated
  isAuthenticated: async (): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      return false;
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },
};

