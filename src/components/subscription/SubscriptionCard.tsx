import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Check, ChevronDown, Loader2, Mail, User as UserIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  frequency: 'monthly' | 'bi_monthly' | 'quarterly';
  discount: number;
  features: string[];
}

const plans: SubscriptionPlan[] = [
  {
    id: 'monthly',
    name: 'Monatlich',
    description: 'Jeden Monat Ihr Lieblingsparfüm',
    frequency: 'monthly',
    discount: 15,
    features: ['15% Rabatt', 'Jederzeit kündbar', 'Kostenloser Versand', 'Exklusive Proben'],
  },
  {
    id: 'bi_monthly',
    name: 'Alle 2 Monate',
    description: 'Perfekt für den moderaten Gebrauch',
    frequency: 'bi_monthly',
    discount: 12,
    features: ['12% Rabatt', 'Jederzeit kündbar', 'Kostenloser Versand', 'Exklusive Proben'],
  },
  {
    id: 'quarterly',
    name: 'Vierteljährlich',
    description: 'Ideal für Abwechslung',
    frequency: 'quarterly',
    discount: 10,
    features: ['10% Rabatt', 'Jederzeit kündbar', 'Kostenloser Versand', 'Überraschungsduft'],
  },
];

interface SubscriptionCardProps {
  productId?: string;
  variantId?: string;
  productName?: string;
  basePrice?: number;
  onSubscribe?: () => void;
  className?: string;
}

export function SubscriptionCard({
  productId,
  variantId,
  productName,
  basePrice = 49.99,
  onSubscribe,
  className = '',
}: SubscriptionCardProps) {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>('monthly');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
  // Guest subscription fields
  const [guestEmail, setGuestEmail] = useState('');
  const [guestName, setGuestName] = useState('');

  const currentPlan = plans.find(p => p.id === selectedPlan);
  const discountedPrice = currentPlan ? basePrice * (1 - currentPlan.discount / 100) : basePrice;

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const canSubscribe = user || (guestEmail && guestName && isValidEmail(guestEmail));

  const handleSubscribe = async () => {
    if (!user && (!guestEmail || !guestName)) {
      toast.error('Bitte geben Sie Ihren Namen und E-Mail-Adresse ein');
      return;
    }

    if (!user && !isValidEmail(guestEmail)) {
      toast.error('Bitte geben Sie eine gültige E-Mail-Adresse ein');
      return;
    }

    if (!productId || !variantId) {
      toast.error('Bitte wählen Sie ein Produkt aus');
      return;
    }

    setLoading(true);

    try {
      // Calculate next delivery date based on frequency
      const nextDelivery = new Date();
      if (currentPlan?.frequency === 'monthly') {
        nextDelivery.setMonth(nextDelivery.getMonth() + 1);
      } else if (currentPlan?.frequency === 'bi_monthly') {
        nextDelivery.setMonth(nextDelivery.getMonth() + 2);
      } else {
        nextDelivery.setMonth(nextDelivery.getMonth() + 3);
      }

      // Create subscription record - for guests or authenticated users
      const subscriptionData = {
        user_id: user?.id || null,
        guest_email: user ? null : guestEmail,
        guest_name: user ? null : guestName,
        product_id: productId,
        variant_id: variantId,
        frequency: currentPlan?.frequency || 'monthly',
        discount_percent: currentPlan?.discount || 15,
        next_delivery: nextDelivery.toISOString().split('T')[0],
        status: 'pending',
      };

      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .insert(subscriptionData)
        .select()
        .single();

      if (subError) throw subError;

      // Create checkout session via edge function
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-checkout', {
        body: {
          items: [{
            variantId,
            quantity: 1,
            isSubscription: true,
            subscriptionId: subscription.id,
            discountPercent: currentPlan?.discount || 15,
          }],
          guestEmail: user ? undefined : guestEmail,
          successUrl: `${window.location.origin}/checkout/success?subscription=${subscription.id}`,
          cancelUrl: `${window.location.origin}/checkout/cancel`,
        },
      });

      if (checkoutError) throw checkoutError;

      if (checkoutData?.url) {
        window.location.href = checkoutData.url;
      } else {
        throw new Error('Keine Checkout-URL erhalten');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Fehler beim Abschließen des Abos. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-card border border-border ${className}`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent/10 flex items-center justify-center">
            <Package className="w-5 h-5 text-accent" strokeWidth={1.5} />
          </div>
          <div className="text-left">
            <h3 className="font-display text-sm text-foreground">Parfüm-Abo</h3>
            <p className="text-xs text-muted-foreground">Bis zu 15% sparen • Auch als Gast</p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`}
          strokeWidth={1.5}
        />
      </button>

      {/* Expanded Content */}
      <motion.div
        initial={false}
        animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="p-4 pt-0 space-y-4">
          {/* Plan Selection */}
          <div className="space-y-2">
            <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
              Lieferintervall wählen
            </p>
            <div className="grid grid-cols-3 gap-2">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`p-3 border text-center transition-colors ${
                    selectedPlan === plan.id
                      ? 'border-accent bg-accent/5'
                      : 'border-border hover:border-accent/50'
                  }`}
                >
                  <p className="text-xs font-medium text-foreground">{plan.name}</p>
                  <p className="text-[10px] text-accent font-medium">-{plan.discount}%</p>
                </button>
              ))}
            </div>
          </div>

          {/* Features */}
          {currentPlan && (
            <div className="space-y-2">
              <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
                Vorteile
              </p>
              <ul className="space-y-1.5">
                {currentPlan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-foreground">
                    <Check className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Guest Subscription Form - Only show if not logged in */}
          {!user && (
            <div className="space-y-3 p-3 bg-muted/30 border border-border">
              <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
                Gast-Abo abschließen
              </p>
              <div className="space-y-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-4 h-4 text-muted-foreground pointer-events-none z-10">
                    <UserIcon className="w-4 h-4" strokeWidth={1.5} />
                  </span>
                  <Input
                    type="text"
                    placeholder="Ihr Name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="pl-10 h-10 text-sm"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-4 h-4 text-muted-foreground pointer-events-none z-10">
                    <Mail className="w-4 h-4" strokeWidth={1.5} />
                  </span>
                  <Input
                    type="email"
                    placeholder="ihre@email.de"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="pl-10 h-10 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2 py-2">
            <span className="text-2xl font-display text-foreground">
              €{discountedPrice.toFixed(2)}
            </span>
            <span className="text-sm text-muted-foreground line-through">
              €{basePrice.toFixed(2)}
            </span>
            <span className="text-xs text-accent font-medium">
              /{currentPlan?.frequency === 'monthly' ? 'Monat' : currentPlan?.frequency === 'bi_monthly' ? '2 Monate' : 'Quartal'}
            </span>
          </div>

          {/* Subscribe Button */}
          <button
            onClick={handleSubscribe}
            disabled={loading || !canSubscribe}
            className="w-full py-3 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Wird weitergeleitet...
              </>
            ) : user ? (
              'Abo starten & bezahlen'
            ) : (
              'Als Gast Abo starten'
            )}
          </button>

          {user && (
            <p className="text-xs text-accent text-center flex items-center justify-center gap-1">
              <Check className="w-3 h-3" />
              Angemeldet als {user.email}
            </p>
          )}

          <p className="text-[10px] text-muted-foreground text-center">
            Jederzeit kündbar • Sichere Zahlung via Stripe
          </p>
        </div>
      </motion.div>
    </div>
  );
}
