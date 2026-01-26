import { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface KPIData {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  avgOrderValue: number;
  recentOrders: any[];
}

export function AdminDashboardContent() {
  const [data, setData] = useState<KPIData>({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    avgOrderValue: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [ordersRes, customersRes] = await Promise.all([
          supabase.from('orders').select('*').order('created_at', { ascending: false }),
          supabase.from('profiles').select('id'),
        ]);

        const orders = ordersRes.data || [];
        const customers = customersRes.data || [];

        const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
        const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

        setData({
          totalOrders: orders.length,
          totalRevenue,
          totalCustomers: customers.length,
          avgOrderValue,
          recentOrders: orders.slice(0, 5),
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const kpis = [
    {
      label: 'Umsatz',
      value: `€${data.totalRevenue.toFixed(2)}`,
      change: '+12.5%',
      trend: 'up',
      icon: TrendingUp,
    },
    {
      label: 'Bestellungen',
      value: data.totalOrders.toString(),
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingCart,
    },
    {
      label: 'Kunden',
      value: data.totalCustomers.toString(),
      change: '+15.3%',
      trend: 'up',
      icon: Users,
    },
    {
      label: 'Ø Bestellwert',
      value: `€${data.avgOrderValue.toFixed(2)}`,
      change: '-2.1%',
      trend: 'down',
      icon: Package,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return 'badge-success';
      case 'pending':
        return 'badge-warning';
      case 'cancelled':
        return 'badge-error';
      case 'processing':
      case 'shipped':
        return 'badge-info';
      default:
        return 'badge-neutral';
    }
  };

  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'Ausstehend',
      processing: 'In Bearbeitung',
      shipped: 'Versendet',
      delivered: 'Geliefert',
      completed: 'Abgeschlossen',
      cancelled: 'Storniert',
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* KPI Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card border border-border p-6 animate-pulse">
              <div className="h-4 w-20 bg-muted mb-3" />
              <div className="h-8 w-32 bg-muted mb-2" />
              <div className="h-3 w-16 bg-muted" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-display text-foreground mb-1">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Übersicht über deinen Shop
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div 
            key={kpi.label} 
            className="kpi-card"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground">
                {kpi.label}
              </span>
              <kpi.icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <p className="text-2xl font-display text-foreground mb-2">
              {kpi.value}
            </p>
            <div className={`flex items-center gap-1 text-xs ${
              kpi.trend === 'up' ? 'text-success' : 'text-destructive'
            }`}>
              {kpi.trend === 'up' ? (
                <ArrowUpRight className="w-3 h-3" strokeWidth={1.5} />
              ) : (
                <ArrowDownRight className="w-3 h-3" strokeWidth={1.5} />
              )}
              <span>{kpi.change}</span>
              <span className="text-muted-foreground ml-1">vs. Vormonat</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-card border border-border">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-display text-foreground">Aktuelle Bestellungen</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Bestellnummer</th>
                <th>Kunde</th>
                <th>Status</th>
                <th>Betrag</th>
                <th>Datum</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted-foreground py-8">
                    Keine Bestellungen vorhanden
                  </td>
                </tr>
              ) : (
                data.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-medium text-foreground">
                      {order.order_number}
                    </td>
                    <td className="text-muted-foreground">
                      {order.user_id?.slice(0, 8)}...
                    </td>
                    <td>
                      <span className={`badge-status ${getStatusColor(order.status)}`}>
                        {formatStatus(order.status)}
                      </span>
                    </td>
                    <td className="font-medium">
                      €{Number(order.total).toFixed(2)}
                    </td>
                    <td className="text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('de-DE')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
