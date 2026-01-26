import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { 
  Loader2, 
  CreditCard, 
  ShoppingBag,
  Shield,
  Truck,
  ArrowRight,
  ArrowLeft,
  Check,
  Zap
} from 'lucide-react';

const ExpressCheckoutPage = () => {
  const { items, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: '',
    lastName: '',
    street: '',
    postalCode: '',
    city: '',
    paymentMethod: 'stripe' as 'stripe' | 'paypal'
  });

  const shippingCost = total >= 50 ? 0 : 4.95;
  const grandTotal = total + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.firstName || !formData.lastName || 
        !formData.street || !formData.postalCode || !formData.city) {
      toast.error('Bitte fülle alle Felder aus');
      return;
    }

    setLoading(true);
    try {
      const checkoutItems = items.map(item => ({
        name: `${item.productName} - ${item.variantSize}`,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      }));

      if (shippingCost > 0) {
        checkoutItems.push({
          name: "Versandkosten",
          price: shippingCost,
          quantity: 1,
          image: "",
        });
      }

      const address = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        street: formData.street,
        postal_code: formData.postalCode,
        city: formData.city,
        country: 'DE',
        type: 'shipping'
      };

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          items: checkoutItems,
          payment_method: formData.paymentMethod,
          shipping_address: address,
          billing_address: address,
          user_id: user?.id,
          email: formData.email,
        },
      });

      if (error) throw error;

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Express checkout error:', error);
      toast.error('Fehler beim Checkout. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-24 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-4">Dein Warenkorb ist leer</h1>
          <Button onClick={() => navigate('/products')}>Jetzt einkaufen</Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-3xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/cart')}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zum Warenkorb
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-6 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold flex items-center gap-2">
                      Express Checkout
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Schnell & sicher in nur einem Schritt bezahlen
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Order Summary */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                    Bestellübersicht ({items.length} Artikel)
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="truncate flex-1 mr-4">
                          {item.quantity}x {item.productName} ({item.variantSize})
                        </span>
                        <span className="font-medium whitespace-nowrap">
                          {(item.price * item.quantity).toFixed(2)} €
                        </span>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-3" />
                  <div className="flex justify-between text-sm">
                    <span>Versand</span>
                    <span className={shippingCost === 0 ? 'text-success font-medium' : ''}>
                      {shippingCost === 0 ? 'Kostenlos' : `${shippingCost.toFixed(2)} €`}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2">
                    <span>Gesamt</span>
                    <span className="text-primary">{grandTotal.toFixed(2)} €</span>
                  </div>
                </div>

                {/* Contact */}
                <div className="space-y-4">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    Kontakt
                  </h3>
                  <div>
                    <Label htmlFor="email">E-Mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="deine@email.de"
                      required
                    />
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="space-y-4">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Lieferadresse
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Vorname *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Nachname *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="street">Straße & Hausnummer *</Label>
                    <Input
                      id="street"
                      value={formData.street}
                      onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="postalCode">PLZ *</Label>
                      <Input
                        id="postalCode"
                        value={formData.postalCode}
                        onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="city">Stadt *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-4">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Zahlungsmethode
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'stripe' }))}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.paymentMethod === 'stripe'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5" />
                          <span className="font-medium">Kreditkarte</span>
                        </div>
                        {formData.paymentMethod === 'stripe' && (
                          <Check className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'paypal' }))}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.paymentMethod === 'paypal'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#003087]">Pay</span>
                          <span className="font-bold text-[#009cde]">Pal</span>
                        </div>
                        {formData.paymentMethod === 'paypal' && (
                          <Check className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Wird verarbeitet...
                    </>
                  ) : (
                    <>
                      Jetzt bezahlen - {grandTotal.toFixed(2)} €
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>

                {/* Trust Badges */}
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    SSL-verschlüsselt
                  </div>
                  <div className="flex items-center gap-1">
                    <Truck className="w-3 h-3" />
                    Kostenloser Versand ab 50€
                  </div>
                  <div className="flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    14 Tage Rückgaberecht
                  </div>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  Mit dem Klick auf "Jetzt bezahlen" akzeptierst du unsere{' '}
                  <a href="/terms" className="underline hover:no-underline">AGB</a> und{' '}
                  <a href="/privacy" className="underline hover:no-underline">Datenschutzerklärung</a>.
                </p>
              </form>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ExpressCheckoutPage;
