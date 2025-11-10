import { Link, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CategoryCard from '@/components/CategoryCard';
import ProductCard from '@/components/ProductCard';
import ReviewCard from '@/components/ReviewCard';
import { HeroSection } from '@/components/HeroSection';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { getProducts, getFeaturedProducts } from '@/lib/products';
import { gameNames } from '@/lib/constants';
import { getPublishedReviewsSync } from '@/lib/reviews';
import { Product } from '@/lib/types';
import { useState, useEffect } from 'react';
import { useSelection } from '@/contexts/SelectionContext';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

const Home = () => {
  const [searchParams] = useSearchParams();
  const { addToSelection, isInSelection } = useSelection();
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredReviews, setFeaturedReviews] = useState(getPublishedReviewsSync().slice(0, 3));
  const [productCounts, setProductCounts] = useState({ pokemon: 0, yugioh: 0, onepiece: 0, other: 0 });

  // Load products on mount
  useEffect(() => {
    const loadProducts = async () => {
      const allProducts = await getProducts();
      setProducts(allProducts);
      
      // Featured products
      const featured = await getFeaturedProducts();
      setFeaturedProducts(featured.slice(0, 4));
      
      // Count by game
      setProductCounts({
        pokemon: allProducts.filter(p => p.game === 'pokemon').length,
        yugioh: allProducts.filter(p => p.game === 'yugioh').length,
        onepiece: allProducts.filter(p => p.game === 'onepiece').length,
        other: allProducts.filter(p => p.game === 'other').length,
      });
    };
    loadProducts();
  }, []);

  // Load reviews on mount (async)
  useEffect(() => {
    const loadReviews = async () => {
      const { getPublishedReviews } = await import('@/lib/reviews');
      const reviews = await getPublishedReviews();
      setFeaturedReviews(reviews.slice(0, 3));
    };
    loadReviews();
  }, []);

  // Handle shared selection from URL (?sel=id1,id2,id3)
  useEffect(() => {
    const selParam = searchParams.get('sel');
    if (selParam && products.length > 0) {
      try {
        const productIds = selParam.split(',').filter(Boolean);
        productIds.forEach((productId) => {
          const product = products.find(p => p.id === productId);
          if (product && !isInSelection(productId)) {
            addToSelection(product);
          }
        });
        // Remove sel parameter from URL
        if (productIds.length > 0) {
          const newSearchParams = new URLSearchParams(searchParams);
          newSearchParams.delete('sel');
          const newUrl = `${window.location.pathname}${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ''}`;
          window.history.replaceState({}, '', newUrl);
        }
      } catch (error) {
        console.error('Error parsing shared selection:', error);
      }
    }
  }, [searchParams, addToSelection, isInSelection, products]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection imageName="home" minHeight="min-h-[500px]">
          <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20 lg:py-32">
            <div className="max-w-3xl mx-auto text-center space-y-4 sm:space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-gray-900">
                Collezione privata di carte TCG
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed px-4 font-medium">
                Pokémon, Yu-Gi-Oh! e One Piece – carte singole, gradate e prodotti sigillati selezionati dalla mia collezione personale.
              </p>
            </div>
          </div>
        </HeroSection>

        {/* Categories Grid */}
        <section className="py-12 sm:py-16 md:py-24 bg-accent/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              <CategoryCard 
                game="pokemon"
                title="Pokémon"
                image="/images/categories/pokemon.jpg"
                count={productCounts.pokemon}
              />
              <CategoryCard 
                game="yugioh"
                title="Yu-Gi-Oh!"
                image="/images/categories/yugioh.jpg"
                count={productCounts.yugioh}
              />
              <CategoryCard 
                game="onepiece"
                title="One Piece"
                image="/images/categories/onepiece.jpg"
                count={productCounts.onepiece}
              />
              <CategoryCard 
                game="other"
                title="Altri prodotti"
                image="/images/categories/other.jpg"
                count={productCounts.other}
              />
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-12 sm:py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-8 sm:mb-12">
                <div className="space-y-2 sm:space-y-3">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                    In evidenza oggi
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Selezione di carte particolarmente interessanti dalla mia collezione
                  </p>
                </div>
                <Button variant="link" asChild className="hidden md:flex">
                  <Link to="/prodotti">
                    Vedi tutti
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {featuredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Nessun prodotto in evidenza al momento.
                  </p>
                </div>
              )}

              <div className="text-center mt-8 sm:mt-12 md:hidden">
                <Button variant="outline" size="lg" asChild className="transition-smooth w-full sm:w-auto">
                  <Link to="/prodotti">
                    Vedi tutti i prodotti
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        {featuredReviews.length > 0 && (
          <section className="py-12 sm:py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8 sm:mb-12">
                  <div className="space-y-2 sm:space-y-3">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                      Dicono di me
                    </h2>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Feedback reali da Vinted, CardTrader e Wallapop
                    </p>
                  </div>
                  <Button variant="link" asChild className="hidden md:flex">
                    <Link to="/recensioni">
                      Leggi tutte
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                <Carousel
                  opts={{
                    align: 'start',
                    loop: true,
                  }}
                  className="w-full"
                >
                  <CarouselContent className="-ml-2 md:-ml-4">
                    {featuredReviews.map((review) => (
                      <CarouselItem key={review.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                        <ReviewCard review={review} compact />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="hidden md:flex" />
                  <CarouselNext className="hidden md:flex" />
                </Carousel>

                <div className="text-center mt-8 sm:mt-12 md:hidden">
                  <Link 
                    to="/recensioni" 
                    className="text-sm sm:text-base text-primary hover:underline transition-smooth font-medium"
                  >
                    Leggi tutte le recensioni →
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Home;
