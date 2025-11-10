# Fix: Blocchi durante l'upload delle immagini nell'editor

## Problema

La dashboard si bloccava quando:
1. Si caricavano immagini nell'editor
2. Si navigava su altre pagine durante l'upload
3. Si tornava all'editor dopo qualche minuto

## Cause Identificate

1. **Upload che continuano dopo lo smontaggio**: Gli upload continuavano in background anche dopo la navigazione, causando aggiornamenti di stato su componenti smontati
2. **setState su componenti smontati**: React lanciava warning quando si tentava di aggiornare lo stato dopo lo smontaggio
3. **Promise non cancellate**: Le Promise degli upload non venivano cancellate, causando memory leak
4. **Race condition**: Gli upload potevano completarsi dopo la navigazione, causando conflitti

## Soluzioni Implementate

### 1. AbortController per cancellare upload

**File**: `src/pages/AdminProductForm.tsx`

```typescript
// Ref per tracciare gli upload in corso e poterli cancellare
const uploadAbortControllersRef = useRef<Map<number, AbortController>>(new Map());

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
```

### 2. isMountedRef per prevenire setState dopo smontaggio

```typescript
// Ref per tracciare se il componente è montato
const isMountedRef = useRef(true);

// Verifica prima di ogni setState
if (!isMountedRef.current) {
  return; // Non aggiornare lo stato se il componente è smontato
}
```

### 3. AbortSignal nella fetch

**File**: `src/lib/storage.ts`

```typescript
export const uploadProductImage = async (
  file: File,
  productId?: string,
  abortSignal?: AbortSignal
): Promise<string> => {
  // Verifica se l'upload è stato cancellato
  if (abortSignal?.aborted) {
    throw new DOMException('Upload cancelled', 'AbortError');
  }

  // Usa AbortSignal nella fetch
  response = await fetch('/api/storage/upload', {
    // ...
    signal: abortSignal, // Cancella la richiesta se necessario
  });
}
```

### 4. Verifica stato prima di aggiornare UI

```typescript
// Verifica che il componente sia ancora montato prima di aggiornare lo stato
if (!isMountedRef.current) {
  console.log('Component unmounted, skipping state update');
  return { success: false, file: file.name, error: 'Component unmounted' };
}
```

### 5. Gestione errori per upload cancellati

```typescript
catch (error: any) {
  // Se l'errore è dovuto all'abort, non mostrare errore
  if (error.name === 'AbortError' || abortController.signal.aborted) {
    console.log('Upload cancelled:', file.name);
    return { success: false, file: file.name, error: 'Cancelled' };
  }
  // ... gestione altri errori
}
```

### 6. Cleanup file caricati se upload cancellato

**File**: `src/lib/storage.ts`

```typescript
// Verifica se l'upload è stato cancellato dopo la chiamata
if (abortSignal?.aborted) {
  // Se l'upload è stato completato ma cancellato dopo, elimina il file
  if (data?.path) {
    await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .remove([data.path])
      .catch(err => console.warn('Error cleaning up cancelled upload:', err));
  }
  throw new DOMException('Upload cancelled', 'AbortError');
}
```

### 7. Interruzione batch upload se componente smontato

```typescript
// Esegui tutti gli upload in parallelo (ma limitati a 3 alla volta)
const batchSize = 3;
for (let i = 0; i < uploadPromises.length; i += batchSize) {
  // Verifica che il componente sia ancora montato
  if (!isMountedRef.current) {
    console.log('Component unmounted, cancelling remaining uploads');
    // Cancella tutti gli upload rimanenti
    uploadAbortControllersRef.current.forEach((controller, index) => {
      if (index >= i) {
        controller.abort();
      }
    });
    break;
  }
  
  const batch = uploadPromises.slice(i, i + batchSize);
  await Promise.allSettled(batch);
}
```

## Risultati Attesi

- ✅ Eliminazione dei blocchi causati da upload in background
- ✅ Prevenzione di setState su componenti smontati
- ✅ Cancellazione automatica degli upload durante la navigazione
- ✅ Pulizia dei file caricati se l'upload viene cancellato
- ✅ Nessun memory leak da Promise non cancellate
- ✅ UI più reattiva durante la navigazione

## Testing

Per testare le correzioni:

1. **Test upload + navigazione**: Carica immagini, naviga via durante l'upload, verifica che non ci siano errori in console
2. **Test upload + ritorno**: Carica immagini, naviga via, torna dopo qualche secondo, verifica che l'editor funzioni correttamente
3. **Test salvataggio durante upload**: Prova a salvare mentre ci sono upload in corso, verifica che venga mostrato un messaggio appropriato
4. **Test cleanup**: Verifica che non ci siano file orfani in Supabase Storage dopo upload cancellati

## Note

- Gli upload vengono cancellati automaticamente quando il componente viene smontato
- I file caricati vengono eliminati da Supabase Storage se l'upload viene cancellato dopo il completamento
- Non vengono mostrati errori per upload cancellati intenzionalmente
- Il componente può essere navigato via in qualsiasi momento senza causare problemi

