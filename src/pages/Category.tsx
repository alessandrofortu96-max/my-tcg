import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { HeroSection } from '@/components/HeroSection';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import ReviewCard from '@/components/ReviewCard';
import { ArrowRight } from 'lucide-react';
import { gameNames, typeNames } from '@/lib/constants';
import { GameType, ProductType, Product } from '@/lib/types';
import { getProductsByGame, getFeaturedProducts } from '@/lib/products';
import { getPublishedReviewsSync } from '@/lib/reviews';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

const Category = () => {
  const { game } = useParams<{ game: string }>();
  const gameType = game as GameType;

  const types: ProductType[] = ['raw', 'graded', 'sealed'];
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredReviews, setFeaturedReviews] = useState(getPublishedReviewsSync().slice(0, 3));

  // Map game types to image names
  const getHeroImage = (game: GameType): string => {
    const imageMap: Record<GameType, string> = {
      pokemon: 'pokemon',
      yugioh: 'yugioh',
      onepiece: 'onepiece',
      other: 'other',
    };
    return imageMap[game] || 'other';
  };

  const heroImageName = getHeroImage(gameType);

  // Load featured products (all featured, not filtered by game, like in home)
  useEffect(() => {
    const loadFeaturedProducts = async () => {
      // Get all featured products (same as home)
      const allFeatured = await getFeaturedProducts();
      setFeaturedProducts(allFeatured.slice(0, 4));
    };
    loadFeaturedProducts();
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <HeroSection imageName={heroImageName} minHeight="min-h-[400px]">
          <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20 lg:py-24">
            <div className="max-w-3xl mx-auto text-center space-y-4 sm:space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-gray-900 drop-shadow-sm">
                {gameNames[gameType]}
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed px-4 font-medium drop-shadow-sm">
                Esplora le carte disponibili dalla mia collezione
              </p>
            </div>
          </div>
        </HeroSection>

        {/* Types Grid */}
        <section className="py-12 sm:py-16 md:py-24 bg-accent/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {types.map(type => (
                <Link key={type} to={`/prodotti?game=${gameType}&type=${type}`}>
                  <Card className="group relative overflow-hidden border-border bg-card transition-smooth hover:shadow-medium cursor-pointer p-8">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg sm:text-xl font-semibold">
                          {typeNames[type]}
                        </h3>
                        <ArrowRight className="h-5 w-5 text-muted-foreground transition-smooth group-hover:translate-x-1 group-hover:text-primary flex-shrink-0 ml-2" />
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {type === 'raw' && 'Carte non gradate in ottime condizioni'}
                        {type === 'graded' && 'Carte certificate PSA, CGC, BGS'}
                        {type === 'sealed' && 'Booster box, Elite Trainer Box e prodotti sigillati'}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
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
                  <Link to={`/prodotti?game=${gameType}`}>
                    Vedi tutti
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {featuredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                              {featuredProducts.map((product, index) => (
                                <ProductCard 
                                  key={product.id} 
                                  product={product}
                                  priority={index < 2} // Prime 2 immagini sono prioritarie
                                />
                              ))}
                            </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Nessun prodotto in evidenza per {gameNames[gameType]} al momento.
                  </p>
                </div>
              )}

              <div className="text-center mt-8 sm:mt-12 md:hidden">
                <Button variant="outline" size="lg" asChild className="transition-smooth w-full sm:w-auto">
                  <Link to={`/prodotti?game=${gameType}`}>
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
          <section className="py-12 sm:py-16 md:py-24 bg-accent/30">
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

export default Category;
