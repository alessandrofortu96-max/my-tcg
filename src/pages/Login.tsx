import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Lock, ArrowLeft, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Redirect se già loggato
  useEffect(() => {
    const checkAuth = async () => {
      if (isSupabaseConfigured()) {
        const isAuth = await auth.isAuthenticated();
        if (isAuth) {
          navigate('/dashboard', { replace: true });
        }
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { user, error } = await auth.signIn(formData.email, formData.password);

    if (error) {
      toast({
        title: "Errore di accesso",
        description: error,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (user) {
      toast({
        title: "Login effettuato",
        description: "Benvenuto nell'area riservata",
      });
      navigate('/dashboard', { replace: true });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-premium-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna al sito
            </Link>
          </Button>
          
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-primary/10">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold tracking-tight">
            Area Riservata
          </h1>
          <p className="text-muted-foreground">
            Accedi per gestire i tuoi annunci
          </p>
        </div>

        {!isSupabaseConfigured() && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Supabase non configurato</strong>
              <p className="mt-2 text-sm">
                Le variabili d'ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY non sono configurate.
                Controlla il file .env.local e riavvia il server di sviluppo.
              </p>
            </AlertDescription>
          </Alert>
        )}

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@my-tcg.it"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full transition-smooth"
              disabled={isLoading}
            >
              {isLoading ? 'Accesso in corso...' : 'Accedi'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-center text-muted-foreground">
              Questa è un'area riservata al proprietario del sito.<br />
              Per domande, usa il <Link to="/contatti" className="underline hover:text-primary">form contatti</Link>.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;

