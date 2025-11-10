import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/lib/types';

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
}

const ContactModal = ({ open, onOpenChange, product }: ContactModalProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: product ? `Ciao! Sono interessato a: ${product.name}` : '',
    honeypot: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.honeypot) {
      console.log('Bot detected');
      return;
    }
    
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Messaggio inviato!",
      description: "Ti risponderò al più presto via email.",
    });
    
    setFormData({ name: '', email: '', phone: '', message: '', honeypot: '' });
    setIsSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Contattami via Email</DialogTitle>
          <DialogDescription>
            Compila il modulo e ti risponderò entro 24 ore
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="hidden" aria-hidden="true">
            <Input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={formData.honeypot}
              onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="modal-name">Nome *</Label>
            <Input
              id="modal-name"
              type="text"
              placeholder="Il tuo nome"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="modal-email">Email *</Label>
            <Input
              id="modal-email"
              type="email"
              placeholder="tua@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              maxLength={255}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="modal-phone">Cellulare *</Label>
            <Input
              id="modal-phone"
              type="tel"
              placeholder="+39 123 456 7890"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              maxLength={20}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="modal-message">Messaggio *</Label>
            <Textarea
              id="modal-message"
              placeholder="Scrivi qui il tuo messaggio..."
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground">* Campi obbligatori</p>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Invio in corso...' : 'Invia messaggio'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactModal;
