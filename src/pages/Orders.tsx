import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  XCircle,
  MapPin,
  CreditCard
} from 'lucide-react';

interface OrderItem {
  id: string;
  product_name: string;
  variant_size: string;
  quantity: number;
  unit_price: number;
  total_price: number;
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [shippingAddress, setShippingAddress] = useState<Address | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (id) {
      loadOrderDetails();
    } else {
      navigate('/account');
    }
  }, [user, id, navigate]);

  async function loadOrderDetails() {
    if (!id || !user) return;

    try {
      // Load order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (orderError || !orderData) {
        navigate('/account');
        return;
      }

      setOrder(orderData);

      // Load order items
      const { data: itemsData } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', id);

      if (itemsData) {
        setItems(itemsData);
      }

      // Load shipping address
      if (orderData.shipping_address_id) {
        const { data: addressData } = await supabase
          .from('addresses')
          .select('*')
          .eq('id', orderData.shipping_address_id)
          .single();

        if (addressData) {
          setShippingAddress(addressData);
        }
      }
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusConfig = (status: string) => {
    const config: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
      pending: { icon: Clock, label: 'Ausstehend', color: 'text-yellow-500' },
      processing: { icon: Package, label: 'In Bearbeitung', color: 'text-blue-500' },
      paid: { icon: CreditCard, label: 'Bezahlt', color: 'text-green-500' },
      shipped: { icon: Truck, label: 'Versendet', color: 'text-purple-500' },
      delivered: { icon: CheckCircle2, label: 'Zugestellt', color: 'text-green-600' },
      cancelled: { icon: XCircle, label: 'Storniert', color: 'text-red-500' },
    };
    return config[status] || config.pending;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="h-10 w-48 mb-8" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">Bestellung nicht gefunden</p>
          <Button asChild className="mt-4">
            <Link to="/account">Zurück zum Konto</Link>
          </Button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/account" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Zurück zum Konto
            </Link>
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{order.order_number}</h1>
              <p className="text-muted-foreground">
                Bestellt am {new Date(order.created_at).toLocaleDateString('de-DE', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className={`flex items-center gap-2 ${statusConfig.color}`}>
              <StatusIcon className="w-5 h-5" />
              <span className="font-medium">{statusConfig.label}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bestellte Artikel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-muted-foreground">{item.variant_size}</p>
                          <p className="text-sm text-muted-foreground">Menge: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-semibold">{Number(item.total_price).toFixed(2)} €</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            {shippingAddress && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Lieferadresse
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">
                    {shippingAddress.first_name} {shippingAddress.last_name}
                  </p>
                  <p className="text-muted-foreground">{shippingAddress.street}</p>
                  {shippingAddress.street2 && (
                    <p className="text-muted-foreground">{shippingAddress.street2}</p>
                  )}
                  <p className="text-muted-foreground">
                    {shippingAddress.postal_code} {shippingAddress.city}
                  </p>
                  <p className="text-muted-foreground">{shippingAddress.country}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Zusammenfassung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Zwischensumme</span>
                  <span>{Number(order.subtotal).toFixed(2)} €</span>
                </div>
                {order.shipping_cost !== null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Versand</span>
                    <span>
                      {Number(order.shipping_cost) === 0
                        ? 'Kostenlos'
                        : `${Number(order.shipping_cost).toFixed(2)} €`}
                    </span>
                  </div>
                )}
                {order.discount !== null && Number(order.discount) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Rabatt</span>
                    <span>-{Number(order.discount).toFixed(2)} €</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Gesamt</span>
                  <span>{Number(order.total).toFixed(2)} €</span>
                </div>

                {order.payment_method && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CreditCard className="w-4 h-4" />
                      <span>
                        {order.payment_method === 'stripe' ? 'Kreditkarte' :
                         order.payment_method === 'paypal' ? 'PayPal' :
                         order.payment_method}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {order.notes && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Anmerkungen</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{order.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
