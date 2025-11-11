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
          // Flag per prevenire loop infiniti
          let isHandlingAuthChange = false;
          
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!isMounted) return;
            
            // Previeni loop: se stiamo già gestendo un cambio, ignora
            if (isHandlingAuthChange) {
              console.log('[ProtectedRoute] Already handling auth change, skipping...');
              return;
            }

            console.log('[ProtectedRoute] Auth state change:', event, session ? 'session exists' : 'no session');

            isHandlingAuthChange = true;

            try {
              // Gestisci eventi specifici
              if (event === 'TOKEN_REFRESHED') {
                console.log('[ProtectedRoute] Token refreshed successfully');
                // Il token è stato rinnovato, aggiorna l'utente (senza chiamare getCurrentUser per evitare loop)
                // La sessione esiste, quindi l'utente è autenticato
                if (isMounted && session) {
                  // Usa direttamente i dati della sessione invece di chiamare getCurrentUser
                  const userFromSession = session.user;
                  if (userFromSession) {
                    setUser({
                      id: userFromSession.id,
                      email: userFromSession.email || '',
                    });
                  }
                }
                isHandlingAuthChange = false;
                return;
              }

              if (event === 'SIGNED_OUT' || (event === 'USER_UPDATED' && !session)) {
                console.log('[ProtectedRoute] User signed out');
                setUser(null);
                // Evita loop: naviga solo se non siamo già sulla pagina di login
                const currentPath = window.location.pathname;
                if (currentPath !== '/login' && !currentPath.startsWith('/login') && isMounted) {
                  navigate('/login', { replace: true });
                }
                isHandlingAuthChange = false;
                return;
              }

              if (!session) {
                console.log('[ProtectedRoute] No session');
                setUser(null);
                // Evita loop: naviga solo se non siamo già sulla pagina di login
                const currentPath = window.location.pathname;
                if (currentPath !== '/login' && !currentPath.startsWith('/login') && isMounted) {
                  navigate('/login', { replace: true });
                }
                isHandlingAuthChange = false;
                return;
              }

              // Session esiste: usa direttamente i dati della sessione invece di chiamare getCurrentUser
              // Questo previene loop infiniti
              if (session.user && isMounted) {
                setUser({
                  id: session.user.id,
                  email: session.user.email || '',
                });
              }
            } catch (error) {
              console.error('[ProtectedRoute] Error in auth state change handler:', error);
            } finally {
              isHandlingAuthChange = false;
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

