import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactModal from '@/components/ContactModal';
import OptimizedImage from '@/components/OptimizedImage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Send, Mail, Package, CreditCard, Shield, Plus, Check, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { getProductById } from '@/lib/products';
import { gameNames, conditionNames } from '@/lib/constants';
import { Product } from '@/lib/types';
import { useSelection } from '@/contexts/SelectionContext';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const { addToSelection, removeFromSelection, isInSelection } = useSelection();
  
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const loadedProduct = await getProductById(id);
      setProduct(loadedProduct);
      setIsLoading(false);
    };
    loadProduct();
  }, [id]);

  // Sincronizza il carosello con l'indice selezionato
  useEffect(() => {
    if (!api) {
      return;
    }

    api.on('select', () => {
      setSelectedImage(api.selectedScrollSnap());
    });
  }, [api]);

  // Cambia slide quando cambia selectedImage (da thumbnail)
  useEffect(() => {
    if (!api || !product) {
      return;
    }

    const currentIndex = api.selectedScrollSnap();
    if (currentIndex !== selectedImage && selectedImage >= 0 && selectedImage < product.images.length) {
      api.scrollTo(selectedImage);
    }
  }, [selectedImage, api, product]);
  
  const inSelection = product ? isInSelection(product.id) : false;
  const isSold = product?.status === 'sold';

  const handleToggleSelection = () => {
    if (!product) return;
    
    if (inSelection) {
      removeFromSelection(product.id);
    } else {
      addToSelection(product);
    }
  };

  const handleImageClick = (index: number) => {
    setLightboxImageIndex(index);
    setLightboxOpen(true);
  };

  const handleLightboxNext = () => {
    if (!product) return;
    setLightboxImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const handleLightboxPrev = () => {
    if (!product) return;
    setLightboxImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  // Sincronizza il lightbox con l'immagine selezionata quando si apre
  useEffect(() => {
    if (lightboxOpen) {
      setLightboxImageIndex(selectedImage);
    }
  }, [lightboxOpen, selectedImage]);

  // Gestione tasti da tastiera nel lightbox
  useEffect(() => {
    if (!lightboxOpen || !product) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setLightboxImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setLightboxImageIndex((prev) => (prev + 1) % product.images.length);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setLightboxOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, product]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Caricamento prodotto...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Prodotto non trovato</h1>
            <Button asChild>
              <Link to="/">Torna alla home</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-4 sm:py-6 md:py-8 lg:py-16">
        <div className="container mx-auto px-4">
          <Button variant="ghost" size="sm" asChild className="mb-4 sm:mb-6 md:mb-8">
            <Link to={`/prodotti?game=${product.game}&type=${product.type}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Indietro
            </Link>
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-16 max-w-6xl mx-auto">
            {/* Image Gallery with Carousel */}
            <div className="space-y-3 sm:space-y-4">
              {product.images.length > 0 ? (
                <>
                  {/* Carousel principale */}
                  <div className="relative rounded-lg border border-border overflow-hidden bg-accent group">
                    <Carousel 
                      setApi={setApi} 
                      className="w-full"
                      opts={{
                        align: 'start',
                        loop: false,
                      }}
                    >
                      <CarouselContent className="-ml-0">
                        {product.images.map((image, index) => (
                          <CarouselItem key={index} className="pl-0">
                            <div 
                              className="relative w-full cursor-pointer" 
                              style={{ aspectRatio: '3/4' }}
                              onClick={() => handleImageClick(index)}
                            >
                              <OptimizedImage
                                src={image || '/placeholder.svg'}
                                alt={`${product.name} - Immagine ${index + 1}`}
                                aspectRatio="3/4"
                                priority={index === 0}
                                className="rounded-lg w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                              />
                              {/* Icona per indicare che è cliccabile */}
                              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg opacity-0 group-hover:opacity-100">
                                <Maximize2 className="h-8 w-8 text-white drop-shadow-lg" />
                              </div>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      {product.images.length > 1 && (
                        <>
                          <CarouselPrevious className="left-2 sm:left-4 bg-background/80 hover:bg-background border-2" />
                          <CarouselNext className="right-2 sm:right-4 bg-background/80 hover:bg-background border-2" />
                        </>
                      )}
                    </Carousel>
                    
                    {/* Indicatore slide corrente (es. 1/3) */}
                    {product.images.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded backdrop-blur-sm z-10">
                        {selectedImage + 1} / {product.images.length}
                      </div>
                    )}
                    
                    {/* Indicatore clicca per ingrandire */}
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded backdrop-blur-sm z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      Clicca per ingrandire
                    </div>
                  </div>
                  
                  {/* Thumbnail navigation */}
                  {product.images.length > 1 && (
                    <div className="grid grid-cols-5 gap-2">
                      {product.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`overflow-hidden rounded border-2 transition-smooth ${
                            selectedImage === index 
                              ? 'border-primary ring-2 ring-primary ring-offset-2' 
                              : 'border-border hover:border-primary/50'
                          }`}
                          aria-label={`Vai all'immagine ${index + 1}`}
                        >
                          <OptimizedImage
                            src={image}
                            alt={`${product.name} thumbnail ${index + 1}`}
                            aspectRatio="3/4"
                            className="rounded"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-lg border border-border overflow-hidden bg-accent flex items-center justify-center" style={{ aspectRatio: '3/4' }}>
                  <p className="text-muted-foreground">Nessuna immagine disponibile</p>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              {/* Header */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-sm">
                    {gameNames[product.game]}
                  </Badge>
                  {isSold ? (
                    <Badge variant="destructive" className="text-sm">Venduto</Badge>
                  ) : (
                    <Badge variant="default" className="text-sm">Disponibile</Badge>
                  )}
                </div>

                <h1 className="text-3xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight">
                  {product.name}
                </h1>
                
                <p className="text-base sm:text-lg text-muted-foreground">
                  {product.set} • {product.cardCode} • {product.language}
                </p>
              </div>

              {/* Specs */}
              <Card className="p-6 space-y-3 bg-accent/50">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Condizione:</span>
                  <span className="font-medium">{conditionNames[product.condition]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lingua:</span>
                  <span className="font-medium">{product.language}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Provenienza:</span>
                  <span className="font-medium">Collezione privata</span>
                </div>
              </Card>

              {/* Description */}
              {product.description && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Descrizione</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Price */}
              <div className="space-y-2">
                <div className="text-4xl sm:text-5xl font-bold">
                  €{product.price.toFixed(2)}
                </div>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Prezzo fisso, aggiornato in base al mercato (TCGplayer / Cardmarket)
                </p>
              </div>

              {/* CTA Buttons */}
              {!isSold && (
                <div className="space-y-3">
                  <Button 
                    size="lg" 
                    variant={inSelection ? "default" : "outline"}
                    className="w-full transition-smooth text-base" 
                    onClick={handleToggleSelection}
                  >
                    {inSelection ? (
                      <>
                        <Check className="mr-2 h-5 w-5" />
                        Nella selezione
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-5 w-5" />
                        Aggiungi alla selezione
                      </>
                    )}
                  </Button>

                  <div className="grid grid-cols-2 gap-3">
                    <Button size="lg" variant="outline" className="transition-smooth text-base" asChild>
                      <a href={`${import.meta.env.VITE_TELEGRAM_URL || 'https://t.me/yourusername'}?text=Ciao! Sono interessato a: ${product.name}`} target="_blank" rel="noopener noreferrer">
                        <Send className="mr-2 h-5 w-5" />
                        Telegram
                      </a>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="transition-smooth text-base"
                      onClick={() => setContactModalOpen(true)}
                    >
                      <Mail className="mr-2 h-5 w-5" />
                      Email
                    </Button>
                  </div>
                </div>
              )}

              {/* Shipping & Payment Info */}
              <Card className="p-6 space-y-4 bg-premium-gradient">
                <h3 className="font-semibold flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Spedizione e Pagamento
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Spedizione tracciata</p>
                      <p className="text-muted-foreground">Top loader, bubble mailer e tracking incluso</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CreditCard className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Metodi di pagamento</p>
                      <p className="text-muted-foreground">Bonifico, PayPal "beni e servizi", contanti ritiro a mano</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Disclaimer */}
              <Card className="p-4 bg-accent/30 border-accent">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground block mb-2">Vendita tra privati – cessione occasionale di beni personali</strong>
                  Questo sito presenta la mia collezione privata di carte TCG e facilita il contatto per trattative private. Non svolgo attività commerciale in forma organizzata, non acquisto merce da rivendere e non effettuo checkout online. I pagamenti avvengono off-site (es. PayPal/bonifico) dopo contatto diretto.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      
      {product && (
        <ContactModal 
          open={contactModalOpen} 
          onOpenChange={setContactModalOpen}
          product={product}
        />
      )}

      {/* Lightbox per immagini a schermo intero */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent 
          className="!max-w-none !w-screen !h-screen !max-h-screen !p-0 !border-0 !bg-black/95 !translate-x-0 !translate-y-0 !left-0 !top-0 !grid-none lightbox-dialog"
          onClick={(e) => {
            // Chiudi se si clicca sullo sfondo (non sull'immagine)
            if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('lightbox-overlay')) {
              setLightboxOpen(false);
            }
          }}
        >
          <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-6 md:p-8 lightbox-overlay overflow-auto">
            {/* Pulsante chiudi */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="fixed top-4 right-4 z-[60] p-2 sm:p-3 rounded-full bg-black/70 hover:bg-black/90 text-white transition-colors shadow-lg"
              aria-label="Chiudi lightbox"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            {/* Immagine */}
            {product.images[lightboxImageIndex] && (
              <div className="relative w-full min-h-full flex items-center justify-center py-16 sm:py-20 md:py-24">
                <img
                  src={product.images[lightboxImageIndex]}
                  alt={`${product.name} - Immagine ${lightboxImageIndex + 1}`}
                  className="max-w-[min(90vw,1400px)] max-h-[min(85vh,1400px)] w-auto h-auto object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            {/* Pulsanti navigazione */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLightboxPrev();
                  }}
                  className="fixed left-4 sm:left-6 top-1/2 -translate-y-1/2 z-[60] p-2 sm:p-3 rounded-full bg-black/70 hover:bg-black/90 text-white transition-colors shadow-lg"
                  aria-label="Immagine precedente"
                >
                  <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLightboxNext();
                  }}
                  className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-[60] p-2 sm:p-3 rounded-full bg-black/70 hover:bg-black/90 text-white transition-colors shadow-lg"
                  aria-label="Immagine successiva"
                >
                  <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </>
            )}

            {/* Indicatore immagine corrente */}
            {product.images.length > 1 && (
              <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] bg-black/70 text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-full backdrop-blur-sm shadow-lg">
                {lightboxImageIndex + 1} / {product.images.length}
              </div>
            )}

            {/* Istruzioni tastiera */}
            <div className="fixed bottom-4 right-4 z-[60] bg-black/50 text-white text-xs px-2 sm:px-3 py-1.5 sm:py-2 rounded backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity hidden sm:block">
              <p>← → Naviga | ESC Esci</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductDetail;
