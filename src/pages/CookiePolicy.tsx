import Header from '@/components/Header';
import Footer from '@/components/Footer';

const CookiePolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Ultimo aggiornamento: 15/11/2025</p>

        <div className="prose prose-sm max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">Introduzione</h2>
            <p>Questo sito, previo tuo consenso, utilizza cookie di analisi/measurement per statistiche aggregate sull'uso del sito (es. numero visite, pagine viste). In assenza di consenso, vengono installati solo cookie tecnici necessari.</p>
            <p className="mt-3">Nel pannello di preferenze puoi modificare in qualsiasi momento le scelte.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Categorie di cookie</h2>
            
            <div className="space-y-4 mt-4">
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold text-lg mb-2">Cookie Tecnici (sempre attivi)</h3>
                <p className="text-muted-foreground">Necessari per erogare il sito (sessione, sicurezza). Per l'installazione di questi cookie non è richiesto il preventivo consenso degli utenti.</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li><strong>Finalità:</strong> Garantire il corretto funzionamento del sito e l'autenticazione dell'area riservata</li>
                  <li><strong>Durata:</strong> Sessione o persistenti per la durata necessaria</li>
                  <li><strong>Base giuridica:</strong> Legittimo interesse (art. 6.1 f GDPR)</li>
                </ul>
              </div>

              <div className="border-l-4 border-accent pl-4">
                <h3 className="font-semibold text-lg mb-2">Cookie Analytics (facoltativi)</h3>
                <p className="text-muted-foreground">Raccolgono informazioni in forma aggregata sull'utilizzo del sito.</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li><strong>Nome:</strong> _ga</li>
                  <li><strong>Durata:</strong> 2 anni</li>
                  <li><strong>Finalità:</strong> Statistiche aggregate sull'uso del sito</li>
                  <li><strong>Fornitore:</strong> Google LLC (Google Analytics 4 con IP masking)</li>
                  <li><strong>Base giuridica:</strong> Consenso (art. 6.1 a GDPR)</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Gestione delle preferenze</h2>
            <p>Puoi accettare o rifiutare i cookie Analytics tramite:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Il banner iniziale che appare alla prima visita del sito</li>
              <li>Il link "Impostazioni cookie" presente nel footer di ogni pagina</li>
              <li>Le impostazioni del tuo browser (vedi sezione successiva)</li>
            </ul>
            <p className="mt-3">I cookie tecnici sono sempre attivi e non possono essere disabilitati tramite il pannello preferenze, in quanto necessari al funzionamento del sito.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Gestione cookie dal browser</h2>
            <p>È possibile gestire i cookie direttamente dal browser utilizzato, accedendo alle impostazioni relative alla privacy. Si ricorda tuttavia che la disabilitazione dei cookie tecnici potrebbe compromettere la corretta fruizione di alcune funzionalità del sito.</p>
            
            <p className="mt-4 font-medium">Link utili per la gestione dei cookie nei principali browser:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/it/kb/Gestione%20dei%20cookie" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Apple Safari</a></li>
              <li><a href="https://support.microsoft.com/it-it/windows/gestire-i-cookie-in-microsoft-edge" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Microsoft Edge</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Scelte tecniche "cookie-light"</h2>
            <p>Per minimizzare l'uso di cookie e script di terze parti, questo sito adotta le seguenti scelte tecniche:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Nessun reCAPTCHA (utilizziamo honeypot e rate-limit server per proteggere i form)</li>
              <li>Nessun embed di servizi esterni (mappe, YouTube, iframe social)</li>
              <li>Font caricati localmente quando possibile</li>
              <li>Analytics con IP masking per garantire l'anonimizzazione dei dati</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Aggiornamenti</h2>
            <p>Questa Cookie Policy può essere aggiornata periodicamente. La versione corrente è sempre disponibile su questa pagina con indicazione della data di ultimo aggiornamento.</p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CookiePolicy;
