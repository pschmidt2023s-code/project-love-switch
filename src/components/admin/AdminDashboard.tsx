import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Euro,
  Clock,
} from 'lucide-react';

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  recentOrders: Array<{
    id: string;
    order_number: string;
    total: number;
    status: string;
    created_at: string;
  }>;
  topProducts: Array<{
    name: string;
    count: number;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    recentOrders: [],
    topProducts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [productsRes, ordersRes, profilesRes] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('id'),
      ]);

      const products = productsRes.data || [];
      const orders = ordersRes.data || [];
      const profiles = profilesRes.data || [];

      setStats({
        totalProducts: products.length,
        activeProducts: products.filter((p) => p.is_active).length,
        totalOrders: orders.length,
        pendingOrders: orders.filter((o) => o.status === 'pending').length,
        totalRevenue: orders.reduce((sum, o) => sum + Number(o.total || 0), 0),
        totalCustomers: profiles.length,
        recentOrders: orders.slice(0, 5),
        topProducts: [],
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      processing: 'default',
      shipped: 'default',
      delivered: 'default',
      cancelled: 'destructive',
    };

    const labels: Record<string, string> = {
      pending: 'Ausstehend',
      processing: 'In Bearbeitung',
      shipped: 'Versendet',
      delivered: 'Geliefert',
      cancelled: 'Storniert',
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Umsatz',
      value: `€${stats.totalRevenue.toFixed(2)}`,
      icon: Euro,
      trend: '+12.5%',
      trendUp: true,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Bestellungen',
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      subtitle: `${stats.pendingOrders} ausstehend`,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Kunden',
      value: stats.totalCustomers.toString(),
      icon: Users,
      trend: '+8.2%',
      trendUp: true,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Produkte',
      value: stats.totalProducts.toString(),
      icon: Package,
      subtitle: `${stats.activeProducts} aktiv`,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Übersicht über Ihren Shop</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover-lift">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  {stat.trend && (
                    <div className="flex items-center gap-1 text-sm">
                      {stat.trendUp ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                      )}
                      <span className={stat.trendUp ? 'text-green-500' : 'text-red-500'}>
                        {stat.trend}
                      </span>
                      <span className="text-muted-foreground">vs letzte Woche</span>
                    </div>
                  )}
                  {stat.subtitle && (
                    <p className="text-sm text-muted-foreground">{stat.subtitle}</p>
                  )}
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Letzte Bestellungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Noch keine Bestellungen vorhanden
            </p>
          ) : (
            <div className="space-y-4">
              {stats.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(order.status || 'pending')}
                    <p className="font-semibold">€{Number(order.total).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
