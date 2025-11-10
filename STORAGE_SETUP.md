# Setup Storage per Upload Immagini

## Problemi Comuni

### 1. Errore "mime type application/json is not supported"

Questo errore indica che il bucket ha restrizioni sui MIME types. **VEDI `STORAGE_FIX.md` per la soluzione dettagliata.**

**Soluzione rapida:**
1. Vai su Supabase Dashboard → Storage → product-images → Settings
2. Rimuovi o modifica "Allowed MIME types" per permettere: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`
3. Oppure lascia vuoto per permettere tutti i tipi

### 2. Errore RLS (Row Level Security)

Quando carichi immagini in sviluppo locale, potresti vedere l'errore:
```
new row violates row-level security policy
```

Questo perché le policy di storage non sono configurate correttamente.

## Soluzione 1: Esegui Migration SQL (Consigliata)

1. Vai su **Supabase Dashboard** → **SQL Editor**
2. Esegui il contenuto del file: `Supabase/Migrations/2025-11-10_storage_policies.sql`

Questo script:
- Crea il bucket `product-images` se non esiste
- Configura le policy per permettere upload agli utenti autenticati
- Permette lettura pubblica delle immagini

## Soluzione 2: Usa Vercel Dev (Alternative)

Se preferisci testare con le API routes anche in sviluppo locale:

```bash
# Installa Vercel CLI
npm i -g vercel

# Avvia il server con supporto API routes
vercel dev
```

Le API routes useranno `SERVICE_ROLE_KEY` e bypassano RLS automaticamente.

## Come Funziona

Il codice tenta prima di usare l'API route (`/api/storage/upload`):
- ✅ **Produzione (Vercel)**: API route disponibile, usa `SERVICE_ROLE_KEY` (bypass RLS)
- ✅ **Sviluppo con `vercel dev`**: API route disponibile, usa `SERVICE_ROLE_KEY` (bypass RLS)
- ⚠️ **Sviluppo con `npm run dev`**: API route non disponibile, fallback a upload diretto (richiede policy)

## Verifica

Dopo aver eseguito la migration SQL:
1. Riavvia il dev server
2. Prova a caricare un'immagine
3. Dovrebbe funzionare senza errori RLS

## Troubleshooting

### Errore: "Bucket non trovato"
- Verifica che il bucket `product-images` esista nel dashboard Supabase
- Esegui la migration SQL per crearlo

### Errore: "new row violates row-level security policy"
- Esegui la migration SQL per le policy di storage
- Verifica di essere autenticato (devi essere loggato nel dashboard)

### Errore: "useRef is not defined"
- Riavvia il dev server (`Ctrl+C` e poi `npm run dev`)
- Pulisci la cache del browser (Ctrl+Shift+R)

