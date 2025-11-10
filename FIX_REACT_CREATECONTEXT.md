# Fix: React createContext Error

## Problema

Errore: `Cannot read properties of undefined (reading 'createContext')`

## Causa

Il problema era causato dal code splitting di Vite che separava React in un chunk separato (`react-vendor`). Quando il codice principale veniva eseguito, React non era ancora disponibile, causando l'errore quando i componenti tentavano di usare `React.createContext`.

## Soluzione

React, React DOM, React Router e React Query sono stati inclusi nel bundle principale invece di essere separati in chunk. Questo garantisce che React sia sempre disponibile quando il codice viene eseguito.

## Modifiche

### vite.config.ts

```typescript
manualChunks: (id) => {
  if (id.includes('node_modules')) {
    // React e le sue dipendenze rimangono nel bundle principale
    if (
      id.includes('react') || 
      id.includes('react-dom') || 
      id.includes('react-router') ||
      id.includes('react/jsx-runtime') ||
      id.includes('scheduler') ||
      id.includes('@tanstack/react-query')
    ) {
      return undefined; // Nel bundle principale
    }
    // Altri vendor possono essere separati
    // ...
  }
}
```

## Risultato

- ✅ React è sempre disponibile quando il codice viene eseguito
- ✅ Nessun errore `createContext`
- ✅ Build funzionante
- ✅ Code splitting ancora attivo per altri vendor (Radix UI, Supabase, ecc.)

## Note

- Il bundle principale è ora più grande (~258 KB invece di ~143 KB), ma questo è necessario per garantire che React sia sempre disponibile
- Altri vendor (Radix UI, Supabase, Lucide) sono ancora separati per miglior caching
- La paginazione e il lazy loading delle immagini sono ancora attivi per ottimizzare il caricamento

## Testing

Dopo il fix:
1. Esegui `npm run build`
2. Verifica che non ci siano errori nella console
3. Testa il sito in produzione/preview
4. Verifica che tutti i componenti React funzionino correttamente

