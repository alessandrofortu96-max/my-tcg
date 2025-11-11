# API Routes - Serverless Functions

Questa cartella contiene le API routes (serverless functions) per Vercel che utilizzano `SERVICE_ROLE_KEY` per operazioni server-side.

## ⚠️ Sicurezza

- **MAI esporre `SERVICE_ROLE_KEY` al client**
- **MAI committare `SERVICE_ROLE_KEY` nel codice**
- **MAI usare `SERVICE_ROLE_KEY` in componenti React o codice client-side**
- Usare `SERVICE_ROLE_KEY` SOLO nelle API routes/serverless functions

## Struttura

```
api/
├── utils/
│   └── supabase-server.ts    # Client Supabase server-side
├── products/
│   ├── [id].ts               # GET prodotto per ID
│   └── bulk-update.ts        # POST aggiornamento bulk
├── webhooks/
│   └── stripe.ts             # POST webhook Stripe
├── storage/
│   └── upload.ts             # POST upload immagini
└── README.md                 # Questa documentazione
```

## Configurazione Variabili d'Ambiente su Vercel

### 1. Variabili Client-Side (prefisso `VITE_`)

Queste variabili sono esposte al client (browser):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_TELEGRAM_URL=https://t.me/yourusername
```

### 2. Variabili Server-Side (senza prefisso `VITE_`)

Queste variabili sono disponibili SOLO nelle API routes:

```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Come aggiungere su Vercel:

1. Vai su **Vercel Dashboard** → Il tuo progetto → **Settings** → **Environment Variables**
2. Aggiungi le variabili:
   - **Name**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: `your-service-role-key`
   - **Environment**: Seleziona `Production`, `Preview`, `Development` (o tutte)
3. Clicca **Save**
4. **Redeploy** il progetto per applicare le modifiche

## Utilizzo

### Esempio: Chiamata API da client

```typescript
// src/lib/api.ts
export const getProductById = async (id: string) => {
  const response = await fetch(`/api/products/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch product');
  }
  return response.json();
};

// Usa nel componente
const product = await getProductById('product-id');
```

### Esempio: Webhook esterno

```bash
# Configura webhook su Stripe (o altro servizio)
# URL: https://your-domain.vercel.app/api/webhooks/stripe
# Method: POST
```

## Quando usare API Routes

Usa API routes quando:

1. **Webhook esterni**: Stripe, PayPal, ecc.
2. **Cron jobs**: Aggiornamento prezzi, pulizia dati
3. **Operazioni bulk**: Aggiornamento multiplo prodotti
4. **Validazione server-side**: Upload file, validazione dati
5. **Integrazione servizi esterni**: Invio email, SMS, ecc.
6. **Operazioni che richiedono privilegi elevati**: Bypass RLS

## Quando NON usare API Routes

Non serve API route quando:

1. **Query semplici**: Lettura prodotti, recensioni (usa RLS)
2. **Operazioni CRUD base**: Create/Update/Delete con autenticazione (usa RLS)
3. **Autenticazione**: Login, logout (usa client Supabase)

## Best Practices

1. **Validazione input**: Sempre validare input nelle API routes
2. **Gestione errori**: Usa `handleApiError` per gestione errori consistente
3. **Autenticazione**: Valida token se necessario con `validateAuth`
4. **Rate limiting**: Considera rate limiting per API pubbliche
5. **Logging**: Logga operazioni importanti per debugging
6. **Testing**: Testa API routes localmente con `vercel dev`

## Testing Locale

```bash
# Installa Vercel CLI
npm i -g vercel

# Avvia server locale con API routes
vercel dev

# Le API routes saranno disponibili su:
# http://localhost:3000/api/products/[id]
# http://localhost:3000/api/products/bulk-update
# ecc.
```

## Esempi di Uso

### 1. Webhook Stripe

Quando un pagamento è completato, aggiorna automaticamente lo status del prodotto:

```typescript
// Configura webhook su Stripe dashboard
// URL: https://your-domain.vercel.app/api/webhooks/stripe
```

### 2. Cron Job per Aggiornamento Prezzi

Usa Vercel Cron Jobs o servizi esterni (es. cron-job.org) per chiamare API route:

```typescript
// Chiama ogni giorno alle 00:00
// GET https://your-domain.vercel.app/api/products/update-prices
```

### 3. Upload Immagini Sicuro

Upload immagini con validazione server-side:

```typescript
const formData = new FormData();
formData.append('file', file);

const response = await fetch('/api/storage/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  body: formData,
});
```

## Note

- Le API routes sono serverless functions su Vercel
- Hanno un timeout di 10 secondi (Hobby) o 60 secondi (Pro)
- Supportano fino a 50MB di payload
- Sono disponibili solo in produzione/preview su Vercel


