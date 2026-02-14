import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingCart, Mail, TrendingUp, Clock } from 'lucide-react';

interface AbandonedCart {
  id: string;
  user_id: string | null;
  guest_email: string | null;
  cart_data: unknown;
  total_amount: number;
  reminder_sent_count: number;
  recovered: boolean;
  created_at: string;
}

export default function AbandonedCartManagement() {
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCarts();
  }, []);

  async function fetchCarts() {
    const { data } = await supabase.from('abandoned_carts').select('*').order('created_at', { ascending: false }).limit(50);
    setCarts(data || []);
    setLoading(false);
  }

  const totalValue = carts.reduce((s, c) => s + Number(c.total_amount || 0), 0);
  const recoveredCarts = carts.filter(c => c.recovered);
  const recoveredValue = recoveredCarts.reduce((s, c) => s + Number(c.total_amount || 0), 0);
  const recoveryRate = carts.length > 0 ? (recoveredCarts.length / carts.length * 100).toFixed(1) : '0';
  const remindedCarts = carts.filter(c => c.reminder_sent_count > 0).length;

  if (loading) return <div className="p-12 text-center"><div className="w-6 h-6 border-2 border-accent border-t-transparent animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-display text-foreground mb-1">Warenkorbabbrecher</h1>
        <p className="text-xs text-muted-foreground">Abandoned Cart Recovery – Übersicht</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Abgebrochene Warenkörbe', value: carts.length, icon: ShoppingCart },
          { label: 'Verlorener Umsatz', value: `€${totalValue.toFixed(2)}`, icon: TrendingUp },
          { label: 'Recovery Rate', value: `${recoveryRate}%`, icon: TrendingUp },
          { label: 'Erinnerungen gesendet', value: remindedCarts, icon: Mail },
        ].map(kpi => (
          <div key={kpi.label} className="bg-card border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] tracking-[0.1em] uppercase text-muted-foreground">{kpi.label}</span>
              <kpi.icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <p className="text-xl font-display text-foreground">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border">
        <div className="p-4 border-b border-border">
          <h2 className="text-base font-display text-foreground">Aktuelle Abbrecher</h2>
        </div>
        <div className="divide-y divide-border">
          {carts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Keine abgebrochenen Warenkörbe</div>
          ) : carts.map(cart => (
            <div key={cart.id} className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {cart.guest_email || 'Registrierter Nutzer'}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {new Date(cart.created_at).toLocaleDateString('de-DE')}
                  </span>
                  <span>€{Number(cart.total_amount).toFixed(2)}</span>
                  <span>{cart.reminder_sent_count} Erinnerung(en)</span>
                </div>
              </div>
              <span className={`text-[10px] tracking-[0.1em] uppercase px-2 py-1 ${
                cart.recovered ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'
              }`}>
                {cart.recovered ? 'Wiederhergestellt' : 'Offen'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
