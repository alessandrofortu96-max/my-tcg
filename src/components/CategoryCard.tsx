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
  return (
    <Link to={`/categoria/${game}`}>
      <Card className="group relative overflow-hidden border-border bg-card transition-smooth hover:shadow-medium cursor-pointer">
        <div className="aspect-[4/3] overflow-hidden bg-accent">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover transition-smooth group-hover:scale-105"
          />
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-1">{title}</h3>
              {count !== undefined && (
                <p className="text-sm text-muted-foreground">{count} carte disponibili</p>
              )}
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground transition-smooth group-hover:translate-x-1 group-hover:text-primary" />
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default CategoryCard;
