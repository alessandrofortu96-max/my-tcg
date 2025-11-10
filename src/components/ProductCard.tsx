import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Product } from '@/lib/types';
import { gameNames } from '@/lib/mockData';
import { useSelection } from '@/contexts/SelectionContext';
import { Plus, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
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

  return (
    <Card className="group overflow-hidden border-border bg-card transition-smooth hover:shadow-medium">
      <Link to={`/prodotto/${product.id}`}>
        <div className="aspect-[3/4] overflow-hidden bg-accent">
          <img 
            src={product.images[0]} 
            alt={product.name}
            className="w-full h-full object-cover transition-smooth group-hover:scale-105"
          />
        </div>
      </Link>
      
      <div className="p-4 space-y-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {gameNames[product.game]}
            </Badge>
            {isSold && (
              <Badge variant="destructive" className="text-xs">
                Venduto
              </Badge>
            )}
          </div>
          
          <Link to={`/prodotto/${product.id}`}>
            <h3 className="font-semibold text-sm sm:text-base leading-tight transition-smooth group-hover:text-primary line-clamp-2">
              {product.name}
            </h3>
          </Link>
          
          <p className="text-xs text-muted-foreground line-clamp-1">
            {product.set} • {product.cardCode}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
          <div className="text-xl sm:text-2xl font-bold">
            €{product.price.toFixed(2)}
          </div>
          
          <Button 
            variant={inSelection ? "default" : "outline"} 
            size="sm" 
            onClick={handleToggleSelection}
            disabled={isSold}
            className="transition-smooth w-full sm:w-auto text-xs"
          >
            {isSold ? (
              'Non disponibile'
            ) : inSelection ? (
              <>
                <Check className="mr-1 h-3 w-3" />
                In selezione
              </>
            ) : (
              <>
                <Plus className="mr-1 h-3 w-3" />
                Aggiungi
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
