import { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, Mail, ShoppingBag } from 'lucide-react';
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

  useEffect(() => {
    // Clear the cart after successful checkout
    clearCart();
  }, [clearCart]);

  // Send order confirmation email for regular orders (guests included)
  const sendOrderConfirmationEmail = useCallback(async () => {
    if (!orderId || orderEmailSentRef.current) return;
    orderEmailSentRef.current = true;
    
    try {
      // Fetch order details
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*),
          shipping_address:shipping_address_id (street, city, postal_code)
        `)
        .eq('id', orderId)
        .single();
      
      if (orderError || !order) {
        console.error('Failed to fetch order:', orderError);
        return;
      }

      // Determine customer email
      let customerEmail = '';
      let customerName = 'Kunde';
      
      if (order.user_id) {
        // Logged in user
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, first_name, last_name')
          .eq('id', order.user_id)
          .single();
        
        if (profile) {
          customerEmail = profile.email || '';
          customerName = profile.first_name 
            ? `${profile.first_name} ${profile.last_name || ''}`.trim() 
            : 'Kunde';
        }
      } else {
        // Guest checkout - get email from URL param or notes
        const guestEmail = searchParams.get('email');
        const guestName = searchParams.get('name');
        if (guestEmail) {
          customerEmail = guestEmail;
          customerName = guestName || 'Kunde';
        }
      }

      if (!customerEmail) {
        console.log('No customer email available for order confirmation');
        return;
      }

      // Format order items
      const items = (order.order_items || []).map((item: any) => ({
        name: item.product_name,
        quantity: item.quantity,
        price: item.unit_price
      }));

      // Send order confirmation email
      await supabase.functions.invoke('send-order-email', {
        body: {
          type: 'order_confirmation',
          orderId: order.id,
          customerEmail,
          customerName,
          orderNumber: order.order_number,
          items,
          subtotal: order.subtotal,
          shipping: order.shipping_cost || 0,
          total: order.total,
          shippingAddress: order.shipping_address || { street: '', city: '', postalCode: '' }
        }
      });
      
      setOrderEmailSent(true);
      console.log('Order confirmation email sent successfully');
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
    }
  }, [orderId, searchParams]);

  useEffect(() => {
    sendOrderConfirmationEmail();
  }, [sendOrderConfirmationEmail]);

  // Handle subscription confirmation email
  const sendSubscriptionEmail = useCallback(async () => {
    if (!subscriptionId || subscriptionEmailSentRef.current) return;
    subscriptionEmailSentRef.current = true;
    
    setIsSubscription(true);
    
    try {
      // Fetch subscription details
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select(`
          *,
          products:product_id (name, base_price),
          product_variants:variant_id (name, price)
        `)
        .eq('id', subscriptionId)
        .single();
      
      if (subError || !subscription) {
        console.error('Failed to fetch subscription:', subError);
        return;
      }

      // Determine customer email and name
      const guestEmail = subscription.guest_email || '';
      const guestName = subscription.guest_name || 'Kunde';
      const isGuest = !subscription.user_id;

      // If user is logged in, get their email from auth
      if (subscription.user_id) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          // Get profile name if available
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, email')
            .eq('id', user.id)
            .single();
          
          const email = profile?.email || user.email;
          const name = profile?.first_name 
            ? `${profile.first_name} ${profile.last_name || ''}`.trim()
            : 'Kunde';
          
          // Send subscription confirmation email
          await supabase.functions.invoke('send-subscription-email', {
            body: {
              type: 'subscription_confirmation',
              subscriptionId: subscription.id,
              customerEmail: email,
              customerName: name,
              productName: subscription.products?.name || 'Parfüm',
              variantName: subscription.product_variants?.name,
              frequency: subscription.frequency,
              discountPercent: subscription.discount_percent || 15,
              price: subscription.product_variants?.price || subscription.products?.base_price || 0,
              nextDelivery: subscription.next_delivery 
                ? new Date(subscription.next_delivery).toLocaleDateString('de-DE')
                : undefined,
              isGuest: false,
            },
          });
          setEmailSent(true);
        }
      } else if (guestEmail) {
        // Send email for guest subscription
        await supabase.functions.invoke('send-subscription-email', {
          body: {
            type: 'subscription_confirmation',
            subscriptionId: subscription.id,
            customerEmail: guestEmail,
            customerName: guestName,
            productName: subscription.products?.name || 'Parfüm',
            variantName: subscription.product_variants?.name,
            frequency: subscription.frequency,
            discountPercent: subscription.discount_percent || 15,
            price: subscription.product_variants?.price || subscription.products?.base_price || 0,
            nextDelivery: subscription.next_delivery 
              ? new Date(subscription.next_delivery).toLocaleDateString('de-DE')
              : undefined,
            isGuest: true,
          },
        });
        setEmailSent(true);
      }

      // Update subscription status to active
      await supabase
        .from('subscriptions')
        .update({ status: 'active' })
        .eq('id', subscriptionId);

    } catch (error) {
      console.error('Error processing subscription confirmation:', error);
    }
  }, [subscriptionId]);

  useEffect(() => {
    sendSubscriptionEmail();
  }, [sendSubscriptionEmail]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-md mx-auto text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          
          <h1 className="text-3xl font-bold mb-4">
            {isSubscription ? 'Abo erfolgreich aktiviert!' : 'Bestellung erfolgreich!'}
          </h1>
          
          <p className="text-muted-foreground mb-6">
            {isSubscription 
              ? 'Vielen Dank für dein Parfüm-Abo! Du erhältst in Kürze eine Bestätigungs-E-Mail mit allen Details.'
              : 'Vielen Dank für Ihre Bestellung. Sie erhalten in Kürze eine Bestätigungs-E-Mail mit allen Details zu Ihrer Bestellung.'
            }
          </p>

          {isSubscription && (
            <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
              <div className="flex items-center gap-3 mb-3">
                <Package className="w-5 h-5 text-accent" />
                <span className="font-medium">Dein Abo im Überblick</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {emailSent ? 'Bestätigungs-E-Mail wurde gesendet' : 'Bestätigungs-E-Mail wird gesendet...'}
                </li>
                <li>✨ Rabatt auf jede Lieferung</li>
                <li>🚚 Kostenloser Versand</li>
                <li>⏸️ Jederzeit kündbar</li>
              </ul>
            </div>
          )}

          {!isSubscription && orderId && (
            <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
              <div className="flex items-center gap-3 mb-3">
                <ShoppingBag className="w-5 h-5 text-accent" />
                <span className="font-medium">Deine Bestellung</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {orderEmailSent ? 'Bestätigungs-E-Mail wurde gesendet' : 'Bestätigungs-E-Mail wird gesendet...'}
                </li>
                <li>📦 Versand innerhalb von 1-2 Werktagen</li>
                <li>🚚 Sendungsverfolgung per E-Mail</li>
              </ul>
            </div>
          )}

          <div className="space-y-4">
            <Button asChild className="w-full">
              <Link to="/products">Weiter einkaufen</Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link to="/">Zur Startseite</Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutSuccess;
