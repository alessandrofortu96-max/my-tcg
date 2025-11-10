import Header from '@/components/Header';
import Footer from '@/components/Footer';

const NotaLegale = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-4">Nota Legale</h1>
        <p className="text-sm text-muted-foreground mb-8">Ultimo aggiornamento: 15/11/2025</p>

        <div className="prose prose-sm max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">Vendita tra privati – cessione occasionale</h2>
            <p className="text-muted-foreground">
              Le vendite effettuate tramite questo sito costituiscono <strong>cessione occasionale di beni personali</strong> tra privati, 
              ai sensi dell'art. 5, comma 2, del D.P.R. n. 633/1972 (Testo Unico delle Imposte sui Redditi) e dell'art. 35, comma 2, 
              lettera e-ter, del D.P.R. n. 633/1972 (imposta sul valore aggiunto).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Natura della prestazione</h2>
            <p className="text-muted-foreground">
              Il presente sito web è utilizzato esclusivamente per facilitare il contatto tra privati interessati all'acquisto 
              di carte collezionabili provenienti dalla mia collezione personale. Non si tratta di un'attività commerciale 
              organizzata, né di un'attività di vendita al dettaglio o all'ingrosso.
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3 text-muted-foreground">
              <li>Non viene acquistata merce da rivendere</li>
              <li>Non viene svolta attività commerciale in forma organizzata</li>
              <li>Non vengono effettuati checkout online o pagamenti diretti tramite il sito</li>
              <li>I pagamenti avvengono off-site (es. PayPal "beni e servizi", bonifico bancario) dopo contatto diretto</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Condizioni di vendita</h2>
            <div className="space-y-3 text-muted-foreground">
              <div>
                <h3 className="font-semibold mb-1">Prezzi</h3>
                <p>I prezzi indicati sono fissi e aggiornati in base al mercato (TCGplayer, Cardmarket). I prezzi possono essere 
                modificati senza preavviso. Il prezzo finale sarà confermato al momento del contatto diretto.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Disponibilità</h3>
                <p>La disponibilità dei prodotti è indicativa. La disponibilità effettiva sarà confermata al momento del contatto diretto.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Pagamento</h3>
                <p>I pagamenti avvengono esclusivamente off-site, tramite:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>PayPal "beni e servizi"</li>
                  <li>Bonifico bancario</li>
                  <li>Contanti (solo per ritiro a mano, se disponibile)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Spedizione</h3>
                <p>La spedizione avviene tramite corriere con tracciamento. I costi di spedizione saranno comunicati al momento 
                del contatto diretto. Le carte vengono imballate in top loader e bubble mailer per garantire la massima protezione.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Diritto di recesso</h2>
            <p className="text-muted-foreground">
              Ai sensi dell'art. 59, comma 1, lettera h, del D.Lgs. n. 206/2005 (Codice del Consumo), il diritto di recesso 
              non si applica ai contratti di fornitura di beni confezionati su misura o chiaramente personalizzati, né ai contratti 
              di fornitura di beni che possono deteriorarsi o scadere rapidamente.
            </p>
            <p className="text-muted-foreground mt-3">
              Tuttavia, data la natura di vendita tra privati, si applica il principio della <strong>buona fede contrattuale</strong>. 
              In caso di disaccordi, si cercherà di trovare una soluzione amichevole tra le parti.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Garanzia</h2>
            <p className="text-muted-foreground">
              Le carte vengono vendute nello stato in cui si trovano, con descrizione accurata delle condizioni. Non viene fornita 
              garanzia legale di conformità, data la natura di vendita tra privati. Tuttavia, mi impegno a descrivere accuratamente 
              le condizioni delle carte e a fornire fotografie dettagliate.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Responsabilità</h2>
            <p className="text-muted-foreground">
              Il venditore non si assume alcuna responsabilità per danni derivanti da:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3 text-muted-foreground">
              <li>Utilizzo improprio dei prodotti</li>
              <li>Danni durante il trasporto (salvo assicurazione del corriere)</li>
              <li>Perdita o furto durante il trasporto (salvo tracciamento del corriere)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Privacy</h2>
            <p className="text-muted-foreground">
              Per informazioni sul trattamento dei dati personali, consulta la <a href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Contatti</h2>
            <p className="text-muted-foreground">
              Per qualsiasi domanda o chiarimento, puoi contattarmi tramite:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3 text-muted-foreground">
              <li>Email: <a href="mailto:info@my-tcg.it" className="text-primary hover:underline">info@my-tcg.it</a></li>
              <li>Telegram: tramite il link presente nel sito</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Legge applicabile</h2>
            <p className="text-muted-foreground">
              Le presenti condizioni sono regolate dalla legge italiana. Per qualsiasi controversia, competente è il foro del 
              luogo di residenza del venditore.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotaLegale;

