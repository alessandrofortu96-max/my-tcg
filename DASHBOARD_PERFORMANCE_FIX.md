# Fix: Blocchi Dashboard - Ottimizzazioni Performance

## Problema Identificato

La dashboard si bloccava occasionalmente durante l'uso, anche senza errori in console. Questo era causato da:

1. **Race condition con refetchQueries**: Chiamare sia `invalidateQueries` che `refetchQueries` insieme causava refetch multipli simultanei
2. **refetchOnMount: true**: Ogni mount del componente causava un nuovo refetch, anche se i dati erano già in cache
3. **Calcoli pesanti ad ogni render**: `productCounts` e `filteredProducts` venivano ricalcolati ad ogni render
4. **Nessun debouncing sulla ricerca**: Ogni carattere digitato causava un filtro completo su tutti i prodotti
5. **Click multipli non prevenuti**: I pulsanti non erano disabilitati durante le mutation, permettendo click multipli rapidi
6. **Mancanza di memoizzazione**: Nessun uso di `useMemo` o `useCallback` per ottimizzare i calcoli

## Soluzioni Implementate

### 1. Rimozione refetchQueries esplicito
**File**: `src/pages/Admin.tsx`

```typescript
// PRIMA (causava race condition)
onSuccess: async () => {
  await queryClient.invalidateQueries({ queryKey: ['admin-products'] });
  await queryClient.refetchQueries({ queryKey: ['admin-products'] }); // ❌ Problema
  // ...
}

// DOPO (ottimizzato)
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['admin-products'] }); // ✅ React Query refetch automaticamente se necessario
  // ...
}
```

**Beneficio**: Elimina race condition e refetch multipli simultanei

### 2. Configurazione React Query ottimizzata
**File**: `src/App.tsx`

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // Aumentato da 30s a 60s
      refetchOnWindowFocus: false,
      refetchOnMount: false, // ✅ Cambiato da true a false (usa cache se disponibile)
      refetchOnReconnect: true,
      gcTime: 300000, // Cache per 5 minuti
      networkMode: 'online',
    },
    mutations: {
      retry: 0, // Non riprovare le mutation
      networkMode: 'online',
    },
  },
});
```

**Beneficio**: Riduce drasticamente i refetch inutili, migliora le performance

### 3. Memoizzazione dei calcoli
**File**: `src/pages/Admin.tsx`

```typescript
// PRIMA (ricalcolato ad ogni render)
const productCounts = {
  pokemon: products.filter(p => p.game === 'pokemon').length,
  // ...
};

const filteredProducts = products.filter(product => {
  // ...
});

// DOPO (memoizzato)
const productCounts = useMemo(() => {
  return {
    pokemon: products.filter(p => p.game === 'pokemon').length,
    // ...
  };
}, [products]);

const filteredProducts = useMemo(() => {
  return products.filter(product => {
    // ...
  });
}, [products, filterGame, filterType, debouncedSearchTerm]);
```

**Beneficio**: I calcoli vengono eseguiti solo quando i dati cambiano, non ad ogni render

### 4. Debouncing per la ricerca
**File**: `src/pages/Admin.tsx`

```typescript
const [searchTerm, setSearchTerm] = useState('');
const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

// Debounce per la ricerca (evita troppi filtri durante la digitazione)
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearchTerm(searchTerm);
  }, 300); // 300ms di delay

  return () => clearTimeout(timer);
}, [searchTerm]);
```

**Beneficio**: Il filtro viene eseguito solo dopo 300ms di inattività, riducendo i calcoli durante la digitazione

### 5. Prevenzione click multipli
**File**: `src/pages/Admin.tsx`

```typescript
// Handler memoizzati con controllo pending
const handleToggleFeatured = useCallback((productId: string) => {
  // Previeni click multipli
  if (toggleFeaturedMutation.isPending) return;
  toggleFeaturedMutation.mutate(productId);
}, [toggleFeaturedMutation]);

// Pulsanti disabilitati durante mutation
<Button 
  onClick={() => handleToggleFeatured(product.id)}
  disabled={toggleFeaturedMutation.isPending || isLoadingData}
>
  {/* ... */}
</Button>
```

**Beneficio**: Previene race condition da click multipli rapidi

### 6. useCallback per le funzioni handler
**File**: `src/pages/Admin.tsx`

```typescript
// PRIMA
const handleToggleFeatured = async (productId: string) => {
  toggleFeaturedMutation.mutate(productId);
};

// DOPO
const handleToggleFeatured = useCallback((productId: string) => {
  if (toggleFeaturedMutation.isPending) return;
  toggleFeaturedMutation.mutate(productId);
}, [toggleFeaturedMutation]);
```

**Beneficio**: Evita re-render inutili dei componenti figli

### 7. Rimozione await nelle mutation callbacks
**File**: `src/pages/Admin.tsx`

```typescript
// PRIMA (bloccante)
onSuccess: async () => {
  await queryClient.invalidateQueries({ queryKey: ['admin-products'] });
  // ...
}

// DOPO (non bloccante)
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['admin-products'] });
  // ...
}
```

**Beneficio**: Non blocca l'UI durante l'invalidazione della cache

### 8. Stato di loading combinato
**File**: `src/pages/Admin.tsx`

```typescript
const { data: products = [], isLoading, isRefetching } = useQuery({
  // ...
});

const isLoadingData = isLoading || isRefetching;

// Usato per disabilitare tutti i pulsanti durante il loading
<Button disabled={isLoadingData}>
  {/* ... */}
</Button>
```

**Beneficio**: UI più reattiva, previene azioni durante il caricamento

## Risultati Attesi

- ✅ Eliminazione dei blocchi causati da race condition
- ✅ Riduzione drastica dei refetch inutili
- ✅ Miglioramento delle performance durante la digitazione (debouncing)
- ✅ Prevenzione di click multipli che causavano conflitti
- ✅ UI più reattiva e fluida
- ✅ Riduzione dei re-render inutili

## Testing

Per testare le ottimizzazioni:

1. **Test refetch**: Apri la dashboard, fai qualche modifica, naviga via e torna - non dovrebbe refetch se i dati sono freschi
2. **Test ricerca**: Digita velocemente nella ricerca - il filtro dovrebbe eseguirsi solo dopo 300ms di pausa
3. **Test click multipli**: Clicca rapidamente più volte su "In evidenza" - solo il primo click dovrebbe essere processato
4. **Test performance**: Apri la console e verifica che non ci siano refetch multipli simultanei

## Note

- Le query React Query ora usano la cache più aggressivamente
- I timeout sono gestiti da Supabase stesso (non serve timeout manuale)
- Se i dati sono freschi (< 60s), React Query non farà refetch automatico
- Le mutation non bloccano più l'UI grazie alla rimozione di `await` nei callbacks

