import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, ShoppingBag, CheckCircle } from 'lucide-react';
import { AddressForm } from '@/components/checkout/AddressForm';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { PaymentMethodSelector } from '@/components/checkout/PaymentMethodSelector';

interface Address {
  id?: string;
  first_name: string;
  last_name: string;
  street: string;
  street2?: string;
  postal_code: string;
  city: string;
  country: string;
  type: 'shipping' | 'billing';
}

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | 'bank_transfer'>('stripe');
  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<Address | null>(null);
  const [billingAddress, setBillingAddress] = useState<Address | null>(null);
  const [useSameAsShipping, setUseSameAsShipping] = useState(true);
  const [step, setStep] = useState<'address' | 'payment'>('address');
  const [email, setEmail] = useState(user?.email || '');

  const shippingCost = total >= 50 ? 0 : 4.95;
  const grandTotal = total + shippingCost;

  // Scroll to top on mount and step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-24 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-4">Dein Warenkorb ist leer</h1>
          <p className="text-muted-foreground mb-8">
            Füge Produkte hinzu, um zur Kasse zu gehen.
          </p>
          <Button onClick={() => navigate('/products')}>
            Jetzt einkaufen
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const isAddressValid = (address: Address | null): boolean => {
    if (!address) return false;
    return (
      address.first_name.trim() !== '' &&
      address.last_name.trim() !== '' &&
      address.street.trim() !== '' &&
      address.postal_code.trim() !== '' &&
      address.city.trim() !== '' &&
      address.country !== ''
    );
  };

  const isEmailValid = user?.email || (email && email.includes('@'));
  
  const canProceedToPayment = isAddressValid(shippingAddress) && 
    (useSameAsShipping || isAddressValid(billingAddress)) &&
    isEmailValid;

  const handleProceedToPayment = () => {
    if (!canProceedToPayment) {
      toast.error('Bitte fülle alle Pflichtfelder aus');
      return;
    }
    setStep('payment');
  };

  const handleCheckout = async () => {
    if (!isAddressValid(shippingAddress)) {
      toast.error('Bitte gib eine gültige Lieferadresse ein');
      setStep('address');
      return;
    }

    setLoading(true);
    try {
      const finalBillingAddress = useSameAsShipping ? shippingAddress : billingAddress;

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
          shipping_address: shippingAddress,
          billing_address: finalBillingAddress,
          user_id: user?.id,
          email: email || user?.email,
        },
      });

      if (error) throw error;

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Fehler beim Erstellen der Bestellung. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 lg:py-12">
        {/* Header */}
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => step === 'payment' ? setStep('address') : navigate('/cart')}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {step === 'payment' ? 'Zurück zur Adresse' : 'Zurück zum Warenkorb'}
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Checkout</h1>
            <p className="text-muted-foreground">
              {step === 'address' ? 'Schritt 1: Adresse eingeben' : 'Schritt 2: Zahlung'}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'address' ? 'bg-primary text-primary-foreground' : 'bg-success text-success-foreground'
              }`}>
                {step === 'payment' ? <CheckCircle className="w-5 h-5" /> : '1'}
              </div>
              <span className={step === 'address' ? 'font-medium' : 'text-muted-foreground'}>
                Adresse
              </span>
            </div>
            <div className="flex-1 h-px bg-border" />
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'payment' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                2
              </div>
              <span className={step === 'payment' ? 'font-medium' : 'text-muted-foreground'}>
                Zahlung
              </span>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
              {step === 'address' ? (
                <>
                  {/* Email for Guest Checkout */}
                  {!user && (
                    <div className="bg-card border rounded-lg p-6">
                      <h3 className="font-semibold mb-4">Kontakt</h3>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-2">
                          E-Mail-Adresse *
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="deine@email.de"
                          required
                          className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Für die Bestellbestätigung und Versandbenachrichtigungen
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Shipping Address */}
                  <AddressForm
                    type="shipping"
                    onAddressChange={setShippingAddress}
                    initialAddress={shippingAddress}
                  />

                  {/* Billing Address */}
                  <AddressForm
                    type="billing"
                    onAddressChange={setBillingAddress}
                    initialAddress={billingAddress}
                    useSameAsShipping={useSameAsShipping}
                    onUseSameAsShippingChange={setUseSameAsShipping}
                    shippingAddress={shippingAddress}
                  />

                  {/* Continue Button */}
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleProceedToPayment}
                    disabled={!canProceedToPayment}
                  >
                    Weiter zur Zahlung
                  </Button>

                  {!user && (
                    <p className="text-sm text-center text-muted-foreground">
                      Als Gast bestellen oder{' '}
                      <a href="/auth" className="text-primary underline hover:no-underline">
                        einloggen
                      </a>{' '}
                      für schnelleren Checkout
                    </p>
                  )}
                </>
              ) : (
                <>
                  {/* Payment Method Selection */}
                  <PaymentMethodSelector
                    value={paymentMethod}
                    onChange={setPaymentMethod}
                  />

                  {/* Address Summary */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h3 className="font-medium mb-2 text-sm text-muted-foreground">Lieferadresse</h3>
                      {shippingAddress && (
                        <div className="text-sm">
                          <p className="font-medium">{shippingAddress.first_name} {shippingAddress.last_name}</p>
                          <p>{shippingAddress.street}</p>
                          {shippingAddress.street2 && <p>{shippingAddress.street2}</p>}
                          <p>{shippingAddress.postal_code} {shippingAddress.city}</p>
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h3 className="font-medium mb-2 text-sm text-muted-foreground">Rechnungsadresse</h3>
                      {(useSameAsShipping ? shippingAddress : billingAddress) && (
                        <div className="text-sm">
                          {useSameAsShipping && <p className="text-xs text-muted-foreground mb-1">Gleich wie Lieferadresse</p>}
                          <p className="font-medium">
                            {(useSameAsShipping ? shippingAddress : billingAddress)?.first_name}{' '}
                            {(useSameAsShipping ? shippingAddress : billingAddress)?.last_name}
                          </p>
                          <p>{(useSameAsShipping ? shippingAddress : billingAddress)?.street}</p>
                          <p>
                            {(useSameAsShipping ? shippingAddress : billingAddress)?.postal_code}{' '}
                            {(useSameAsShipping ? shippingAddress : billingAddress)?.city}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pay Button */}
                  <Button
                    className="w-full"
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

                  <p className="text-xs text-center text-muted-foreground">
                    Mit dem Klick auf "Jetzt bezahlen" akzeptierst du unsere{' '}
                    <a href="/terms" className="underline hover:no-underline">AGB</a> und{' '}
                    <a href="/privacy" className="underline hover:no-underline">Datenschutzerklärung</a>.
                  </p>
                </>
              )}
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24">
                <OrderSummary
                  items={items}
                  subtotal={total}
                  shippingCost={shippingCost}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
