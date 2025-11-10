import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Chiave univoca per il progetto (previene conflitti con altre istanze)
const STORAGE_KEY = 'my-tcg-supabase-auth-token';
const GLOBAL_CLIENT_KEY = '__MY_TCG_SUPABASE_CLIENT__';

/**
 * Crea o restituisce l'istanza singleton del client Supabase
 * Usa window object per garantire che il client sia creato solo una volta
 * anche durante Hot Module Replacement (HMR) in sviluppo
 * 
 * Questo previene il warning "Multiple GoTrueClient instances detected"
 */
function getSupabaseClient(): SupabaseClient {
  // In ambiente browser, usa window per persistenza globale
  if (typeof window !== 'undefined') {
    // Verifica se esiste già un client globale
    const existingClient = (window as any)[GLOBAL_CLIENT_KEY];
    if (existingClient && typeof existingClient === 'object') {
      // Verifica che il client sia valido controllando una proprietà essenziale
      if (existingClient.auth && existingClient.from) {
        return existingClient;
      }
    }

    // Crea una nuova istanza solo se non esiste o non è valida
    let client: SupabaseClient;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('⚠️ Supabase environment variables not found. Auth features will not work.');
      client = createClient(
        'https://placeholder.supabase.co',
        'placeholder-key',
        {
          global: {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          },
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            storageKey: STORAGE_KEY,
            storage: window.localStorage,
            detectSessionInUrl: false, // Disabilita rilevamento session in URL per evitare conflitti
          },
        }
      );
    } else {
      client = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        },
        db: {
          schema: 'public',
        },
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          storageKey: STORAGE_KEY,
          storage: window.localStorage,
          detectSessionInUrl: false, // Disabilita rilevamento session in URL per evitare conflitti
        },
      });
    }

    // Memorizza il client nel window object
    (window as any)[GLOBAL_CLIENT_KEY] = client;
    return client;
  }

  // In ambiente server-side (SSR), crea un nuovo client ogni volta
  // (non dovrebbe succedere in questo progetto, ma per sicurezza)
  if (!supabaseUrl || !supabaseAnonKey) {
    return createClient(
      'https://placeholder.supabase.co',
      'placeholder-key',
      {
        global: {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          storageKey: STORAGE_KEY,
        },
      }
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    },
    db: {
      schema: 'public',
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      storageKey: STORAGE_KEY,
    },
  });
}

// Inizializza il client Supabase immediatamente (singleton)
// Questo viene eseguito una sola volta quando il modulo viene caricato
const supabase: SupabaseClient = getSupabaseClient();

export { supabase };

// Helper per verificare se Supabase è configurato
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey);
};

// Helper per tipizzare le tabelle
export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          game_id: string;
          product_type_id: string;
          set: string | null;
          card_code: string | null;
          language: string;
          condition: string;
          price: number;
          status: 'DISPONIBILE' | 'VENDUTO' | 'PRENOTATO';
          description: string | null;
          featured: boolean;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
      reviews: {
        Row: {
          id: string;
          platform: 'Vinted' | 'CardTrader' | 'Wallapop';
          rating: number;
          title: string;
          text: string;
          author: string;
          review_date: string;
          screenshot_url: string | null;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>;
      };
    };
  };
};

