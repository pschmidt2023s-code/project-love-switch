import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PremiumPageLayout } from '@/components/premium/PremiumPageLayout';
import { Seo } from '@/components/Seo';
import { toast } from 'sonner';
import {
  Loader2, CreditCard, ShoppingBag, Shield, Truck,
  ArrowRight, ArrowLeft, Check, Zap, Banknote
} from 'lucide-react';

interface ProfileData { first_name: string | null; last_name: string | null; email: string | null; phone: string | null; }
interface AddressData { street: string; postal_code: string; city: string; }

const ExpressCheckoutPage = () => {
  const { items, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [formData, setFormData] = useState({
    email: '', firstName: '', lastName: '', street: '', postalCode: '', city: '',
    paymentMethod: 'stripe' as 'stripe' | 'paypal' | 'bank_transfer'
  });

  const shippingCost = total >= 50 ? 0 : 4.95;
  const grandTotal = total + shippingCost;

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) { setLoadingProfile(false); return; }
      try {
        const { data: profileData } = await supabase.from('profiles').select('first_name, last_name, email, phone').eq('id', user.id).single();
        const { data: addressData } = await supabase.from('addresses').select('street, postal_code, city').eq('user_id', user.id).eq('is_default', true).maybeSingle();
        setFormData(prev => ({
          ...prev,
          email: user.email || profileData?.email || '',
          firstName: profileData?.first_name || '',
          lastName: profileData?.last_name || '',
          street: addressData?.street || '',
          postalCode: addressData?.postal_code || '',
          city: addressData?.city || '',
        }));
      } catch (error) { console.error('Error loading user data:', error); }
      finally { setLoadingProfile(false); }
    };
    loadUserData();
  }, [user]);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.street || !formData.postalCode || !formData.city) {
      toast.error('Bitte fülle alle Felder aus'); return;
    }
    if (formData.paymentMethod === 'bank_transfer') {
      toast.success('Bestellung aufgegeben!');
      navigate('/checkout/success?payment_method=bank_transfer');
      return;
    }
    setLoading(true);
    try {
      const checkoutItems = items.map(item => ({ name: `${item.productName} - ${item.variantSize}`, price: item.price, quantity: item.quantity, image: item.image }));
      if (shippingCost > 0) checkoutItems.push({ name: "Versandkosten", price: shippingCost, quantity: 1, image: "" });
      const address = { first_name: formData.firstName, last_name: formData.lastName, street: formData.street, postal_code: formData.postalCode, city: formData.city, country: 'DE', type: 'shipping' };
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { items: checkoutItems, payment_method: formData.paymentMethod, shipping_address: address, billing_address: address, user_id: user?.id, email: formData.email },
      });
      if (error) throw error;
      if (data.url) window.location.href = data.url;
    } catch (error) {
      console.error('Express checkout error:', error);
      toast.error('Fehler beim Checkout. Bitte versuche es erneut.');
    } finally { setLoading(false); }
  };

  if (items.length === 0) {
    return (
      <PremiumPageLayout>
        <section className="section-spacing">
          <div className="container-premium text-center max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-muted">
              <ShoppingBag className="w-7 h-7 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <h1 className="font-display text-2xl text-foreground mb-3">Dein Warenkorb ist leer</h1>
            <button onClick={() => navigate('/products')} className="inline-flex items-center px-8 py-4 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors">
              Jetzt einkaufen <ArrowRight className="ml-2 w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </section>
      </PremiumPageLayout>
    );
  }

  return (
    <PremiumPageLayout>
      <Seo title="Express Checkout | ALDENAIR" description="Schneller Checkout bei ALDENAIR." canonicalPath="/express-checkout" />

      <section className="border-b border-border">
        <div className="container-premium py-8 lg:py-12">
          <button onClick={() => navigate('/cart')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} /> Zurück zum Warenkorb
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center bg-accent/10">
              <Zap className="w-6 h-6 text-accent" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="font-display text-2xl text-foreground">Express Checkout</h1>
              <p className="text-sm text-muted-foreground">Schnell & sicher in nur einem Schritt</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="container-premium max-w-2xl mx-auto">
          {loadingProfile ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Order Summary */}
              <div className="p-5 border border-border">
                <h3 className="text-[10px] tracking-[0.2em] uppercase text-accent mb-4">
                  Bestellübersicht ({items.length} Artikel)
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="truncate flex-1 mr-4 text-muted-foreground">{item.quantity}x {item.productName} ({item.variantSize})</span>
                      <span className="font-medium text-foreground whitespace-nowrap">{(item.price * item.quantity).toFixed(2)} €</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border mt-3 pt-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Versand</span>
                    <span className={shippingCost === 0 ? 'text-accent font-medium' : 'text-foreground'}>
                      {shippingCost === 0 ? 'Kostenlos' : `${shippingCost.toFixed(2)} €`}
                    </span>
                  </div>
                  <div className="flex justify-between font-display text-lg pt-2">
                    <span>Gesamt</span>
                    <span className="text-foreground">{grandTotal.toFixed(2)} €</span>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-4">
                <h3 className="text-[10px] tracking-[0.2em] uppercase text-accent">Kontakt</h3>
                <div>
                  <label className="block text-xs text-muted-foreground mb-2">E-Mail *</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} placeholder="deine@email.de" required className="w-full px-4 py-3 bg-background border border-border text-sm focus:outline-none focus:border-accent" />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <h3 className="text-[10px] tracking-[0.2em] uppercase text-accent flex items-center gap-2"><Truck className="w-4 h-4" /> Lieferadresse</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-2">Vorname *</label>
                    <input value={formData.firstName} onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))} required className="w-full px-4 py-3 bg-background border border-border text-sm focus:outline-none focus:border-accent" />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-2">Nachname *</label>
                    <input value={formData.lastName} onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))} required className="w-full px-4 py-3 bg-background border border-border text-sm focus:outline-none focus:border-accent" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-2">Straße & Hausnummer *</label>
                  <input value={formData.street} onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))} required className="w-full px-4 py-3 bg-background border border-border text-sm focus:outline-none focus:border-accent" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-2">PLZ *</label>
                    <input value={formData.postalCode} onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))} required className="w-full px-4 py-3 bg-background border border-border text-sm focus:outline-none focus:border-accent" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-muted-foreground mb-2">Stadt *</label>
                    <input value={formData.city} onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))} required className="w-full px-4 py-3 bg-background border border-border text-sm focus:outline-none focus:border-accent" />
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="space-y-4">
                <h3 className="text-[10px] tracking-[0.2em] uppercase text-accent flex items-center gap-2"><CreditCard className="w-4 h-4" /> Zahlungsmethode</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {([
                    { key: 'stripe' as const, label: 'Kreditkarte', icon: CreditCard },
                    { key: 'paypal' as const, label: 'PayPal', icon: null },
                    { key: 'bank_transfer' as const, label: 'Überweisung', icon: Banknote },
                  ]).map(({ key, label, icon: Icon }) => (
                    <button
                      key={key} type="button"
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethod: key }))}
                      className={`p-4 border-2 transition-all flex items-center justify-between ${
                        formData.paymentMethod === key ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {key === 'paypal' ? (
                          <><span className="font-bold text-[#003087] text-sm">Pay</span><span className="font-bold text-[#009cde] text-sm">Pal</span></>
                        ) : Icon ? (
                          <><Icon className="w-4 h-4" strokeWidth={1.5} /><span className="text-sm font-medium">{label}</span></>
                        ) : null}
                      </div>
                      {formData.paymentMethod === key && <Check className="w-4 h-4 text-accent" />}
                    </button>
                  ))}
                </div>
                {formData.paymentMethod === 'bank_transfer' && (
                  <p className="text-xs text-muted-foreground p-3 border border-border">
                    Nach Abschluss erhältst du eine E-Mail mit unseren Bankdaten. Versand nach Zahlungseingang.
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit" disabled={loading}
                className="w-full py-4 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (<><Loader2 className="w-4 h-4 animate-spin" /> Wird verarbeitet...</>) : (
                  <>{formData.paymentMethod === 'bank_transfer' ? 'Bestellung aufgeben' : 'Jetzt bezahlen'} – {grandTotal.toFixed(2)} € <ArrowRight className="w-4 h-4" strokeWidth={1.5} /></>
                )}
              </button>

              {/* Trust */}
              <div className="flex items-center justify-center gap-6 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> SSL-verschlüsselt</span>
                <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" /> Kostenlos ab 50€</span>
                <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> 14 Tage Rückgabe</span>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Mit dem Klick akzeptierst du unsere <a href="/terms" className="underline">AGB</a> und <a href="/privacy" className="underline">Datenschutzerklärung</a>.
              </p>
            </form>
          )}
        </div>
      </section>
    </PremiumPageLayout>
  );
};

export default ExpressCheckoutPage;