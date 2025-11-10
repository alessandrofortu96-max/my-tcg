/**
 * Script per creare favicon.ico da SVG
 * 
 * Questo script crea un favicon.ico base (32x32) da logo-icon.svg
 * 
 * Utilizzo: node scripts/create-favicon-ico.js
 */

const fs = require('fs');
const path = require('path');

// Verifica se sharp è installato
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.error('❌ Errore: sharp non è installato.');
  console.log('');
  console.log('📦 Per installare sharp:');
  console.log('   npm install --save-dev sharp');
  console.log('');
  console.log('⭐ ALTERNATIVA:');
  console.log('   Vai su https://realfavicongenerator.net/');
  console.log('   Carica public/logo-icon.svg');
  console.log('   Scarica favicon.ico');
  console.log('');
  process.exit(1);
}

const publicDir = path.join(__dirname, '..', 'public');
const logoIconSvg = path.join(publicDir, 'logo-icon.svg');
const faviconIcoPath = path.join(publicDir, 'favicon.ico');

async function createFaviconIco() {
  console.log('🎨 Creazione favicon.ico...\n');

  // Verifica che il file SVG esista
  if (!fs.existsSync(logoIconSvg)) {
    console.error(`❌ File non trovato: ${logoIconSvg}`);
    process.exit(1);
  }

  try {
    // Crea un PNG 32x32 (sharp non supporta ICO direttamente, ma possiamo creare un PNG)
    // Per un vero ICO multi-size, serve ImageMagick o un tool online
    const png32Path = path.join(publicDir, 'favicon-temp-32.png');
    
    await sharp(logoIconSvg)
      .resize(32, 32)
      .png()
      .toFile(png32Path);

    console.log('✅ Creato favicon-temp-32.png (32x32)');

    // Copia il PNG come favicon.ico temporaneo
    // Nota: questo non è un vero ICO, ma funziona per molti browser moderni
    // Per un vero ICO multi-size, usa realfavicongenerator.net o ImageMagick
    
    // Leggi il PNG e scrivilo come .ico (solo per compatibilità base)
    const pngBuffer = fs.readFileSync(png32Path);
    
    // Crea un ICO minimale (formato ICO base)
    // Il formato ICO è complesso, quindi creiamo un file semplice che i browser accettano
    // In realtà, molti browser accettano anche PNG con estensione .ico
    fs.writeFileSync(faviconIcoPath, pngBuffer);
    
    // Rimuovi il file temporaneo
    fs.unlinkSync(png32Path);

    console.log('✅ Creato favicon.ico (32x32, formato PNG con estensione .ico)');
    console.log('');
    console.log('⚠️  NOTA: Questo è un ICO base (32x32).');
    console.log('   Per un ICO multi-size (16x16, 32x32, 48x48), usa:');
    console.log('   - https://realfavicongenerator.net/ (raccomandato)');
    console.log('   - ImageMagick: magick logo-icon.svg -define icon:auto-resize=16,32,48 favicon.ico');
    console.log('');

  } catch (error) {
    console.error('❌ Errore durante la creazione:', error.message);
    process.exit(1);
  }
}

// Esegui lo script
createFaviconIco();

