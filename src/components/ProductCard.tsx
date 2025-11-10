import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Product } from '@/lib/types';
import { gameNames } from '@/lib/constants';
import { useSelection } from '@/contexts/SelectionContext';
import { Plus, Check } from 'lucide-react';
import OptimizedImage from '@/components/OptimizedImage';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

const ProductCard = ({ product, priority = false }: ProductCardProps) => {
  const { addToSelection, removeFromSelection, isInSelection } = useSelection();
  const inSelection = isInSelection(product.id);
  const isSold = product.status === 'sold';

  const handleToggleSelection = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (inSelection) {
      removeFromSelection(product.id);
    } else {
      addToSelection(product);
    }
  };

  // Assicurati che ci sia almeno un'immagine
  const productImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : '/placeholder.svg';

  return (
    <Card className="group overflow-hidden border-border bg-card transition-smooth hover:shadow-medium">
      <Link to={`/prodotto/${product.id}`}>
        <div className="overflow-hidden relative" style={{ aspectRatio: '3/4' }}>
          <OptimizedImage
            src={productImage}
            alt={product.name}
            aspectRatio="3/4"
            priority={priority}
            className="transition-transform duration-300 group-hover:scale-105 w-full h-full object-cover"
          />
          {product.images && product.images.length > 1 && (
            <div className="absolute top-2 right-2 bg-black/60 text-white text-xs font-medium px-2 py-1 rounded backdrop-blur-sm">
              {product.images.length} foto
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 mb-1.5 sm:mb-2 flex-wrap">
            <Badge variant="outline" className="text-xs sm:text-sm">
              {gameNames[product.game]}
            </Badge>
            {isSold && (
              <Badge variant="destructive" className="text-xs sm:text-sm">
                Venduto
              </Badge>
            )}
          </div>
          
          <Link to={`/prodotto/${product.id}`}>
            <h3 className="text-lg sm:text-xl md:text-lg font-semibold leading-tight transition-smooth group-hover:text-primary line-clamp-2">
              {product.name}
            </h3>
          </Link>
          
          <p className="text-sm sm:text-base text-muted-foreground line-clamp-1">
            {product.set} • {product.cardCode}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 pt-1.5 sm:pt-2 min-w-0">
          <div className="text-2xl sm:text-2xl md:text-xl lg:text-2xl font-bold flex-shrink-0">
            €{product.price.toFixed(2)}
          </div>
          
          <Button 
            variant={inSelection ? "default" : "outline"} 
            size="sm"
            onClick={handleToggleSelection}
            disabled={isSold}
            className="transition-smooth w-full sm:w-auto sm:flex-shrink-0 text-xs sm:text-sm whitespace-nowrap max-w-full"
          >
            {isSold ? (
              <span className="truncate">Non disponibile</span>
            ) : inSelection ? (
              <>
                <Check className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>In selezione</span>
              </>
            ) : (
              <>
                <Plus className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>Aggiungi</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
