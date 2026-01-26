import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Search, Filter, MoreHorizontal, Eye, Truck, CheckCircle, XCircle } from 'lucide-react';

export function AdminOrdersContent() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Fehler beim Laden der Bestellungen');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      toast.success('Status aktualisiert');
      fetchOrders();
    } catch (error) {
      toast.error('Fehler beim Aktualisieren');
    }
  };

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

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.order_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-64 bg-muted animate-pulse" />
        <div className="bg-card border border-border">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 border-b border-border animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display text-foreground mb-1">Bestellungen</h1>
          <p className="text-sm text-muted-foreground">
            {orders.length} Bestellungen insgesamt
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Bestellnummer suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border text-sm focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-card border border-border text-sm focus:outline-none focus:border-accent transition-colors"
        >
          <option value="all">Alle Status</option>
          <option value="pending">Ausstehend</option>
          <option value="processing">In Bearbeitung</option>
          <option value="shipped">Versendet</option>
          <option value="delivered">Geliefert</option>
          <option value="completed">Abgeschlossen</option>
          <option value="cancelled">Storniert</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Bestellnummer</th>
                <th>Artikel</th>
                <th>Status</th>
                <th>Zahlung</th>
                <th>Betrag</th>
                <th>Datum</th>
                <th className="text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted-foreground py-12">
                    Keine Bestellungen gefunden
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-medium text-foreground">
                      {order.order_number}
                    </td>
                    <td className="text-muted-foreground">
                      {order.order_items?.length || 0} Artikel
                    </td>
                    <td>
                      <span className={`badge-status ${getStatusColor(order.status)}`}>
                        {formatStatus(order.status)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-status ${order.payment_status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                        {order.payment_status === 'paid' ? 'Bezahlt' : 'Ausstehend'}
                      </span>
                    </td>
                    <td className="font-medium">
                      €{Number(order.total).toFixed(2)}
                    </td>
                    <td className="text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('de-DE')}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => updateOrderStatus(order.id, 'shipped')}
                          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          title="Als versendet markieren"
                        >
                          <Truck className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'completed')}
                          className="p-2 text-muted-foreground hover:text-success hover:bg-muted transition-colors"
                          title="Abschließen"
                        >
                          <CheckCircle className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                          title="Stornieren"
                        >
                          <XCircle className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      </div>
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
