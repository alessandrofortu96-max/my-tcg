import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080, // Vite userà automaticamente un'altra porta se questa è occupata
    headers: {
      // Security headers for development
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    },
  },
  preview: {
    port: 4173,
    headers: {
      // Security headers for preview
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
      "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://fonts.googleapis.com https://*.supabase.co https://*.supabase.io;",
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Generate source maps for production (opzionale, rimuovi se non serve)
    sourcemap: false,
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Minificazione e ottimizzazione
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Separare vendor chunks per miglior caching
          if (id.includes('node_modules')) {
            // IMPORTANTE: React, react-dom, react-router, @tanstack/react-query devono rimanere nel bundle principale
            // per evitare problemi di caricamento con createContext e altri hook React
            // Non separare React e le sue dipendenze in chunk separati
            if (
              id.includes('react') || 
              id.includes('react-dom') || 
              id.includes('react-router') ||
              id.includes('react/jsx-runtime') ||
              id.includes('scheduler') ||
              id.includes('@tanstack/react-query') ||
              id.includes('@supabase')
            ) {
              // Non creare un chunk separato per React, React Query e Supabase
              // Lasciamoli nel bundle principale per evitare problemi di inizializzazione
              return undefined;
            }
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'icons-vendor';
            }
            return 'vendor';
          }
        },
        // Ottimizza nomi file per caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Ottimizzazioni CSS
    cssCodeSplit: true,
    cssMinify: true,
  },
  optimizeDeps: {
    // Pre-bundle React, React Query e Supabase per evitare problemi di caricamento
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js',
    ],
    // Escludi le API routes dal pre-bundling
    exclude: ['@vercel/node'],
  },
});
