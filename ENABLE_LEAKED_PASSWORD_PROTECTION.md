# Abilitare Leaked Password Protection in Supabase

## 📋 Informazioni

**Warning**: Leaked Password Protection Disabled

**Livello**: WARN (non critico, ma raccomandato)

**Descrizione**: Supabase Auth può verificare se le password sono state compromesse controllando il database HaveIBeenPwned.org. Questa funzionalità è attualmente disabilitata.

---

## 🎯 Come Abilitare

### Passo 1: Accedi al Dashboard Supabase

1. Vai su https://supabase.com/dashboard
2. Accedi con il tuo account
3. Seleziona il progetto `my-tcg`

### Passo 2: Vai alle Impostazioni di Autenticazione

1. Nel menu laterale, clicca su **Authentication**
2. Clicca su **Password Security** (o **Password** → **Security**)

### Passo 3: Abilita Leaked Password Protection

1. Trova l'opzione **"Leaked Password Protection"** o **"Check against HaveIBeenPwned"**
2. Attiva il toggle/spunta per abilitarla
3. Clicca su **Save** (o **Update**)

### Passo 4: Verifica

1. Dopo aver salvato, aspetta qualche minuto
2. Vai su **Database** → **Linter** (o **Security Advisor**)
3. Verifica che il warning **"Leaked Password Protection Disabled"** sia scomparso

---

## 🔍 Dettagli Tecnici

### Cosa fa?

Quando un utente cerca di registrarsi o cambiare password, Supabase:
1. Prende la password
2. Crea un hash SHA-1 della password
3. Invia le prime 5 caratteri dell'hash a HaveIBeenPwned.org
4. Riceve una lista di hash che iniziano con quelle 5 caratteri
5. Controlla se l'hash completo della password è nella lista
6. Se la password è compromessa, rifiuta la registrazione/cambio password

### Privacy

- ✅ La password completa **non viene mai inviata** a HaveIBeenPwned
- ✅ Viene inviato solo un **prefisso dell'hash** (5 caratteri)
- ✅ Il controllo è fatto in modo **anonimo e sicuro**
- ✅ HaveIBeenPwned.org è un servizio **pubblico e affidabile**

### Limiti

- ⚠️ Richiede una **chiamata esterna** a HaveIBeenPwned.org
- ⚠️ Può aggiungere un **piccolo delay** alla registrazione (di solito < 1 secondo)
- ⚠️ Funziona solo per **nuove registrazioni e cambi password**
- ⚠️ Non controlla le password esistenti

---

## 📚 Riferimenti

- [Supabase Password Security Documentation](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)
- [HaveIBeenPwned API Documentation](https://haveibeenpwned.com/API/v3#SearchingPwnedPasswordsByRange)
- [Supabase Security Advisor](https://supabase.com/docs/guides/database/database-linter)

---

## ✅ Checklist

- [ ] Accesso al dashboard Supabase
- [ ] Navigazione a Authentication → Password Security
- [ ] Abilitazione Leaked Password Protection
- [ ] Salvataggio modifiche
- [ ] Verifica nel Security Advisor che il warning sia scomparso
- [ ] Test di registrazione con password compromessa (opzionale)

---

## 🧪 Test (Opzionale)

Per verificare che funzioni, puoi provare a registrare un nuovo utente con una password nota come compromessa (es. "password123", "12345678", ecc.). Supabase dovrebbe rifiutare la registrazione con un messaggio di errore.

**Nota**: Questo test richiede di creare un nuovo account. Se hai già un account, puoi provare a cambiare la password con una compromessa.

---

## ⚠️ Nota Importante

Questa funzionalità **non può essere abilitata tramite codice o migration SQL**. Deve essere abilitata manualmente nel dashboard Supabase.

Se hai bisogno di aiuto, contatta il supporto Supabase o consulta la documentazione ufficiale.

