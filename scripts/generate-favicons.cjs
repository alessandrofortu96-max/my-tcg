/**
 * Script per generare favicon e icon PNG da SVG
 * 
 * NOTA: Questo script richiede sharp installato
 * Installazione: npm install --save-dev sharp
 * 
 * Utilizzo: node scripts/generate-favicons.js
 */

const fs = require('fs');
const path = require('path');

// Verifica se sharp è installato
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.error('❌ Errore: sharp non è installato.');
  console.log('📦 Installa sharp con: npm install --save-dev sharp');
  console.log('📚 Alternativa: usa https://realfavicongenerator.net/ per generare i favicon online');
  process.exit(1);
}

const publicDir = path.join(__dirname, '..', 'public');
const logoIconSvg = path.join(publicDir, 'logo-icon.svg');
const faviconSvg = path.join(publicDir, 'favicon.svg');

// Dimensioni richieste
const sizes = {
  'favicon-16x16.png': 16,
  'favicon-32x32.png': 32,
  'apple-touch-icon.png': 180,
  'favicon-192x192.png': 192,
  'favicon-512x512.png': 512,
  'og-image.png': { width: 1200, height: 630 },
};

async function generateFavicons() {
  console.log('🎨 Generazione favicon e icone...\n');

  // Verifica che il file SVG esista
  if (!fs.existsSync(logoIconSvg)) {
    console.error(`❌ File non trovato: ${logoIconSvg}`);
    console.log('💡 Crea prima il file logo-icon.svg nella cartella public/');
    process.exit(1);
  }

  try {
    // Genera le dimensioni standard
    for (const [filename, size] of Object.entries(sizes)) {
      const outputPath = path.join(publicDir, filename);
      
      if (typeof size === 'object') {
        // Per og-image (1200x630)
        await sharp(logoIconSvg)
          .resize(size.width, size.height, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 1 }
          })
          .extend({
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            background: { r: 255, g: 255, b: 255, alpha: 1 }
          })
          .png()
          .toFile(outputPath);
        console.log(`✅ Creato: ${filename} (${size.width}x${size.height})`);
      } else {
        // Per le altre dimensioni (quadrate)
        await sharp(logoIconSvg)
          .resize(size, size)
          .png()
          .toFile(outputPath);
        console.log(`✅ Creato: ${filename} (${size}x${size})`);
      }
    }

    // Genera favicon.ico (multi-size)
    // Nota: sharp non supporta direttamente ICO multi-size
    // Generiamo solo la versione 32x32 come ICO
    const faviconIcoPath = path.join(publicDir, 'favicon.ico');
    await sharp(logoIconSvg)
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'favicon-temp-32.png'));

    // Per un vero ICO multi-size, usa ImageMagick o un tool online
    console.log('\n⚠️  favicon.ico: Per un ICO multi-size (16x16, 32x32, 48x48),');
    console.log('   usa https://realfavicongenerator.net/ o ImageMagick');
    console.log('   ImageMagick: magick logo-icon.svg -define icon:auto-resize=16,32,48 favicon.ico\n');

    console.log('✨ Generazione completata!\n');
    console.log('📝 File generati:');
    Object.keys(sizes).forEach(filename => {
      console.log(`   - ${filename}`);
    });
    console.log('\n💡 Prossimi passi:');
    console.log('   1. Genera favicon.ico usando https://realfavicongenerator.net/');
    console.log('   2. Verifica che tutti i file siano in public/');
    console.log('   3. Riavvia il server di sviluppo');

  } catch (error) {
    console.error('❌ Errore durante la generazione:', error.message);
    process.exit(1);
  }
}

// Esegui lo script
generateFavicons();

