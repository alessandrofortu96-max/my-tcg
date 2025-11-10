import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelection } from '@/contexts/SelectionContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { X, Copy, Mail, Send, Trash2 } from 'lucide-react';
import { gameNames, conditionNames } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

interface SelectionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SelectionDrawer = ({ open, onOpenChange }: SelectionDrawerProps) => {
  const { selection, removeFromSelection, clearSelection, totalPrice } = useSelection();
  const { toast } = useToast();

  const generateSummaryText = () => {
    const items = selection.map(product => {
      const url = `${window.location.origin}/prodotto/${product.id}`;
      return `- [${gameNames[product.game]}] ${product.name} – ${product.set} – ${product.cardCode} – ${product.language} – ${conditionNames[product.condition]} – €${product.price.toFixed(2)} – Link: ${url}`;
    }).join('\n');

    return `Richiesta lotto – my-tcg.it

Ciao,
vorrei informazioni/acquistare il seguente lotto:

${items}

Totale stimato: €${totalPrice.toFixed(2)}

Preferenze:
- Metodo di pagamento: (PayPal B&S / Bonifico)
- Spedizione: (corriere / ritiro a mano se disponibile)

Nome:
Città:
Note:`;
  };

  const handleCopyToClipboard = async () => {
    const text = generateSummaryText();
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Riepilogo copiato!",
        description: "Incolla il testo nel messaggio.",
      });
    } catch (err) {
      toast({
        title: "Errore",
        description: "Impossibile copiare negli appunti",
        variant: "destructive",
      });
    }
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent('Richiesta lotto – my-tcg.it');
    const body = encodeURIComponent(generateSummaryText());
    window.open(`mailto:info@my-tcg.it?subject=${subject}&body=${body}`, '_blank');
  };

  const handleOpenTelegram = () => {
    handleCopyToClipboard();
    setTimeout(() => {
      window.open('https://t.me/yourusername', '_blank');
    }, 500);
  };

  const handleShareSelection = async () => {
    // Create shareable link with selection IDs
    const selectionIds = selection.map(p => p.id).join(',');
    const shareUrl = `${window.location.origin}?sel=${encodeURIComponent(selectionIds)}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copiato!",
        description: "Condividi questo link per ripristinare la selezione.",
      });
    } catch (err) {
      toast({
        title: "Errore",
        description: "Impossibile copiare il link",
        variant: "destructive",
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-lg flex flex-col"
      >
        <SheetHeader>
          <SheetTitle id="selection-drawer-title">La tua selezione</SheetTitle>
          <SheetDescription id="selection-drawer-description">
            {selection.length} {selection.length === 1 ? 'prodotto selezionato' : 'prodotti selezionati'}
          </SheetDescription>
        </SheetHeader>

        {selection.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-3 max-w-sm px-4">
              <p className="text-muted-foreground">
                La selezione è vuota. Aggiungi le carte che ti interessano e invia la richiesta in un unico messaggio.
              </p>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-4">
                {selection.map((product) => (
                  <div key={product.id} className="flex gap-4 group">
                    <Link to={`/prodotto/${product.id}`} className="w-20 h-28 flex-shrink-0 rounded overflow-hidden bg-accent">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                    
                    <div className="flex-1 min-w-0">
                      <Link to={`/prodotto/${product.id}`}>
                        <h4 className="font-medium text-sm mb-1 line-clamp-2 hover:text-primary transition-smooth">
                          {product.name}
                        </h4>
                      </Link>
                      <p className="text-xs text-muted-foreground mb-2">
                        {product.set} • {product.cardCode}
                      </p>
                      <p className="text-sm font-semibold">€{product.price.toFixed(2)}</p>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromSelection(product.id)}
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-smooth"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Separator className="my-4" />

            <div className="space-y-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Totale stimato:</span>
                <span>€{totalPrice.toFixed(2)}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={handleCopyToClipboard} className="w-full">
                  <Copy className="mr-2 h-4 w-4" />
                  Copia riepilogo
                </Button>
                <Button variant="outline" onClick={handleSendEmail} className="w-full">
                  <Mail className="mr-2 h-4 w-4" />
                  Invia via email
                </Button>
              </div>

              <Button onClick={handleOpenTelegram} className="w-full">
                <Send className="mr-2 h-4 w-4" />
                Apri Telegram
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={handleShareSelection} className="w-full">
                  <Copy className="mr-2 h-4 w-4" />
                  Salva/Condividi selezione
                </Button>
                <Button variant="ghost" onClick={clearSelection} className="w-full text-destructive hover:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Svuota selezione
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center leading-relaxed border-t pt-4">
                La selezione è salvata solo sul tuo dispositivo (storage tecnico). Non è un checkout e non effettua acquisti.
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default SelectionDrawer;
