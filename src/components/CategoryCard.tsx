import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { GameType } from '@/lib/types';

interface CategoryCardProps {
  game: GameType;
  title: string;
  image: string;
  count?: number;
}

const CategoryCard = ({ game, title, image, count }: CategoryCardProps) => {
  const [imageSrc, setImageSrc] = useState(image);
  const [hasError, setHasError] = useState(false);

  // Gestisce il fallback: JPG -> PNG -> placeholder
  const handleImageError = () => {
    if (imageSrc.endsWith('.jpg')) {
      // Prova PNG se JPG fallisce
      const pngSrc = imageSrc.replace('.jpg', '.png');
      setImageSrc(pngSrc);
    } else if (imageSrc.endsWith('.png')) {
      // Se anche PNG fallisce, usa placeholder
      setImageSrc('/placeholder.svg');
      setHasError(true);
    } else {
      // Se già su placeholder e fallisce, mostra messaggio
      setHasError(true);
    }
  };

  return (
    <Link to={`/categoria/${game}`}>
      <Card className="group relative overflow-hidden border-border bg-card transition-smooth hover:shadow-medium cursor-pointer">
        <div className="aspect-[4/3] overflow-hidden bg-accent relative">
          {!hasError ? (
            <>
              <img 
                src={imageSrc} 
                alt={title}
                className="w-full h-full object-cover transition-smooth group-hover:scale-105"
                onError={handleImageError}
              />
              {/* Leggerissimo overlay bianco */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                }}
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <span className="text-muted-foreground text-sm">Immagine non disponibile</span>
            </div>
          )}
        </div>
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-1.5">{title}</h3>
              {count !== undefined && (
                <p className="text-xs sm:text-sm text-muted-foreground">{count} {count === 1 ? 'carta disponibile' : 'carte disponibili'}</p>
              )}
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground transition-smooth group-hover:translate-x-1 group-hover:text-primary flex-shrink-0 ml-2" />
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default CategoryCard;
