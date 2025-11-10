import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface SelectionItem {
  id: string;
  name: string;
  game: string;
  type: string;
  set: string;
  cardCode: string;
  language: string;
  condition: string;
  price: number;
  images: string[];
  status: string;
  description?: string;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SelectionData {
  version: number;
  updated_at: string;
  items: SelectionItem[];
}

interface SelectionContextType {
  selection: Product[];
  addToSelection: (product: Product) => void;
  removeFromSelection: (productId: string) => void;
  clearSelection: () => void;
  isInSelection: (productId: string) => boolean;
  totalPrice: number;
}

const SELECTION_KEY = 'mytcg_selection_v1';
const SELECTION_VERSION = 1;

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export const SelectionProvider = ({ children }: { children: ReactNode }) => {
  const [selection, setSelection] = useState<Product[]>([]);
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount (only once)
  useEffect(() => {
    if (isInitialized) return;
    
    const saved = localStorage.getItem(SELECTION_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        // Check if it's the new format
        if (parsed.version === SELECTION_VERSION && parsed.items && Array.isArray(parsed.items)) {
          // New format: convert SelectionItem[] to Product[]
          const products: Product[] = parsed.items.map((item: SelectionItem) => ({
            ...item,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt),
          }));
          setSelection(products);
          if (products.length > 0) {
            toast({
              title: "Selezione ripristinata",
              description: `${products.length} ${products.length === 1 ? 'articolo' : 'articoli'} ripristinati`,
            });
          }
        } else if (Array.isArray(parsed)) {
          // Old format: array of products directly
          const products: Product[] = parsed.map((p: any) => ({
            ...p,
            createdAt: p.createdAt instanceof Date ? p.createdAt : new Date(p.createdAt),
            updatedAt: p.updatedAt instanceof Date ? p.updatedAt : new Date(p.updatedAt),
          }));
          setSelection(products);
          
          // Migrate to new format
          const migratedData: SelectionData = {
            version: SELECTION_VERSION,
            updated_at: new Date().toISOString(),
            items: products.map(p => ({
              id: p.id,
              name: p.name,
              game: p.game,
              type: p.type,
              set: p.set,
              cardCode: p.cardCode,
              language: p.language,
              condition: p.condition,
              price: p.price,
              images: p.images,
              status: p.status,
              description: p.description,
              featured: p.featured,
              createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : new Date(p.createdAt).toISOString(),
              updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : new Date(p.updatedAt).toISOString(),
            })),
          };
          localStorage.setItem(SELECTION_KEY, JSON.stringify(migratedData));
          
          if (products.length > 0) {
            toast({
              title: "Selezione ripristinata",
              description: `${products.length} ${products.length === 1 ? 'articolo' : 'articoli'} ripristinati`,
            });
          }
        }
      } catch (e) {
        console.error('Failed to load selection:', e);
        // Clear invalid data
        localStorage.removeItem(SELECTION_KEY);
      }
    }
    setIsInitialized(true);
  }, [toast, isInitialized]);

  // Save to localStorage on change (only after initialization)
  useEffect(() => {
    if (!isInitialized) return;

    const data: SelectionData = {
      version: SELECTION_VERSION,
      updated_at: new Date().toISOString(),
      items: selection.map(product => ({
        id: product.id,
        name: product.name,
        game: product.game,
        type: product.type,
        set: product.set,
        cardCode: product.cardCode,
        language: product.language,
        condition: product.condition,
        price: product.price,
        images: product.images,
        status: product.status,
        description: product.description,
        featured: product.featured,
        createdAt: product.createdAt instanceof Date ? product.createdAt.toISOString() : new Date(product.createdAt).toISOString(),
        updatedAt: product.updatedAt instanceof Date ? product.updatedAt.toISOString() : new Date(product.updatedAt).toISOString(),
      })),
    };
    localStorage.setItem(SELECTION_KEY, JSON.stringify(data));
  }, [selection, isInitialized]);

  const addToSelection = (product: Product) => {
    if (!isInSelection(product.id)) {
      setSelection(prev => [...prev, product]);
      toast({
        title: "Aggiunto alla selezione",
        description: `${product.name} è stato aggiunto alla tua selezione`,
      });
    }
  };

  const removeFromSelection = (productId: string) => {
    setSelection(prev => prev.filter(p => p.id !== productId));
    toast({
      title: "Rimosso dalla selezione",
      description: "Prodotto rimosso dalla selezione",
    });
  };

  const clearSelection = () => {
    setSelection([]);
    toast({
      title: "Selezione svuotata",
      description: "Tutti i prodotti sono stati rimossi",
    });
  };

  const isInSelection = (productId: string) => {
    return selection.some(p => p.id === productId);
  };

  const totalPrice = selection.reduce((sum, product) => sum + product.price, 0);

  return (
    <SelectionContext.Provider value={{
      selection,
      addToSelection,
      removeFromSelection,
      clearSelection,
      isInSelection,
      totalPrice,
    }}>
      {children}
    </SelectionContext.Provider>
  );
};

export const useSelection = () => {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelection must be used within SelectionProvider');
  }
  return context;
};
