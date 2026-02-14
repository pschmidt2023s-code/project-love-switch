import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { PremiumPageLayout } from '@/components/premium/PremiumPageLayout';
import { Seo } from '@/components/Seo';
import { CheckCircle, Package, ShoppingBag, ArrowRight, Truck, Clock, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface OrderDetails {
  order_number: string;
  total: number;
  status: string;
  created_at: string;
  shipping_cost: number | null;
  payment_method: string | null;
}

interface OrderItem {
  product_name: string;
  variant_size: string;
  quantity: number;
  total_price: number;
}

const CheckoutSuccess = () => {
  const { clearCart } = useCart();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const subscriptionId = searchParams.get('subscription');
  const orderId = searchParams.get('order_id');
  const [isSubscription, setIsSubscription] = useState(false);
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  useEffect(() => { clearCart(); }, [clearCart]);

  useEffect(() => {
    if (subscriptionId) {
      setIsSubscription(true);
      supabase.from('subscriptions').update({ status: 'active' }).eq('id', subscriptionId)
        .then(() => { console.log('Subscription activated'); });
    }
  }, [subscriptionId]);

  // Load order details
  useEffect(() => {
    if (orderId && user) {
      loadOrderDetails();
    }
  }, [orderId, user]);

  const loadOrderDetails = async () => {
    if (!orderId || !user) return;

    const { data: orderData } = await supabase
      .from('orders')
      .select('order_number, total, status, created_at, shipping_cost, payment_method')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();

    if (orderData) setOrder(orderData);

    const { data: itemsData } = await supabase
      .from('order_items')
      .select('product_name, variant_size, quantity, total_price')
      .eq('order_id', orderId);

    if (itemsData) setOrderItems(itemsData);
  };

  // Calculate estimated delivery (1-2 business days from now)
  const getEstimatedDelivery = () => {
    const now = new Date();
    const addWorkdays = (date: Date, days: number) => {
      const result = new Date(date);
      let added = 0;
      while (added < days) {
        result.setDate(result.getDate() + 1);
        const day = result.getDay();
        if (day !== 0 && day !== 6) added++;
      }
      return result;
    };
    const earliest = addWorkdays(now, 1);
    const latest = addWorkdays(now, 3);
    const fmt = (d: Date) => d.toLocaleDateString('de-DE', { day: '2-digit', month: 'long' });
    return `${fmt(earliest)} – ${fmt(latest)}`;
  };

  const getPaymentLabel = (method: string | null) => {
    if (!method) return 'Unbekannt';
    const map: Record<string, string> = {
      stripe: 'Kreditkarte', paypal: 'PayPal', bank_transfer: 'Überweisung',
    };
    return map[method] || method;
  };

  return (
    <PremiumPageLayout>
      <Seo title="Bestellung bestätigt | ALDENAIR" description="Deine Bestellung wurde erfolgreich aufgegeben." canonicalPath="/checkout/success" />

      <section className="section-spacing">
        <div className="container-premium max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-accent/10">
              <CheckCircle className="w-10 h-10 text-accent" strokeWidth={1.5} />
            </div>

            <h1 className="font-display text-3xl text-foreground mb-3">
              {isSubscription ? 'Abo erfolgreich aktiviert!' : 'Bestellung bestätigt!'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isSubscription
                ? 'Vielen Dank für dein Parfüm-Abo! Du erhältst in Kürze eine Bestätigungs-E-Mail.'
                : 'Vielen Dank für deine Bestellung. Du erhältst in Kürze eine Bestätigungs-E-Mail.'}
            </p>
          </div>

          {/* Order Details */}
          {order && (
            <div className="border border-border divide-y divide-border mb-8">
              {/* Order Header */}
              <div className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-accent mb-1">Bestellnummer</p>
                  <p className="font-display text-lg text-foreground">{order.order_number}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">Gesamt</p>
                  <p className="font-display text-lg text-foreground">{Number(order.total).toFixed(2)} €</p>
                </div>
              </div>

              {/* Order Items */}
              {orderItems.length > 0 && (
                <div className="p-6">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-accent mb-4">Bestellte Artikel</p>
                  <div className="space-y-3">
                    {orderItems.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div>
                          <span className="text-foreground">{item.quantity}x {item.product_name}</span>
                          <span className="text-muted-foreground ml-2">({item.variant_size})</span>
                        </div>
                        <span className="font-medium text-foreground">{Number(item.total_price).toFixed(2)} €</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Delivery & Payment Info */}
              <div className="p-6 grid sm:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <Truck className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <div>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1">Lieferung</p>
                    <p className="text-sm text-foreground">{getEstimatedDelivery()}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <div>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1">Zahlung</p>
                    <p className="text-sm text-foreground">{getPaymentLabel(order.payment_method)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <div>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1">Versand</p>
                    <p className="text-sm text-foreground">
                      {order.shipping_cost === null || Number(order.shipping_cost) === 0 ? 'Kostenlos' : `${Number(order.shipping_cost).toFixed(2)} €`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subscription Details */}
          {isSubscription && (
            <div className="p-6 border border-border mb-8">
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

          {/* No order loaded fallback */}
          {!order && !isSubscription && (
            <div className="p-6 border border-border mb-8">
              <div className="flex items-center gap-3 mb-4">
                <ShoppingBag className="w-5 h-5 text-accent" strokeWidth={1.5} />
                <span className="text-sm font-medium text-foreground">Nächste Schritte</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>📧 Bestätigungs-E-Mail prüfen</li>
                <li>📦 Versand innerhalb von 1-2 Werktagen</li>
                <li>🚚 Sendungsverfolgung per E-Mail</li>
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {user && orderId && (
              <Link
                to={`/orders/${orderId}`}
                className="flex items-center justify-center w-full py-4 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors"
              >
                Bestellung verfolgen
                <ArrowRight className="ml-2 w-4 h-4" strokeWidth={1.5} />
              </Link>
            )}
            <Link
              to="/products"
              className={`flex items-center justify-center w-full py-4 text-[11px] tracking-[0.15em] uppercase font-medium transition-colors ${
                user && orderId
                  ? 'border border-border text-foreground hover:bg-muted'
                  : 'bg-foreground text-background hover:bg-foreground/90'
              }`}
            >
              Weiter einkaufen
              <ArrowRight className="ml-2 w-4 h-4" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </section>
    </PremiumPageLayout>
  );
};

export default CheckoutSuccess;
