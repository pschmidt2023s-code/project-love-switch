import { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';

interface KPIData {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  avgOrderValue: number;
  recentOrders: any[];
  // Trend data
  previousOrders: number;
  previousRevenue: number;
  previousCustomers: number;
  previousAvgOrderValue: number;
}

export function AdminDashboardContent() {
  const isMobile = useIsMobile();
  const [data, setData] = useState<KPIData>({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    avgOrderValue: 0,
    recentOrders: [],
    previousOrders: 0,
    previousRevenue: 0,
    previousCustomers: 0,
    previousAvgOrderValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      const [ordersRes, customersRes, lastMonthOrdersRes, lastMonthCustomersRes] = await Promise.all([
        // Current month orders
        supabase
          .from('orders')
          .select('*')
          .gte('created_at', startOfMonth.toISOString())
          .order('created_at', { ascending: false }),
        // All customers
        supabase.from('profiles').select('id, created_at'),
        // Last month orders for comparison
        supabase
          .from('orders')
          .select('*')
          .gte('created_at', startOfLastMonth.toISOString())
          .lte('created_at', endOfLastMonth.toISOString()),
        // Last month customers
        supabase
          .from('profiles')
          .select('id')
          .lte('created_at', endOfLastMonth.toISOString()),
      ]);

      const orders = ordersRes.data || [];
      const customers = customersRes.data || [];
      const lastMonthOrders = lastMonthOrdersRes.data || [];
      const lastMonthCustomers = lastMonthCustomersRes.data || [];

      // Current month calculations
      const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
      const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

      // Last month calculations
      const previousRevenue = lastMonthOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
      const previousAvgOrderValue = lastMonthOrders.length > 0 ? previousRevenue / lastMonthOrders.length : 0;

      // Get all orders for recent list
      const allOrdersRes = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setData({
        totalOrders: orders.length,
        totalRevenue,
        totalCustomers: customers.length,
        avgOrderValue,
        recentOrders: allOrdersRes.data || [],
        previousOrders: lastMonthOrders.length,
        previousRevenue,
        previousCustomers: lastMonthCustomers.length,
        previousAvgOrderValue,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Set up realtime subscription for orders
    const channel = supabase
      .channel('admin-dashboard')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const calculateChange = (current: number, previous: number): { value: string; trend: 'up' | 'down' | 'neutral' } => {
    if (previous === 0) {
      if (current === 0) return { value: '0%', trend: 'neutral' };
      return { value: '+100%', trend: 'up' };
    }
    const change = ((current - previous) / previous) * 100;
    if (Math.abs(change) < 0.1) return { value: '0%', trend: 'neutral' };
    return {
      value: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`,
      trend: change > 0 ? 'up' : 'down',
    };
  };

  const revenueChange = calculateChange(data.totalRevenue, data.previousRevenue);
  const ordersChange = calculateChange(data.totalOrders, data.previousOrders);
  const customersChange = calculateChange(data.totalCustomers, data.previousCustomers);
  const avgOrderChange = calculateChange(data.avgOrderValue, data.previousAvgOrderValue);

  const kpis = [
    {
      label: 'Umsatz (Monat)',
      value: `€${data.totalRevenue.toFixed(2)}`,
      change: revenueChange.value,
      trend: revenueChange.trend,
      icon: TrendingUp,
    },
    {
      label: 'Bestellungen (Monat)',
      value: data.totalOrders.toString(),
      change: ordersChange.value,
      trend: ordersChange.trend,
      icon: ShoppingCart,
    },
    {
      label: 'Kunden (Gesamt)',
      value: data.totalCustomers.toString(),
      change: customersChange.value,
      trend: customersChange.trend,
      icon: Users,
    },
    {
      label: 'Ø Bestellwert',
      value: `€${data.avgOrderValue.toFixed(2)}`,
      change: avgOrderChange.value,
      trend: avgOrderChange.trend,
      icon: Package,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return 'bg-success/10 text-success';
      case 'pending':
        return 'bg-warning/10 text-warning';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive';
      case 'processing':
      case 'shipped':
        return 'bg-accent/10 text-accent';
      default:
        return 'bg-muted text-muted-foreground';
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

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight className="w-3 h-3" strokeWidth={1.5} />;
      case 'down':
        return <ArrowDownRight className="w-3 h-3" strokeWidth={1.5} />;
      default:
        return <Minus className="w-3 h-3" strokeWidth={1.5} />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return 'text-success';
      case 'down':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* KPI Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card border border-border p-4 lg:p-6 animate-pulse">
              <div className="h-3 w-16 bg-muted mb-3" />
              <div className="h-6 lg:h-8 w-24 bg-muted mb-2" />
              <div className="h-3 w-12 bg-muted" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-display text-foreground mb-1">Dashboard</h1>
          <p className="text-xs lg:text-sm text-muted-foreground">
            Echtzeit-Übersicht deines Shops
          </p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          title="Aktualisieren"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} strokeWidth={1.5} />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {kpis.map((kpi) => (
          <div 
            key={kpi.label} 
            className="bg-card border border-border p-4 lg:p-6"
          >
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <span className="text-[9px] lg:text-[10px] tracking-[0.1em] uppercase text-muted-foreground">
                {kpi.label}
              </span>
              <kpi.icon className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <p className="text-lg lg:text-2xl font-display text-foreground mb-1 lg:mb-2 truncate">
              {kpi.value}
            </p>
            <div className={`flex items-center gap-1 text-[10px] lg:text-xs ${getTrendColor(kpi.trend)}`}>
              {getTrendIcon(kpi.trend)}
              <span>{kpi.change}</span>
              <span className="text-muted-foreground ml-1 hidden sm:inline">vs. Vormonat</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-card border border-border">
        <div className="p-4 lg:p-6 border-b border-border">
          <h2 className="text-base lg:text-lg font-display text-foreground">Aktuelle Bestellungen</h2>
        </div>
        
        {/* Mobile Card View */}
        {isMobile ? (
          <div className="divide-y divide-border">
            {data.recentOrders.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                Keine Bestellungen vorhanden
              </div>
            ) : (
              data.recentOrders.map((order) => (
                <div key={order.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground text-sm">
                      {order.order_number}
                    </span>
                    <span className={`text-xs px-2 py-1 ${getStatusColor(order.status)}`}>
                      {formatStatus(order.status)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{new Date(order.created_at).toLocaleDateString('de-DE')}</span>
                    <span className="font-medium text-foreground">€{Number(order.total).toFixed(2)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Desktop Table View */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">
                    Bestellnummer
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">
                    Betrag
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">
                    Datum
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-muted-foreground py-8">
                      Keine Bestellungen vorhanden
                    </td>
                  </tr>
                ) : (
                  data.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                      <td className="p-4 font-medium text-foreground">
                        {order.order_number}
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 ${getStatusColor(order.status)}`}>
                          {formatStatus(order.status)}
                        </span>
                      </td>
                      <td className="p-4 font-medium">
                        €{Number(order.total).toFixed(2)}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('de-DE')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
