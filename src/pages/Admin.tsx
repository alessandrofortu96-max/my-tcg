import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Archive, ArrowLeft, Star, LogOut } from 'lucide-react';
import { gameNames, typeNames } from '@/lib/constants';
import { GameType, ProductType, Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/auth';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getProducts, toggleProductFeatured, toggleProductStatus, deleteProduct } from '@/lib/products';

const Admin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [filterGame, setFilterGame] = useState<GameType | 'all'>('all');
  const [filterType, setFilterType] = useState<ProductType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState<any>(null);

  // React Query per caricare i prodotti
  const { data: products = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      // Carica tutti i prodotti (inclusi non pubblicati per admin)
      return await getProducts(true);
    },
    staleTime: 0, // Sempre considera i dati stale per refetch immediato
  });

  // Refetch quando si torna alla dashboard (es. dopo creazione/modifica prodotto)
  useEffect(() => {
    if (location.pathname === '/dashboard') {
      refetch();
    }
  }, [location.pathname, refetch]);

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await auth.getCurrentUser();
      setUser(currentUser);
    };
    loadData();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesGame = filterGame === 'all' || product.game === filterGame;
    const matchesType = filterType === 'all' || product.type === filterType;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesGame && matchesType && matchesSearch;
  });

  // Mutation per toggle featured
  const toggleFeaturedMutation = useMutation({
    mutationFn: toggleProductFeatured,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({
        title: "Aggiornato",
        description: "Stato 'In evidenza' modificato con successo",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Impossibile aggiornare il prodotto",
        variant: "destructive",
      });
    },
  });

  // Mutation per toggle status
  const toggleStatusMutation = useMutation({
    mutationFn: toggleProductStatus,
    onSuccess: (newStatus) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({
        title: "Aggiornato",
        description: `Prodotto marcato come ${newStatus === 'sold' ? 'venduto' : 'disponibile'}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Impossibile aggiornare lo stato",
        variant: "destructive",
      });
    },
  });

  // Mutation per delete
  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({
        title: "Eliminato",
        description: "Prodotto eliminato con successo",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Impossibile eliminare il prodotto",
        variant: "destructive",
      });
    },
  });

  const handleToggleFeatured = async (productId: string) => {
    toggleFeaturedMutation.mutate(productId);
  };

  const handleToggleStatus = async (productId: string, currentStatus: 'available' | 'sold') => {
    toggleStatusMutation.mutate(productId);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo prodotto?')) {
      return;
    }
    deleteMutation.mutate(productId);
  };

  const handleLogout = async () => {
    await auth.signOut();
    toast({
      title: "Logout effettuato",
      description: "Alla prossima!",
    });
    navigate('/', { replace: true });
  };

  // Count products by game
  const productCounts = {
    pokemon: products.filter(p => p.game === 'pokemon').length,
    yugioh: products.filter(p => p.game === 'yugioh').length,
    onepiece: products.filter(p => p.game === 'onepiece').length,
    other: products.filter(p => p.game === 'other').length,
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <header className="border-b border-border bg-background/95 backdrop-blur">
            <div className="container mx-auto px-4">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Torna al sito
                    </Link>
                  </Button>
                  <h1 className="text-xl font-bold">Dashboard</h1>
                </div>
              </div>
            </div>
          </header>
          <main className="container mx-auto px-4 py-8">
            <p className="text-muted-foreground">Caricamento...</p>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Torna al sito
                </Link>
              </Button>
              <h1 className="text-xl font-bold">Dashboard</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild className="transition-smooth">
                <Link to="/dashboard/recensioni">
                  <Star className="mr-2 h-4 w-4" />
                  Recensioni
                </Link>
              </Button>
              
              <Button className="transition-smooth" onClick={() => navigate('/dashboard/prodotti/nuovo')}>
                <Plus className="mr-2 h-4 w-4" />
                Nuovo annuncio
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleLogout} className="transition-smooth">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Game Categories Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 hover:shadow-medium transition-smooth cursor-pointer" onClick={() => setFilterGame('pokemon')}>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Pokémon</h3>
              <p className="text-3xl font-bold text-primary">
                {productCounts.pokemon}
              </p>
              <p className="text-sm text-muted-foreground">prodotti disponibili</p>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-medium transition-smooth cursor-pointer" onClick={() => setFilterGame('yugioh')}>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Yu-Gi-Oh!</h3>
              <p className="text-3xl font-bold text-primary">
                {productCounts.yugioh}
              </p>
              <p className="text-sm text-muted-foreground">prodotti disponibili</p>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-medium transition-smooth cursor-pointer" onClick={() => setFilterGame('onepiece')}>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">One Piece</h3>
              <p className="text-3xl font-bold text-primary">
                {productCounts.onepiece}
              </p>
              <p className="text-sm text-muted-foreground">prodotti disponibili</p>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-medium transition-smooth cursor-pointer" onClick={() => setFilterGame('other')}>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Altri prodotti</h3>
              <p className="text-3xl font-bold text-primary">
                {productCounts.other}
              </p>
              <p className="text-sm text-muted-foreground">prodotti disponibili</p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Cerca</label>
              <Input
                placeholder="Nome carta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Gioco</label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                value={filterGame}
                onChange={(e) => setFilterGame(e.target.value as GameType | 'all')}
              >
                <option value="all">Tutti i giochi</option>
                <option value="pokemon">Pokémon</option>
                <option value="yugioh">Yu-Gi-Oh!</option>
                <option value="onepiece">One Piece</option>
                <option value="other">Altri prodotti</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Tipo</label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as ProductType | 'all')}
              >
                <option value="all">Tutti i tipi</option>
                <option value="raw">RAW</option>
                <option value="graded">Gradate</option>
                <option value="sealed">Sigillati</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Products List */}
        <div className="space-y-4">
          {filteredProducts.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                {products.length === 0 
                  ? 'Nessun prodotto disponibile. Aggiungi i primi prodotti da Supabase.'
                  : 'Nessun prodotto trovato con questi filtri.'
                }
              </p>
            </Card>
          ) : (
            filteredProducts.map(product => (
              <Card key={product.id} className="p-6 hover:shadow-medium transition-smooth">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-32 h-40 flex-shrink-0 rounded overflow-hidden bg-accent">
                    <img 
                      src={product.images[0] || '/placeholder.svg'} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="text-xl font-semibold mb-1">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {product.set} • {product.cardCode}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Badge variant="outline">
                          {gameNames[product.game]}
                        </Badge>
                        <Badge variant="outline">
                          {typeNames[product.type]}
                        </Badge>
                        <Badge variant={product.status === 'available' ? 'default' : 'destructive'}>
                          {product.status === 'available' ? 'Disponibile' : 'Venduto'}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">Lingua: {product.language}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">Condizione: {product.condition}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="font-semibold text-lg">€{product.price.toFixed(2)}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button 
                        variant={product.featured ? "default" : "outline"} 
                        size="sm"
                        onClick={() => handleToggleFeatured(product.id)}
                        className="transition-smooth"
                      >
                        <Star className={`mr-2 h-4 w-4 ${product.featured ? 'fill-current' : ''}`} />
                        {product.featured ? 'In evidenza' : 'Metti in evidenza'}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleToggleStatus(product.id, product.status)}
                        className="transition-smooth"
                      >
                        {product.status === 'available' ? 'Marca come venduto' : 'Marca disponibile'}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/dashboard/prodotti/${product.id}/modifica`)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Modifica
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        className="transition-smooth text-destructive hover:text-destructive"
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        Elimina
                      </Button>
                      
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/prodotto/${product.id}`} target="_blank">
                          Vedi scheda
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
    </ProtectedRoute>
  );
};

export default Admin;
