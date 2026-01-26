import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const CheckoutSuccess = () => {
  const { clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const subscriptionId = searchParams.get('subscription');
  const [isSubscription, setIsSubscription] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    // Clear the cart after successful checkout
    clearCart();
  }, [clearCart]);

  useEffect(() => {
    // Handle subscription confirmation email
    const sendSubscriptionEmail = async () => {
      if (!subscriptionId) return;
      
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
        const customerEmail = subscription.guest_email || '';
        const customerName = subscription.guest_name || 'Kunde';
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
        } else if (customerEmail) {
          // Send email for guest subscription
          await supabase.functions.invoke('send-subscription-email', {
            body: {
              type: 'subscription_confirmation',
              subscriptionId: subscription.id,
              customerEmail,
              customerName,
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
    };

    sendSubscriptionEmail();
  }, [subscriptionId]);

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
