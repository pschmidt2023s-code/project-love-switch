import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CreditCard, Loader2 } from 'lucide-react';

const Checkout = () => {
  const { items, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
  const [loading, setLoading] = useState(false);

  const shippingCost = total >= 50 ? 0 : 4.95;
  const grandTotal = total + shippingCost;

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const checkoutItems = items.map(item => ({
        name: `${item.productName} - ${item.variantSize}`,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      }));

      // Add shipping if applicable
      if (shippingCost > 0) {
        checkoutItems.push({
          name: "Versandkosten",
          price: shippingCost,
          quantity: 1,
          image: "",
        });
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          items: checkoutItems,
          payment_method: paymentMethod,
        },
      });

      if (error) throw error;

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Fehler beim Erstellen der Bestellung');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-24">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-card rounded-lg p-6 border border-border">
            <h2 className="text-xl font-semibold mb-4">Bestellübersicht</h2>
            
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <img 
                      src={item.image || '/placeholder.svg'} 
                      alt={item.productName}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">{item.variantSize} × {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-medium">{(item.price * item.quantity).toFixed(2)} €</p>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Zwischensumme</span>
                <span>{total.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between">
                <span>Versand</span>
                <span>{shippingCost === 0 ? 'Kostenlos' : `${shippingCost.toFixed(2)} €`}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                <span>Gesamt</span>
                <span>{grandTotal.toFixed(2)} €</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-card rounded-lg p-6 border border-border">
            <h2 className="text-xl font-semibold mb-4">Zahlungsmethode</h2>

            <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'stripe' | 'paypal')}>
              <div className="flex items-center space-x-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="stripe" id="stripe" />
                <Label htmlFor="stripe" className="flex items-center gap-2 cursor-pointer flex-1">
                  <CreditCard className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Kreditkarte / Debitkarte</p>
                    <p className="text-sm text-muted-foreground">Visa, Mastercard, American Express</p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors mt-3">
                <RadioGroupItem value="paypal" id="paypal" />
                <Label htmlFor="paypal" className="flex items-center gap-2 cursor-pointer flex-1">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .756-.654h6.86c2.325 0 4.085.663 5.122 1.92.472.576.773 1.218.892 1.903.127.737.09 1.62-.107 2.624-.026.134-.053.269-.082.404l-.007.029v.097c-.413 2.158-1.358 3.665-2.806 4.478-1.39.78-3.16 1.176-5.262 1.176H8.43a.977.977 0 0 0-.966.824l-.71 4.502-.215 1.365a.507.507 0 0 1-.501.43h-.962z"/>
                  </svg>
                  <div>
                    <p className="font-medium">PayPal</p>
                    <p className="text-sm text-muted-foreground">Sicher bezahlen mit PayPal</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            {!user && (
              <p className="text-sm text-muted-foreground mt-4">
                Als Gast bestellen oder{' '}
                <a href="/auth" className="text-primary underline">einloggen</a>
              </p>
            )}

            <Button 
              className="w-full mt-6" 
              size="lg"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Wird verarbeitet...
                </>
              ) : (
                `Jetzt bezahlen - ${grandTotal.toFixed(2)} €`
              )}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
