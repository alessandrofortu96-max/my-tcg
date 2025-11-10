# Post-Migrazione Checklist

## ✅ Completato

### 1. Repository
- [x] Nome repo: `my-tcg`
- [x] Package.json aggiornato con metadati corretti
- [x] README.md aggiornato

### 2. Rimozione riferimenti Lovable
- [x] Rimosso `lovable-tagger` da package.json
- [x] Rimosso da vite.config.ts
- [x] Rimosso da index.html
- [x] Rimosso da Login.tsx e mockAuth.ts
- [x] Nessun riferimento Lovable nel codice sorgente

### 3. Selezione/Lotto client-side
- [x] Chiave localStorage: `mytcg_selection_v1`
- [x] Schema con version, updated_at, items
- [x] Ripristino all'avvio con toast
- [x] Supporto link condivisibile `?sel=`
- [x] Funzioni: Copia riepilogo, Invia email, Apri Telegram, Salva/Condividi, Svuota

### 4. Recensioni
- [x] File JSON: `public/data/reviews_unificate.json`
- [x] Sistema di caricamento da file locale
- [x] Date formato `gg/mm/aaaa`
- [x] Piattaforme: Vinted, CardTrader, Wallapop
- [x] Filtri e pagina recensioni funzionanti

### 5. Pagine legali
- [x] Privacy Policy (`/privacy-policy`)
- [x] Cookie Policy (`/cookie-policy`)
- [x] Nota Legale (`/nota-legale`)
- [x] Tutte linkate nel Footer

### 6. SEO e Meta Tags
- [x] Meta tags completi in index.html
- [x] Open Graph tags
- [x] Twitter Card tags
- [x] Lang="it" impostato
- [x] Canonical URL
- [x] Sitemap.xml creato
- [x] Robots.txt aggiornato

### 7. Favicons e Manifest
- [x] Favicon.ico (già presente)
- [x] Link a favicons in index.html
- [x] site.webmanifest creato
- [ ] ⚠️ **DA CREARE**: favicon-32x32.png, favicon-16x16.png, apple-touch-icon.png, og-image.png

### 8. Pagine di errore
- [x] 404 custom con Header/Footer
- [x] Stile coerente con il sito
- [x] Link di navigazione utili

### 9. Headers sicurezza
- [x] Headers in vite.config.ts (dev/preview)
- [x] vercel.json (per deploy su Vercel)
- [x] netlify.toml (per deploy su Netlify)
- [x] .htaccess (per Apache)
- [x] Content-Security-Policy
- [x] X-Frame-Options, X-Content-Type-Options, etc.

### 10. Supabase
- [x] Struttura cartelle Supabase/Migrations/
- [x] 2025-11-10_init.sql (schema iniziale)
- [x] 2025-11-10_policies.sql (RLS e policy)
- [x] README.md per Supabase

## ⚠️ Da fare manualmente

### 1. Favicons e immagini
Crea le seguenti immagini nella cartella `public/`:
- `favicon-32x32.png` (32x32px)
- `favicon-16x16.png` (16x16px)
- `apple-touch-icon.png` (180x180px)
- `og-image.png` (1200x630px) - Immagine per social sharing
- `favicon-192x192.png` (192x192px) - Per PWA
- `favicon-512x512.png` (512x512px) - Per PWA

Puoi usare strumenti come:
- [Favicon Generator](https://realfavicongenerator.net/)
- [OG Image Generator](https://www.opengraph.xyz/)

### 2. Setup Supabase
1. Crea progetto su [supabase.com](https://supabase.com)
2. Esegui le migrazioni da `Supabase/Migrations/`
3. Configura Storage buckets (opzionale)
4. Aggiungi variabili d'ambiente:
   ```env
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```

### 3. Test build
```bash
npm run build
npm run preview
```

Verifica che:
- Build completi senza errori
- Nessun warning grave
- Tutte le route funzionano
- Immagini e asset caricano correttamente

### 4. Test Lighthouse
Esegui Lighthouse su:
- Homepage
- Pagina prodotto
- Pagina recensioni
- Pagina contatti

Obiettivi:
- Performance ≥ 90
- Accessibility ≥ 90
- Best Practices ≥ 90
- SEO ≥ 90

### 5. Deploy
Scegli una delle opzioni:

#### Vercel
```bash
npm install -g vercel
vercel
```
- Usa `vercel.json` per configurazione

#### Netlify
```bash
npm install -g netlify-cli
netlify deploy
```
- Usa `netlify.toml` per configurazione

#### Apache/Nginx
- Usa `.htaccess` per Apache
- Configura Nginx manualmente con header sicurezza

### 6. Dominio personalizzato
1. Configura DNS per `my-tcg.it`
2. Aggiungi certificato SSL (Let's Encrypt)
3. Verifica headers sicurezza dopo deploy

### 7. Google Search Console
1. Aggiungi `my-tcg.it` a Google Search Console
2. Invia sitemap.xml
3. Verifica robots.txt

### 8. Analytics (opzionale)
Se vuoi aggiungere analytics:
- Google Analytics 4 (con IP masking)
- Configura in Cookie Policy
- Aggiungi banner consenso cookie

## 📝 Note importanti

### Headers sicurezza in produzione
I headers in `vite.config.ts` sono solo per dev/preview. In produzione:
- **Vercel**: usa `vercel.json`
- **Netlify**: usa `netlify.toml`
- **Apache**: usa `.htaccess`
- **Nginx**: configura manualmente

### Content-Security-Policy
La CSP attuale permette `unsafe-inline` e `unsafe-eval` per React. Per maggiore sicurezza:
- Usa nonce o hash per script inline
- Rimuovi `unsafe-eval` se possibile
- Testa attentamente dopo modifiche

### Sitemap.xml
Aggiorna `public/sitemap.xml` periodicamente quando aggiungi nuovi prodotti o pagine.

### Recensioni
Attualmente le recensioni sono in `public/data/reviews_unificate.json`. Per migrare a Supabase:
1. Esegui migrazione `2025-11-10_init.sql`
2. Importa dati da JSON a Supabase
3. Aggiorna `src/lib/reviews.ts` per usare Supabase client

## 🚀 Prossimi passi

1. ✅ Completare favicons e immagini
2. ✅ Setup Supabase e migrazioni
3. ✅ Test build e preview
4. ✅ Test Lighthouse
5. ✅ Deploy su produzione
6. ✅ Configurare dominio
7. ✅ Verificare headers sicurezza
8. ✅ Inviare sitemap a Google

## 📞 Supporto

Per problemi o domande:
- Email: info@my-tcg.it
- Repository: https://github.com/yourusername/my-tcg

