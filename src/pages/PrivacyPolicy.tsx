import Header from '@/components/Header';
import Footer from '@/components/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-border bg-premium-gradient">
          <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20 lg:py-24">
            <div className="max-w-3xl mx-auto text-center space-y-4 sm:space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                Privacy Policy
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
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4">Titolare del trattamento</h2>
                <p className="text-sm sm:text-base text-muted-foreground">Alessandro Fortunato – Email: info@my-tcg.it</p>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4">Che dati tratto</h2>
                <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
                  <li>Dati che mi invii volontariamente tramite modulo di contatto (nome, email, messaggio) o via email.</li>
                  <li>Dati di navigazione tecnici (log del server, indirizzo IP, timestamp, user-agent) necessari al funzionamento e alla sicurezza del sito.</li>
                  <li>Link esterni a Telegram: cliccando "Contattami su Telegram" vieni reindirizzato a un servizio terzo; Telegram può trattare dati secondo le proprie policy.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4">Finalità e basi giuridiche</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2">Gestione delle richieste inviate tramite modulo/email e trattative di vendita tra privati</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">Base giuridica: esecuzione di misure precontrattuali e legittimo interesse a rispondere (art. 6.1 b/f GDPR).</p>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2">Sicurezza e funzionamento del sito (log tecnici)</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">Base giuridica: legittimo interesse del Titolare a garantire integrità e sicurezza (art. 6.1 f).</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4">Natura del conferimento</h2>
                <p className="text-sm sm:text-base text-muted-foreground">Inviare messaggi è facoltativo; senza i dati minimi (nome, email, testo) non posso risponderti.</p>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4">Conservazione</h2>
                <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
                  <li><strong className="text-foreground">Messaggi ricevuti:</strong> fino a 12 mesi dall'ultima comunicazione, salvo necessità ulteriori (es. tutela legale).</li>
                  <li><strong className="text-foreground">Log tecnici:</strong> indicativamente 7–30 giorni salvo estensioni per sicurezza.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4">Destinatari e categorie di fornitori</h2>
                <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
                  <li>Fornitore hosting e email del Titolare (solo per esigenze tecniche/erogazione del servizio).</li>
                  <li>Piattaforme di comunicazione esterne scelte dall'utente (es. Telegram): trattano i dati come Titolari autonomi.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4">Trasferimenti extra-UE</h2>
                <p className="text-sm sm:text-base text-muted-foreground">L'uso di servizi terzi (es. Telegram) può comportare trasferimenti fuori dallo SEE. Quando possibile seleziono fornitori con adeguate garanzie; in ogni caso il reindirizzamento avviene solo su tua azione.</p>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4">Diritti dell'interessato</h2>
                <p className="text-sm sm:text-base text-muted-foreground">Puoi chiedere accesso, rettifica, cancellazione, limitazione, portabilità, opposizione. Puoi anche proporre reclamo al Garante per la protezione dei dati personali. Per esercitare i diritti: info@my-tcg.it.</p>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4">Minori</h2>
                <p className="text-sm sm:text-base text-muted-foreground">Il sito non è destinato a minori di 14 anni. Se ritieni che siano stati inviati dati di minori, scrivimi per rimuoverli.</p>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4">Sicurezza</h2>
                <p className="text-sm sm:text-base text-muted-foreground">Adotto misure tecniche e organizzative adeguate a proteggere i dati (es. HTTPS, controlli di accesso).</p>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4">Modifiche</h2>
                <p className="text-sm sm:text-base text-muted-foreground">Questa informativa può essere aggiornata. La versione corrente è sempre pubblicata su questa pagina.</p>
              </section>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
