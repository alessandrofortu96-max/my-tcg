import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { GameType } from '@/lib/types';
import OptimizedImage from '@/components/OptimizedImage';

interface CategoryCardProps {
  game: GameType;
  title: string;
  image: string;
  count?: number;
}

const CategoryCard = ({ game, title, image, count }: CategoryCardProps) => {
  const [imageSrc, setImageSrc] = useState(image);

  // Gestisce il fallback: JPG -> PNG -> placeholder
  const handleImageError = () => {
    if (imageSrc.endsWith('.jpg')) {
      // Prova PNG se JPG fallisce
      setImageSrc(imageSrc.replace('.jpg', '.png'));
    } else if (imageSrc.endsWith('.png')) {
      // Se anche PNG fallisce, usa placeholder
      setImageSrc('/placeholder.svg');
    }
  };

  return (
    <Link to={`/categoria/${game}`}>
      <Card className="group relative overflow-hidden border-border bg-card transition-smooth hover:shadow-medium cursor-pointer">
        <div className="relative">
          <OptimizedImage
            src={imageSrc}
            alt={title}
            aspectRatio="4/3"
            priority={false}
            className="transition-transform duration-300 group-hover:scale-105"
            fallback="/placeholder.svg"
            onError={handleImageError}
          />
          {/* Leggerissimo overlay bianco */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
            }}
          />
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
