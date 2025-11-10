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
  // Get current user
  getCurrentUser: async (): Promise<AuthUser | null> => {
    if (!isSupabaseConfigured()) {
      return null;
    }
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return null;
      return convertUser(user);
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Get current session
  getSession: async () => {
    if (!isSupabaseConfigured()) {
      return { session: null, error: new Error('Supabase not configured') };
    }
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      return { session, error };
    } catch (error: any) {
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

