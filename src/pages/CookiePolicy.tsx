import Header from '@/components/Header';
import Footer from '@/components/Footer';

const CookiePolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-border bg-premium-gradient">
          <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20 lg:py-24">
            <div className="max-w-3xl mx-auto text-center space-y-4 sm:space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                Cookie Policy
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed px-4 font-medium">
                Ultimo aggiornamento: 15/11/2025
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 sm:py-16 md:py-24 bg-accent/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-8 sm:space-y-10">
              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4">Introduzione</h2>
                <p className="text-sm sm:text-base text-muted-foreground">Questo sito, previo tuo consenso, utilizza cookie di analisi/measurement per statistiche aggregate sull'uso del sito (es. numero visite, pagine viste). In assenza di consenso, vengono installati solo cookie tecnici necessari.</p>
                <p className="text-sm sm:text-base text-muted-foreground mt-3">Nel pannello di preferenze puoi modificare in qualsiasi momento le scelte.</p>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4">Categorie di cookie</h2>
                
                <div className="space-y-6 mt-4">
                  <div className="border-l-4 border-primary pl-4">
                    <h3 className="text-base sm:text-lg font-semibold mb-2">Cookie Tecnici (sempre attivi)</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">Necessari per erogare il sito (sessione, sicurezza). Per l'installazione di questi cookie non è richiesto il preventivo consenso degli utenti.</p>
                    <ul className="list-disc pl-6 mt-2 space-y-1 text-sm sm:text-base text-muted-foreground">
                      <li><strong className="text-foreground">Finalità:</strong> Garantire il corretto funzionamento del sito e l'autenticazione dell'area riservata</li>
                      <li><strong className="text-foreground">Durata:</strong> Sessione o persistenti per la durata necessaria</li>
                      <li><strong className="text-foreground">Base giuridica:</strong> Legittimo interesse (art. 6.1 f GDPR)</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-accent pl-4">
                    <h3 className="text-base sm:text-lg font-semibold mb-2">Cookie Analytics (facoltativi)</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">Raccolgono informazioni in forma aggregata sull'utilizzo del sito.</p>
                    <ul className="list-disc pl-6 mt-2 space-y-1 text-sm sm:text-base text-muted-foreground">
                      <li><strong className="text-foreground">Nome:</strong> _ga</li>
                      <li><strong className="text-foreground">Durata:</strong> 2 anni</li>
                      <li><strong className="text-foreground">Finalità:</strong> Statistiche aggregate sull'uso del sito</li>
                      <li><strong className="text-foreground">Fornitore:</strong> Google LLC (Google Analytics 4 con IP masking)</li>
                      <li><strong className="text-foreground">Base giuridica:</strong> Consenso (art. 6.1 a GDPR)</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4">Gestione delle preferenze</h2>
                <p className="text-sm sm:text-base text-muted-foreground">Puoi accettare o rifiutare i cookie Analytics tramite:</p>
                <ul className="list-disc pl-6 space-y-2 mt-3 text-sm sm:text-base text-muted-foreground">
                  <li>Il banner iniziale che appare alla prima visita del sito</li>
                  <li>Il link "Impostazioni cookie" presente nel footer di ogni pagina</li>
                  <li>Le impostazioni del tuo browser (vedi sezione successiva)</li>
                </ul>
                <p className="text-sm sm:text-base text-muted-foreground mt-3">I cookie tecnici sono sempre attivi e non possono essere disabilitati tramite il pannello preferenze, in quanto necessari al funzionamento del sito.</p>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4">Gestione cookie dal browser</h2>
                <p className="text-sm sm:text-base text-muted-foreground">È possibile gestire i cookie direttamente dal browser utilizzato, accedendo alle impostazioni relative alla privacy. Si ricorda tuttavia che la disabilitazione dei cookie tecnici potrebbe compromettere la corretta fruizione di alcune funzionalità del sito.</p>
                
                <p className="text-sm sm:text-base font-medium text-foreground mt-4">Link utili per la gestione dei cookie nei principali browser:</p>
                <ul className="list-disc pl-6 space-y-2 mt-3 text-sm sm:text-base text-muted-foreground">
                  <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Chrome</a></li>
                  <li><a href="https://support.mozilla.org/it/kb/Gestione%20dei%20cookie" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mozilla Firefox</a></li>
                  <li><a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Apple Safari</a></li>
                  <li><a href="https://support.microsoft.com/it-it/windows/gestire-i-cookie-in-microsoft-edge" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Microsoft Edge</a></li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4">Scelte tecniche "cookie-light"</h2>
                <p className="text-sm sm:text-base text-muted-foreground">Per minimizzare l'uso di cookie e script di terze parti, questo sito adotta le seguenti scelte tecniche:</p>
                <ul className="list-disc pl-6 space-y-2 mt-3 text-sm sm:text-base text-muted-foreground">
                  <li>Nessun reCAPTCHA (utilizziamo honeypot e rate-limit server per proteggere i form)</li>
                  <li>Nessun embed di servizi esterni (mappe, YouTube, iframe social)</li>
                  <li>Font caricati localmente quando possibile</li>
                  <li>Analytics con IP masking per garantire l'anonimizzazione dei dati</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4">Aggiornamenti</h2>
                <p className="text-sm sm:text-base text-muted-foreground">Questa Cookie Policy può essere aggiornata periodicamente. La versione corrente è sempre disponibile su questa pagina con indicazione della data di ultimo aggiornamento.</p>
              </section>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CookiePolicy;
