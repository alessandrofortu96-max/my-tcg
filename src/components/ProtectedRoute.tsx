import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '@/lib/auth';
import { AuthUser } from '@/lib/auth';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isSupabaseConfigured()) {
        // Se Supabase non è configurato, mostra un errore
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await auth.getCurrentUser();
        if (!currentUser) {
          navigate('/login', { replace: true });
        } else {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        navigate('/login', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen to auth state changes solo se Supabase è configurato
    if (isSupabaseConfigured()) {
      try {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!session) {
            navigate('/login', { replace: true });
            setUser(null);
          } else {
            try {
              const currentUser = await auth.getCurrentUser();
              setUser(currentUser);
            } catch (error) {
              console.error('Error getting user on auth state change:', error);
            }
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error setting up auth state listener:', error);
      }
    }
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md p-6">
          <h1 className="text-2xl font-bold">Supabase non configurato</h1>
          <p className="text-muted-foreground">
            Le variabili d'ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY non sono configurate.
            Controlla il file .env.local
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

