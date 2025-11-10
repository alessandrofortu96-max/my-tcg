import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Inizializza Supabase solo se le variabili d'ambiente sono presenti
// Altrimenti crea un client "dummy" per evitare errori
let supabase: SupabaseClient;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables not found. Auth features will not work.');
  // Crea un client con valori placeholder per evitare errori
  // Le chiamate falliranno ma non crasheranno l'app
  supabase = createClient(
    'https://placeholder.supabase.co',
    'placeholder-key'
  );
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

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

