# Fix: Gestione Sessione Supabase - Refresh Automatico e Retry

## Problema

Quando si creano o modificano molti annunci in sequenza, l'applicazione va in bug dopo un po':
- Le azioni non vengono completate
- Non ci sono errori in console
- L'app sembra "congelarsi" e poi tornare normale senza aver fatto l'azione
- Probabilmente la sessione Supabase scade durante le operazioni

## Cause Identificate

1. **Token JWT scaduto**: Il token di autenticazione Supabase scade dopo un certo tempo (default: 1 ora)
2. **Nessun refresh preventivo**: Il token non viene rinnovato prima che scada
3. **Errori silenziosi**: Gli errori di autenticazione non vengono gestiti correttamente
4. **Nessun retry**: Le operazioni falliscono senza ritentare dopo il refresh del token
5. **Session non verificata**: Le operazioni non verificano la validità della sessione prima di eseguirle

## Soluzioni Implementate

### 1. Funzione `ensureValidSession` per verificare e rinnovare la sessione

**File**: `src/lib/auth.ts`

```typescript
// Ensure valid session (refresh if needed)
ensureValidSession: async (): Promise<{ session: any; error: any }> => {
  // Verifica la sessione corrente
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    return { session: null, error: sessionError || new Error('No session') };
  }

  // Verifica se il token è scaduto o sta per scadere
  const expiresAt = session.expires_at;
  if (expiresAt) {
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = expiresAt - now;
    
    // Se il token scade entro 120 secondi, fai refresh preventivo
    if (timeUntilExpiry < 120) {
      console.log('Token expiring soon, refreshing...');
      const { data: { session: refreshedSession }, error: refreshError } = 
        await supabase.auth.refreshSession();
      // ...
    }
  }

  return { session, error: null };
}
```

**Beneficio**: La sessione viene rinnovata preventivamente prima che scada, evitando errori durante le operazioni

### 2. Helper `executeWithAuthRetry` per retry automatico

**File**: `src/lib/products.ts`

```typescript
const executeWithAuthRetry = async <T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> => {
  try {
    // Verifica e aggiorna la sessione prima dell'operazione
    const { session, error: sessionError } = await auth.ensureValidSession();
    if (sessionError || !session) {
      throw new Error('Sessione scaduta. Effettua il login di nuovo.');
    }

    // Esegui l'operazione
    return await operation();
  } catch (error: any) {
    // Se l'errore è di autenticazione, prova a fare refresh e riprova
    if (
      error?.message?.includes('JWT') ||
      error?.message?.includes('token') ||
      error?.message?.includes('expired') ||
      error?.code === 'PGRST301' ||
      error?.status === 401
    ) {
      console.warn(`${operationName}: Auth error detected, attempting refresh and retry...`);
      // Prova a fare refresh e riprova
      const { session: refreshedSession, error: refreshError } = await auth.ensureValidSession();
      if (!refreshError && refreshedSession) {
        // Riprova l'operazione dopo il refresh
        return await operation();
      }
      throw new Error('Sessione scaduta. Effettua il login di nuovo.');
    }
    throw error;
  }
};
```

**Beneficio**: Le operazioni ritentano automaticamente dopo il refresh del token se falliscono per errori di autenticazione

### 3. Refresh automatico migliorato in `getSession` e `getCurrentUser`

**File**: `src/lib/auth.ts`

```typescript
getSession: async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  // Verifica se il token è scaduto o sta per scadere (entro 60 secondi)
  const expiresAt = session?.expires_at;
  if (expiresAt) {
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = expiresAt - now;
    
    // Se il token scade entro 60 secondi, fai refresh
    if (timeUntilExpiry < 60) {
      console.log('Token expiring soon, refreshing session...');
      const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
      return { session: refreshedSession, error: null };
    }
  }

  return { session, error: null };
}
```

**Beneficio**: La sessione viene rinnovata automaticamente quando sta per scadere

### 4. Listener per eventi di refresh token

**File**: `src/components/ProtectedRoute.tsx`

```typescript
supabase.auth.onAuthStateChange(async (event, session) => {
  // Gestisci eventi specifici
  if (event === 'TOKEN_REFRESHED') {
    console.log('[ProtectedRoute] Token refreshed successfully');
    // Il token è stato rinnovato, aggiorna l'utente
    const currentUser = await auth.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    return;
  }
  // ... altri eventi
});
```

**Beneficio**: L'UI viene aggiornata quando il token viene rinnovato automaticamente

### 5. Verifica sessione prima di ogni operazione critica

Tutte le operazioni critiche (createProduct, updateProduct, deleteProduct, toggleProductFeatured) ora:
1. Verificano la sessione prima di eseguire l'operazione
2. Fanno refresh preventivo se il token sta per scadere
3. Ritentano automaticamente se l'operazione fallisce per errori di autenticazione
4. Forniscono messaggi di errore chiari se la sessione è scaduta

### 6. Logging migliorato

Aggiunto logging dettagliato per:
- Verifica sessione prima delle operazioni
- Refresh del token
- Retry dopo errori di autenticazione
- Eventi di auth state change

**Beneficio**: Facilita il debug e l'identificazione dei problemi

### 7. Gestione errori migliorata nelle mutation

**File**: `src/pages/AdminProductForm.tsx`

```typescript
mutationFn: async (data) => {
  console.log(`[saveMutation] Starting ${data.id ? 'update' : 'create'} product...`);
  
  try {
    const result = data.id 
      ? await updateProduct(data.id, data.formData)
      : await createProduct(data.formData);

    if (!result) {
      throw new Error('Operazione completata ma nessun prodotto restituito');
    }

    console.log(`[saveMutation] ${data.id ? 'Update' : 'Create'} successful:`, result.id);
    return result;
  } catch (error: any) {
    // Se l'errore è di autenticazione, fornisci un messaggio più chiaro
    if (error?.message?.includes('Sessione scaduta')) {
      throw new Error('La sessione è scaduta. Effettua il login di nuovo e riprova.');
    }
    throw error;
  }
}
```

**Beneficio**: Messaggi di errore chiari per l'utente quando la sessione scade

## Risultati Attesi

- ✅ Refresh automatico del token prima che scada
- ✅ Retry automatico dopo errori di autenticazione
- ✅ Messaggi di errore chiari quando la sessione è scaduta
- ✅ Nessun "freeze" dell'applicazione durante operazioni lunghe
- ✅ Logging dettagliato per debug
- ✅ Gestione robusta degli errori di autenticazione

## Testing

Per testare le correzioni:

1. **Test sessione lunga**: Lascia l'app aperta per più di 1 ora, verifica che la sessione venga rinnovata automaticamente
2. **Test operazioni multiple**: Crea/modifica molti prodotti in sequenza, verifica che non ci siano freeze
3. **Test refresh token**: Apri la console e verifica i log quando il token viene rinnovato
4. **Test errori**: Simula un errore di autenticazione (es. token scaduto), verifica che venga mostrato un messaggio chiaro
5. **Test retry**: Verifica che le operazioni ritentino automaticamente dopo il refresh del token

## Note

- Il token viene rinnovato preventivamente quando mancano 120 secondi alla scadenza
- Le operazioni ritentano automaticamente una volta dopo il refresh del token
- Se il refresh fallisce, viene mostrato un messaggio chiaro all'utente
- Il logging è attivo in sviluppo per facilitare il debug
- La sessione viene verificata prima di ogni operazione critica

