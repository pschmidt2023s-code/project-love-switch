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
  Cell
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';

export function AdminAnalyticsContent() {
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [ordersData, setOrdersData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: true });

      if (orders) {
        // Group by day for the last 30 days
        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);

        const dailyData: Record<string, { revenue: number; orders: number }> = {};
        
        orders.forEach((order) => {
          const date = new Date(order.created_at).toISOString().split('T')[0];
          if (!dailyData[date]) {
            dailyData[date] = { revenue: 0, orders: 0 };
          }
          dailyData[date].revenue += Number(order.total || 0);
          dailyData[date].orders += 1;
        });

        const chartData = Object.entries(dailyData)
          .map(([date, data]) => ({
            date: new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
            revenue: data.revenue,
            orders: data.orders,
          }))
          .slice(-30);

        setRevenueData(chartData);
        setOrdersData(chartData);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusData = [
    { name: 'Abgeschlossen', value: 45, color: 'hsl(var(--success))' },
    { name: 'Versendet', value: 25, color: 'hsl(var(--info))' },
    { name: 'Ausstehend', value: 20, color: 'hsl(var(--warning))' },
    { name: 'Storniert', value: 10, color: 'hsl(var(--destructive))' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-muted animate-pulse" />
          <div className="h-80 bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display text-foreground mb-1">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Umsatz- und Bestellstatistiken der letzten 30 Tage
        </p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-card border border-border p-6">
          <h3 className="text-sm font-medium text-foreground mb-6">Umsatz</h3>
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

        {/* Orders Chart */}
        <div className="bg-card border border-border p-6">
          <h3 className="text-sm font-medium text-foreground mb-6">Bestellungen</h3>
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

        {/* Status Distribution */}
        <div className="bg-card border border-border p-6">
          <h3 className="text-sm font-medium text-foreground mb-6">Bestellstatus</h3>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
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
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {statusData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                  <span className="text-xs font-medium text-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-card border border-border p-6">
          <h3 className="text-sm font-medium text-foreground mb-6">Top Produkte</h3>
          <div className="space-y-4">
            {[
              { name: 'ALDENAIR 632', sales: 156, revenue: '€4,680' },
              { name: 'ALDENAIR 888', sales: 134, revenue: '€4,020' },
              { name: 'ALDENAIR 111', sales: 98, revenue: '€2,940' },
              { name: 'ALDENAIR Prestige', sales: 67, revenue: '€2,010' },
            ].map((product, index) => (
              <div key={product.name} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-4">{index + 1}</span>
                  <span className="text-sm text-foreground">{product.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground">{product.sales} verkauft</span>
                  <span className="text-sm font-medium text-foreground">{product.revenue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
