import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, TrendingUp, Users, ShoppingCart, DollarSign } from 'lucide-react';

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  topProducts: Array<{ name: string; count: number }>;
  recentDays: Array<{ date: string; revenue: number; orders: number }>;
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    topProducts: [],
    recentDays: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [ordersRes, profilesRes] = await Promise.all([
        supabase.from('orders').select('*'),
        supabase.from('profiles').select('id'),
      ]);

      const orders = ordersRes.data || [];
      const profiles = profilesRes.data || [];

      const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
      const totalOrders = orders.length;
      const totalCustomers = profiles.length;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Generate last 7 days data
      const recentDays = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayOrders = orders.filter(o => 
          o.created_at.startsWith(dateStr)
        );
        
        recentDays.push({
          date: date.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric' }),
          revenue: dayOrders.reduce((sum, o) => sum + Number(o.total || 0), 0),
          orders: dayOrders.length,
        });
      }

      setData({
        totalRevenue,
        totalOrders,
        totalCustomers,
        averageOrderValue,
        topProducts: [],
        recentDays,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8">Laden...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Analytics</h2>
        <p className="text-muted-foreground">Übersicht über Ihre Shop-Performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <DollarSign className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">€{data.totalRevenue.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Gesamtumsatz</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <ShoppingCart className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{data.totalOrders}</p>
                <p className="text-sm text-muted-foreground">Bestellungen</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{data.totalCustomers}</p>
                <p className="text-sm text-muted-foreground">Kunden</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <TrendingUp className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">€{data.averageOrderValue.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Ø Bestellwert</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Letzte 7 Tage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentDays.map((day, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-24 text-sm text-muted-foreground">{day.date}</div>
                <div className="flex-1 h-8 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${Math.max(5, (day.revenue / Math.max(...data.recentDays.map(d => d.revenue), 1)) * 100)}%`,
                    }}
                  />
                </div>
                <div className="w-24 text-right">
                  <span className="font-semibold">€{day.revenue.toFixed(2)}</span>
                  <span className="text-xs text-muted-foreground ml-1">({day.orders})</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
