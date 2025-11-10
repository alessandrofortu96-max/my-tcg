import { useSearchParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Send, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getProductById } from '@/lib/products';
import { Product } from '@/lib/types';

const Contact = () => {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('product');
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(!!productId);
  
  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) {
        setIsLoadingProduct(false);
        return;
      }
      const loadedProduct = await getProductById(productId);
      setProduct(loadedProduct);
      setIsLoadingProduct(false);
      if (loadedProduct) {
        setFormData(prev => ({
          ...prev,
          message: `Ciao! Sono interessato a: ${loadedProduct.name}`,
        }));
      }
    };
    loadProduct();
  }, [productId]);
  
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    honeypot: '', // Anti-bot field
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Honeypot check - se compilato è un bot
    if (formData.honeypot) {
      console.log('Bot detected');
      return;
    }
    
    setIsSubmitting(true);

    // Simulazione invio - da sostituire con chiamata backend reale
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Messaggio inviato!",
      description: "Ti risponderò al più presto via email.",
    });
    
    setFormData({ name: '', email: '', phone: '', message: '', honeypot: '' });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <section className="border-b border-border bg-premium-gradient">
          <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20 lg:py-24">
            <div className="max-w-3xl mx-auto text-center space-y-4 sm:space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                Contatti
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed px-4 font-medium">
                Scrivimi per qualsiasi domanda o per acquistare una carta
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 md:py-24 bg-accent/30">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
              {/* Telegram CTA */}
              <Card className="p-6 sm:p-8 bg-primary text-primary-foreground">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">
                      Preferisci una risposta veloce?
                    </h3>
                    <p className="text-sm sm:text-base opacity-90">
                      Contattami direttamente su Telegram per una chat istantanea
                    </p>
                  </div>
                  <Button 
                    size="lg" 
                    variant="secondary"
                    asChild
                    className="flex-shrink-0"
                  >
                    <a 
                      href={`${import.meta.env.VITE_TELEGRAM_URL || 'https://t.me/yourusername'}${product ? `?text=Ciao! Sono interessato a: ${product.name}` : ''}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Send className="mr-2 h-5 w-5" />
                      Apri Telegram
                    </a>
                  </Button>
                </div>
              </Card>

              {/* Email Form */}
              <Card className="p-6 sm:p-8">
                <div className="mb-6">
                  <h3 className="text-xl sm:text-2xl font-semibold mb-2 flex items-center gap-2">
                    <Mail className="h-5 w-5 sm:h-6 sm:w-6" />
                    Oppure inviami un'email
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Compila il modulo e ti risponderò entro 24 ore
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Honeypot field - nascosto per utenti reali */}
                  <div className="hidden" aria-hidden="true">
                    <Input
                      type="text"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formData.honeypot}
                      onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Il tuo nome"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      maxLength={100}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tua@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      maxLength={255}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Cellulare *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+39 123 456 7890"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      maxLength={20}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Messaggio *</Label>
                    <Textarea
                      id="message"
                      placeholder="Scrivi qui il tuo messaggio..."
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      maxLength={1000}
                    />
                    <p className="text-xs text-muted-foreground">* Campi obbligatori</p>
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full transition-smooth"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Invio in corso...' : 'Invia messaggio'}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Inviando accetti la <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>.
                  </p>
                </form>
              </Card>

              <p className="text-center text-xs sm:text-sm text-muted-foreground">
                Ti risponderò il prima possibile. I dati che mi invii vengono utilizzati solo per rispondere alla tua richiesta.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
