# Istruzioni Logo e Favicon

## ✅ File creati

Sono stati creati i seguenti file SVG:

- ✅ `public/logo.svg` - Logo principale (200x200, scalabile) - **GIÀ IN USO NEL HEADER**
- ✅ `public/favicon.svg` - Favicon SVG (32x32, scalabile) - **GIÀ CONFIGURATO IN index.html**
- ✅ `public/logo-icon.svg` - Logo grande per conversioni (512x512)

## 🎨 Design

Il design rappresenta **carte TCG stilizzate** con:
- Carta principale in primo piano (bianca con bordo nero)
- Area immagine stilizzata (blu con simbolo centrale)
- Carte secondarie dietro per effetto profondità
- Design minimalista e pulito

## 🔄 Conversioni necessarie

I file SVG devono essere convertiti nelle seguenti dimensioni PNG/ICO:

### Favicon
1. **favicon.ico** - 16x16, 32x32, 48x48 (multi-size ICO)
2. **favicon-16x16.png** - 16x16 PNG
3. **favicon-32x32.png** - 32x32 PNG
4. **apple-touch-icon.png** - 180x180 PNG (per iOS)
5. **favicon-192x192.png** - 192x192 PNG (per PWA)
6. **favicon-512x512.png** - 512x512 PNG (per PWA)
7. **og-image.png** - 1200x630 PNG (per Open Graph)

## 🛠️ Strumenti per conversioni

### ⭐ Opzione 1: Online (RACCOMANDATO - Più semplice)
1. **Favicon Generator**: https://realfavicongenerator.net/
   - Vai su https://realfavicongenerator.net/
   - Carica il file `public/logo-icon.svg`
   - Il generatore creerà automaticamente tutte le dimensioni necessarie
   - Scarica il pacchetto completo
   - Sostituisci i file nella cartella `public/`
   - **Vantaggio**: Genera anche il favicon.ico multi-size corretto

2. **SVG to PNG**: https://cloudconvert.com/svg-to-png
   - Carica `logo-icon.svg`
   - Converti alle dimensioni necessarie (16x16, 32x32, 180x180, 192x192, 512x512)
   - Per og-image (1200x630): usa aspect ratio personalizzato

### Opzione 2: Script Node.js (se hai sharp installato)
```bash
# Installa sharp
npm install --save-dev sharp

# Esegui lo script
npm run generate-favicons
```

**Nota**: Lo script è in `scripts/generate-favicons.js` ma richiede `sharp`. 
Se preferisci, usa l'opzione online che è più semplice.

### Opzione 3: ImageMagick (CLI)
```bash
# Installa ImageMagick
# Windows: choco install imagemagick
# Mac: brew install imagemagick
# Linux: sudo apt-get install imagemagick

# Converti SVG a PNG
magick public/logo-icon.svg -resize 16x16 public/favicon-16x16.png
magick public/logo-icon.svg -resize 32x32 public/favicon-32x32.png
magick public/logo-icon.svg -resize 180x180 public/apple-touch-icon.png
magick public/logo-icon.svg -resize 192x192 public/favicon-192x192.png
magick public/logo-icon.svg -resize 512x512 public/favicon-512x512.png

# Crea favicon.ico multi-size
magick public/logo-icon.svg -define icon:auto-resize=16,32,48 public/favicon.ico

# Crea og-image (1200x630)
magick public/logo-icon.svg -resize 1200x630 -extent 1200x630 -gravity center -background white public/og-image.png
```

### Opzione 4: Photoshop/GIMP
1. Apri `public/logo-icon.svg` in Photoshop/GIMP
2. Esporta alle dimensioni necessarie
3. Salva come PNG nelle dimensioni corrette in `public/`

## 📝 Checklist

Dopo le conversioni, verifica che esistano questi file in `public/`:

- [ ] `favicon.ico` (multi-size)
- [ ] `favicon-16x16.png`
- [ ] `favicon-32x32.png`
- [ ] `apple-touch-icon.png` (180x180)
- [ ] `favicon-192x192.png`
- [ ] `favicon-512x512.png`
- [ ] `og-image.png` (1200x630)
- [ ] `logo.svg` (già presente)

## 🎯 Utilizzo nel sito

### ✅ Logo nel Header
Il logo è **già integrato** nel componente Header (`src/components/Header.tsx`).
Viene mostrato insieme al testo "my-tcg.it" (testo nascosto su mobile, solo logo).

### ✅ Favicon
I favicon sono già configurati in `index.html` e `site.webmanifest`.
Il favicon SVG è già attivo come fallback moderno.

## 🔧 Personalizzazione

Se vuoi modificare il design:

1. Apri `logo-icon.svg` in un editor SVG (Inkscape, Figma, Adobe Illustrator)
2. Modifica colori, forme, dimensioni
3. Esporta e riconverti alle dimensioni necessarie

### Colori attuali
- Carta principale: `#ffffff` (bianco)
- Bordo: `#1a1a1a` (nero)
- Area immagine: `#2563eb` (blu)
- Carte secondarie: `#e5e5e5`, `#d0d0d0` (grigi)

## ✅ Verifica

Dopo aver aggiunto i file:

1. Riavvia il server: `npm run dev`
2. Visita il sito e controlla:
   - Favicon nella tab del browser
   - Logo nel header (se aggiunto)
   - Open Graph image quando condividi il link
3. Testa su mobile:
   - Icona sulla home screen (iOS/Android)
   - Favicon nel browser mobile

## 📚 Risorse

- [Favicon Generator](https://realfavicongenerator.net/)
- [SVG to PNG Converter](https://cloudconvert.com/svg-to-png)
- [Favicon Best Practices](https://developer.mozilla.org/en-US/docs/Web/Manifest/icons)

