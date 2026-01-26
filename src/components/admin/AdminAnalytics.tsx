import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import {
  BarChart3,
  TrendingUp,
  ShoppingCart,
  Users,
  DollarSign,
  Calendar,
  Package,
} from 'lucide-react';

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  revenueByDay: Array<{ date: string; revenue: number; orders: number }>;
  ordersByStatus: Record<string, number>;
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    revenueByDay: [],
    ordersByStatus: {},
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7days');

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    try {
      const daysBack = period === '7days' ? 7 : period === '30days' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      const [ordersRes, profilesRes] = await Promise.all([
        supabase.from('orders').select('*'),
        supabase.from('profiles').select('id'),
      ]);

      const orders = ordersRes.data || [];
      const profiles = profilesRes.data || [];

      const filteredOrders = orders.filter(
        (o) => new Date(o.created_at) >= startDate
      );

      const totalRevenue = filteredOrders.reduce(
        (sum, o) => sum + Number(o.total || 0),
        0
      );
      const totalOrders = filteredOrders.length;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Revenue by day
      const revenueByDay: Array<{ date: string; revenue: number; orders: number }> = [];
      for (let i = daysBack - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const dayOrders = orders.filter((o) =>
          o.created_at.startsWith(dateStr)
        );

        revenueByDay.push({
          date: date.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric' }),
          revenue: dayOrders.reduce((sum, o) => sum + Number(o.total || 0), 0),
          orders: dayOrders.length,
        });
      }

      // Orders by status
      const ordersByStatus: Record<string, number> = {};
      orders.forEach((o) => {
        const status = o.status || 'pending';
        ordersByStatus[status] = (ordersByStatus[status] || 0) + 1;
      });

      setData({
        totalRevenue,
        totalOrders,
        totalCustomers: profiles.length,
        averageOrderValue,
        revenueByDay,
        ordersByStatus,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const maxRevenue = Math.max(...data.revenueByDay.map((d) => d.revenue), 1);

  if (loading) {
    return <div className="flex justify-center py-8">Laden...</div>;
  }

  const statusLabels: Record<string, string> = {
    pending: 'Ausstehend',
    processing: 'In Bearbeitung',
    shipped: 'Versendet',
    delivered: 'Geliefert',
    cancelled: 'Storniert',
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500',
    processing: 'bg-blue-500',
    shipped: 'bg-purple-500',
    delivered: 'bg-success',
    cancelled: 'bg-destructive',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Analytics</h2>
          <p className="text-muted-foreground">Übersicht über Ihre Shop-Performance</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Letzte 7 Tage</SelectItem>
            <SelectItem value="30days">Letzte 30 Tage</SelectItem>
            <SelectItem value="90days">Letzte 90 Tage</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover-lift">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10">
                <DollarSign className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">€{data.totalRevenue.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Gesamtumsatz</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-lift">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <ShoppingCart className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.totalOrders}</p>
                <p className="text-sm text-muted-foreground">Bestellungen</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-lift">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-accent/10">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.totalCustomers}</p>
                <p className="text-sm text-muted-foreground">Kunden</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-lift">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-secondary">
                <TrendingUp className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">€{data.averageOrderValue.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Ø Bestellwert</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Umsatz pro Tag
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.revenueByDay.slice(-14).map((day, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-16 text-sm text-muted-foreground">{day.date}</div>
                  <div className="flex-1 h-8 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{
                        width: `${Math.max(5, (day.revenue / maxRevenue) * 100)}%`,
                      }}
                    />
                  </div>
                  <div className="w-24 text-right">
                    <span className="font-semibold">€{day.revenue.toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground ml-1">
                      ({day.orders})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Bestellungen nach Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(data.ordersByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${statusColors[status] || 'bg-muted'}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {statusLabels[status] || status}
                    </p>
                  </div>
                  <p className="font-semibold">{count}</p>
                </div>
              ))}
              {Object.keys(data.ordersByStatus).length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  Keine Bestellungen vorhanden
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
