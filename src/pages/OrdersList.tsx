import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PremiumPageLayout } from '@/components/premium/PremiumPageLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Seo } from '@/components/Seo';
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
    if (!user) { navigate('/auth'); return; }

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

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      pending: 'Ausstehend', processing: 'In Bearbeitung', paid: 'Bezahlt',
      shipped: 'Versendet', delivered: 'Zugestellt', cancelled: 'Storniert', completed: 'Abgeschlossen',
    };
    return map[status] || status;
  };

  return (
    <PremiumPageLayout>
      <Seo title="Meine Bestellungen | ALDENAIR" description="Übersicht Ihrer Bestellungen" canonicalPath="/orders" />

      {/* Header */}
      <section className="border-b border-border">
        <div className="container-premium py-8 lg:py-12">
          <Breadcrumb
            items={[
              { label: 'Konto', path: '/account' },
              { label: 'Bestellungen' }
            ]}
            className="mb-6"
          />
          <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-3">Konto</span>
          <h1 className="font-display text-3xl lg:text-4xl text-foreground">Meine Bestellungen</h1>
          <p className="text-muted-foreground text-sm mt-2">Übersicht Ihrer Bestellungen</p>
        </div>
      </section>

      {/* Orders */}
      <section className="section-spacing">
        <div className="container-premium">
          <div className="max-w-3xl">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted animate-pulse" />)}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 border border-border">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" strokeWidth={1} />
                <h2 className="font-display text-xl text-foreground mb-2">Noch keine Bestellungen</h2>
                <p className="text-sm text-muted-foreground mb-6">Starten Sie Ihre Duftreise</p>
                <Link to="/products" className="inline-flex items-center px-6 py-3 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors">
                  Jetzt einkaufen
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map(order => (
                  <Link
                    key={order.id}
                    to={`/orders/${order.id}`}
                    className="flex items-center justify-between p-5 border border-border hover:border-accent/50 transition-colors group"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">{order.order_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('de-DE', {
                          day: '2-digit', month: 'long', year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] tracking-[0.1em] uppercase px-3 py-1 bg-muted text-muted-foreground">
                        {getStatusLabel(order.status)}
                      </span>
                      <span className="text-sm font-medium text-foreground">{Number(order.total).toFixed(2)} €</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" strokeWidth={1.5} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </PremiumPageLayout>
  );
}