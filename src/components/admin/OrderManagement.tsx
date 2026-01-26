import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Search,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Filter,
  Plus,
  RefreshCcw,
  AlertTriangle,
  Edit,
  RotateCcw,
} from 'lucide-react';

interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  total: number;
  status: string;
  payment_status: string;
  payment_method: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  variant_size: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Product {
  id: string;
  name: string;
}

interface Variant {
  id: string;
  product_id: string;
  size: string;
  price: number;
}

const statusOptions = [
  { value: 'pending', label: 'Ausstehend', icon: Clock, color: 'bg-yellow-500', priority: 1 },
  { value: 'processing', label: 'In Bearbeitung', icon: Package, color: 'bg-blue-500', priority: 2 },
  { value: 'shipped', label: 'Versendet', icon: Truck, color: 'bg-purple-500', priority: 3 },
  { value: 'delivered', label: 'Geliefert', icon: CheckCircle, color: 'bg-green-500', priority: 4 },
  { value: 'cancelled', label: 'Storniert', icon: XCircle, color: 'bg-red-500', priority: 5 },
];

const paymentStatusOptions = [
  { value: 'pending', label: 'Ausstehend' },
  { value: 'paid', label: 'Bezahlt' },
  { value: 'failed', label: 'Fehlgeschlagen' },
  { value: 'refunded', label: 'Erstattet' },
];

