import { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { PremiumPageLayout } from '@/components/premium/PremiumPageLayout';
import { CheckCircle, Package, Mail, ShoppingBag, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const CheckoutSuccess = () => {
  const { clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const subscriptionId = searchParams.get('subscription');
  const orderId = searchParams.get('order_id');
  const [isSubscription, setIsSubscription] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [orderEmailSent, setOrderEmailSent] = useState(false);
  const orderEmailSentRef = useRef(false);
  const subscriptionEmailSentRef = useRef(false);

  useEffect(() => { clearCart(); }, [clearCart]);

  const sendOrderConfirmationEmail = useCallback(async () => {
    if (!orderId || orderEmailSentRef.current) return;
    orderEmailSentRef.current = true;
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`*, order_items (*), shipping_address:shipping_address_id (street, city, postal_code)`)
        .eq('id', orderId).single();
      if (orderError || !order) return;

      let customerEmail = '', customerName = 'Kunde';
      if (order.user_id) {
        const { data: profile } = await supabase.from('profiles').select('email, first_name, last_name').eq('id', order.user_id).single();
        if (profile) { customerEmail = profile.email || ''; customerName = profile.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : 'Kunde'; }
      } else {
        const guestEmail = searchParams.get('email');
        if (guestEmail) { customerEmail = guestEmail; customerName = searchParams.get('name') || 'Kunde'; }
      }
      if (!customerEmail) return;

      const items = (order.order_items || []).map((item: any) => ({ name: item.product_name, quantity: item.quantity, price: item.unit_price }));
      await supabase.functions.invoke('send-order-email', {
        body: { type: 'order_confirmation', orderId: order.id, customerEmail, customerName, orderNumber: order.order_number, items, subtotal: order.subtotal, shipping: order.shipping_cost || 0, total: order.total, shippingAddress: order.shipping_address || {} }
      });
      setOrderEmailSent(true);
    } catch (error) { console.error('Error sending order confirmation:', error); }
  }, [orderId, searchParams]);

  useEffect(() => { sendOrderConfirmationEmail(); }, [sendOrderConfirmationEmail]);

  const sendSubscriptionEmail = useCallback(async () => {
    if (!subscriptionId || subscriptionEmailSentRef.current) return;
    subscriptionEmailSentRef.current = true;
    setIsSubscription(true);
    try {
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select(`*, products:product_id (name, base_price), product_variants:variant_id (name, price)`)
        .eq('id', subscriptionId).single();
      if (!subscription) return;

      if (subscription.user_id) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          const { data: profile } = await supabase.from('profiles').select('first_name, last_name, email').eq('id', user.id).single();
          await supabase.functions.invoke('send-subscription-email', {
            body: { type: 'subscription_confirmation', subscriptionId: subscription.id, customerEmail: profile?.email || user.email, customerName: profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : 'Kunde', productName: subscription.products?.name || 'Parfüm', frequency: subscription.frequency, discountPercent: subscription.discount_percent || 15, price: subscription.product_variants?.price || subscription.products?.base_price || 0, isGuest: false }
          });
          setEmailSent(true);
        }
      } else if (subscription.guest_email) {
        await supabase.functions.invoke('send-subscription-email', {
          body: { type: 'subscription_confirmation', subscriptionId: subscription.id, customerEmail: subscription.guest_email, customerName: subscription.guest_name || 'Kunde', productName: subscription.products?.name || 'Parfüm', frequency: subscription.frequency, discountPercent: subscription.discount_percent || 15, price: subscription.product_variants?.price || subscription.products?.base_price || 0, isGuest: true }
        });
        setEmailSent(true);
      }
      await supabase.from('subscriptions').update({ status: 'active' }).eq('id', subscriptionId);
    } catch (error) { console.error('Error processing subscription:', error); }
  }, [subscriptionId]);

  useEffect(() => { sendSubscriptionEmail(); }, [sendSubscriptionEmail]);

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
                <li className="flex items-center gap-2"><Mail className="w-4 h-4" strokeWidth={1.5} />{emailSent ? 'Bestätigungs-E-Mail gesendet' : 'E-Mail wird gesendet...'}</li>
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
                <li className="flex items-center gap-2"><Mail className="w-4 h-4" strokeWidth={1.5} />{orderEmailSent ? 'Bestätigungs-E-Mail gesendet' : 'E-Mail wird gesendet...'}</li>
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