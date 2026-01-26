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
import { TrendingUp, TrendingDown, Users, ShoppingBag, DollarSign, Package } from 'lucide-react';

export function AdminAnalyticsContent() {
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [ordersData, setOrdersData] = useState<any[]>([]);
  const [customerData, setCustomerData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusData = [
    { name: 'Abgeschlossen', value: 45, color: 'hsl(142, 76%, 36%)' },
    { name: 'Versendet', value: 25, color: 'hsl(221, 83%, 53%)' },
    { name: 'Ausstehend', value: 20, color: 'hsl(45, 93%, 47%)' },
    { name: 'Storniert', value: 10, color: 'hsl(0, 84%, 60%)' },
  ];

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
      <div>
        <h1 className="text-2xl font-display text-foreground mb-1">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Umsatz-, Bestell- und Kundenstatistiken der letzten 30 Tage
        </p>
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

        {/* Status Distribution */}
        <div className="bg-card border border-border p-6">
          <h3 className="text-sm font-medium text-foreground mb-6">Bestellstatus-Verteilung</h3>
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

      {/* Top Products */}
      <div className="bg-card border border-border p-6">
        <h3 className="text-sm font-medium text-foreground mb-6">Top Produkte (letzte 30 Tage)</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs tracking-wider uppercase text-muted-foreground pb-4">#</th>
                <th className="text-left text-xs tracking-wider uppercase text-muted-foreground pb-4">Produkt</th>
                <th className="text-right text-xs tracking-wider uppercase text-muted-foreground pb-4">Verkäufe</th>
                <th className="text-right text-xs tracking-wider uppercase text-muted-foreground pb-4">Umsatz</th>
                <th className="text-right text-xs tracking-wider uppercase text-muted-foreground pb-4">Trend</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'ALDENAIR 632', sales: 156, revenue: 4680, trend: 12 },
                { name: 'ALDENAIR 888', sales: 134, revenue: 4020, trend: 8 },
                { name: 'ALDENAIR 111', sales: 98, revenue: 2940, trend: -3 },
                { name: 'ALDENAIR Prestige', sales: 67, revenue: 2010, trend: 24 },
                { name: 'Sparsets 3er', sales: 45, revenue: 1890, trend: 15 },
              ].map((product, index) => (
                <tr key={product.name} className="border-b border-border last:border-0">
                  <td className="py-4 text-sm text-muted-foreground">{index + 1}</td>
                  <td className="py-4 text-sm text-foreground">{product.name}</td>
                  <td className="py-4 text-sm text-muted-foreground text-right">{product.sales}</td>
                  <td className="py-4 text-sm text-foreground text-right">€{product.revenue.toLocaleString('de-DE')}</td>
                  <td className="py-4 text-right">
                    <span className={`inline-flex items-center gap-1 text-xs ${product.trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {product.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {product.trend >= 0 ? '+' : ''}{product.trend}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
