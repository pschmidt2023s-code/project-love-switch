import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users, TrendingUp, Award, DollarSign } from 'lucide-react';

interface CustomerCLV {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  total_spent: number;
  tier: string | null;
  order_count: number;
}

export default function CLVDashboard() {
  const [customers, setCustomers] = useState<CustomerCLV[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      // Get profiles with spending data
      const { data: profiles } = await supabase.from('profiles').select('id, email, first_name, last_name, total_spent, tier');
      
      // Get order counts per user
      const { data: orders } = await supabase.from('orders').select('user_id');

      const orderCounts: Record<string, number> = {};
      (orders || []).forEach(o => {
        if (o.user_id) orderCounts[o.user_id] = (orderCounts[o.user_id] || 0) + 1;
      });

      const customerData: CustomerCLV[] = (profiles || [])
        .map(p => ({
          id: p.id,
          email: p.email,
          first_name: p.first_name,
          last_name: p.last_name,
          total_spent: Number(p.total_spent || 0),
          tier: p.tier,
          order_count: orderCounts[p.id] || 0,
        }))
        .sort((a, b) => b.total_spent - a.total_spent);

      setCustomers(customerData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const totalCLV = customers.reduce((s, c) => s + c.total_spent, 0);
  const avgCLV = customers.length > 0 ? totalCLV / customers.length : 0;
  const topCustomers = customers.filter(c => c.total_spent > avgCLV * 2);
  const tierDistribution = {
    bronze: customers.filter(c => c.tier === 'bronze' || !c.tier).length,
    silver: customers.filter(c => c.tier === 'silver').length,
    gold: customers.filter(c => c.tier === 'gold').length,
    platinum: customers.filter(c => c.tier === 'platinum').length,
  };

  const getTierColor = (tier: string | null) => {
    switch (tier) {
      case 'platinum': return 'bg-purple-500/10 text-purple-600';
      case 'gold': return 'bg-yellow-500/10 text-yellow-700';
      case 'silver': return 'bg-gray-500/10 text-gray-600';
      default: return 'bg-amber-500/10 text-amber-700';
    }
  };

  if (loading) return <div className="p-12 text-center"><div className="w-6 h-6 border-2 border-accent border-t-transparent animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-display text-foreground mb-1">Customer Lifetime Value</h1>
        <p className="text-xs text-muted-foreground">Kundenwert-Analyse und Segmentierung</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Gesamt CLV', value: `€${totalCLV.toFixed(2)}`, icon: DollarSign },
          { label: 'Ø CLV', value: `€${avgCLV.toFixed(2)}`, icon: TrendingUp },
          { label: 'Top-Kunden', value: topCustomers.length, icon: Award },
          { label: 'Kunden gesamt', value: customers.length, icon: Users },
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

      {/* Tier Distribution */}
      <div className="bg-card border border-border p-4">
        <h2 className="text-base font-display text-foreground mb-4">Tier-Verteilung</h2>
        <div className="grid grid-cols-4 gap-3">
          {Object.entries(tierDistribution).map(([tier, count]) => (
            <div key={tier} className="text-center p-3 bg-muted/50">
              <p className="text-lg font-display text-foreground">{count}</p>
              <p className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground capitalize">{tier}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top Customers */}
      <div className="bg-card border border-border">
        <div className="p-4 border-b border-border">
          <h2 className="text-base font-display text-foreground">Top 20 Kunden nach CLV</h2>
        </div>
        <div className="divide-y divide-border">
          {customers.slice(0, 20).map((customer, i) => (
            <div key={customer.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground w-6">{i + 1}.</span>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {customer.first_name || customer.email || 'Unbekannt'} {customer.last_name || ''}
                  </p>
                  <p className="text-xs text-muted-foreground">{customer.order_count} Bestellungen</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[9px] tracking-[0.1em] uppercase px-2 py-0.5 ${getTierColor(customer.tier)}`}>
                  {customer.tier || 'bronze'}
                </span>
                <span className="text-sm font-medium text-foreground">€{customer.total_spent.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
