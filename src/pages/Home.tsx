import { Link, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CategoryCard from '@/components/CategoryCard';
import ProductCard from '@/components/ProductCard';
import ReviewCard from '@/components/ReviewCard';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { mockProducts } from '@/lib/mockData';
import { getPublishedReviewsSync } from '@/lib/reviews';
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
  const featuredProducts = mockProducts.filter(p => p.featured && p.status === 'available').slice(0, 4);
  const [featuredReviews, setFeaturedReviews] = useState(getPublishedReviewsSync().slice(0, 3));

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
    if (selParam) {
      try {
        const productIds = selParam.split(',').filter(Boolean);
        productIds.forEach((productId) => {
          const product = mockProducts.find(p => p.id === productId);
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
  }, [searchParams, addToSelection, isInSelection]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b border-border bg-premium-gradient">
          <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20 lg:py-32">
            <div className="max-w-3xl mx-auto text-center space-y-4 sm:space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                Liquidazione Collezione TCG Privata
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed px-4">
                Carte RAW, gradate e prodotti sigillati di Pokémon, One Piece e Yu-Gi-Oh! – 
                provenienti esclusivamente dalla mia collezione personale.
              </p>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-12 sm:py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              <CategoryCard 
                game="pokemon"
                title="Pokémon"
                image="/placeholder.svg"
                count={mockProducts.filter(p => p.game === 'pokemon').length}
              />
              <CategoryCard 
                game="yugioh"
                title="Yu-Gi-Oh!"
                image="/placeholder.svg"
                count={mockProducts.filter(p => p.game === 'yugioh').length}
              />
              <CategoryCard 
                game="onepiece"
                title="One Piece"
                image="/placeholder.svg"
                count={mockProducts.filter(p => p.game === 'onepiece').length}
              />
              <CategoryCard 
                game="other"
                title="Altri prodotti"
                image="/placeholder.svg"
                count={mockProducts.filter(p => p.game === 'other').length}
              />
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-12 sm:py-16 md:py-24 bg-accent/30">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mb-8 sm:mb-12 space-y-2 sm:space-y-3">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                In evidenza oggi
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground">
                Alcune delle carte più interessanti disponibili in questo momento
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="text-center">
              <Button variant="outline" size="lg" asChild className="transition-smooth w-full sm:w-auto">
                <Link to="/prodotti">
                  Vedi tutti i prodotti
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        {featuredReviews.length > 0 && (
          <section className="py-12 sm:py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl mb-8 sm:mb-12 space-y-2 sm:space-y-3">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                  Recensioni dei miei acquirenti
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground">
                  Feedback reali da Vinted, CardTrader e Wallapop – selezione dalla mia attività da collezionista.
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Le recensioni provengono da profili pubblici su piattaforme terze. Gli screenshot sono disponibili come prova.
                </p>
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

              <div className="text-center mt-8 sm:mt-12">
                <Link 
                  to="/recensioni" 
                  className="text-sm sm:text-base text-primary hover:underline transition-smooth font-medium"
                >
                  Leggi tutte le recensioni →
                </Link>
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
