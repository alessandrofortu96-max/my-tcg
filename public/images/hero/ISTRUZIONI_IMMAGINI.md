# Istruzioni per le Immagini Hero

## 📁 Dove inserire le immagini

Inserisci le immagini nella cartella:
```
public/images/hero/
```

## 📝 Nomi file richiesti

Devi creare le seguenti immagini con questi nomi esatti:

### 1. Homepage
- **Nome file**: `home.jpg` OPPURE `home.png`
- **Utilizzo**: Hero section della homepage principale

### 2. Categoria Pokémon
- **Nome file**: `pokemon.jpg` OPPURE `pokemon.png`
- **Utilizzo**: Hero section della pagina `/categoria/pokemon`

### 3. Categoria Yu-Gi-Oh!
- **Nome file**: `yugioh.jpg` OPPURE `yugioh.png`
- **Utilizzo**: Hero section della pagina `/categoria/yugioh`

### 4. Categoria One Piece
- **Nome file**: `onepiece.jpg` OPPURE `onepiece.png`
- **Utilizzo**: Hero section della pagina `/categoria/onepiece`

### 5. Categoria Altri prodotti
- **Nome file**: `other.jpg` OPPURE `other.png`
- **Utilizzo**: Hero section della pagina `/categoria/other`

## 🎨 Specifiche tecniche

### Formato
- **JPG**: Consigliato per foto/immagini complesse (peso minore)
- **PNG**: Consigliato se hai bisogno di trasparenza o immagini semplici

### Dimensioni consigliate
- **Larghezza**: 1920px (Full HD) o superiore
- **Altezza**: 600-800px (per hero section)
- **Aspect ratio**: 16:9 o 21:9 (panoramico)

### Ottimizzazione
- **Peso file**: Cerca di mantenere sotto i 500KB per performance ottimali
- **Strumenti**: Usa strumenti come TinyPNG, ImageOptim o Squoosh per comprimere
- **Qualità**: Bilanciare qualità visiva e dimensione file

### Stile
- Le immagini avranno un **overlay bianco semi-trasparente** (75% opacità) per garantire leggibilità del testo nero scuro
- Scegli immagini che funzionano bene con testo sovrapposto
- Evita immagini troppo chiare o con molti dettagli nella parte centrale (dove va il testo)

## 📂 Struttura finale

Dopo aver inserito le immagini, la struttura sarà:

```
public/
└── images/
    └── hero/
        ├── home.jpg (o .png)
        ├── pokemon.jpg (o .png)
        ├── yugioh.jpg (o .png)
        ├── onepiece.jpg (o .png)
        └── other.jpg (o .png)
```

## ✅ Come funziona

1. Il codice prova prima a caricare il file `.jpg`
2. Se non trova il `.jpg`, prova con il `.png`
3. Se non trova nessuno dei due, usa il gradiente di fallback (`bg-premium-gradient`)

## 🔍 Verifica

Dopo aver inserito le immagini:

1. Avvia il server: `npm run dev`
2. Visita la homepage: dovresti vedere l'immagine `home.jpg` o `home.png`
3. Visita una categoria (es. `/categoria/pokemon`): dovresti vedere l'immagine corrispondente
4. Se non vedi le immagini, controlla:
   - I nomi file sono corretti (case-sensitive su alcuni sistemi)
   - Le immagini sono nella cartella `public/images/hero/`
   - Ricarica la pagina con Ctrl+F5 (hard refresh)

## 💡 Consigli

- **Temi immagini**:
  - Home: Collezione generale di carte TCG, mix di giochi
  - Pokémon: Carte Pokémon, Charizard, Pikachu, etc.
  - Yu-Gi-Oh!: Carte Yu-Gi-Oh!, Dark Magician, Blue-Eyes, etc.
  - One Piece: Carte One Piece, personaggi famosi
  - Other: Collezione generica o mix di altri giochi

- **Composizione**: Considera di lasciare spazio al centro per il testo (zona "safe area")

- **Colori**: Immagini con colori vivaci funzionano bene con l'overlay bianco, mantenendo il testo nero scuro leggibile

