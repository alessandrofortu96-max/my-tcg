import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-12 sm:py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto space-y-6">
            <div className="space-y-2">
              <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold text-primary">404</h1>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                Pagina non trovata
              </h2>
              <p className="text-muted-foreground">
                La pagina che stai cercando non esiste o è stata spostata.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="transition-smooth">
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  Torna alla home
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="transition-smooth"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Torna indietro
              </Button>
            </div>

            <div className="pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4">
                Forse stai cercando:
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/prodotti">Prodotti</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/recensioni">Recensioni</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/contatti">Contatti</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
