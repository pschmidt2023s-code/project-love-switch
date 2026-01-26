import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Search, Truck, CheckCircle, XCircle, RefreshCw, ChevronDown } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export function AdminOrdersContent() {
  const isMobile = useIsMobile();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const fetchOrders = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    
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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('admin-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      toast.success('Status aktualisiert');
    } catch (error) {
      toast.error('Fehler beim Aktualisieren');
    }
  };

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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return 'bg-success/10 text-success';
      case 'pending':
        return 'bg-warning/10 text-warning';
      case 'failed':
        return 'bg-destructive/10 text-destructive';
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

  const formatPaymentStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'Ausstehend',
      paid: 'Bezahlt',
      completed: 'Bezahlt',
      failed: 'Fehlgeschlagen',
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
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-display text-foreground mb-1">Bestellungen</h1>
          <p className="text-xs lg:text-sm text-muted-foreground">
            {orders.length} Bestellungen insgesamt
          </p>
        </div>
        <button
          onClick={() => fetchOrders(true)}
          disabled={refreshing}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          title="Aktualisieren"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} strokeWidth={1.5} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
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
          className="px-4 py-2.5 bg-card border border-border text-sm focus:outline-none focus:border-accent transition-colors min-w-[140px]"
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

      {/* Orders */}
      <div className="bg-card border border-border">
        {isMobile ? (
          /* Mobile Card View */
          <div className="divide-y divide-border">
            {filteredOrders.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                Keine Bestellungen gefunden
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div key={order.id} className="p-4">
                  {/* Header */}
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  >
                    <div>
                      <p className="font-medium text-foreground text-sm">{order.order_number}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(order.created_at).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">€{Number(order.total).toFixed(2)}</span>
                      <ChevronDown 
                        className={`w-4 h-4 text-muted-foreground transition-transform ${
                          expandedOrder === order.id ? 'rotate-180' : ''
                        }`} 
                        strokeWidth={1.5} 
                      />
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center gap-2 mt-3">
                    <span className={`text-[10px] px-2 py-1 ${getStatusColor(order.status)}`}>
                      {formatStatus(order.status)}
                    </span>
                    <span className={`text-[10px] px-2 py-1 ${getPaymentStatusColor(order.payment_status)}`}>
                      {formatPaymentStatus(order.payment_status)}
                    </span>
                  </div>

                  {/* Expanded Content */}
                  {expandedOrder === order.id && (
                    <div className="mt-4 pt-4 border-t border-border space-y-3">
                      <div className="text-xs text-muted-foreground">
                        {order.order_items?.length || 0} Artikel
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateOrderStatus(order.id, 'shipped');
                          }}
                          className="flex-1 flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted border border-border transition-colors"
                        >
                          <Truck className="w-3.5 h-3.5" strokeWidth={1.5} />
                          Versendet
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateOrderStatus(order.id, 'completed');
                          }}
                          className="flex-1 flex items-center justify-center gap-2 py-2 text-xs text-success hover:bg-success/10 border border-border transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                          Abschließen
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateOrderStatus(order.id, 'cancelled');
                          }}
                          className="p-2 text-destructive hover:bg-destructive/10 border border-border transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  )}
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
                    Artikel
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">
                    Zahlung
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">
                    Betrag
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">
                    Datum
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-muted-foreground py-12">
                      Keine Bestellungen gefunden
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                      <td className="p-4 font-medium text-foreground">
                        {order.order_number}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {order.order_items?.length || 0} Artikel
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 ${getStatusColor(order.status)}`}>
                          {formatStatus(order.status)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 ${getPaymentStatusColor(order.payment_status)}`}>
                          {formatPaymentStatus(order.payment_status)}
                        </span>
                      </td>
                      <td className="p-4 font-medium">
                        €{Number(order.total).toFixed(2)}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('de-DE')}
                      </td>
                      <td className="p-4">
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
        )}
      </div>
    </div>
  );
}
