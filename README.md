# my-tcg.it

**Liquidazione Collezione TCG Privata** - Carte RAW, gradate e prodotti sigillati di Pokémon, Yu-Gi-Oh! e One Piece – provenienti esclusivamente dalla collezione personale.

## 🎯 Descrizione

Sito web per la vendita occasionale di carte collezionabili TCG. Vendita tra privati, cessione occasionale di beni personali. Non è un'attività commerciale organizzata.

## 🛠️ Tecnologie

- **Vite** - Build tool e dev server
- **React** - UI framework
- **TypeScript** - Type safety
- **shadcn/ui** - Componenti UI
- **Tailwind CSS** - Styling
- **React Router** - Routing

## 📦 Installazione

### Prerequisiti

- Node.js 18+ (consigliato installare con [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- pnpm (consigliato) o npm/yarn

### Setup

```sh
# Clona il repository
git clone <YOUR_GIT_URL>
cd my-tcg

# Installa le dipendenze
pnpm install
# oppure
npm install
# oppure
yarn install

# Avvia il server di sviluppo
pnpm dev
# oppure
npm run dev
# oppure
yarn dev
```

Il sito sarà disponibile su `http://localhost:8080`

## 🏗️ Build

```sh
# Build per produzione
pnpm build
# oppure
npm run build
# oppure
yarn build

# Preview della build di produzione
pnpm preview
# oppure
npm run preview
# oppure
yarn preview
```

## 📁 Struttura del Progetto

```
my-tcg/
├── public/                 # File statici
│   ├── data/              # File JSON per recensioni
│   └── ...
├── src/
│   ├── components/        # Componenti React
│   │   ├── ui/           # Componenti UI (shadcn)
│   │   └── ...
│   ├── contexts/         # React Context
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utilities e tipi
│   ├── pages/            # Pagine dell'app
│   └── ...
├── package.json
├── vite.config.ts
└── ...
```

## 🎨 Funzionalità

- **Homepage HUB** - Categorie e prodotti in evidenza
- **Selezione/Lotto** - Gestione client-side con localStorage
- **Pagine prodotto** - Dettagli completi con immagini
- **Recensioni** - Sistema di recensioni da file JSON locale
- **Contatti** - Modulo email e link Telegram
- **Dashboard Admin** - Gestione prodotti e recensioni (area riservata)

## 🔧 Configurazione

### Variabili d'ambiente

Crea un file `.env` nella root del progetto (opzionale):

```env
# Telegram
NEXT_PUBLIC_TELEGRAM_URL=https://t.me/yourusername

# Email (per modulo contatti)
CONTACT_TO=info@my-tcg.it
```

### Selezione/Lotto

La selezione viene salvata in `localStorage` con chiave `mytcg_selection_v1`. Lo schema è:

```json
{
  "version": 1,
  "updated_at": "2024-01-15T10:30:00Z",
  "items": [
    {
      "id": "product-id",
      "name": "Product Name",
      ...
    }
  ]
}
```

### Recensioni

Le recensioni vengono caricate da `public/data/reviews_unificate.json`. Il formato è:

```json
[
  {
    "id": "1",
    "platform": "Vinted",
    "rating": 5,
    "title": "Perfetto!",
    "text": "Recensione...",
    "author": "@username",
    "date": "2024-01-15",
    "screenshotUrl": "/screenshots/review1.jpg",
    "published": true
  }
]
```

## 🚀 Deploy

### Build e Deploy

1. Esegui il build:
   ```sh
   pnpm build
   ```

2. I file compilati saranno in `dist/`

3. Puoi deployare su:
   - **Vercel** - `vercel deploy`
   - **Netlify** - Drag & drop della cartella `dist`
   - **GitHub Pages** - Configura GitHub Actions
   - Altri hosting statici

### Deploy su Vercel

```sh
# Installa Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy produzione
vercel --prod
```

### Deploy su Netlify

```sh
# Installa Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy

# Deploy produzione
netlify deploy --prod
```

## 🔒 Sicurezza

Il progetto include headers di sicurezza configurati per:
- Vercel (vercel.json)
- Netlify (netlify.toml)
- Apache (.htaccess)

Per maggiori dettagli, consulta `POST_MIGRATION_CHECKLIST.md`.

## 🗄️ Database (Supabase)

Il progetto include migrazioni Supabase per gestire prodotti e recensioni nel database.

Vedi `Supabase/README.md` per istruzioni di setup.

## 📝 Licenza

MIT

## 👤 Autore

Alessandro Fortunato - info@my-tcg.it

## 🔗 Link

- Sito: https://my-tcg.it
- Repository: https://github.com/yourusername/my-tcg

## 📋 Checklist Post-Migrazione

Vedi `POST_MIGRATION_CHECKLIST.md` per la checklist completa delle attività da completare dopo la migrazione.
