import { useState, useEffect, useRef } from 'react';
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
import { ArrowLeft, Save, X, Upload, Loader2, ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/auth';
import ProtectedRoute from '@/components/ProtectedRoute';
import { createProduct, updateProduct, getProductById } from '@/lib/products';
import { Product, GameType, ProductType, Condition, Language, ProductStatus } from '@/lib/types';
import { gameNames, typeNames, conditionNames } from '@/lib/constants';
import { uploadProductImage, validateImageFile } from '@/lib/storage';

const AdminProductForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [uploadingImages, setUploadingImages] = useState<Set<number>>(new Set());
  const [imagePreviews, setImagePreviews] = useState<Map<number, string>>(new Map());
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Ref per tracciare se il componente è montato (previene setState dopo smontaggio)
  const isMountedRef = useRef(true);
  // Ref per tracciare gli upload in corso e poterli cancellare
  const uploadAbortControllersRef = useRef<Map<number, AbortController>>(new Map());
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

  // Cleanup quando il componente viene smontato
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      // Cancella tutti gli upload in corso quando il componente viene smontato
      uploadAbortControllersRef.current.forEach(controller => {
        controller.abort();
      });
      uploadAbortControllersRef.current.clear();
    };
  }, []);

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
      // Crea un timeout per evitare che la chiamata si blocchi indefinitamente
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Timeout: la richiesta ha impiegato troppo tempo. Riprova.'));
        }, 30000); // 30 secondi di timeout
      });

      const productPromise = data.id 
        ? updateProduct(data.id, data.formData)
        : createProduct(data.formData);

      // Race tra la promise del prodotto e il timeout
      return await Promise.race([productPromise, timeoutPromise]) as Product;
    },
    onSuccess: async (_, variables) => {
      try {
        // Invalida la query dei prodotti per refetch automatico
        await Promise.race([
          queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
      } catch (error) {
        console.warn('Error invalidating queries:', error);
        // Non bloccare la navigazione se l'invalidazione fallisce
      }

      toast({
        title: variables.id ? "Prodotto aggiornato" : "Prodotto creato",
        description: variables.id 
          ? "Le modifiche sono state salvate con successo"
          : "Il nuovo prodotto è stato aggiunto",
      });

      // Naviga dopo un breve delay per permettere al toast di essere visibile
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 500);
    },
    onError: (error: any) => {
      console.error('Error saving product:', error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile salvare il prodotto. Riprova più tardi.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Blocca il salvataggio se ci sono upload in corso
    if (uploadingImages.size > 0) {
      toast({
        title: 'Upload in corso',
        description: 'Attendi il completamento del caricamento delle immagini prima di salvare.',
        variant: 'destructive',
      });
      return;
    }

    // Valida che ci sia almeno un nome
    if (!formData.name || formData.name.trim() === '') {
      toast({
        title: 'Nome richiesto',
        description: 'Inserisci un nome per il prodotto.',
        variant: 'destructive',
      });
      return;
    }

    // Valida che ci sia almeno un prezzo valido
    if (formData.price <= 0) {
      toast({
        title: 'Prezzo non valido',
        description: 'Inserisci un prezzo valido maggiore di 0.',
        variant: 'destructive',
      });
      return;
    }
    
    if (isEditMode && id) {
      saveMutation.mutate({ id, formData });
    } else {
      saveMutation.mutate({ formData });
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);
    
    // Valida tutti i file prima di iniziare
    const validFiles: File[] = [];
    for (const file of filesArray) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        toast({
          title: 'File non valido',
          description: `${file.name}: ${validation.error || 'File non valido'}`,
          variant: 'destructive',
        });
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Processa ogni file validato (in parallelo per velocizzare, ma con limite)
    const uploadPromises = validFiles.map(async (file, index) => {
      const tempIndex = formData.images.length + index;
      
      // Verifica che il componente sia ancora montato
      if (!isMountedRef.current) {
        return { success: false, file: file.name, error: 'Component unmounted' };
      }

      // Crea AbortController per questo upload
      const abortController = new AbortController();
      uploadAbortControllersRef.current.set(tempIndex, abortController);

      // Crea preview locale immediatamente
      const reader = new FileReader();
      reader.onload = (e) => {
        // Verifica che il componente sia ancora montato prima di aggiornare lo stato
        if (!isMountedRef.current) return;
        
        const previewUrl = e.target?.result as string;
        setImagePreviews(prev => {
          const newMap = new Map(prev);
          newMap.set(tempIndex, previewUrl);
          return newMap;
        });
      };
      reader.readAsDataURL(file);

      // Marca come uploading (solo se montato)
      if (isMountedRef.current) {
        setUploadingImages(prev => new Set(prev).add(tempIndex));
      }

      try {
        // Upload su Supabase Storage con timeout e abort signal
        const uploadPromise = uploadProductImage(file, id || undefined, abortController.signal);
        const timeoutPromise = new Promise<string>((_, reject) => {
          const timeoutId = setTimeout(() => {
            abortController.abort(); // Cancella l'upload se timeout
            reject(new Error('Timeout: upload troppo lento. Riprova con un\'immagine più piccola.'));
          }, 60000); // 60 secondi di timeout per l'upload
          
          // Pulisci timeout se l'upload completa prima
          uploadPromise.finally(() => clearTimeout(timeoutId));
        });

        const uploadedUrl = await Promise.race([uploadPromise, timeoutPromise]);

        // Verifica che il componente sia ancora montato prima di aggiornare lo stato
        if (!isMountedRef.current) {
          console.log('Component unmounted, skipping state update');
          return { success: false, file: file.name, error: 'Component unmounted' };
        }

        // Aggiorna le immagini nel form (aggiungi l'URL caricato)
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, uploadedUrl],
        }));

        // Rimuovi preview locale (ora usiamo l'URL caricato)
        setImagePreviews(prev => {
          const newMap = new Map(prev);
          newMap.delete(tempIndex);
          return newMap;
        });

        // Rimuovi dalla lista di uploading
        setUploadingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(tempIndex);
          return newSet;
        });

        // Rimuovi l'AbortController dalla mappa
        uploadAbortControllersRef.current.delete(tempIndex);

        toast({
          title: 'Upload completato',
          description: `Immagine "${file.name}" caricata con successo`,
        });

        return { success: true, file: file.name };
      } catch (error: any) {
        // Se l'errore è dovuto all'abort, non mostrare errore
        if (error.name === 'AbortError' || abortController.signal.aborted) {
          console.log('Upload cancelled:', file.name);
          return { success: false, file: file.name, error: 'Cancelled' };
        }

        console.error('Error uploading image:', error);
        
        // Verifica che il componente sia ancora montato prima di aggiornare lo stato
        if (!isMountedRef.current) {
          return { success: false, file: file.name, error: error.message };
        }
        
        // Rimuovi dalla lista di uploading
        setUploadingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(tempIndex);
          return newSet;
        });
        
        // Rimuovi preview
        setImagePreviews(prev => {
          const newMap = new Map(prev);
          newMap.delete(tempIndex);
          return newMap;
        });

        // Rimuovi l'AbortController dalla mappa
        uploadAbortControllersRef.current.delete(tempIndex);

        toast({
          title: 'Errore upload',
          description: `${file.name}: ${error.message || "Impossibile caricare l'immagine"}`,
          variant: 'destructive',
        });

        return { success: false, file: file.name, error: error.message };
      }
    });

    // Esegui tutti gli upload in parallelo (ma limitati a 3 alla volta per evitare sovraccarico)
    const batchSize = 3;
    for (let i = 0; i < uploadPromises.length; i += batchSize) {
      const batch = uploadPromises.slice(i, i + batchSize);
      await Promise.allSettled(batch);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddImageByUrl = () => {
    const url = prompt('Inserisci URL immagine:');
    if (url && url.trim()) {
      setFormData({
        ...formData,
        images: [...formData.images, url.trim()],
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    // Rimuovi preview se esiste
    const newPreviews = new Map(imagePreviews);
    newPreviews.delete(index);
    setImagePreviews(newPreviews);

    // Rimuovi immagine
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleMoveImageUp = (index: number) => {
    if (index === 0) return; // Già in cima
    
    const newImages = [...formData.images];
    const temp = newImages[index];
    newImages[index] = newImages[index - 1];
    newImages[index - 1] = temp;
    
    // Aggiorna anche le preview se esistono
    const newPreviews = new Map(imagePreviews);
    const preview1 = newPreviews.get(index);
    const preview2 = newPreviews.get(index - 1);
    if (preview1) newPreviews.set(index - 1, preview1);
    if (preview2) newPreviews.set(index, preview2);
    if (preview1 || preview2) {
      setImagePreviews(newPreviews);
    }
    
    setFormData({
      ...formData,
      images: newImages,
    });
  };

  const handleMoveImageDown = (index: number) => {
    if (index === formData.images.length - 1) return; // Già in fondo
    moveImage(index, index + 1);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    
    const newImages = [...formData.images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    
    // Aggiorna le preview: crea una mappa URL -> preview, poi ricostruisci in base al nuovo ordine
    const urlToPreview = new Map<string, string>();
    imagePreviews.forEach((previewUrl, idx) => {
      const url = formData.images[idx];
      if (url) {
        urlToPreview.set(url, previewUrl);
      }
    });
    
    // Ricostruisci le preview in base al nuovo ordine delle immagini
    const newPreviews = new Map<number, string>();
    newImages.forEach((url, newIdx) => {
      const previewUrl = urlToPreview.get(url);
      if (previewUrl) {
        newPreviews.set(newIdx, previewUrl);
      }
    });
    
    setImagePreviews(newPreviews);
    
    setFormData({
      ...formData,
      images: newImages,
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    // Evidenzia la posizione di drop
    e.currentTarget.classList.add('ring-2', 'ring-primary');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('ring-2', 'ring-primary');
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.currentTarget.classList.remove('ring-2', 'ring-primary');
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }
    
    moveImage(draggedIndex, dropIndex);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
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
        <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-40">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="flex h-14 sm:h-16 items-center justify-between gap-2">
              <Button variant="ghost" size="sm" asChild className="h-9 sm:h-10 px-2 sm:px-3">
                <Link to="/dashboard">
                  <ArrowLeft className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
              </Button>
              <h1 className="text-lg sm:text-xl font-bold truncate flex-1 text-center sm:text-left px-2">
                {isEditMode ? 'Modifica prodotto' : 'Nuovo prodotto'}
              </h1>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-4xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informazioni base */}
            <Card className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Informazioni base</h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm">Nome prodotto *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Es. Charizard VMAX"
                    required
                    className="h-10 sm:h-11"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
            <Card className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Prezzo e stato</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm">Prezzo (€) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    required
                    className="h-10 sm:h-11 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm">Stato *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as ProductStatus })}
                  >
                    <SelectTrigger id="status" className="h-10 sm:h-11 text-sm">
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
            <Card className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Descrizione</h2>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm">Descrizione prodotto</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrizione del prodotto..."
                  rows={4}
                  className="text-sm"
                />
              </div>
            </Card>

            {/* Immagini */}
            <Card className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Immagini</h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button
                    type="button"
                    variant="default"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={saveMutation.isPending}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Carica immagini
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddImageByUrl}
                    disabled={saveMutation.isPending}
                  >
                    Aggiungi da URL
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground">
                  Formati supportati: JPG, PNG, WebP. Dimensione massima: 10MB per immagine.
                </p>

                {formData.images.length > 0 && (
                  <div className="space-y-2 sm:space-y-3">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Trascina le immagini per riordinare o usa i pulsanti ↑↓. La prima immagine sarà quella principale.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {formData.images.map((url, index) => {
                        const isUploading = uploadingImages.has(index);
                        const previewUrl = imagePreviews.get(index);
                        const displayUrl = previewUrl || url;
                        const isFirst = index === 0;
                        const isLast = index === formData.images.length - 1;
                        const isDragging = draggedIndex === index;

                        return (
                          <div
                            key={index}
                            className="relative group"
                            draggable={!isUploading}
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, index)}
                            onDragEnd={handleDragEnd}
                          >
                            <div
                              className={`relative w-full h-48 rounded-lg border-2 overflow-hidden bg-accent cursor-move transition-all ${
                                isDragging ? 'opacity-50 scale-95' : ''
                              } ${!isUploading ? 'hover:border-primary' : ''}`}
                            >
                              {isUploading ? (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                </div>
                              ) : (
                                <>
                                  <img
                                    src={displayUrl}
                                    alt={`Immagine ${index + 1}`}
                                    className="w-full h-full object-cover pointer-events-none"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                                    }}
                                  />
                                  {isFirst && (
                                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded shadow-md">
                                      Principale
                                    </div>
                                  )}
                                  <div className="absolute top-2 right-2 bg-background/90 text-foreground text-xs font-semibold px-2 py-1 rounded shadow-md">
                                    #{index + 1}
                                  </div>
                                  {/* Icona drag handle */}
                                  <div className="absolute bottom-2 left-2 bg-background/90 text-muted-foreground p-1.5 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                                    <GripVertical className="h-4 w-4" />
                                  </div>
                                </>
                              )}
                            </div>
                            
                            {!isUploading && (
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                                <div className="flex flex-col gap-2 pointer-events-auto">
                                  {/* Pulsanti di ordinamento */}
                                  <div className="flex gap-1">
                                    <Button
                                      type="button"
                                      variant="secondary"
                                      size="sm"
                                      className="h-8 w-8 p-0 bg-background/90 hover:bg-background shadow-md"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMoveImageUp(index);
                                      }}
                                      disabled={isFirst}
                                      title="Sposta su"
                                    >
                                      <ChevronUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="secondary"
                                      size="sm"
                                      className="h-8 w-8 p-0 bg-background/90 hover:bg-background shadow-md"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMoveImageDown(index);
                                      }}
                                      disabled={isLast}
                                      title="Sposta giù"
                                    >
                                      <ChevronDown className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  
                                  {/* Pulsante rimuovi */}
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="h-8 w-8 p-0 shadow-md"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveImage(index);
                                    }}
                                    title="Rimuovi"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Opzioni */}
            <Card className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Opzioni</h2>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm sm:text-base">
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
            <div className="space-y-3 sm:space-y-4">
              {/* Warning se ci sono upload in corso */}
              {uploadingImages.size > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-2 sm:p-3 text-xs sm:text-sm text-yellow-800 dark:text-yellow-200">
                  <p className="font-medium">Upload in corso: {uploadingImages.size} immagine{uploadingImages.size > 1 ? 'i' : ''}</p>
                  <p className="text-xs mt-1">Attendi il completamento prima di salvare il prodotto.</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (uploadingImages.size > 0) {
                      toast({
                        title: 'Upload in corso',
                        description: 'Attendi il completamento del caricamento delle immagini.',
                        variant: 'destructive',
                      });
                      return;
                    }
                    navigate('/dashboard');
                  }}
                  disabled={saveMutation.isPending}
                  className="w-full sm:w-auto text-sm h-10 sm:h-11"
                >
                  Annulla
                </Button>
                <Button 
                  type="submit" 
                  disabled={saveMutation.isPending || uploadingImages.size > 0}
                  className="w-full sm:min-w-[140px] text-sm h-10 sm:h-11"
                >
                  {saveMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvataggio...
                    </>
                  ) : uploadingImages.size > 0 ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Upload in corso...
                    </>
                  ) : isEditMode ? (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salva modifiche
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Crea prodotto
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default AdminProductForm;

