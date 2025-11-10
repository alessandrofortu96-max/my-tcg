import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createServerClient, handleApiError } from '../utils/supabase-server';

/**
 * API Route: POST /api/webhooks/stripe
 * 
 * Webhook esempio per integrazione Stripe (o altri servizi)
 * Usa SERVICE_ROLE_KEY per aggiornare database senza autenticazione utente
 * 
 * Esempio: quando un pagamento viene completato, aggiorna lo status del prodotto
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verifica signature del webhook (importante per sicurezza)
    // const signature = req.headers['stripe-signature'];
    // const isValid = verifyStripeSignature(req.body, signature);
    // if (!isValid) {
    //   return res.status(401).json({ error: 'Invalid signature' });
    // }

    const { type, data } = req.body;

    // Esempio: quando un pagamento è completato
    if (type === 'payment_intent.succeeded') {
      const { productId } = data.metadata;
      
      if (!productId) {
        return res.status(400).json({ error: 'Product ID missing in metadata' });
      }

      const supabase = createServerClient();
      
      // Aggiorna prodotto come venduto (bypass RLS con SERVICE_ROLE_KEY)
      const { error } = await supabase
        .from('products')
        .update({ status: 'VENDUTO' })
        .eq('id', productId);

      if (error) {
        console.error('Error updating product:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ success: true });
    }

    // Altri eventi webhook...
    return res.status(200).json({ received: true });
  } catch (error) {
    const { error: errorMessage, status } = handleApiError(error);
    return res.status(status).json({ error: errorMessage });
  }
}

