# Supabase - Database Migrations

Questo progetto utilizza Supabase come database backend per prodotti, recensioni e configurazioni.

## Struttura

```
Supabase/
└─ Migrations/
   ├─ 2025-11-10_init.sql           # Schema iniziale (tabelle, enum, trigger)
   ├─ 2025-11-10_policies.sql       # RLS (Row Level Security) e policy pubbliche
   ├─ 2025-11-10_admin_policies.sql # Policy per utenti autenticati (admin)
   └─ 2025-11-10_add_other_game.sql # Aggiunge game "other" se non esiste
```

## Setup

### 1. Crea un progetto Supabase

1. Vai su [supabase.com](https://supabase.com)
2. Crea un nuovo progetto
3. Copia l'URL del progetto e la chiave API (Service Role Key)

### 2. Esegui le migrazioni

#### Opzione A: Via Dashboard Supabase
1. Vai su SQL Editor nel dashboard Supabase
2. Esegui le migrazioni in questo ordine:
   - `2025-11-10_init.sql` (schema iniziale)
   - `2025-11-10_policies.sql` (policy pubbliche)
   - `2025-11-10_admin_policies.sql` (policy admin)
   - `2025-11-10_add_other_game.sql` (game "other")

**Nota:** Gli script sono idempotenti (possono essere eseguiti più volte senza errori). 
Se ricevi errori di policy già esistenti, è sicuro ri-eseguire gli script - le policy verranno ricreate.

#### Opzione B: Via CLI Supabase
```bash
# Installa Supabase CLI
npm install -g supabase

# Login
supabase login

# Link al progetto
supabase link --project-ref your-project-ref

# Esegui migrazioni
supabase db push
```

### 3. Configura Storage (opzionale)

Se vuoi usare Supabase Storage per le immagini:

1. Vai su Storage nel dashboard
2. Crea due bucket pubblici:
   - `product-images` (pubblico, per immagini prodotti)
   - `review-screens` (pubblico, per screenshot recensioni)

3. Configura le policy di storage:
   - **Public read**: chiunque può leggere
   - **Authenticated write**: solo utenti autenticati (o service role) possono uploadare

### 4. Configura variabili d'ambiente

Crea un file `.env.local` (non committare):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Schema Database

### Tabelle principali

- **games**: Giochi (Pokémon, Yu-Gi-Oh!, One Piece)
- **product_types**: Tipi di prodotti (RAW, Gradate, Sigillati)
- **products**: Prodotti in vendita
- **product_images**: Immagini dei prodotti
- **featured_products**: Prodotti in evidenza (homepage)
- **reviews**: Recensioni dei clienti
- **site_settings**: Impostazioni del sito

### RLS (Row Level Security)

- **Pubblico (anon)**: può solo leggere prodotti pubblicati e recensioni pubblicate
- **Authenticated (utenti loggati)**: possono creare/modificare/eliminare prodotti e recensioni (admin)
- **Service Role**: può fare tutto (usato dal backend/server)

## Utilizzo

### Query prodotti pubblicati

```sql
SELECT * FROM public.products 
WHERE published = true 
AND status = 'DISPONIBILE'
ORDER BY created_at DESC;
```

### Query recensioni pubblicate

```sql
SELECT * FROM public.reviews 
WHERE published = true 
ORDER BY review_date DESC;
```

### Query prodotti in evidenza

```sql
SELECT * FROM public.v_featured 
ORDER BY rank ASC;
```

## Migrazioni future

Per aggiungere nuove migrazioni:

1. Crea un nuovo file nella cartella `Migrations/`
2. Usa il formato: `YYYY-MM-DD_description.sql`
3. Esegui la migrazione via dashboard o CLI

Esempio:
- `2025-11-15_add_product_tags.sql`
- `2025-11-20_add_user_favorites.sql`

## Note

- Le migrazioni sono idempotenti (usano `IF NOT EXISTS` e `DROP POLICY IF EXISTS`)
- Le policy RLS sono configurate per accesso pubblico in sola lettura
- Le operazioni di scrittura richiedono autenticazione (utenti autenticati) o Service Role Key
- Il database è ottimizzato per query pubbliche (indici su `published`, `status`, etc.)
- **Se ricevi errori "policy already exists"**: ri-esegui lo script - le policy verranno ricreate correttamente