export default function OrderManagement() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [newOrderItems, setNewOrderItems] = useState<{ variantId: string; quantity: number }[]>([]);
  const [newOrderNotes, setNewOrderNotes] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  useEffect(() => {
    loadOrders();
    loadProducts();
  }, []);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const { data: productsData } = await supabase.from('products').select('id, name').eq('is_active', true);
      const { data: variantsData } = await supabase.from('product_variants').select('id, product_id, size, price');
      setProducts(productsData || []);
      setVariants(variantsData || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadOrderItems = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (error) throw error;
      setOrderItems(data || []);
    } catch (error) {
      console.error('Error loading order items:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;
      toast({ title: 'Erfolg', description: 'Bestellstatus aktualisiert' });
      loadOrders();
    } catch (error) {
      toast({ title: 'Fehler', description: 'Status konnte nicht geändert werden', variant: 'destructive' });
    }
  };

  const updatePaymentStatus = async (orderId: string, paymentStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: paymentStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;
      toast({ title: 'Erfolg', description: 'Zahlungsstatus aktualisiert' });
      loadOrders();
    } catch (error) {
      toast({ title: 'Fehler', description: 'Status konnte nicht geändert werden', variant: 'destructive' });
    }
  };

  const cancelOrder = async (orderId: string) => {
    if (!confirm('Bestellung wirklich stornieren?')) return;
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled', 
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId);

      if (error) throw error;
      toast({ title: 'Erfolg', description: 'Bestellung storniert' });
      loadOrders();
      setDetailsOpen(false);
    } catch (error) {
      toast({ title: 'Fehler', description: 'Stornierung fehlgeschlagen', variant: 'destructive' });
    }
  };

  const processRefund = async () => {
    if (!selectedOrder || !refundAmount) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          payment_status: 'refunded',
          notes: selectedOrder.notes 
            ? `${selectedOrder.notes}\n\nRückerstattung: €${refundAmount} - ${refundReason}`
            : `Rückerstattung: €${refundAmount} - ${refundReason}`,
          updated_at: new Date().toISOString() 
        })
        .eq('id', selectedOrder.id);

      if (error) throw error;
      toast({ title: 'Erfolg', description: `Rückerstattung von €${refundAmount} verarbeitet` });
      setRefundDialogOpen(false);
      setRefundAmount('');
      setRefundReason('');
      loadOrders();
    } catch (error) {
      toast({ title: 'Fehler', description: 'Rückerstattung fehlgeschlagen', variant: 'destructive' });
    }
  };

  const createOrder = async () => {
    if (newOrderItems.length === 0) {
      toast({ title: 'Fehler', description: 'Bitte fügen Sie mindestens ein Produkt hinzu', variant: 'destructive' });
      return;
    }

    try {
      // Calculate totals
      let subtotal = 0;
      const itemsToInsert = newOrderItems.map(item => {
        const variant = variants.find(v => v.id === item.variantId);
        const product = products.find(p => p.id === variant?.product_id);
        const itemTotal = (variant?.price || 0) * item.quantity;
        subtotal += itemTotal;
        
        return {
          variant_id: item.variantId,
          product_name: product?.name || 'Unbekannt',
          variant_size: variant?.size || '',
          quantity: item.quantity,
          unit_price: variant?.price || 0,
          total_price: itemTotal,
        };
      });

      const shippingCost = subtotal >= 50 ? 0 : 4.99;
      const total = subtotal + shippingCost;

      // Generate order number
      const orderNumber = `ALN-${Date.now().toString(36).toUpperCase()}`;

      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          subtotal,
          shipping_cost: shippingCost,
          discount: 0,
          total,
          status: 'pending',
          payment_status: 'pending',
          payment_method: 'manual',
          notes: newOrderNotes || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItemsToInsert = itemsToInsert.map(item => ({
        ...item,
        order_id: orderData.id,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

      if (itemsError) throw itemsError;

      toast({ title: 'Erfolg', description: `Bestellung ${orderNumber} erstellt` });
      setCreateDialogOpen(false);
      setNewOrderItems([]);
      setNewOrderNotes('');
      loadOrders();
    } catch (error) {
      console.error('Error creating order:', error);
      toast({ title: 'Fehler', description: 'Bestellung konnte nicht erstellt werden', variant: 'destructive' });
    }
  };

  const openOrderDetails = async (order: Order) => {
    setSelectedOrder(order);
    await loadOrderItems(order.id);
    setDetailsOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = statusOptions.find((s) => s.value === status);
    if (!statusConfig) return <Badge variant="outline">{status}</Badge>;

    return (
      <Badge className={`${statusConfig.color} text-white`}>
        <statusConfig.icon className="w-3 h-3 mr-1" />
        {statusConfig.label}
      </Badge>
    );
  };

  const getPaymentBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500',
      paid: 'bg-green-500',
      failed: 'bg-red-500',
      refunded: 'bg-gray-500',
    };
    const labels: Record<string, string> = {
      pending: 'Ausstehend',
      paid: 'Bezahlt',
      failed: 'Fehlgeschlagen',
      refunded: 'Erstattet',
    };

    return (
      <Badge className={`${colors[status] || 'bg-gray-500'} text-white`}>
        {labels[status] || status}
      </Badge>
    );
  };

  // Sort by priority (pending/processing first)
  const sortedOrders = [...orders].sort((a, b) => {
    const priorityA = statusOptions.find(s => s.value === a.status)?.priority || 99;
    const priorityB = statusOptions.find(s => s.value === b.status)?.priority || 99;
    if (priorityA !== priorityB) return priorityA - priorityB;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const filteredOrders = sortedOrders.filter((order) => {
    const matchesSearch = order.order_number.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const orderStats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    processing: orders.filter((o) => o.status === 'processing').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
  };

  const addOrderItem = () => {
    setNewOrderItems([...newOrderItems, { variantId: '', quantity: 1 }]);
  };

  const updateOrderItem = (index: number, field: 'variantId' | 'quantity', value: string | number) => {
    const updated = [...newOrderItems];
    updated[index] = { ...updated[index], [field]: value };
    setNewOrderItems(updated);
  };

  const removeOrderItem = (index: number) => {
    setNewOrderItems(newOrderItems.filter((_, i) => i !== index));
  };

  if (loading) {
    return <div className="flex justify-center py-8">Laden...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Bestellungen</h2>
          <p className="text-muted-foreground">{orders.length} Bestellungen insgesamt</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Neue Bestellung
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Neue Bestellung erstellen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Produkte</Label>
                {newOrderItems.map((item, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Select
                        value={item.variantId}
                        onValueChange={(v) => updateOrderItem(index, 'variantId', v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Produkt wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          {variants.map((variant) => {
                            const product = products.find(p => p.id === variant.product_id);
                            return (
                              <SelectItem key={variant.id} value={variant.id}>
                                {product?.name} - {variant.size} (€{variant.price.toFixed(2)})
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <Input
                      type="number"
                      min="1"
                      className="w-20"
                      value={item.quantity}
                      onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeOrderItem(index)}>
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addOrderItem}>
                  <Plus className="w-4 h-4 mr-2" /> Produkt hinzufügen
                </Button>
              </div>

              <div>
                <Label>Notizen</Label>
                <Textarea
                  value={newOrderNotes}
                  onChange={(e) => setNewOrderNotes(e.target.value)}
                  placeholder="Interne Notizen zur Bestellung..."
                />
              </div>

              <Button onClick={createOrder} className="w-full">
                Bestellung erstellen
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats with priority highlight */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Gesamt', value: orderStats.total, color: 'text-foreground', bgColor: '' },
          { label: 'Ausstehend', value: orderStats.pending, color: 'text-yellow-500', bgColor: orderStats.pending > 0 ? 'ring-2 ring-yellow-500' : '' },
          { label: 'In Bearbeitung', value: orderStats.processing, color: 'text-blue-500', bgColor: orderStats.processing > 0 ? 'ring-2 ring-blue-500' : '' },
          { label: 'Versendet', value: orderStats.shipped, color: 'text-purple-500', bgColor: '' },
          { label: 'Geliefert', value: orderStats.delivered, color: 'text-green-500', bgColor: '' },
        ].map((stat, i) => (
          <Card key={i} className={stat.bgColor}>
            <CardContent className="pt-4 pb-4">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Bestellnummer suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status filtern" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bestellnummer</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Betrag</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Zahlung</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow 
                  key={order.id}
                  className={order.status === 'pending' ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''}
                >
                  <TableCell className="font-mono font-medium">
                    {order.order_number}
                  </TableCell>
                  <TableCell>
                    {new Date(order.created_at).toLocaleDateString('de-DE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="font-semibold">
                    €{Number(order.total).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.status || 'pending'}
                      onValueChange={(value) => updateOrderStatus(order.id, value)}
                    >
                      <SelectTrigger className="w-[160px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            <div className="flex items-center gap-2">
                              <status.icon className="w-4 h-4" />
                              {status.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.payment_status || 'pending'}
                      onValueChange={(value) => updatePaymentStatus(order.id, value)}
                    >
                      <SelectTrigger className="w-[140px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentStatusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openOrderDetails(order)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bestellung {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Bestelldatum</p>
                  <p className="font-medium">
                    {new Date(selectedOrder.created_at).toLocaleDateString('de-DE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Zahlungsmethode</p>
                  <p className="font-medium capitalize">{selectedOrder.payment_method || 'Nicht angegeben'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(selectedOrder.status || 'pending')}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Zahlungsstatus</p>
                  {getPaymentBadge(selectedOrder.payment_status || 'pending')}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">Bestellpositionen</h4>
                <div className="space-y-2">
                  {orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.variant_size} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">€{Number(item.total_price).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Zwischensumme</span>
                  <span>€{Number(selectedOrder.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Versand</span>
                  <span>€{Number(selectedOrder.shipping_cost || 0).toFixed(2)}</span>
                </div>
                {Number(selectedOrder.discount) > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Rabatt</span>
                    <span>-€{Number(selectedOrder.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Gesamt</span>
                  <span>€{Number(selectedOrder.total).toFixed(2)}</span>
                </div>
              </div>

              {selectedOrder.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Notizen</p>
                    <p className="mt-1 whitespace-pre-wrap">{selectedOrder.notes}</p>
                  </div>
                </>
              )}

              <Separator />

              {/* Action Buttons */}
              <div className="flex gap-2 flex-wrap">
                {selectedOrder.status !== 'cancelled' && (
                  <Button 
                    variant="destructive" 
                    onClick={() => cancelOrder(selectedOrder.id)}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Stornieren
                  </Button>
                )}
                {selectedOrder.payment_status === 'paid' && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setRefundAmount(selectedOrder.total.toString());
                      setRefundDialogOpen(true);
                    }}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Rückerstattung
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rückerstattung verarbeiten</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Betrag (€)</Label>
              <Input
                type="number"
                step="0.01"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
              />
            </div>
            <div>
              <Label>Grund</Label>
              <Textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Grund für die Rückerstattung..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={processRefund}>
              Rückerstattung verarbeiten
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
