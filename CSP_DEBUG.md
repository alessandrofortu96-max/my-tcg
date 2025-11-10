# Debug Content Security Policy (CSP)

## Come verificare il CSP in produzione

### 1. Apri DevTools nel browser
- Premi `F12` o `Ctrl+Shift+I` (Windows/Linux) o `Cmd+Option+I` (Mac)
- Vai alla tab **Network**

### 2. Ricarica la pagina
- Premi `F5` o `Ctrl+R` per ricaricare
- Cerca la richiesta per il documento HTML (di solito la prima, tipo `my-tcg.it` o `index.html`)

### 3. Controlla i Response Headers
- Clicca sulla richiesta del documento HTML
- Vai alla tab **Headers**
- Scorri fino a **Response Headers**
- Cerca `Content-Security-Policy`

### 4. Verifica che il CSP includa Supabase
Il CSP dovrebbe contenere:
```
connect-src 'self' https://fonts.googleapis.com https://bptynzlbmccwkipwrhys.supabase.co wss://bptynzlbmccwkipwrhys.supabase.co;
```

### 5. Se il CSP non include Supabase

#### Opzione A: Verifica che vercel.json sia corretta
Controlla che `vercel.json` contenga:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://fonts.googleapis.com https://bptynzlbmccwkipwrhys.supabase.co wss://bptynzlbmccwkipwrhys.supabase.co; frame-ancestors 'none';"
        }
      ]
    }
  ]
}
```

#### Opzione B: Verifica che non ci siano header CSP manuali su Vercel
1. Vai su **Vercel Dashboard** → Il tuo progetto → **Settings** → **Headers**
2. Verifica che non ci siano header CSP configurati manualmente che sovrascrivono `vercel.json`
3. Se ci sono, rimuovili o aggiornali per includere Supabase

#### Opzione C: Redeploy forzato
1. Vai su **Vercel Dashboard** → Il tuo progetto → **Deployments**
2. Clicca sui **3 puntini** (⋯) dell'ultimo deployment
3. Seleziona **Redeploy**
4. Attendi che il deploy si completi (1-2 minuti)

#### Opzione D: Hard refresh del browser
- Windows/Linux: `Ctrl+F5` o `Ctrl+Shift+R`
- Mac: `Cmd+Shift+R`
- Oppure apri una finestra in incognito

### 6. Se ancora non funziona

#### Temporaneamente rimuovi il CSP per testare
Se vuoi testare se il problema è davvero il CSP, puoi temporaneamente rimuovere la direttiva CSP da `vercel.json`:

1. Commenta o rimuovi la sezione CSP in `vercel.json`
2. Fai commit e push
3. Attendi il deploy
4. Verifica se Supabase funziona
5. Se funziona, il problema è il CSP - rimetti il CSP con il dominio Supabase incluso

#### Verifica le variabili d'ambiente
Anche se `VITE_SUPABASE_URL` è corretto, verifica che sia configurato su Vercel:

1. Vai su **Vercel Dashboard** → Il tuo progetto → **Settings** → **Environment Variables**
2. Verifica che `VITE_SUPABASE_URL` sia presente e abbia il valore corretto: `https://bptynzlbmccwkipwrhys.supabase.co`
3. Verifica che `VITE_SUPABASE_ANON_KEY` sia presente
4. Assicurati che entrambe siano selezionate per **Production**, **Preview**, e **Development**

## Variabili d'Ambiente Corrette

### Client-Side (prefisso `VITE_`)
Queste variabili sono esposte al browser:
- `VITE_SUPABASE_URL=https://bptynzlbmccwkipwrhys.supabase.co`
- `VITE_SUPABASE_ANON_KEY=your-anon-key`

### Server-Side (senza prefisso `VITE_`)
Queste variabili sono disponibili SOLO nelle API routes:
- `SUPABASE_SERVICE_ROLE_KEY=your-service-role-key`

**NOTA:** Per Vite, le variabili client-side DEVONO avere il prefisso `VITE_`. Non aggiungere `SUPABASE_URL` senza il prefisso per il client-side.

