import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  getAllReviews,
  getAllReviewsSync,
  addReview,
  updateReview,
  deleteReview,
  toggleReviewPublished,
  Review,
  ReviewPlatform,
} from '@/lib/reviews';
import { useToast } from '@/hooks/use-toast';
import { mockAuth } from '@/lib/mockAuth';
import ProtectedRoute from '@/components/ProtectedRoute';

const AdminReviews = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>(getAllReviewsSync());
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Load reviews on mount
  useEffect(() => {
    const loadReviews = async () => {
      const loadedReviews = await getAllReviews();
      setReviews(loadedReviews);
    };
    loadReviews();
  }, []);

  const handleLogout = async () => {
    await mockAuth.logout();
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingReview) {
      updateReview(editingReview.id, {
        ...formData,
        date: new Date(formData.date),
      });
      toast({
        title: 'Recensione aggiornata',
        description: 'La recensione è stata modificata con successo',
      });
    } else {
      addReview({
        ...formData,
        date: new Date(formData.date),
      });
      toast({
        title: 'Recensione aggiunta',
        description: 'La nuova recensione è stata creata con successo',
      });
    }

    resetForm();
    setIsDialogOpen(false);
    // Reload reviews
    setReviews(getAllReviewsSync());
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

  const handleDelete = (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questa recensione?')) {
      deleteReview(id);
      toast({
        title: 'Recensione eliminata',
        description: 'La recensione è stata rimossa con successo',
      });
      // Reload reviews
      setReviews(getAllReviewsSync());
    }
  };

  const handleTogglePublished = (id: string) => {
    toggleReviewPublished(id);
    toast({
      title: 'Stato aggiornato',
      description: 'Lo stato di pubblicazione è stato modificato',
    });
    // Reload reviews
    setReviews(getAllReviewsSync());
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split('\n');
        
        // Skip header row
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

        toast({
          title: 'Import completato',
          description: `${imported} recensioni importate con successo`,
        });
        
        setIsImportDialogOpen(false);
        // Reload reviews
        setReviews(getAllReviewsSync());
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
        <header className="border-b border-border bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/admin">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
                <h1 className="text-xl font-bold">Gestione Recensioni</h1>
              </div>

              <div className="flex items-center gap-2">
                <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="transition-smooth">
                      <Upload className="mr-2 h-4 w-4" />
                      Import CSV
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
                        <strong>Published:</strong> true o false<br />
                        <br />
                        <strong>⚠️ Nota:</strong> Le modifiche sono solo in memoria e vengono perse al refresh. Per persistenza, integra con Supabase.
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
                    <Button className="transition-smooth">
                      <Plus className="mr-2 h-4 w-4" />
                      Nuova recensione
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingReview ? 'Modifica recensione' : 'Nuova recensione'}
                      </DialogTitle>
                      <DialogDescription>
                        Inserisci i dati della recensione ricevuta su piattaforma esterna
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
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
                        <Label htmlFor="title">Titolo recensione *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Es. Perfetto!"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="text">Testo recensione *</Label>
                        <Textarea
                          id="text"
                          value={formData.text}
                          onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                          placeholder="Testo completo della recensione..."
                          rows={4}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="author">Username autore *</Label>
                          <Input
                            id="author"
                            value={formData.author}
                            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                            placeholder="@username"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="date">Data *</Label>
                          <Input
                            id="date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="screenshotUrl">URL Screenshot (opzionale)</Label>
                        <Input
                          id="screenshotUrl"
                          value={formData.screenshotUrl}
                          onChange={(e) =>
                            setFormData({ ...formData, screenshotUrl: e.target.value })
                          }
                          placeholder="/path/to/screenshot.jpg"
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
                        <Label htmlFor="published" className="cursor-pointer">
                          Pubblica subito
                        </Label>
                      </div>

                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            resetForm();
                            setIsDialogOpen(false);
                          }}
                        >
                          Annulla
                        </Button>
                        <Button type="submit">
                          {editingReview ? 'Salva modifiche' : 'Crea recensione'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" size="sm" onClick={handleLogout} className="transition-smooth">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Totale recensioni</h3>
                <p className="text-3xl font-bold text-primary">{reviews.length}</p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Pubblicate</h3>
                <p className="text-3xl font-bold text-primary">
                  {reviews.filter((r) => r.published).length}
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">In bozza</h3>
                <p className="text-3xl font-bold text-primary">
                  {reviews.filter((r) => !r.published).length}
                </p>
              </div>
            </Card>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">Nessuna recensione presente</p>
              </Card>
            ) : (
              reviews.map((review) => (
                <Card key={review.id} className="p-6 hover:shadow-medium transition-smooth">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="space-y-2">
                          {renderStars(review.rating)}
                          <h3 className="text-xl font-semibold">{review.title}</h3>
                          <p className="text-sm text-muted-foreground">{review.author}</p>
                        </div>

                        <div className="flex gap-2">
                          <Badge variant="outline">{review.platform}</Badge>
                          <Badge variant={review.published ? 'default' : 'secondary'}>
                            {review.published ? 'Pubblicata' : 'Bozza'}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {review.text}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          {new Date(review.date).toLocaleDateString('it-IT', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                        {review.screenshotUrl && (
                          <>
                            <span>•</span>
                            <span>Screenshot disponibile</span>
                          </>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button
                          variant={review.published ? 'outline' : 'default'}
                          size="sm"
                          onClick={() => handleTogglePublished(review.id)}
                          className="transition-smooth"
                        >
                          {review.published ? (
                            <>
                              <EyeOff className="mr-2 h-4 w-4" />
                              Nascondi
                            </>
                          ) : (
                            <>
                              <Eye className="mr-2 h-4 w-4" />
                              Pubblica
                            </>
                          )}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(review)}
                          className="transition-smooth"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Modifica
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(review.id)}
                          className="transition-smooth"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Elimina
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
