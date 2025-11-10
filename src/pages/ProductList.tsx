import { useSearchParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { mockProducts, gameNames, typeNames } from '@/lib/mockData';
import { GameType, ProductType } from '@/lib/types';

const ProductList = () => {
  const [searchParams] = useSearchParams();
  const game = searchParams.get('game') as GameType | null;
  const type = searchParams.get('type') as ProductType | null;

  const filteredProducts = mockProducts.filter(product => {
    if (game && product.game !== game) return false;
    if (type && product.type !== type) return false;
    return true;
  });

  const title = game && type 
    ? `${gameNames[game]} - ${typeNames[type]}`
    : game 
    ? gameNames[game]
    : 'Tutti i prodotti';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <section className="border-b border-border bg-premium-gradient">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto">
              <Button variant="ghost" size="sm" asChild className="mb-6">
                <Link to={game ? `/categoria/${game}` : '/'}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Indietro
                </Link>
              </Button>
              
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                {title}
              </h1>
              <p className="text-muted-foreground">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'prodotto' : 'prodotti'}
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground text-lg">
                    Nessun prodotto trovato con questi filtri.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ProductList;
