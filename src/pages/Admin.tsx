import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const queryClient = useQueryClient();
  const [filterGame, setFilterGame] = useState<GameType | 'all'>('all');
  const [filterType, setFilterType] = useState<ProductType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState<any>(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce per la ricerca (evita troppi filtri durante la digitazione)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms di delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // React Query per caricare i prodotti
  const { data: products = [], isLoading, isRefetching } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      // Carica tutti i prodotti (inclusi non pubblicati per admin)
      return await getProducts(true);
    },
    staleTime: 60000, // Considera i dati freschi per 60 secondi (aumentato)
    refetchOnWindowFocus: false, // Non refetch quando si torna alla finestra
    refetchOnMount: false, // Non refetch quando si monta il componente (usa cache se disponibile)
    refetchOnReconnect: true, // Refetch solo quando si riconnette
    gcTime: 300000, // Mantieni in cache per 5 minuti (precedentemente cacheTime)
  });

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await auth.getCurrentUser();
      setUser(currentUser);
    };
    loadData();
  }, []);

  // Memoizza i conteggi dei prodotti per categoria
  const productCounts = useMemo(() => {
    return {
      pokemon: products.filter(p => p.game === 'pokemon').length,
      yugioh: products.filter(p => p.game === 'yugioh').length,
      onepiece: products.filter(p => p.game === 'onepiece').length,
      other: products.filter(p => p.game === 'other').length,
    };
  }, [products]);

  // Memoizza i prodotti filtrati (evita ricalcoli ad ogni render)
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesGame = filterGame === 'all' || product.game === filterGame;
      const matchesType = filterType === 'all' || product.type === filterType;
      const matchesSearch = debouncedSearchTerm === '' || 
        product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        product.set.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        product.cardCode.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      return matchesGame && matchesType && matchesSearch;
    });
  }, [products, filterGame, filterType, debouncedSearchTerm]);

  // Mutation per toggle featured
  const toggleFeaturedMutation = useMutation({
    mutationFn: toggleProductFeatured,
    onSuccess: () => {
      // Invalida solo la query (React Query refetch automaticamente se necessario)
      // NON chiamare refetchQueries esplicitamente per evitare race condition
      // Non usare await per non bloccare l'UI
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
      // Non usare await per non bloccare l'UI
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
      // Non usare await per non bloccare l'UI
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

  // Memoizza le funzioni handler per evitare re-render inutili
  const handleToggleFeatured = useCallback((productId: string) => {
    // Previeni click multipli
    if (toggleFeaturedMutation.isPending) return;
    toggleFeaturedMutation.mutate(productId);
  }, [toggleFeaturedMutation]);

  const handleToggleStatus = useCallback((productId: string, currentStatus: 'available' | 'sold') => {
    // Previeni click multipli
    if (toggleStatusMutation.isPending) return;
    toggleStatusMutation.mutate(productId);
  }, [toggleStatusMutation]);

  const handleDelete = useCallback((productId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo prodotto?')) {
      return;
    }
    // Previeni click multipli
    if (deleteMutation.isPending) return;
    deleteMutation.mutate(productId);
  }, [deleteMutation]);

  const handleLogout = useCallback(async () => {
    await auth.signOut();
    toast({
      title: "Logout effettuato",
      description: "Alla prossima!",
    });
    navigate('/', { replace: true });
  }, [toast, navigate]);

  // Stato di loading combinato (query o refetch)
  const isLoadingData = isLoading || isRefetching;

  if (isLoading && products.length === 0) {
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
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex h-14 sm:h-16 items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <Button variant="ghost" size="sm" asChild className="h-9 sm:h-10 px-2 sm:px-3">
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Torna al sito</span>
                </Link>
              </Button>
              <h1 className="text-lg sm:text-xl font-bold truncate">Dashboard</h1>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" asChild className="transition-smooth h-9 sm:h-10 px-2 sm:px-3">
                <Link to="/dashboard/recensioni">
                  <Star className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Recensioni</span>
                </Link>
              </Button>
              
              <Button 
                className="transition-smooth h-9 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm" 
                onClick={() => navigate('/dashboard/prodotti/nuovo')}
              >
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Nuovo annuncio</span>
                <span className="sm:hidden">Nuovo</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout} 
                className="transition-smooth h-9 sm:h-10 px-2 sm:px-3"
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        {/* Game Categories Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
          <Card className="p-4 sm:p-6 hover:shadow-medium transition-smooth cursor-pointer" onClick={() => setFilterGame('pokemon')}>
            <div className="space-y-1 sm:space-y-2">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold">Pokémon</h3>
              <p className="text-2xl sm:text-3xl font-bold text-primary">
                {productCounts.pokemon}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">prodotti disponibili</p>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 hover:shadow-medium transition-smooth cursor-pointer" onClick={() => setFilterGame('yugioh')}>
            <div className="space-y-1 sm:space-y-2">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold">Yu-Gi-Oh!</h3>
              <p className="text-2xl sm:text-3xl font-bold text-primary">
                {productCounts.yugioh}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">prodotti disponibili</p>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 hover:shadow-medium transition-smooth cursor-pointer" onClick={() => setFilterGame('onepiece')}>
            <div className="space-y-1 sm:space-y-2">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold">One Piece</h3>
              <p className="text-2xl sm:text-3xl font-bold text-primary">
                {productCounts.onepiece}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">prodotti disponibili</p>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 hover:shadow-medium transition-smooth cursor-pointer" onClick={() => setFilterGame('other')}>
            <div className="space-y-1 sm:space-y-2">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold">Altri prodotti</h3>
              <p className="text-2xl sm:text-3xl font-bold text-primary">
                {productCounts.other}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">prodotti disponibili</p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 sm:p-6 mb-4 sm:mb-6 md:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="text-sm font-medium mb-2 block">Cerca</label>
              <Input
                placeholder="Nome carta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 sm:h-11"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Gioco</label>
              <select
                className="w-full h-10 sm:h-11 rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                className="w-full h-10 sm:h-11 rounded-md border border-input bg-background px-3 py-2 text-sm"
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
        <div className="space-y-3 sm:space-y-4">
          {filteredProducts.length === 0 ? (
            <Card className="p-8 sm:p-12 text-center">
              <p className="text-sm sm:text-base text-muted-foreground">
                {products.length === 0 
                  ? 'Nessun prodotto disponibile. Aggiungi i primi prodotti da Supabase.'
                  : 'Nessun prodotto trovato con questi filtri.'
                }
              </p>
            </Card>
          ) : (
            filteredProducts.map(product => (
              <Card key={product.id} className="p-4 sm:p-6 hover:shadow-medium transition-smooth">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  <div className="w-full sm:w-32 h-48 sm:h-40 flex-shrink-0 rounded overflow-hidden bg-accent">
                    <img 
                      src={product.images[0] || '/placeholder.svg'} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-2 sm:space-y-3 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg sm:text-xl font-semibold mb-1 break-words">{product.name}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {product.set} • {product.cardCode}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          {gameNames[product.game]}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {typeNames[product.type]}
                        </Badge>
                        <Badge variant={product.status === 'available' ? 'default' : 'destructive'} className="text-xs">
                          {product.status === 'available' ? 'Disponibile' : 'Venduto'}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                      <span className="text-muted-foreground">Lingua: {product.language}</span>
                      <span className="text-muted-foreground hidden sm:inline">•</span>
                      <span className="text-muted-foreground">Condizione: {product.condition}</span>
                      <span className="text-muted-foreground hidden sm:inline">•</span>
                      <span className="font-semibold text-base sm:text-lg">€{product.price.toFixed(2)}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button 
                        variant={product.featured ? "default" : "outline"} 
                        size="sm"
                        onClick={() => handleToggleFeatured(product.id)}
                        disabled={toggleFeaturedMutation.isPending || isLoadingData}
                        className="transition-smooth text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                      >
                        <Star className={`h-3 w-3 sm:h-4 sm:w-4 sm:mr-2 ${product.featured ? 'fill-current' : ''}`} />
                        <span className="hidden sm:inline">{product.featured ? 'In evidenza' : 'Metti in evidenza'}</span>
                        <span className="sm:hidden">{product.featured ? 'In evidenza' : 'Evidenza'}</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleToggleStatus(product.id, product.status)}
                        disabled={toggleStatusMutation.isPending || isLoadingData}
                        className="transition-smooth text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                      >
                        <span className="hidden sm:inline">{product.status === 'available' ? 'Marca come venduto' : 'Marca disponibile'}</span>
                        <span className="sm:hidden">{product.status === 'available' ? 'Venduto' : 'Disponibile'}</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/dashboard/prodotti/${product.id}/modifica`)}
                        disabled={isLoadingData}
                        className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Modifica</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        disabled={deleteMutation.isPending || isLoadingData}
                        className="transition-smooth text-destructive hover:text-destructive text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                      >
                        <Archive className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Elimina</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        asChild
                        className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                      >
                        <Link to={`/prodotto/${product.id}`} target="_blank">
                          <span className="hidden sm:inline">Vedi scheda</span>
                          <span className="sm:hidden">Vedi</span>
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
