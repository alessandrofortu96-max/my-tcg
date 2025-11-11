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

  // Ensure valid session (refresh if needed)
  ensureValidSession: async (): Promise<{ session: any; error: any }> => {
    if (!isSupabaseConfigured()) {
      return { session: null, error: new Error('Supabase not configured') };
    }

    try {
      // Prima verifica la sessione corrente
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        return { session: null, error: sessionError || new Error('No session') };
      }

      // Verifica se il token è scaduto o sta per scadere
      const expiresAt = session.expires_at;
      if (expiresAt) {
        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = expiresAt - now;
        
        // Se il token scade entro 120 secondi, fai refresh preventivo
        if (timeUntilExpiry < 120) {
          console.log('Token expiring soon, refreshing...');
          try {
            const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
              console.error('Error refreshing session:', refreshError);
              return { session: null, error: refreshError };
            }
            if (refreshedSession) {
              return { session: refreshedSession, error: null };
            }
          } catch (refreshErr) {
            console.error('Error during session refresh:', refreshErr);
            return { session: null, error: refreshErr };
          }
        }
      }

      return { session, error: null };
    } catch (error: any) {
      console.error('Error in ensureValidSession:', error);
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

