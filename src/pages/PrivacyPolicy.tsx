import Header from '@/components/Header';
import Footer from '@/components/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Ultimo aggiornamento: 15/11/2025</p>

        <div className="prose prose-sm max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">Titolare del trattamento</h2>
            <p>Alessandro Fortunato – Email: info@my-tcg.it</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Che dati tratto</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Dati che mi invii volontariamente tramite modulo di contatto (nome, email, messaggio) o via email.</li>
              <li>Dati di navigazione tecnici (log del server, indirizzo IP, timestamp, user-agent) necessari al funzionamento e alla sicurezza del sito.</li>
              <li>Link esterni a Telegram: cliccando "Contattami su Telegram" vieni reindirizzato a un servizio terzo; Telegram può trattare dati secondo le proprie policy.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Finalità e basi giuridiche</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-1">Gestione delle richieste inviate tramite modulo/email e trattative di vendita tra privati</h3>
                <p className="text-muted-foreground">Base giuridica: esecuzione di misure precontrattuali e legittimo interesse a rispondere (art. 6.1 b/f GDPR).</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Sicurezza e funzionamento del sito (log tecnici)</h3>
                <p className="text-muted-foreground">Base giuridica: legittimo interesse del Titolare a garantire integrità e sicurezza (art. 6.1 f).</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Natura del conferimento</h2>
            <p>Inviare messaggi è facoltativo; senza i dati minimi (nome, email, testo) non posso risponderti.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Conservazione</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Messaggi ricevuti:</strong> fino a 12 mesi dall'ultima comunicazione, salvo necessità ulteriori (es. tutela legale).</li>
              <li><strong>Log tecnici:</strong> indicativamente 7–30 giorni salvo estensioni per sicurezza.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Destinatari e categorie di fornitori</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fornitore hosting e email del Titolare (solo per esigenze tecniche/erogazione del servizio).</li>
              <li>Piattaforme di comunicazione esterne scelte dall'utente (es. Telegram): trattano i dati come Titolari autonomi.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Trasferimenti extra-UE</h2>
            <p>L'uso di servizi terzi (es. Telegram) può comportare trasferimenti fuori dallo SEE. Quando possibile seleziono fornitori con adeguate garanzie; in ogni caso il reindirizzamento avviene solo su tua azione.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Diritti dell'interessato</h2>
            <p>Puoi chiedere accesso, rettifica, cancellazione, limitazione, portabilità, opposizione. Puoi anche proporre reclamo al Garante per la protezione dei dati personali. Per esercitare i diritti: info@my-tcg.it.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Minori</h2>
            <p>Il sito non è destinato a minori di 14 anni. Se ritieni che siano stati inviati dati di minori, scrivimi per rimuoverli.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Sicurezza</h2>
            <p>Adotto misure tecniche e organizzative adeguate a proteggere i dati (es. HTTPS, controlli di accesso).</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Modifiche</h2>
            <p>Questa informativa può essere aggiornata. La versione corrente è sempre pubblicata su questa pagina.</p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
