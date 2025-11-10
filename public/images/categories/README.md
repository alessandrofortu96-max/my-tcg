# Istruzioni per le Immagini delle Categorie

## 📁 Dove inserire le immagini

Inserisci le immagini nella cartella:
```
public/images/categories/
```

## 📝 Nomi file richiesti

Devi creare le seguenti immagini con questi nomi esatti:

### 1. Categoria Pokémon
- **Nome file**: `pokemon.jpg` OPPURE `pokemon.png`
- **Utilizzo**: Card categoria nella homepage

### 2. Categoria Yu-Gi-Oh!
- **Nome file**: `yugioh.jpg` OPPURE `yugioh.png`
- **Utilizzo**: Card categoria nella homepage

### 3. Categoria One Piece
- **Nome file**: `onepiece.jpg` OPPURE `onepiece.png`
- **Utilizzo**: Card categoria nella homepage

### 4. Categoria Altri prodotti
- **Nome file**: `other.jpg` OPPURE `other.png`
- **Utilizzo**: Card categoria nella homepage

## 🎨 Specifiche tecniche

### Formato
- **JPG**: Consigliato per foto/immagini complesse (peso minore)
- **PNG**: Consigliato se hai bisogno di trasparenza o immagini semplici

### Dimensioni consigliate
- **Larghezza**: 800-1200px
- **Altezza**: 600-900px (aspect ratio 4:3)
- **Aspect ratio**: 4:3 (ottimale per le card)

### Ottimizzazione
- **Peso file**: Cerca di mantenere sotto i 300KB per performance ottimali
- **Strumenti**: Usa strumenti come TinyPNG, ImageOptim o Squoosh per comprimere
- **Qualità**: Bilanciare qualità visiva e dimensione file

### Stile
- Le immagini verranno visualizzate nelle card categoria con aspect ratio 4:3
- Le immagini avranno un effetto hover (zoom) al passaggio del mouse
- Scegli immagini rappresentative per ogni categoria
- Assicurati che le immagini siano ben centrate e visibili anche con il crop

## 📂 Struttura finale

Dopo aver inserito le immagini, la struttura sarà:

```
public/
└── images/
    └── categories/
        ├── pokemon.jpg (o .png)
        ├── yugioh.jpg (o .png)
        ├── onepiece.jpg (o .png)
        └── other.jpg (o .png)
```

## ✅ Come funziona

1. Il codice carica le immagini dalla cartella `public/images/categories/`
2. Le immagini vengono mostrate nelle card categoria nella homepage
3. Al click sulla card, si viene reindirizzati alla pagina della categoria
4. Le immagini hanno un effetto hover con leggero zoom

## 🔍 Verifica

Dopo aver inserito le immagini:

1. Avvia il server: `npm run dev`
2. Visita la homepage: dovresti vedere le immagini nelle card categoria
3. Passa il mouse sulle card: dovresti vedere l'effetto hover (zoom)
4. Se non vedi le immagini, controlla:
   - I nomi file sono corretti (case-sensitive su alcuni sistemi)
   - Le immagini sono nella cartella `public/images/categories/`
   - Ricarica la pagina con Ctrl+F5 (hard refresh)

## 💡 Consigli

- **Temi immagini**:
  - Pokémon: Carte Pokémon famose, Charizard, Pikachu, etc.
  - Yu-Gi-Oh!: Carte Yu-Gi-Oh! iconiche, Dark Magician, Blue-Eyes, etc.
  - One Piece: Carte One Piece, personaggi famosi, Luffy, etc.
  - Other: Collezione generica o mix di altri giochi TCG

- **Composizione**: 
  - Centra il soggetto principale
  - Lascia un po' di spazio attorno ai bordi (per evitare tagli con il crop)
  - Usa immagini con buona illuminazione e contrasto

- **Colori**: Immagini vivaci e colorate funzionano meglio per attirare l'attenzione

