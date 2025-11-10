import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactModal from '@/components/ContactModal';
import OptimizedImage from '@/components/OptimizedImage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Send, Mail, Package, CreditCard, Shield, Plus, Check } from 'lucide-react';
import { getProductById } from '@/lib/products';
import { gameNames, conditionNames } from '@/lib/constants';
import { Product } from '@/lib/types';
import { useSelection } from '@/contexts/SelectionContext';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [contactModalOpen, setContactModalOpen] = useState(false);
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
      
      <main className="flex-1 py-6 sm:py-8 md:py-16">
        <div className="container mx-auto px-4">
          <Button variant="ghost" size="sm" asChild className="mb-6 sm:mb-8">
            <Link to={`/prodotti?game=${product.game}&type=${product.type}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Indietro
            </Link>
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-16 max-w-6xl mx-auto">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="rounded-lg border border-border overflow-hidden">
                <OptimizedImage
                  src={product.images[selectedImage] || '/placeholder.svg'}
                  alt={product.name}
                  aspectRatio="3/4"
                  priority={selectedImage === 0} // Prima immagine è prioritaria
                  className="rounded-lg"
                />
              </div>
              
              {product.images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`overflow-hidden rounded border-2 transition-smooth ${
                        selectedImage === index ? 'border-primary' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <OptimizedImage
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        aspectRatio="3/4"
                        className="rounded"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6 sm:space-y-8">
              {/* Header */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">
                    {gameNames[product.game]}
                  </Badge>
                  {isSold ? (
                    <Badge variant="destructive">Venduto</Badge>
                  ) : (
                    <Badge variant="default">Disponibile</Badge>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight">
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
                <div className="text-4xl font-bold">
                  €{product.price.toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Prezzo fisso, aggiornato in base al mercato (TCGplayer / Cardmarket)
                </p>
              </div>

              {/* CTA Buttons */}
              {!isSold && (
                <div className="space-y-3">
                  <Button 
                    size="lg" 
                    variant={inSelection ? "default" : "outline"}
                    className="w-full transition-smooth text-sm sm:text-base" 
                    onClick={handleToggleSelection}
                  >
                    {inSelection ? (
                      <>
                        <Check className="mr-2 h-4 sm:h-5 w-4 sm:w-5" />
                        Nella selezione
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 sm:h-5 w-4 sm:w-5" />
                        Aggiungi alla selezione
                      </>
                    )}
                  </Button>

                  <div className="grid grid-cols-2 gap-3">
                    <Button size="lg" variant="outline" className="transition-smooth text-sm sm:text-base" asChild>
                      <a href={`https://t.me/yourusername?text=Ciao! Sono interessato a: ${product.name}`} target="_blank" rel="noopener noreferrer">
                        <Send className="mr-2 h-4 sm:h-5 w-4 sm:w-5" />
                        <span className="hidden sm:inline">Telegram</span>
                        <span className="sm:hidden">TG</span>
                      </a>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="transition-smooth text-sm sm:text-base"
                      onClick={() => setContactModalOpen(true)}
                    >
                      <Mail className="mr-2 h-4 sm:h-5 w-4 sm:w-5" />
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
    </div>
  );
};

export default ProductDetail;
