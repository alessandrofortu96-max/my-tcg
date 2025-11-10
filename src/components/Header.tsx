import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useSelection } from '@/contexts/SelectionContext';
import SelectionDrawer from '@/components/SelectionDrawer';

const Header = () => {
  const { selection } = useSelection();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <img 
                src="/logo.svg" 
                alt="My-TCG.it" 
                className="h-8 w-8 md:h-10 md:w-10"
              />
              <span className="text-lg md:text-xl font-bold tracking-tight hidden sm:inline">My-TCG.it</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
              <Link to="/categoria/pokemon" className="text-sm font-medium transition-smooth hover:text-primary">
                Pokémon
              </Link>
              <Link to="/categoria/yugioh" className="text-sm font-medium transition-smooth hover:text-primary">
                Yu-Gi-Oh!
              </Link>
              <Link to="/categoria/onepiece" className="text-sm font-medium transition-smooth hover:text-primary">
                One Piece
              </Link>
              <Link to="/categoria/other" className="text-sm font-medium transition-smooth hover:text-primary">
                Altri prodotti
              </Link>
              <Link to="/recensioni" className="text-sm font-medium transition-smooth hover:text-primary">
                Recensioni
              </Link>
              <Link to="/contatti" className="text-sm font-medium transition-smooth hover:text-primary">
                Contatti
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setDrawerOpen(true)}
                className="relative transition-smooth"
              >
                <ShoppingBag className="h-5 w-5" />
                {selection.length > 0 && (
                  <Badge 
                    variant="default" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {selection.length}
                  </Badge>
                )}
                <span className="ml-2 hidden sm:inline">Selezione ({selection.length})</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <nav className="md:hidden py-4 border-t border-border animate-fade-in">
              <div className="flex flex-col space-y-3">
                <Link 
                  to="/categoria/pokemon" 
                  className="text-sm font-medium transition-smooth hover:text-primary py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pokémon
                </Link>
                <Link 
                  to="/categoria/yugioh" 
                  className="text-sm font-medium transition-smooth hover:text-primary py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Yu-Gi-Oh!
                </Link>
                <Link 
                  to="/categoria/onepiece" 
                  className="text-sm font-medium transition-smooth hover:text-primary py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  One Piece
                </Link>
                <Link 
                  to="/categoria/other" 
                  className="text-sm font-medium transition-smooth hover:text-primary py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Altri prodotti
                </Link>
                <Link 
                  to="/recensioni" 
                  className="text-sm font-medium transition-smooth hover:text-primary py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Recensioni
                </Link>
                <Link 
                  to="/contatti" 
                  className="text-sm font-medium transition-smooth hover:text-primary py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contatti
                </Link>
              </div>
            </nav>
          )}
        </div>
      </header>

      <SelectionDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  );
};

export default Header;
