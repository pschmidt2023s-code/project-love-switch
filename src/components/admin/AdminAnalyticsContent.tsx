import { useState, useEffect } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, TrendingDown, Users, ShoppingBag, DollarSign, Package, RefreshCcw, Repeat, Pause, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrderStatusCount {
  status: string;
  count: number;
}

interface TopProduct {
  name: string;
  sales: number;
  revenue: number;
}

interface SubscriptionStats {
  active: number;
  paused: number;
  cancelled: number;
  total: number;
  pauseRate: number;
  cancelRate: number;
  monthlyChurn: number;
  revenueAtRisk: number;
}

export function AdminAnalyticsContent() {
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [ordersData, setOrdersData] = useState<any[]>([]);
  const [customerData, setCustomerData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [subscriptionStats, setSubscriptionStats] = useState<SubscriptionStats>({
    active: 0,
    paused: 0,
    cancelled: 0,
    total: 0,
    pauseRate: 0,
    cancelRate: 0,
    monthlyChurn: 0,
    revenueAtRisk: 0,
  });
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    avgOrderValue: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    customersGrowth: 0,
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch orders for revenue and order trends
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: true });

      // Fetch profiles for customer trends
      const { data: profiles } = await supabase
        .from('profiles')
        .select('created_at')
        .order('created_at', { ascending: true });

      // Fetch order items for top products
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('product_name, quantity, total_price');

      // Fetch subscriptions for analytics
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('status, frequency, created_at, updated_at, variant_id');

      // Fetch product variants for subscription revenue calculation
      const { data: variants } = await supabase
        .from('product_variants')
        .select('id, price');

      if (orders) {
        const now = new Date();
        const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const last60Days = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

        // Daily aggregation
        const dailyData: Record<string, { revenue: number; orders: number; customers: number }> = {};
        
        // Generate last 30 days of dates
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const dateStr = date.toISOString().split('T')[0];
          dailyData[dateStr] = { revenue: 0, orders: 0, customers: 0 };
        }

        // Aggregate orders
        orders.forEach((order) => {
          const date = new Date(order.created_at).toISOString().split('T')[0];
          if (dailyData[date] !== undefined) {
            dailyData[date].revenue += Number(order.total || 0);
            dailyData[date].orders += 1;
          }
        });

        // Aggregate customers
        if (profiles) {
          profiles.forEach((profile) => {
            const date = new Date(profile.created_at).toISOString().split('T')[0];
            if (dailyData[date] !== undefined) {
              dailyData[date].customers += 1;
            }
          });
        }

        // Convert to chart data
        const chartData = Object.entries(dailyData)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, data]) => ({
            date: new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
            fullDate: date,
            revenue: data.revenue,
            orders: data.orders,
            customers: data.customers,
          }));

        setRevenueData(chartData);
        setOrdersData(chartData);
        setCustomerData(chartData);

        // Calculate stats
        const currentPeriodOrders = orders.filter(o => new Date(o.created_at) >= last30Days);
        const previousPeriodOrders = orders.filter(o => 
          new Date(o.created_at) >= last60Days && new Date(o.created_at) < last30Days
        );

        const currentRevenue = currentPeriodOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
        const previousRevenue = previousPeriodOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);

        const currentPeriodCustomers = profiles?.filter(p => new Date(p.created_at) >= last30Days).length || 0;
        const previousPeriodCustomers = profiles?.filter(p => 
          new Date(p.created_at) >= last60Days && new Date(p.created_at) < last30Days
        ).length || 0;

        setStats({
          totalRevenue: currentRevenue,
          totalOrders: currentPeriodOrders.length,
          totalCustomers: currentPeriodCustomers,
          avgOrderValue: currentPeriodOrders.length > 0 ? currentRevenue / currentPeriodOrders.length : 0,
          revenueGrowth: previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0,
          ordersGrowth: previousPeriodOrders.length > 0 
            ? ((currentPeriodOrders.length - previousPeriodOrders.length) / previousPeriodOrders.length) * 100 
            : 0,
          customersGrowth: previousPeriodCustomers > 0 
            ? ((currentPeriodCustomers - previousPeriodCustomers) / previousPeriodCustomers) * 100 
            : 0,
        });

        // Calculate status distribution from real data
        const statusCounts: Record<string, number> = {};
        orders.forEach(order => {
          const status = order.status || 'pending';
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        const totalOrders = orders.length || 1;
        const statusColors: Record<string, string> = {
          delivered: 'hsl(142, 76%, 36%)',
          shipped: 'hsl(221, 83%, 53%)',
          processing: 'hsl(200, 83%, 53%)',
          pending: 'hsl(45, 93%, 47%)',
          cancelled: 'hsl(0, 84%, 60%)',
        };
        const statusLabels: Record<string, string> = {
          delivered: 'Geliefert',
          shipped: 'Versendet',
          processing: 'In Bearbeitung',
          pending: 'Ausstehend',
          cancelled: 'Storniert',
        };

        const statusDataArray = Object.entries(statusCounts).map(([status, count]) => ({
          name: statusLabels[status] || status,
          value: Math.round((count / totalOrders) * 100),
          color: statusColors[status] || 'hsl(0, 0%, 50%)',
        }));

        setStatusData(statusDataArray.length > 0 ? statusDataArray : [
          { name: 'Keine Daten', value: 100, color: 'hsl(0, 0%, 80%)' }
        ]);

        // Calculate top products from real order items
        if (orderItems && orderItems.length > 0) {
          const productStats: Record<string, { sales: number; revenue: number }> = {};
          
          orderItems.forEach(item => {
            const name = item.product_name;
            if (!productStats[name]) {
              productStats[name] = { sales: 0, revenue: 0 };
            }
            productStats[name].sales += item.quantity;
            productStats[name].revenue += Number(item.total_price || 0);
          });

          const sortedProducts = Object.entries(productStats)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

          setTopProducts(sortedProducts);
        } else {
          setTopProducts([]);
        }

        // Calculate subscription stats
        if (subscriptions) {
          const now = new Date();
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          
          const active = subscriptions.filter(s => s.status === 'active').length;
          const paused = subscriptions.filter(s => s.status === 'paused').length;
          const cancelled = subscriptions.filter(s => s.status === 'cancelled').length;
          const total = subscriptions.length;
          
          // Calculate churn in last 30 days
          const cancelledRecently = subscriptions.filter(s => 
            s.status === 'cancelled' && 
            s.updated_at && 
            new Date(s.updated_at) >= thirtyDaysAgo
          ).length;
          
          // Calculate revenue at risk (paused subscriptions)
          let revenueAtRisk = 0;
          if (variants) {
            const variantPrices = new Map(variants.map(v => [v.id, Number(v.price || 0)]));
            subscriptions
              .filter(s => s.status === 'paused' && s.variant_id)
              .forEach(s => {
                revenueAtRisk += variantPrices.get(s.variant_id) || 0;
              });
          }
          
          setSubscriptionStats({
            active,
            paused,
            cancelled,
            total,
            pauseRate: total > 0 ? (paused / total) * 100 : 0,
            cancelRate: total > 0 ? (cancelled / total) * 100 : 0,
            monthlyChurn: (active + paused) > 0 ? (cancelledRecently / (active + paused)) * 100 : 0,
            revenueAtRisk,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-muted animate-pulse" />
          <div className="h-80 bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  const StatCard = ({ 
    title, 
    value, 
    growth, 
    icon: Icon, 
    format = 'number' 
  }: { 
    title: string; 
    value: number; 
    growth: number; 
    icon: any;
    format?: 'currency' | 'number';
  }) => (
    <div className="bg-card border border-border p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs tracking-wider uppercase text-muted-foreground">{title}</p>
          <p className="text-2xl font-display text-foreground">
            {format === 'currency' ? `€${value.toLocaleString('de-DE', { minimumFractionDigits: 2 })}` : value}
          </p>
        </div>
        <div className="w-10 h-10 flex items-center justify-center border border-border">
          <Icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        {growth >= 0 ? (
          <TrendingUp className="w-3 h-3 text-green-500" />
        ) : (
          <TrendingDown className="w-3 h-3 text-red-500" />
        )}
        <span className={`text-xs ${growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
        </span>
        <span className="text-xs text-muted-foreground">vs. Vormonat</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display text-foreground mb-1">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Live-Daten der letzten 30 Tage
          </p>
        </div>
        <Button variant="outline" onClick={fetchAnalytics} disabled={loading}>
          <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Aktualisieren
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Umsatz" 
          value={stats.totalRevenue} 
          growth={stats.revenueGrowth} 
          icon={DollarSign}
          format="currency"
        />
        <StatCard 
          title="Bestellungen" 
          value={stats.totalOrders} 
          growth={stats.ordersGrowth} 
          icon={ShoppingBag}
        />
        <StatCard 
          title="Neukunden" 
          value={stats.totalCustomers} 
          growth={stats.customersGrowth} 
          icon={Users}
        />
        <StatCard 
          title="Ø Bestellwert" 
          value={stats.avgOrderValue} 
          growth={0} 
          icon={Package}
          format="currency"
        />
      </div>

      {/* Subscription Analytics Section */}
      <div className="bg-card border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Repeat className="w-4 h-4" />
              Abo-Statistiken
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Kündigungs- und Pausierungsraten</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-muted/30 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-success" />
              <span className="text-xs text-muted-foreground">Aktiv</span>
            </div>
            <p className="text-2xl font-display">{subscriptionStats.active}</p>
          </div>
          <div className="p-4 bg-muted/30 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Pause className="w-3 h-3 text-warning" />
              <span className="text-xs text-muted-foreground">Pausiert</span>
            </div>
            <p className="text-2xl font-display">{subscriptionStats.paused}</p>
          </div>
          <div className="p-4 bg-muted/30 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-3 h-3 text-destructive" />
              <span className="text-xs text-muted-foreground">Gekündigt</span>
            </div>
            <p className="text-2xl font-display">{subscriptionStats.cancelled}</p>
          </div>
          <div className="p-4 bg-muted/30 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-3 h-3 text-warning" />
              <span className="text-xs text-muted-foreground">Umsatz at risk</span>
            </div>
            <p className="text-2xl font-display">€{subscriptionStats.revenueAtRisk.toFixed(0)}</p>
          </div>
        </div>

        {subscriptionStats.total > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Pausierungsrate</p>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-display">{subscriptionStats.pauseRate.toFixed(1)}%</p>
                <Pause className="w-4 h-4 text-warning mb-1" />
              </div>
              <div className="mt-3 h-1.5 bg-muted overflow-hidden">
                <div 
                  className="h-full bg-warning transition-all duration-500" 
                  style={{ width: `${subscriptionStats.pauseRate}%` }}
                />
              </div>
            </div>
            
            <div className="p-4 border border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Kündigungsrate (gesamt)</p>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-display">{subscriptionStats.cancelRate.toFixed(1)}%</p>
                <XCircle className="w-4 h-4 text-destructive mb-1" />
              </div>
              <div className="mt-3 h-1.5 bg-muted overflow-hidden">
                <div 
                  className="h-full bg-destructive transition-all duration-500" 
                  style={{ width: `${subscriptionStats.cancelRate}%` }}
                />
              </div>
            </div>
            
            <div className="p-4 border border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Monatliche Churn-Rate</p>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-display">{subscriptionStats.monthlyChurn.toFixed(1)}%</p>
                {subscriptionStats.monthlyChurn > 5 ? (
                  <TrendingDown className="w-4 h-4 text-destructive mb-1" />
                ) : (
                  <TrendingUp className="w-4 h-4 text-success mb-1" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Letzte 30 Tage</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Repeat className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Noch keine Abos vorhanden</p>
            <p className="text-sm">Sobald Kunden Abos abschließen, werden hier Statistiken angezeigt</p>
          </div>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-card border border-border p-6">
          <h3 className="text-sm font-medium text-foreground mb-6">Umsatzentwicklung</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(value) => `€${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [`€${value.toFixed(2)}`, 'Umsatz']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Trend */}
        <div className="bg-card border border-border p-6">
          <h3 className="text-sm font-medium text-foreground mb-6">Bestellungen pro Tag</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ordersData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [value, 'Bestellungen']}
                />
                <Bar 
                  dataKey="orders" 
                  fill="hsl(var(--foreground))" 
                  radius={[0, 0, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Growth */}
        <div className="bg-card border border-border p-6">
          <h3 className="text-sm font-medium text-foreground mb-6">Kundenentwicklung</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={customerData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [value, 'Neue Kunden']}
                />
                <Line 
                  type="monotone"
                  dataKey="customers" 
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--accent))', strokeWidth: 0, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution - Now with LIVE data */}
        <div className="bg-card border border-border p-6">
          <h3 className="text-sm font-medium text-foreground mb-6">Bestellstatus-Verteilung (Live)</h3>
          <div className="h-64 flex items-center gap-8">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [`${value}%`, 'Anteil']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 shrink-0">
              {statusData.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-muted-foreground w-24">{item.name}</span>
                  <span className="text-xs font-medium text-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Products - Now with LIVE data */}
      <div className="bg-card border border-border p-6">
        <h3 className="text-sm font-medium text-foreground mb-6">Top Produkte (Live-Daten)</h3>
        {topProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs tracking-wider uppercase text-muted-foreground pb-4">#</th>
                  <th className="text-left text-xs tracking-wider uppercase text-muted-foreground pb-4">Produkt</th>
                  <th className="text-right text-xs tracking-wider uppercase text-muted-foreground pb-4">Verkäufe</th>
                  <th className="text-right text-xs tracking-wider uppercase text-muted-foreground pb-4">Umsatz</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, index) => (
                  <tr key={product.name} className="border-b border-border last:border-0">
                    <td className="py-4 text-sm text-muted-foreground">{index + 1}</td>
                    <td className="py-4 text-sm text-foreground">{product.name}</td>
                    <td className="py-4 text-sm text-muted-foreground text-right">{product.sales}</td>
                    <td className="py-4 text-sm text-foreground text-right">€{product.revenue.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Noch keine Bestellungen vorhanden</p>
            <p className="text-sm">Sobald Bestellungen eingehen, werden hier die Top-Produkte angezeigt</p>
          </div>
        )}
      </div>
    </div>
  );
}
