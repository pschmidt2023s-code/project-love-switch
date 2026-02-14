import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PremiumPageLayout } from '@/components/premium/PremiumPageLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Seo } from '@/components/Seo';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, ShoppingBag, CheckCircle, ArrowRight } from 'lucide-react';
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
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const shippingCost = total >= 50 ? 0 : 4.95;
  const grandTotal = total + shippingCost;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  if (items.length === 0) {
    return (
      <PremiumPageLayout>
        <Seo title="Checkout | ALDENAIR" description="Sichere Bestellung bei ALDENAIR." canonicalPath="/checkout" />
        <section className="section-spacing">
          <div className="container-premium text-center max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-muted">
              <ShoppingBag className="w-7 h-7 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <h1 className="font-display text-2xl text-foreground mb-3">Dein Warenkorb ist leer</h1>
            <p className="text-sm text-muted-foreground mb-8">Füge Produkte hinzu, um zur Kasse zu gehen.</p>
            <Link
              to="/products"
              className="inline-flex items-center px-8 py-4 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors"
            >
              Jetzt einkaufen
              <ArrowRight className="ml-2 w-4 h-4" strokeWidth={1.5} />
            </Link>
          </div>
        </section>
      </PremiumPageLayout>
    );
  }

  const isAddressValid = (address: Address | null): boolean => {
    if (!address) return false;
    return address.first_name.trim() !== '' && address.last_name.trim() !== '' &&
      address.street.trim() !== '' && address.postal_code.trim() !== '' &&
      address.city.trim() !== '' && address.country !== '';
  };

  const isEmailValid = user?.email || (email && email.includes('@'));
  const canProceedToPayment = isAddressValid(shippingAddress) && 
    (useSameAsShipping || isAddressValid(billingAddress)) && isEmailValid;

  const handleProceedToPayment = () => {
    if (!canProceedToPayment) { toast.error('Bitte fülle alle Pflichtfelder aus'); return; }
    setStep('payment');
  };

  const handleCheckout = async () => {
    if (!isAddressValid(shippingAddress)) { toast.error('Bitte gib eine gültige Lieferadresse ein'); setStep('address'); return; }

    setLoading(true);
    try {
      const finalBillingAddress = useSameAsShipping ? shippingAddress : billingAddress;
      const checkoutItems = items.map(item => ({
        name: `${item.productName} - ${item.variantSize}`,
        price: item.price, quantity: item.quantity, image: item.image,
      }));

      if (shippingCost > 0) {
        checkoutItems.push({ name: "Versandkosten", price: shippingCost, quantity: 1, image: "" });
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          items: checkoutItems, payment_method: paymentMethod,
          shipping_address: shippingAddress, billing_address: finalBillingAddress,
          user_id: user?.id, email: email || user?.email,
        },
      });

      if (error) throw error;
      if (!data) throw new Error('Keine Antwort vom Server erhalten');

      if (data.payment_method === 'bank_transfer' && data.bank_details) {
        navigate('/checkout/bank-transfer', { state: { bank_details: data.bank_details, total: data.total, currency: data.currency } });
        return;
      }

      if (data.url) { window.location.href = data.url; }
      else { throw new Error('Keine Weiterleitungs-URL erhalten'); }
    } catch (error) {
      console.error('Checkout error:', error);
      const message = error instanceof Error ? error.message : 'Unbekannter Fehler';
      toast.error(`Checkout fehlgeschlagen: ${message}`);
    } finally { setLoading(false); }
  };

  return (
    <PremiumPageLayout>
      <Seo title="Checkout | ALDENAIR" description="Sichere Bestellung bei ALDENAIR." canonicalPath="/checkout" />

      {/* Header */}
      <section className="border-b border-border">
        <div className="container-premium py-8 lg:py-12">
          <button
            onClick={() => step === 'payment' ? setStep('address') : navigate('/cart')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            {step === 'payment' ? 'Zurück zur Adresse' : 'Zurück zum Warenkorb'}
          </button>
          <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-3">Checkout</span>
          <h1 className="font-display text-3xl lg:text-4xl text-foreground mb-4">
            {step === 'address' ? 'Adresse eingeben' : 'Zahlung'}
          </h1>

          {/* Progress Steps */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 flex items-center justify-center text-xs font-medium ${
                step === 'address' ? 'bg-foreground text-background' : 'bg-accent text-accent-foreground'
              }`}>
                {step === 'payment' ? <CheckCircle className="w-4 h-4" /> : '1'}
              </div>
              <span className={`text-sm ${step === 'address' ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>Adresse</span>
            </div>
            <div className="flex-1 h-px bg-border" />
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 flex items-center justify-center text-xs font-medium ${
                step === 'payment' ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'
              }`}>
                2
              </div>
              <span className={`text-sm ${step === 'payment' ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>Zahlung</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="container-premium">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {step === 'address' ? (
                <>
                  {!user && (
                    <div className="p-6 border border-border">
                      <h3 className="text-[10px] tracking-[0.2em] uppercase text-accent mb-4">Kontakt</h3>
                      <label htmlFor="email" className="block text-sm text-muted-foreground mb-2">E-Mail-Adresse *</label>
                      <input
                        type="email" id="email" value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="deine@email.de" required
                        className="w-full px-4 py-3 bg-background border border-border text-sm focus:outline-none focus:border-accent"
                      />
                    </div>
                  )}
                  <AddressForm type="shipping" onAddressChange={setShippingAddress} initialAddress={shippingAddress} />
                  <AddressForm type="billing" onAddressChange={setBillingAddress} initialAddress={billingAddress}
                    useSameAsShipping={useSameAsShipping} onUseSameAsShippingChange={setUseSameAsShipping} shippingAddress={shippingAddress} />
                  <button
                    onClick={handleProceedToPayment}
                    disabled={!canProceedToPayment}
                    className="w-full py-4 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50"
                  >
                    Weiter zur Zahlung
                  </button>
                  {!user && (
                    <p className="text-xs text-center text-muted-foreground">
                      Als Gast bestellen oder <a href="/auth" className="text-accent underline">einloggen</a>
                    </p>
                  )}
                </>
              ) : (
                <>
                  <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-5 border border-border">
                      <h3 className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground mb-3">Lieferadresse</h3>
                      {shippingAddress && (
                        <div className="text-sm text-foreground space-y-0.5">
                          <p className="font-medium">{shippingAddress.first_name} {shippingAddress.last_name}</p>
                          <p>{shippingAddress.street}</p>
                          <p>{shippingAddress.postal_code} {shippingAddress.city}</p>
                        </div>
                      )}
                    </div>
                    <div className="p-5 border border-border">
                      <h3 className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground mb-3">Rechnungsadresse</h3>
                      {(useSameAsShipping ? shippingAddress : billingAddress) && (
                        <div className="text-sm text-foreground space-y-0.5">
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
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 accent-accent flex-shrink-0"
                    />
                    <span className="text-xs text-muted-foreground leading-relaxed">
                      Ich habe die <a href="/terms" className="text-accent underline" target="_blank" rel="noopener noreferrer">AGB</a>, die <a href="/privacy" className="text-accent underline" target="_blank" rel="noopener noreferrer">Datenschutzerklärung</a> und die <a href="/returns" className="text-accent underline" target="_blank" rel="noopener noreferrer">Widerrufsbelehrung</a> gelesen und akzeptiere diese. *
                    </span>
                  </label>
                  <button
                    onClick={handleCheckout}
                    disabled={loading || !acceptedTerms}
                    className="w-full py-4 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Wird verarbeitet...</>
                    ) : (
                      `Kostenpflichtig bestellen – ${grandTotal.toFixed(2)} €`
                    )}
                  </button>
                </>
              )}
            </div>

            {/* Right Column */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24">
                <OrderSummary items={items} subtotal={total} shippingCost={shippingCost} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </PremiumPageLayout>
  );
};

export default Checkout;