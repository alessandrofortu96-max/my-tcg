# Analisi Problemi Blocco Dashboard

## 📋 Riepilogo Situazione

**Problema**: La dashboard si blocca dopo diverse azioni, senza errori visibili in console.

**Domanda utente**: 
- La dashboard è accessibile solo con account Supabase? ✅ **SÌ** (confermato)
- I codici per permessi, API e caricamenti sono scritti correttamente? ⚠️ **PROBLEMI TROVATI**

---

## 🔍 Analisi Completa

### 1. ✅ Autenticazione e Accesso Dashboard

**Stato**: ✅ **CORRETTO**

- La dashboard richiede autenticazione Supabase tramite `ProtectedRoute`
- Solo utenti autenticati possono accedere
- Le RLS policies permettono a TUTTI gli utenti autenticati di fare tutto (`with check (true)`)
  - **Nota**: OK se c'è solo un admin, ma se ci sono più utenti potrebbe essere un problema di sicurezza

**File analizzati**:
- `src/components/ProtectedRoute.tsx` - ✅ Gestione autenticazione corretta
- `supabase/migrations/2025-11-10_admin_policies.sql` - ✅ Policy per utenti autenticati

---

### 2. ⚠️ Problemi Identificati

#### **Problema 1: Query Multiple Senza Gestione Errori**

**File**: `src/lib/products.ts` - Funzione `getProducts()`

**Problema**:
```typescript
// Query principale (ha gestione errori)
const { data, error } = await query;

// Query immagini (NON ha gestione errori!)
const { data: allImages } = await supabase
  .from('product_images')
  .select('product_id, url, sort_order')
  .in('product_id', productIds)
  .order('sort_order', { ascending: true });

// Query featured (NON ha gestione errori!)
const { data: allFeatured } = await supabase
  .from('featured_products')
  .select('product_id')
  .in('product_id', productIds);
```

**Impatto**: Se una di queste query fallisce o va in timeout, può bloccare l'intera operazione.

**Righe**: 214-224 in `src/lib/products.ts`

---

#### **Problema 2: Nessun Timeout sulle Query Supabase**

**Problema**: Le query Supabase non hanno timeout espliciti. Se il server non risponde, la query può bloccarsi indefinitamente.

**Impatto**: 
- Query che si bloccano per minuti
- Accumulo di query in attesa
- UI che si blocca

**Dove**: Tutte le query in `src/lib/products.ts`

---

#### **Problema 3: Race Conditions nelle Mutation**

**File**: `src/pages/Admin.tsx`

**Problema**: 
- Le mutation invalidano le query in modo asincrono (`setTimeout`)
- Se l'utente clicca velocemente, possono accumularsi multiple mutation
- Non c'è limitazione del numero di mutation simultanee

**Esempio**:
```typescript
// Mutation 1 inizia
toggleFeaturedMutation.mutate(id1);
// Mutation 2 inizia prima che la 1 finisca
toggleFeaturedMutation.mutate(id2);
// Entrambe invalidano la query, causando refetch multipli
```

**Righe**: 81-159 in `src/pages/Admin.tsx`

---

#### **Problema 4: getProducts può Restituire Array o Oggetto Paginato**

**File**: `src/lib/products.ts`

**Problema**: 
```typescript
export const getProducts = async (
  includeUnpublished: boolean = false,
  pagination?: PaginationParams
): Promise<PaginationResult<Product> | Product[]>
```

**In Admin.tsx**:
```typescript
const { data: products = [] } = useQuery({
  queryFn: async () => {
    return await getProducts(true); // Assume sempre array
  },
});
```

**Impatto**: Se `getProducts` restituisce un oggetto paginato invece di un array, il codice si rompe.

**Righe**: 36-47 in `src/pages/Admin.tsx`, 144-275 in `src/lib/products.ts`

---

#### **Problema 5: Session Check che si Blocca**

**File**: `src/lib/auth.ts` - `ensureValidSession()`

**Stato**: ✅ **PARZIALMENTE RISOLTO** (timeout di 3 secondi aggiunto)

**Problema residuo**: 
- Se `getSession()` va in timeout, ritorna errore ma non gestisce il caso in cui la sessione esiste ma la query è lenta
- Non c'è retry automatico

**Righe**: 143-238 in `src/lib/auth.ts`

---

#### **Problema 6: Query che si Accumulano**

**Problema**: 
- Ogni mutation invalida la query principale
- Se ci sono molte mutation rapide, si accumulano refetch
- Non c'è debouncing o limitazione

**Esempio**:
```
Utente clicca 5 volte velocemente su "In evidenza"
→ 5 mutation iniziate
→ 5 invalidazioni query
→ 5 refetch di getProducts()
→ Potenziale blocco
```

---

### 3. ✅ Cosa Funziona Bene

1. **ProtectedRoute**: Gestione autenticazione corretta
2. **RLS Policies**: Configurate correttamente per utenti autenticati
3. **API Routes**: Usano SERVICE_ROLE_KEY correttamente (non usate dalla dashboard)
4. **React Query Config**: Configurazione base corretta
5. **Debouncing ricerca**: Implementato correttamente (300ms)
6. **Memoization**: `useMemo` e `useCallback` usati correttamente

---

## 🎯 Soluzioni Proposte

### Soluzione 1: Aggiungere Timeout e Gestione Errori alle Query

**File**: `src/lib/products.ts`

**Modifiche**:
- Aggiungere timeout alle query Supabase (10 secondi)
- Gestire errori nelle query immagini e featured
- Ritornare dati parziali se alcune query falliscono

---

### Soluzione 2: Limitare Query e Mutation Simultanee

**File**: `src/pages/Admin.tsx`

**Modifiche**:
- Disabilitare tutti i pulsanti durante una mutation
- Usare `isPending` per prevenire click multipli
- Aggiungere debouncing alle mutation (già fatto parzialmente)

---

### Soluzione 3: Migliorare Gestione Errori in getProducts

**File**: `src/lib/products.ts`

**Modifiche**:
- Assicurarsi che `getProducts(true)` restituisca sempre un array
- Gestire errori nelle query secondarie (immagini, featured)
- Ritornare dati parziali invece di fallire completamente

---

### Soluzione 4: Aggiungere Circuit Breaker

**File**: `src/lib/products.ts`

**Modifiche**:
- Se una query fallisce 3 volte di seguito, bloccare temporaneamente
- Mostrare messaggio all'utente invece di bloccarsi silenziosamente

---

### Soluzione 5: Migliorare Session Management

**File**: `src/lib/auth.ts`

**Modifiche**:
- Cache della sessione per evitare query ripetute
- Retry automatico con backoff esponenziale
- Fallback a localStorage se getSession() fallisce

---

## 📊 Priorità Fix

1. **ALTA**: Aggiungere gestione errori alle query immagini/featured
2. **ALTA**: Aggiungere timeout alle query Supabase
3. **MEDIA**: Limitare mutation simultanee
4. **MEDIA**: Assicurarsi che getProducts restituisca sempre array
5. **BASSA**: Circuit breaker (se i problemi persistono)

---

## 🔧 Prossimi Passi

**Prima di implementare le fix, conferma**:

1. ✅ La dashboard è accessibile solo con account Supabase creato nel dashboard Supabase?
2. ⚠️ Quanti utenti hanno accesso alla dashboard? (per valutare se limitare le RLS policies)
3. ⚠️ Quando si blocca, cosa stai facendo esattamente? (es. click multipli, upload immagini, etc.)
4. ⚠️ Dopo quanto tempo si blocca? (secondi, minuti?)

**Dopo la conferma, implementerò le fix in ordine di priorità.**

