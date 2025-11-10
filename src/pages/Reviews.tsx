import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReviewCard from '@/components/ReviewCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getPublishedReviews, getPublishedReviewsSync, ReviewPlatform, getAverageRating, getTotalReviewsCount, Review } from '@/lib/reviews';

const Reviews = () => {
  const [platformFilter, setPlatformFilter] = useState<ReviewPlatform | 'all'>('all');
  const [ratingFilter, setRatingFilter] = useState<'all' | '5' | '4+'>('all');
  const [allReviews, setAllReviews] = useState<Review[]>(getPublishedReviewsSync());

  // Load reviews on mount (async)
  useEffect(() => {
    const loadReviews = async () => {
      const reviews = await getPublishedReviews();
      setAllReviews(reviews);
    };
    loadReviews();
  }, []);

  const filteredReviews = allReviews.filter((review) => {
    const matchesPlatform = platformFilter === 'all' || review.platform === platformFilter;
    const matchesRating =
      ratingFilter === 'all' ||
      (ratingFilter === '5' && review.rating === 5) ||
      (ratingFilter === '4+' && review.rating >= 4);
    return matchesPlatform && matchesRating;
  });

  const FilterButton = ({ 
    active, 
    onClick, 
    children 
  }: { 
    active: boolean; 
    onClick: () => void; 
    children: React.ReactNode;
  }) => (
    <Button
      variant={active ? 'default' : 'outline'}
      size="sm"
      onClick={onClick}
      className="transition-smooth text-xs sm:text-sm"
    >
      {children}
    </Button>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-border bg-premium-gradient">
          <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
            <div className="max-w-3xl mx-auto text-center space-y-4 sm:space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                Recensioni verificate (esterne)
              </h1>
              
              {/* Stats */}
              {getTotalReviewsCount() > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                  <Badge variant="outline" className="text-base sm:text-lg px-4 py-2">
                    <Star className="h-4 w-4 sm:h-5 sm:w-5 mr-2 fill-primary text-primary" />
                    {getAverageRating()}/5
                  </Badge>
                  <Badge variant="outline" className="text-base sm:text-lg px-4 py-2">
                    {getTotalReviewsCount()} recensioni
                  </Badge>
                </div>
              )}
              
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed px-4">
                Selezione di feedback ricevuti su piattaforme terze. Ogni recensione riporta un link allo screenshot dell'originale. Username e date sono ripresi dalla fonte.
              </p>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="border-b border-border bg-background">
          <div className="container mx-auto px-4 py-6 sm:py-8">
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-xs sm:text-sm font-medium mb-3 text-muted-foreground">
                  Piattaforma
                </h3>
                <div className="flex flex-wrap gap-2">
                  <FilterButton
                    active={platformFilter === 'all'}
                    onClick={() => setPlatformFilter('all')}
                  >
                    Tutte
                  </FilterButton>
                  <FilterButton
                    active={platformFilter === 'Vinted'}
                    onClick={() => setPlatformFilter('Vinted')}
                  >
                    Vinted
                  </FilterButton>
                  <FilterButton
                    active={platformFilter === 'CardTrader'}
                    onClick={() => setPlatformFilter('CardTrader')}
                  >
                    CardTrader
                  </FilterButton>
                  <FilterButton
                    active={platformFilter === 'Wallapop'}
                    onClick={() => setPlatformFilter('Wallapop')}
                  >
                    Wallapop
                  </FilterButton>
                </div>
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-medium mb-3 text-muted-foreground">
                  Valutazione
                </h3>
                <div className="flex flex-wrap gap-2">
                  <FilterButton
                    active={ratingFilter === 'all'}
                    onClick={() => setRatingFilter('all')}
                  >
                    Tutte
                  </FilterButton>
                  <FilterButton
                    active={ratingFilter === '5'}
                    onClick={() => setRatingFilter('5')}
                  >
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    5★
                  </FilterButton>
                  <FilterButton
                    active={ratingFilter === '4+'}
                    onClick={() => setRatingFilter('4+')}
                  >
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    4★+
                  </FilterButton>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews List */}
        <section className="py-12 sm:py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
              {filteredReviews.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Nessuna recensione trovata con i filtri selezionati.
                </div>
              ) : (
                filteredReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))
              )}
            </div>

            {/* Disclaimer */}
            <div className="max-w-4xl mx-auto mt-12 sm:mt-16 p-4 sm:p-6 bg-accent/30 rounded-lg">
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Le recensioni sono testimonianze pubbliche pubblicate su piattaforme terze. Gli screenshot sono riprodotti a scopo di prova; eventuali dati personali non pertinenti sono oscurati. Per rimozioni o rettifiche: info@my-tcg.it
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Reviews;
