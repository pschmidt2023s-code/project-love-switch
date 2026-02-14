import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PremiumPageLayout } from '@/components/premium/PremiumPageLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Seo } from '@/components/Seo';
import {
  ArrowLeft, Package, Truck, CheckCircle2, Clock, XCircle,
  MapPin, CreditCard
} from 'lucide-react';
import { OrderStatusTracker } from '@/components/OrderStatusTracker';
import { ReorderButton } from '@/components/ReorderButton';

interface OrderItem {
  id: string;
  product_name: string;
  variant_size: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  variant_id: string | null;
}

interface Order {
  id: string;
  order_number: string;
  total: number;
  subtotal: number;
  shipping_cost: number | null;
  discount: number | null;
  status: string;
  payment_status: string | null;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface Address {
  id: string;
  first_name: string;
  last_name: string;
  street: string;
  street2: string | null;
  city: string;
  postal_code: string;
  state: string | null;
  country: string;
}

export default function Orders() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [shippingAddress, setShippingAddress] = useState<Address | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/auth'); return; }
    if (id) { loadOrderDetails(); } else { navigate('/orders'); }
  }, [user, authLoading, id, navigate]);

  async function loadOrderDetails() {
    if (!id || !user) return;
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders').select('*').eq('id', id).eq('user_id', user.id).single();
      if (orderError || !orderData) { navigate('/account'); return; }
      setOrder(orderData);

      const { data: itemsData } = await supabase.from('order_items').select('*').eq('order_id', id);
      if (itemsData) setItems(itemsData);

      if (orderData.shipping_address_id) {
        const { data: addressData } = await supabase
          .from('addresses').select('*').eq('id', orderData.shipping_address_id).single();
        if (addressData) setShippingAddress(addressData);
      }
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusConfig = (status: string) => {
    const config: Record<string, { icon: typeof Clock; label: string; color: string }> = {
      pending: { icon: Clock, label: 'Ausstehend', color: 'text-amber-500' },
      processing: { icon: Package, label: 'In Bearbeitung', color: 'text-blue-500' },
      paid: { icon: CreditCard, label: 'Bezahlt', color: 'text-green-500' },
      shipped: { icon: Truck, label: 'Versendet', color: 'text-purple-500' },
      delivered: { icon: CheckCircle2, label: 'Zugestellt', color: 'text-green-600' },
      cancelled: { icon: XCircle, label: 'Storniert', color: 'text-destructive' },
      completed: { icon: CheckCircle2, label: 'Abgeschlossen', color: 'text-accent' },
    };
    return config[status] || config.pending;
  };

  if (loading) {
    return (
      <PremiumPageLayout>
        <div className="container-premium py-16">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-muted" />
            <div className="h-64 bg-muted" />
          </div>
        </div>
      </PremiumPageLayout>
    );
  }

  if (!order) {
    return (
      <PremiumPageLayout>
        <div className="container-premium py-24 text-center">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" strokeWidth={1} />
          <h1 className="font-display text-2xl text-foreground mb-3">Bestellung nicht gefunden</h1>
          <Link
            to="/account"
            className="inline-flex items-center px-6 py-3 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors mt-4"
          >
            Zurück zum Konto
          </Link>
        </div>
      </PremiumPageLayout>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  return (
    <PremiumPageLayout>
      <Seo title={`Bestellung ${order.order_number} | ALDENAIR`} description="Bestelldetails" canonicalPath={`/orders/${id}`} />

      {/* Header */}
      <section className="border-b border-border">
        <div className="container-premium py-8 lg:py-12">
          <Breadcrumb
            items={[
              { label: 'Konto', path: '/account' },
              { label: 'Bestellungen', path: '/orders' },
              { label: order.order_number }
            ]}
            className="mb-6"
          />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-3">Bestellung</span>
              <h1 className="font-display text-3xl lg:text-4xl text-foreground">{order.order_number}</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Bestellt am {new Date(order.created_at).toLocaleDateString('de-DE', {
                  day: '2-digit', month: 'long', year: 'numeric',
                })}
              </p>
            </div>
            <ReorderButton items={items} />
          </div>

          {/* Status Tracker */}
          <div className="mt-8">
            <OrderStatusTracker status={order.status} />
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section-spacing">
        <div className="container-premium">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Left - Items & Address */}
            <div className="lg:col-span-2 space-y-8">
              {/* Order Items */}
              <div>
                <h2 className="text-[10px] tracking-[0.2em] uppercase text-accent mb-6">Bestellte Artikel</h2>
                <div className="border border-border divide-y divide-border">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-muted flex items-center justify-center flex-shrink-0">
                          <Package className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.product_name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.variant_size} · Menge: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-foreground">{Number(item.total_price).toFixed(2)} €</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              {shippingAddress && (
                <div>
                  <h2 className="text-[10px] tracking-[0.2em] uppercase text-accent mb-4">Lieferadresse</h2>
                  <div className="p-5 border border-border">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                      <div className="text-sm text-muted-foreground space-y-0.5">
                        <p className="font-medium text-foreground">{shippingAddress.first_name} {shippingAddress.last_name}</p>
                        <p>{shippingAddress.street}</p>
                        {shippingAddress.street2 && <p>{shippingAddress.street2}</p>}
                        <p>{shippingAddress.postal_code} {shippingAddress.city}</p>
                        <p>{shippingAddress.country}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right - Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 border border-border p-6 lg:p-8 space-y-5">
                <h2 className="text-[10px] tracking-[0.2em] uppercase text-accent">Zusammenfassung</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Zwischensumme</span>
                    <span>{Number(order.subtotal).toFixed(2)} €</span>
                  </div>
                  {order.shipping_cost !== null && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Versand</span>
                      <span>{Number(order.shipping_cost) === 0 ? 'Kostenlos' : `${Number(order.shipping_cost).toFixed(2)} €`}</span>
                    </div>
                  )}
                  {order.discount !== null && Number(order.discount) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Rabatt</span>
                      <span>-{Number(order.discount).toFixed(2)} €</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-4 flex justify-between font-display text-lg">
                  <span>Gesamt</span>
                  <span className="text-foreground">{Number(order.total).toFixed(2)} €</span>
                </div>

                {order.payment_method && (
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CreditCard className="w-4 h-4" strokeWidth={1.5} />
                      <span>
                        {order.payment_method === 'stripe' ? 'Kreditkarte' :
                         order.payment_method === 'paypal' ? 'PayPal' :
                         order.payment_method === 'bank_transfer' ? 'Banküberweisung' :
                         order.payment_method}
                      </span>
                    </div>
                  </div>
                )}

                {order.notes && (
                  <div className="pt-4 border-t border-border">
                    <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-2">Anmerkungen</p>
                    <p className="text-sm text-muted-foreground">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PremiumPageLayout>
  );
}