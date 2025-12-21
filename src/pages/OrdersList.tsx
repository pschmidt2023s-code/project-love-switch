import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, ChevronRight } from 'lucide-react';

interface Order {
  id: string;
  order_number: string;
  total: number;
  status: string;
  created_at: string;
}

export default function OrdersList() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/auth');
      return;
    }

    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('orders')
        .select('id, order_number, total, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      setOrders(data || []);
      setLoading(false);
    })();
  }, [user, authLoading, navigate]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: 'Ausstehend', variant: 'secondary' },
      processing: { label: 'In Bearbeitung', variant: 'outline' },
      paid: { label: 'Bezahlt', variant: 'default' },
      shipped: { label: 'Versendet', variant: 'default' },
      delivered: { label: 'Zugestellt', variant: 'default' },
      cancelled: { label: 'Storniert', variant: 'destructive' },
    };
    const config = statusMap[status] || statusMap.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <header className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Meine Bestellungen</h1>
          <p className="text-muted-foreground mt-1">Übersicht Ihrer Bestellungen</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Bestellungen</CardTitle>
            <CardDescription>Die letzten Bestellungen in Ihrem Konto</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-10">
                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Noch keine Bestellungen</p>
                <Button asChild>
                  <Link to="/products">Jetzt einkaufen</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {getStatusBadge(order.status)}
                      <p className="font-semibold">{Number(order.total).toFixed(2)} €</p>
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/orders/${order.id}`} aria-label={`Bestellung ${order.order_number} ansehen`}>
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
