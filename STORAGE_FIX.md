# Fix Errore "mime type application/json is not supported"

## 🔴 Problema

Quando carichi un'immagine, vedi l'errore:
```
mime type application/json is not supported
```

Questo significa che il bucket `product-images` ha restrizioni sui MIME types che bloccano l'upload.

## ✅ Soluzione: Configurazione Manuale nel Dashboard

### Passo 1: Vai nel Dashboard Supabase

1. Apri il dashboard Supabase: https://supabase.com/dashboard
2. Seleziona il tuo progetto
3. Vai su **Storage** nel menu laterale

### Passo 2: Configura il Bucket `product-images`

1. Clicca su **Buckets** → **product-images** (o crealo se non esiste)
2. Clicca su **Settings** (Impostazioni)
3. Controlla la sezione **"File size limit"** e **"Allowed MIME types"**

### Passo 3: Rimuovi o Modifica le Restrizioni MIME Types

**Opzione A (Consigliata): Rimuovi completamente le restrizioni**
- Lascia vuoto il campo **"Allowed MIME types"**
- Questo permetterà tutti i tipi di file (ma la validazione lato client permetterà solo immagini)

**Opzione B: Configura i MIME types corretti**
- Aggiungi questi MIME types (uno per riga o separati da virgola):
  ```
  image/jpeg
  image/jpg
  image/png
  image/webp
  ```

### Passo 4: Configura File Size Limit

- Imposta **"File size limit"** a `10485760` (10MB) o più

### Passo 5: Verifica che il Bucket sia Pubblico

- Assicurati che **"Public bucket"** sia **attivato** (spunta verde)

### Passo 6: Esegui la Migration SQL

1. Vai su **SQL Editor** nel dashboard Supabase
2. Esegui il contenuto del file: `Supabase/Migrations/2025-11-10_storage_policies.sql`
3. Questo creerà le policy RLS necessarie per permettere l'upload agli utenti autenticati

## 🔍 Verifica

Dopo aver configurato il bucket:

1. Riavvia il dev server (`npm run dev`)
2. Vai su `/dashboard/prodotti/nuovo`
3. Prova a caricare un'immagine
4. Dovrebbe funzionare senza errori

## 📝 Note

- Le restrizioni sui MIME types nel bucket possono essere più restrittive delle policy RLS
- Se il bucket ha `allowed_mime_types` configurato, devono corrispondere esattamente ai tipi di file che carichi
- La migrazione SQL crea le policy RLS, ma le impostazioni del bucket (MIME types, file size) devono essere configurate manualmente nel dashboard

## 🚀 Alternativa: Usa Vercel Dev

Se preferisci testare con le API routes anche in sviluppo:

```bash
# Installa Vercel CLI
npm i -g vercel

# Avvia il server con supporto API routes
vercel dev
```

Le API routes useranno `SERVICE_ROLE_KEY` e bypassano RLS automaticamente, quindi non avrai problemi con le policy.

