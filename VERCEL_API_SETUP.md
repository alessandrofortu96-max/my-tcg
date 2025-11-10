# Setup API Routes con SERVICE_ROLE_KEY su Vercel

## 📋 Panoramica

Questa guida spiega come configurare API routes (serverless functions) su Vercel che usano `SERVICE_ROLE_KEY` per operazioni server-side sicure.

## 🔐 Variabili d'Ambiente

### Client-Side (prefisso `VITE_`)
Queste variabili sono esposte al browser e devono essere pubbliche:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_TELEGRAM_URL=https://t.me/yourusername
```

### Server-Side (senza prefisso `VITE_`)
Queste variabili sono disponibili SOLO nelle API routes e NON sono esposte al client:

```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 🚀 Configurazione su Vercel

### Step 1: Aggiungi Variabili d'Ambiente

1. Vai su **Vercel Dashboard**: https://vercel.com/dashboard
2. Seleziona il tuo progetto
3. Vai su **Settings** → **Environment Variables**
4. Aggiungi le variabili:

   #### Variabili Client-Side:
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: `https://your-project.supabase.co`
   - **Environment**: `Production`, `Preview`, `Development`

   - **Name**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: `your-anon-key`
   - **Environment**: `Production`, `Preview`, `Development`

   - **Name**: `VITE_TELEGRAM_URL` (opzionale)
   - **Value**: `https://t.me/yourusername`
   - **Environment**: `Production`, `Preview`, `Development`

   #### Variabili Server-Side:
   - **Name**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: `your-service-role-key` ⚠️ **NON committare questa chiave!**
   - **Environment**: `Production`, `Preview`, `Development`

5. Clicca **Save** per ogni variabile

### Step 2: Redeploy

Dopo aver aggiunto le variabili d'ambiente:

1. Vai su **Deployments**
2. Clicca sui **3 puntini** (⋯) dell'ultimo deployment
3. Seleziona **Redeploy**
4. Oppure fai push di un nuovo commit

### Step 3: Verifica

Verifica che le variabili siano configurate correttamente:

```bash
# Le variabili client-side sono accessibili nel browser
console.log(import.meta.env.VITE_SUPABASE_URL);

# Le variabili server-side sono accessibili SOLO nelle API routes
// api/utils/supabase-server.ts
console.log(process.env.SUPABASE_SERVICE_ROLE_KEY);
```

## 📁 Struttura API Routes

Le API routes sono nella cartella `api/`:

```
api/
├── utils/
│   └── supabase-server.ts    # Client Supabase server-side
├── products/
│   ├── [id].ts               # GET /api/products/[id]
│   └── bulk-update.ts        # POST /api/products/bulk-update
├── webhooks/
│   └── stripe.ts             # POST /api/webhooks/stripe
└── storage/
    └── upload.ts             # POST /api/storage/upload
```

## 🔒 Sicurezza

### ✅ DO (Fai):

- ✅ Usa `SERVICE_ROLE_KEY` SOLO nelle API routes
- ✅ Valida input nelle API routes
- ✅ Usa autenticazione per API sensibili
- ✅ Logga operazioni importanti
- ✅ Gestisci errori correttamente

### ❌ DON'T (Non fare):

- ❌ MAI esporre `SERVICE_ROLE_KEY` al client
- ❌ MAI committare `SERVICE_ROLE_KEY` nel codice
- ❌ MAI usare `SERVICE_ROLE_KEY` in componenti React
- ❌ MAI loggare `SERVICE_ROLE_KEY` nei log

## 🧪 Testing Locale

### Installazione Vercel CLI

```bash
npm i -g vercel
```

### Avvia Server Locale

```bash
vercel dev
```

Le API routes saranno disponibili su:
- `http://localhost:3000/api/products/[id]`
- `http://localhost:3000/api/products/bulk-update`
- `http://localhost:3000/api/webhooks/stripe`
- `http://localhost:3000/api/storage/upload`

### Variabili d'Ambiente Locali

Crea un file `.env.local` nella root del progetto:

```env
# Client-Side
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_TELEGRAM_URL=https://t.me/yourusername

# Server-Side (solo per API routes)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**⚠️ IMPORTANTE**: Aggiungi `.env.local` al `.gitignore` per non committare le chiavi!

## 📝 Esempi di Uso

### Esempio 1: Chiamata API da Client

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

### Esempio 2: Webhook Stripe

Configura webhook su Stripe Dashboard:
- **URL**: `https://your-domain.vercel.app/api/webhooks/stripe`
- **Method**: `POST`
- **Events**: `payment_intent.succeeded`, ecc.

### Esempio 3: Upload Immagini

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

## 🎯 Quando Usare API Routes

Usa API routes quando:

1. **Webhook esterni**: Stripe, PayPal, ecc.
2. **Cron jobs**: Aggiornamento prezzi, pulizia dati
3. **Operazioni bulk**: Aggiornamento multiplo prodotti
4. **Validazione server-side**: Upload file, validazione dati
5. **Integrazione servizi esterni**: Invio email, SMS, ecc.
6. **Operazioni che richiedono privilegi elevati**: Bypass RLS

## 🚫 Quando NON Usare API Routes

Non serve API route quando:

1. **Query semplici**: Lettura prodotti, recensioni (usa RLS)
2. **Operazioni CRUD base**: Create/Update/Delete con autenticazione (usa RLS)
3. **Autenticazione**: Login, logout (usa client Supabase)

## 📚 Risorse

- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Supabase Service Role Key](https://supabase.com/docs/guides/auth/row-level-security#service-role-key)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## 🆘 Troubleshooting

### Problema: "Missing Supabase environment variables"

**Soluzione**: Verifica che le variabili d'ambiente siano configurate su Vercel e che il progetto sia stato redeployato.

### Problema: "Unauthorized" nelle API routes

**Soluzione**: Verifica che `SUPABASE_SERVICE_ROLE_KEY` sia configurata correttamente (senza prefisso `VITE_`).

### Problema: API routes non funzionano in locale

**Soluzione**: 
1. Installa Vercel CLI: `npm i -g vercel`
2. Crea file `.env.local` con le variabili d'ambiente
3. Avvia server: `vercel dev`

### Problema: "SERVICE_ROLE_KEY exposed to client"

**Soluzione**: Verifica che `SERVICE_ROLE_KEY` NON abbia prefisso `VITE_` e che non sia usata in componenti React.

