import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { PremiumPageLayout } from '@/components/premium/PremiumPageLayout';
import { CheckCircle, Package, ShoppingBag, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const CheckoutSuccess = () => {
  const { clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const subscriptionId = searchParams.get('subscription');
  const orderId = searchParams.get('order_id');
  const [isSubscription, setIsSubscription] = useState(false);

  useEffect(() => { clearCart(); }, [clearCart]);

  useEffect(() => {
    if (subscriptionId) {
      setIsSubscription(true);
      // Activate subscription
      supabase.from('subscriptions').update({ status: 'active' }).eq('id', subscriptionId)
        .then(() => { console.log('Subscription activated'); });
    }
  }, [subscriptionId]);

  return (
    <PremiumPageLayout>
      <section className="section-spacing">
        <div className="container-premium max-w-lg mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-accent/10">
            <CheckCircle className="w-10 h-10 text-accent" strokeWidth={1.5} />
          </div>

          <h1 className="font-display text-3xl text-foreground mb-4">
            {isSubscription ? 'Abo erfolgreich aktiviert!' : 'Bestellung erfolgreich!'}
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            {isSubscription
              ? 'Vielen Dank für dein Parfüm-Abo! Du erhältst in Kürze eine Bestätigungs-E-Mail.'
              : 'Vielen Dank für deine Bestellung. Du erhältst in Kürze eine Bestätigungs-E-Mail.'}
          </p>

          {isSubscription && (
            <div className="p-6 border border-border text-left mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Package className="w-5 h-5 text-accent" strokeWidth={1.5} />
                <span className="text-sm font-medium text-foreground">Dein Abo im Überblick</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>✨ Rabatt auf jede Lieferung</li>
                <li>🚚 Kostenloser Versand</li>
                <li>⏸️ Jederzeit kündbar</li>
              </ul>
            </div>
          )}

          {!isSubscription && orderId && (
            <div className="p-6 border border-border text-left mb-8">
              <div className="flex items-center gap-3 mb-4">
                <ShoppingBag className="w-5 h-5 text-accent" strokeWidth={1.5} />
                <span className="text-sm font-medium text-foreground">Deine Bestellung</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>📦 Versand innerhalb von 1-2 Werktagen</li>
                <li>🚚 Sendungsverfolgung per E-Mail</li>
              </ul>
            </div>
          )}

          <div className="space-y-3">
            <Link
              to="/products"
              className="flex items-center justify-center w-full py-4 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors"
            >
              Weiter einkaufen
              <ArrowRight className="ml-2 w-4 h-4" strokeWidth={1.5} />
            </Link>
            <Link
              to="/"
              className="flex items-center justify-center w-full py-4 border border-border text-foreground text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-muted transition-colors"
            >
              Zur Startseite
            </Link>
          </div>
        </div>
      </section>
    </PremiumPageLayout>
  );
};

export default CheckoutSuccess;
