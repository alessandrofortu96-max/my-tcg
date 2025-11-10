import { Link } from 'react-router-dom';
import { Shield, PackageCheck, CreditCard, MapPin, Star } from 'lucide-react';
import { getAverageRating, getTotalReviewsCount } from '@/lib/reviews';

const Footer = () => {
  const trustItems = [
    {
      icon: Shield,
      title: 'Foto reali',
      description: 'Tutte le foto sono delle carte effettive in vendita',
    },
    {
      icon: PackageCheck,
      title: 'Provenienza privata',
      description: 'Collezione personale, non compro per rivendere',
    },
    {
      icon: CreditCard,
      title: 'Pagamenti tracciabili',
      description: 'Bonifico, PayPal beni e servizi, contanti a mano',
    },
    {
      icon: MapPin,
      title: 'Spedizione protetta',
      description: 'Top loader, bubble mailer e tracking incluso',
    },
  ];

  return (
    <footer className="border-t border-border bg-accent/30">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {trustItems.map((item, index) => (
            <div key={index} className="flex flex-col items-center text-center space-y-3">
              <div className="p-4 sm:p-4 rounded-lg bg-background">
                <item.icon className="h-7 w-7 sm:h-6 sm:w-6 text-primary" />
              </div>
              <h3 className="text-xl sm:text-lg md:text-xl font-semibold">{item.title}</h3>
              <p className="text-base sm:text-base text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-6 sm:pt-8 space-y-4">
          {/* Reviews Summary */}
          {getTotalReviewsCount() > 0 && (
            <div className="text-center pb-4">
              <Link 
                to="/recensioni"
                className="inline-flex items-center gap-2 text-sm sm:text-base text-muted-foreground hover:text-primary transition-smooth"
              >
                <Star className="h-5 w-5 fill-primary text-primary" />
                <span>
                  {getAverageRating()}/5 su {getTotalReviewsCount()} recensioni – Vinted, CardTrader, Wallapop
                </span>
                <span className="font-medium">· Leggi tutte</span>
              </Link>
            </div>
          )}

          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed px-4">
              <strong className="text-foreground">Vendita tra privati – cessione occasionale di beni personali.</strong><br />
              Questo sito presenta la mia collezione privata di carte TCG e facilita il contatto per trattative private. Non svolgo attività commerciale in forma organizzata, non acquisto merce da rivendere e non effettuo checkout online. I pagamenti avvengono off-site (es. PayPal/bonifico) dopo contatto diretto.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-sm sm:text-base">
            <Link to="/privacy-policy" className="text-muted-foreground hover:text-primary transition-smooth">
              Privacy
            </Link>
            <span className="text-muted-foreground hidden sm:inline">•</span>
            <Link to="/cookie-policy" className="text-muted-foreground hover:text-primary transition-smooth">
              Cookie
            </Link>
            <span className="text-muted-foreground hidden sm:inline">•</span>
            <button className="text-muted-foreground hover:text-primary transition-smooth">
              Impostazioni cookie
            </button>
            <span className="text-muted-foreground hidden sm:inline">•</span>
            <Link to="/nota-legale" className="text-muted-foreground hover:text-primary transition-smooth">
              Nota legale
            </Link>
          </div>
          
          <p className="text-sm sm:text-base text-muted-foreground text-center">
            © {new Date().getFullYear()} my-tcg.it - Tutti i diritti riservati
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
