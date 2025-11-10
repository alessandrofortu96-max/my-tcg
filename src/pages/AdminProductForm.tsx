import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/auth';
import ProtectedRoute from '@/components/ProtectedRoute';
import { createProduct, updateProduct, getProductById } from '@/lib/products';
import { Product, GameType, ProductType, Condition, Language, ProductStatus } from '@/lib/types';
import { gameNames, typeNames, conditionNames } from '@/lib/constants';

const AdminProductForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [formData, setFormData] = useState<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    game: 'pokemon',
    type: 'raw',
    set: '',
    cardCode: '',
    language: 'ENG',
    condition: 'near-mint',
    price: 0,
    images: [],
    status: 'available',
    description: '',
    featured: false,
  });

  useEffect(() => {
    if (isEditMode && id) {
      const loadProduct = async () => {
        try {
          const product = await getProductById(id, true);
          if (product) {
            setFormData({
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
              description: product.description || '',
              featured: product.featured || false,
            });
          } else {
            toast({
              title: "Errore",
              description: "Prodotto non trovato",
              variant: "destructive",
            });
            navigate('/dashboard');
          }
        } catch (error) {
          console.error('Error loading product:', error);
          toast({
            title: "Errore",
            description: "Impossibile caricare il prodotto",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };
      loadProduct();
    }
  }, [id, isEditMode, navigate, toast]);

  // Mutation per create/update
  const saveMutation = useMutation({
    mutationFn: async (data: { id?: string; formData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> }) => {
      if (data.id) {
        return await updateProduct(data.id, data.formData);
      } else {
        return await createProduct(data.formData);
      }
    },
    onSuccess: (_, variables) => {
      // Invalida la query dei prodotti per refetch automatico
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({
        title: variables.id ? "Prodotto aggiornato" : "Prodotto creato",
        description: variables.id 
          ? "Le modifiche sono state salvate con successo"
          : "Il nuovo prodotto è stato aggiunto",
      });
      navigate('/dashboard');
    },
    onError: (error: any) => {
      console.error('Error saving product:', error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile salvare il prodotto",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditMode && id) {
      saveMutation.mutate({ id, formData });
    } else {
      saveMutation.mutate({ formData });
    }
  };

  const handleAddImage = () => {
    const url = prompt('Inserisci URL immagine:');
    if (url) {
      setFormData({
        ...formData,
        images: [...formData.images, url],
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <header className="border-b border-border bg-background/95 backdrop-blur">
            <div className="container mx-auto px-4">
              <div className="flex h-16 items-center justify-between">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
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
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <h1 className="text-xl font-bold">
                {isEditMode ? 'Modifica prodotto' : 'Nuovo prodotto'}
              </h1>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informazioni base */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Informazioni base</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome prodotto *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Es. Charizard VMAX"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="game">Gioco *</Label>
                    <Select
                      value={formData.game}
                      onValueChange={(value) => setFormData({ ...formData, game: value as GameType })}
                    >
                      <SelectTrigger id="game">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pokemon">{gameNames.pokemon}</SelectItem>
                        <SelectItem value="yugioh">{gameNames.yugioh}</SelectItem>
                        <SelectItem value="onepiece">{gameNames.onepiece}</SelectItem>
                        <SelectItem value="other">{gameNames.other}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value as ProductType })}
                    >
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="raw">{typeNames.raw}</SelectItem>
                        <SelectItem value="graded">{typeNames.graded}</SelectItem>
                        <SelectItem value="sealed">{typeNames.sealed}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="set">Set</Label>
                    <Input
                      id="set"
                      value={formData.set}
                      onChange={(e) => setFormData({ ...formData, set: e.target.value })}
                      placeholder="Es. Shining Fates"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardCode">Codice carta</Label>
                    <Input
                      id="cardCode"
                      value={formData.cardCode}
                      onChange={(e) => setFormData({ ...formData, cardCode: e.target.value })}
                      placeholder="Es. SV107"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Lingua *</Label>
                    <Select
                      value={formData.language}
                      onValueChange={(value) => setFormData({ ...formData, language: value as Language })}
                    >
                      <SelectTrigger id="language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ENG">English</SelectItem>
                        <SelectItem value="ITA">Italiano</SelectItem>
                        <SelectItem value="JAP">Japanese</SelectItem>
                        <SelectItem value="GER">Deutsch</SelectItem>
                        <SelectItem value="FRA">Français</SelectItem>
                        <SelectItem value="SPA">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="condition">Condizione *</Label>
                    <Select
                      value={formData.condition}
                      onValueChange={(value) => setFormData({ ...formData, condition: value as Condition })}
                    >
                      <SelectTrigger id="condition">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mint">{conditionNames['mint']}</SelectItem>
                        <SelectItem value="near-mint">{conditionNames['near-mint']}</SelectItem>
                        <SelectItem value="excellent">{conditionNames['excellent']}</SelectItem>
                        <SelectItem value="good">{conditionNames['good']}</SelectItem>
                        <SelectItem value="light-played">{conditionNames['light-played']}</SelectItem>
                        <SelectItem value="played">{conditionNames['played']}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </Card>

            {/* Prezzo e status */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Prezzo e stato</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Prezzo (€) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Stato *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as ProductStatus })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Disponibile</SelectItem>
                      <SelectItem value="sold">Venduto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Descrizione */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Descrizione</h2>
              <div className="space-y-2">
                <Label htmlFor="description">Descrizione prodotto</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrizione del prodotto..."
                  rows={4}
                />
              </div>
            </Card>

            {/* Immagini */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Immagini</h2>
              <div className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddImage}
                >
                  Aggiungi immagine
                </Button>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.images.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Immagine ${index + 1}`}
                          className="w-full h-32 object-cover rounded border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Opzioni */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Opzioni</h2>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="h-4 w-4 rounded border-input"
                  />
                  <span>Metti in evidenza (featured)</span>
                </label>
              </div>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
                disabled={saveMutation.isPending}
              >
                Annulla
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {saveMutation.isPending ? 'Salvataggio...' : isEditMode ? 'Salva modifiche' : 'Crea prodotto'}
              </Button>
            </div>
          </form>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default AdminProductForm;

