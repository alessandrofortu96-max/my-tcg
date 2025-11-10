import { useEffect, useState, useRef } from 'react';
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
  const hasCheckedAuthRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    let authSubscription: { unsubscribe: () => void } | null = null;

    const checkAuth = async () => {
      // Evita di eseguire il check più di una volta
      if (hasCheckedAuthRef.current) return;
      hasCheckedAuthRef.current = true;

      if (!isSupabaseConfigured()) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        // Prima verifica la session esistente (più veloce)
        const { session } = await auth.getSession();
        if (session && isMounted) {
          // Session esiste, verifica l'utente
          const currentUser = await auth.getCurrentUser();
          if (currentUser && isMounted) {
            setUser(currentUser);
            setIsLoading(false);
          } else if (isMounted) {
            // Session esiste ma utente non trovato, redirect a login
            setIsLoading(false);
            navigate('/login', { replace: true });
          }
        } else if (isMounted) {
          // Nessuna session, redirect a login
          setIsLoading(false);
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        if (isMounted) {
          setIsLoading(false);
          navigate('/login', { replace: true });
        }
      }

      // Setup auth state listener solo una volta
      if (isSupabaseConfigured() && isMounted) {
        try {
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!isMounted) return;

            if (!session) {
              setUser(null);
              // Evita loop: naviga solo se non siamo già sulla pagina di login
              const currentPath = window.location.pathname;
              if (currentPath !== '/login' && !currentPath.startsWith('/login')) {
                navigate('/login', { replace: true });
              }
            } else {
              try {
                const currentUser = await auth.getCurrentUser();
                if (currentUser && isMounted) {
                  setUser(currentUser);
                } else if (isMounted) {
                  setUser(null);
                  const currentPath = window.location.pathname;
                  if (currentPath !== '/login' && !currentPath.startsWith('/login')) {
                    navigate('/login', { replace: true });
                  }
                }
              } catch (error) {
                console.error('Error getting user on auth state change:', error);
                if (isMounted) {
                  setUser(null);
                }
              }
            }
          });
          authSubscription = subscription;
        } catch (error) {
          console.error('Error setting up auth state listener:', error);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
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

