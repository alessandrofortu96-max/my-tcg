import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit, Trash2, ArrowLeft, Eye, EyeOff, Star, LogOut, Upload } from 'lucide-react';
import {
  getAllReviewsSync,
  getAllReviews,
  addReview,
  updateReview,
  deleteReview,
  toggleReviewPublished,
  Review,
  ReviewPlatform,
} from '@/lib/reviews';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/auth';
import ProtectedRoute from '@/components/ProtectedRoute';

const AdminReviews = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // React Query per caricare le recensioni
  const { data: reviews = getAllReviewsSync(), isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      // Carica le recensioni (usa il cache in memoria se disponibile)
      return await getAllReviews();
    },
    staleTime: 60000, // Considera i dati freschi per 60 secondi (aumentato)
    refetchOnWindowFocus: false, // Non refetch quando si torna alla finestra
    refetchOnMount: false, // NON refetch quando si monta (usa cache per evitare loop)
    refetchOnReconnect: true, // Refetch solo quando si riconnette
    gcTime: 300000, // Mantieni in cache per 5 minuti
    retry: 1, // Riprova solo 1 volta in caso di errore (previene loop infiniti)
    retryDelay: 1000, // Aspetta 1 secondo prima di riprovare
    initialData: getAllReviewsSync(), // Dati iniziali sincroni
  });

  const [formData, setFormData] = useState({
    platform: 'Vinted' as ReviewPlatform,
    rating: 5 as 1 | 2 | 3 | 4 | 5,
    title: '',
    text: '',
    author: '',
    date: new Date().toISOString().split('T')[0],
    screenshotUrl: '',
    published: true,
  });

  const handleLogout = async () => {
    await auth.signOut();
    toast({
      title: 'Logout effettuato',
      description: 'Alla prossima!',
    });
    navigate('/', { replace: true });
  };

  const resetForm = () => {
    setFormData({
      platform: 'Vinted',
      rating: 5,
      title: '',
      text: '',
      author: '',
      date: new Date().toISOString().split('T')[0],
      screenshotUrl: '',
      published: true,
    });
    setEditingReview(null);
  };

  // Mutation per create/update review
  const saveReviewMutation = useMutation({
    mutationFn: async (data: { id?: string; review: Omit<Review, 'id'> }) => {
      if (data.id) {
        const success = updateReview(data.id, data.review);
        if (!success) {
          throw new Error('Recensione non trovata');
        }
        return getAllReviewsSync(); // Ritorna i dati aggiornati
      } else {
        addReview(data.review);
        return getAllReviewsSync(); // Ritorna i dati aggiornati
      }
    },
    onSuccess: (updatedReviews, variables) => {
      // Aggiorna direttamente la cache invece di invalidare (evita loop)
      queryClient.setQueryData(['admin-reviews'], updatedReviews);
      
      toast({
        title: variables.id ? 'Recensione aggiornata' : 'Recensione aggiunta',
        description: variables.id 
          ? 'La recensione è stata modificata con successo'
          : 'La nuova recensione è stata creata con successo',
      });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Errore',
        description: error.message || 'Impossibile salvare la recensione',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const reviewData = {
      ...formData,
      date: new Date(formData.date),
    };

    if (editingReview) {
      saveReviewMutation.mutate({ id: editingReview.id, review: reviewData });
    } else {
      saveReviewMutation.mutate({ review: reviewData });
    }
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setFormData({
      platform: review.platform,
      rating: review.rating,
      title: review.title,
      text: review.text,
      author: review.author,
      date: new Date(review.date).toISOString().split('T')[0],
      screenshotUrl: review.screenshotUrl || '',
      published: review.published,
    });
    setIsDialogOpen(true);
  };

  // Mutation per delete review
  const deleteReviewMutation = useMutation({
    mutationFn: (id: string) => {
      const success = deleteReview(id);
      if (!success) {
        throw new Error('Recensione non trovata');
      }
      return getAllReviewsSync(); // Ritorna i dati aggiornati
    },
    onSuccess: (updatedReviews) => {
      // Aggiorna direttamente la cache invece di invalidare (evita loop)
      queryClient.setQueryData(['admin-reviews'], updatedReviews);
      
      toast({
        title: 'Recensione eliminata',
        description: 'La recensione è stata rimossa con successo',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Errore',
        description: error.message || 'Impossibile eliminare la recensione',
        variant: 'destructive',
      });
    },
  });

  // Mutation per toggle published
  const togglePublishedMutation = useMutation({
    mutationFn: (id: string) => {
      const success = toggleReviewPublished(id);
      if (!success) {
        throw new Error('Recensione non trovata');
      }
      return getAllReviewsSync(); // Ritorna i dati aggiornati
    },
    onSuccess: (updatedReviews) => {
      // Aggiorna direttamente la cache invece di invalidare (evita loop)
      queryClient.setQueryData(['admin-reviews'], updatedReviews);
      
      toast({
        title: 'Stato aggiornato',
        description: 'Lo stato di pubblicazione è stato modificato',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Errore',
        description: error.message || 'Impossibile aggiornare lo stato',
        variant: 'destructive',
      });
    },
  });

  const handleDelete = async (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questa recensione?')) {
      deleteReviewMutation.mutate(id);
    }
  };

  const handleTogglePublished = async (id: string) => {
    togglePublishedMutation.mutate(id);
  };

  // Mutation per import CSV
  const importCSVMutation = useMutation({
    mutationFn: async (csv: string) => {
      const lines = csv.split('\n');
      const dataLines = lines.slice(1).filter(line => line.trim());
      
      let imported = 0;
      dataLines.forEach(line => {
        const columns = line.split(',').map(col => col.trim().replace(/^"|"$/g, ''));
        
        if (columns.length >= 7) {
          const [platform, rating, title, text, author, date, published, screenshotUrl] = columns;
          
          addReview({
            platform: platform as ReviewPlatform,
            rating: parseInt(rating) as 1 | 2 | 3 | 4 | 5,
            title,
            text,
            author,
            date: new Date(date),
            published: published.toLowerCase() === 'true' || published === '1',
            screenshotUrl: screenshotUrl || undefined,
          });
          imported++;
        }
      });
      
      // Ritorna i dati aggiornati invece del numero importato
      return getAllReviewsSync();
    },
    onSuccess: (updatedReviews) => {
      // Aggiorna direttamente la cache invece di invalidare (evita loop)
      queryClient.setQueryData(['admin-reviews'], updatedReviews);
      
      toast({
        title: 'Import completato',
        description: `Recensioni importate con successo`,
      });
      setIsImportDialogOpen(false);
    },
    onError: () => {
      toast({
        title: 'Errore import',
        description: 'Formato CSV non valido',
        variant: 'destructive',
      });
    },
  });

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target?.result as string;
        importCSVMutation.mutate(csv);
      } catch (error) {
        toast({
          title: 'Errore import',
          description: 'Formato CSV non valido',
          variant: 'destructive',
        });
      }
    };

    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-primary text-primary' : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex h-14 sm:h-16 items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <Button variant="ghost" size="sm" asChild className="h-9 sm:h-10 px-2 sm:px-3">
                <Link to="/dashboard">
                  <ArrowLeft className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
              </Button>
              <h1 className="text-lg sm:text-xl font-bold truncate">Gestione Recensioni</h1>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="transition-smooth h-9 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm">
                  <Upload className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Import CSV</span>
                </Button>
              </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Import recensioni da CSV</DialogTitle>
                      <DialogDescription>
                        Carica un file CSV con le seguenti colonne:<br />
                        <code className="text-xs bg-accent px-2 py-1 rounded mt-2 inline-block">
                          platform,rating,title,text,author,date,published,screenshotUrl
                        </code>
                        <br /><br />
                        <strong>Formato date:</strong> YYYY-MM-DD (es. 2024-01-15)<br />
                        <strong>Platform:</strong> Vinted, CardTrader, o Wallapop<br />
                        <strong>Rating:</strong> numero da 1 a 5<br />
                        <strong>Published:</strong> true o false
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".csv"
                          onChange={handleImportCSV}
                          className="hidden"
                          id="csv-upload"
                        />
                        <label htmlFor="csv-upload" className="cursor-pointer">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm font-medium mb-1">Clicca per caricare CSV</p>
                          <p className="text-xs text-muted-foreground">Formato: .csv</p>
                        </label>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="transition-smooth h-9 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm">
                  <Plus className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Nuova recensione</span>
                  <span className="sm:hidden">Nuova</span>
                </Button>
              </DialogTrigger>
                  <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-lg sm:text-xl">
                        {editingReview ? 'Modifica recensione' : 'Nuova recensione'}
                      </DialogTitle>
                      <DialogDescription className="text-xs sm:text-sm">
                        Inserisci i dati della recensione ricevuta su piattaforma esterna
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="platform">Piattaforma *</Label>
                          <Select
                            value={formData.platform}
                            onValueChange={(value) =>
                              setFormData({ ...formData, platform: value as ReviewPlatform })
                            }
                          >
                            <SelectTrigger id="platform">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Vinted">Vinted</SelectItem>
                              <SelectItem value="CardTrader">CardTrader</SelectItem>
                              <SelectItem value="Wallapop">Wallapop</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="rating">Rating *</Label>
                          <Select
                            value={formData.rating.toString()}
                            onValueChange={(value) =>
                              setFormData({ ...formData, rating: parseInt(value) as 1 | 2 | 3 | 4 | 5 })
                            }
                          >
                            <SelectTrigger id="rating">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5 stelle</SelectItem>
                              <SelectItem value="4">4 stelle</SelectItem>
                              <SelectItem value="3">3 stelle</SelectItem>
                              <SelectItem value="2">2 stelle</SelectItem>
                              <SelectItem value="1">1 stella</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm">Titolo recensione *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Es. Perfetto!"
                          required
                          className="h-10 sm:h-11 text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="text" className="text-sm">Testo recensione *</Label>
                        <Textarea
                          id="text"
                          value={formData.text}
                          onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                          placeholder="Testo completo della recensione..."
                          rows={4}
                          required
                          className="text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="author" className="text-sm">Username autore *</Label>
                          <Input
                            id="author"
                            value={formData.author}
                            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                            placeholder="@username"
                            required
                            className="h-10 sm:h-11 text-sm"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="date" className="text-sm">Data *</Label>
                          <Input
                            id="date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                            className="h-10 sm:h-11 text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="screenshotUrl" className="text-sm">URL Screenshot (opzionale)</Label>
                        <Input
                          id="screenshotUrl"
                          value={formData.screenshotUrl}
                          onChange={(e) =>
                            setFormData({ ...formData, screenshotUrl: e.target.value })
                          }
                          placeholder="/path/to/screenshot.jpg"
                          className="h-10 sm:h-11 text-sm"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="published"
                          checked={formData.published}
                          onChange={(e) =>
                            setFormData({ ...formData, published: e.target.checked })
                          }
                          className="h-4 w-4 rounded border-input"
                        />
                        <Label htmlFor="published" className="cursor-pointer text-sm">
                          Pubblica subito
                        </Label>
                      </div>

                      <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            resetForm();
                            setIsDialogOpen(false);
                          }}
                          className="w-full sm:w-auto text-sm"
                        >
                          Annulla
                        </Button>
                        <Button type="submit" className="w-full sm:w-auto text-sm">
                          {editingReview ? 'Salva modifiche' : 'Crea recensione'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" size="sm" onClick={handleLogout} className="transition-smooth h-9 sm:h-10 px-2 sm:px-3">
                  <LogOut className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
          <Card className="p-4 sm:p-6">
            <div className="space-y-1 sm:space-y-2">
              <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Totale recensioni</h3>
              <p className="text-2xl sm:text-3xl font-bold text-primary">{reviews.length}</p>
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <div className="space-y-1 sm:space-y-2">
              <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Pubblicate</h3>
              <p className="text-2xl sm:text-3xl font-bold text-primary">
                {reviews.filter((r) => r.published).length}
              </p>
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <div className="space-y-1 sm:space-y-2">
              <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">In bozza</h3>
              <p className="text-2xl sm:text-3xl font-bold text-primary">
                {reviews.filter((r) => !r.published).length}
              </p>
            </div>
          </Card>
        </div>

          {/* Reviews List */}
          <div className="space-y-3 sm:space-y-4">
            {isLoading ? (
              <Card className="p-8 sm:p-12 text-center">
                <p className="text-sm sm:text-base text-muted-foreground">Caricamento...</p>
              </Card>
            ) : reviews.length === 0 ? (
              <Card className="p-8 sm:p-12 text-center">
                <p className="text-sm sm:text-base text-muted-foreground">Nessuna recensione presente</p>
              </Card>
            ) : (
              reviews.map((review) => (
                <Card key={review.id} className="p-4 sm:p-6 hover:shadow-medium transition-smooth">
                  <div className="flex flex-col gap-4 sm:gap-6">
                    <div className="flex-1 space-y-2 sm:space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="space-y-2 min-w-0 flex-1">
                          {renderStars(review.rating)}
                          <h3 className="text-lg sm:text-xl font-semibold break-words">{review.title}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">{review.author}</p>
                        </div>

                        <div className="flex gap-2 flex-shrink-0">
                          <Badge variant="outline" className="text-xs">{review.platform}</Badge>
                          <Badge variant={review.published ? 'default' : 'secondary'} className="text-xs">
                            {review.published ? 'Pubblicata' : 'Bozza'}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-words">
                        {review.text}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                        <span>
                          {new Date(review.date).toLocaleDateString('it-IT', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                        {review.screenshotUrl && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <span>Screenshot disponibile</span>
                          </>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button
                          variant={review.published ? 'outline' : 'default'}
                          size="sm"
                          onClick={() => handleTogglePublished(review.id)}
                          className="transition-smooth text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                        >
                          {review.published ? (
                            <>
                              <EyeOff className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                              <span className="hidden sm:inline">Nascondi</span>
                            </>
                          ) : (
                            <>
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                              <span className="hidden sm:inline">Pubblica</span>
                            </>
                          )}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(review)}
                          className="transition-smooth text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Modifica</span>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(review.id)}
                          className="transition-smooth text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Elimina</span>
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

export default AdminReviews;

