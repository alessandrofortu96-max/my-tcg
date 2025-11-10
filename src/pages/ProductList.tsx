import { useSearchParams, Link } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { getProducts, getProductsByGame, getProductsByType } from '@/lib/products';
import { gameNames, typeNames } from '@/lib/constants';
import { Product } from '@/lib/types';
import { GameType, ProductType } from '@/lib/types';
import { DEFAULT_PAGE_SIZE } from '@/lib/pagination';

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const game = searchParams.get('game') as GameType | null;
  const type = searchParams.get('type') as ProductType | null;
  const page = parseInt(searchParams.get('page') || '1', 10);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      let loadedProducts: Product[] = [];
      
      // Carica prodotti con filtri
      // Nota: per ora usiamo paginazione client-side per mantenere compatibilità
      // In futuro possiamo spostare la paginazione server-side per migliori performance
      if (game && type) {
        // Filter by both game and type
        const allProducts = await getProducts() as Product[];
        loadedProducts = allProducts.filter(p => p.game === game && p.type === type);
      } else if (game) {
        loadedProducts = await getProductsByGame(game);
      } else if (type) {
        loadedProducts = await getProductsByType(type);
      } else {
        loadedProducts = await getProducts() as Product[];
      }
      
      // Applica paginazione client-side per ora (verrà spostata server-side)
      const startIndex = (page - 1) * DEFAULT_PAGE_SIZE;
      const endIndex = startIndex + DEFAULT_PAGE_SIZE;
      const paginatedProducts = loadedProducts.slice(startIndex, endIndex);
      const calculatedTotalPages = Math.ceil(loadedProducts.length / DEFAULT_PAGE_SIZE);
      
      setProducts(paginatedProducts);
      setTotalPages(calculatedTotalPages);
      setTotal(loadedProducts.length);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [game, type, page]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

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
                      <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
                        <div className="max-w-4xl mx-auto">
                          <Button variant="ghost" size="sm" asChild className="mb-4 sm:mb-6">
                            <Link to={game ? `/categoria/${game}` : '/'}>
                              <ArrowLeft className="mr-2 h-4 w-4" />
                              Indietro
                            </Link>
                          </Button>
                          
                          <h1 className="text-3xl sm:text-4xl md:text-4xl font-bold tracking-tight mb-2">
                            {title}
                          </h1>
                          <p className="text-base sm:text-base text-muted-foreground">
                            {isLoading 
                              ? 'Caricamento...' 
                              : `${total} ${total === 1 ? 'prodotto' : 'prodotti'}${totalPages > 1 ? ` • Pagina ${page} di ${totalPages}` : ''}`
                            }
                          </p>
                        </div>
                      </div>
                    </section>

                    <section className="py-8 sm:py-12 md:py-16">
                      <div className="container mx-auto px-4">
                        <div className="max-w-6xl mx-auto">
                          {isLoading ? (
                            <div className="text-center py-12 sm:py-16">
                              <p className="text-muted-foreground text-base sm:text-lg">Caricamento prodotti...</p>
                            </div>
                          ) : products.length === 0 ? (
                            <div className="text-center py-12 sm:py-16">
                              <p className="text-muted-foreground text-base sm:text-lg">
                                Nessun prodotto trovato con questi filtri.
                              </p>
                            </div>
                          ) : (
                            <>
                              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                                {products.map(product => (
                                  <ProductCard key={product.id} product={product} />
                                ))}
                              </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-12 flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newParams = new URLSearchParams(searchParams);
                          if (page > 1) {
                            newParams.set('page', (page - 1).toString());
                          } else {
                            newParams.delete('page');
                          }
                          setSearchParams(newParams);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        disabled={page === 1 || isLoading}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Precedente
                      </Button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum: number;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (page <= 3) {
                            pageNum = i + 1;
                          } else if (page >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = page - 2 + i;
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={pageNum === page ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => {
                                const newParams = new URLSearchParams(searchParams);
                                if (pageNum === 1) {
                                  newParams.delete('page');
                                } else {
                                  newParams.set('page', pageNum.toString());
                                }
                                setSearchParams(newParams);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              disabled={isLoading}
                              className="min-w-[40px]"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newParams = new URLSearchParams(searchParams);
                          newParams.set('page', (page + 1).toString());
                          setSearchParams(newParams);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        disabled={page >= totalPages || isLoading}
                      >
                        Successiva
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  )}
                </>
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
