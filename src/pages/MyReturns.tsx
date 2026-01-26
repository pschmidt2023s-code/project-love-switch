import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  Plus,
  Truck,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { PremiumPageLayout } from '@/components/premium/PremiumPageLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Seo } from '@/components/Seo';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Return {
  id: string;
  order_id: string | null;
  status: string;
  reason: string;
  notes: string | null;
  refund_amount: number | null;
  tracking_number: string | null;
  created_at: string;
  updated_at: string;
  order?: {
    order_number: string;
    total: number;
  } | null;
}

interface Order {
  id: string;
  order_number: string;
  total: number;
  created_at: string;
  status: string;
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function MyReturns() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [returns, setReturns] = useState<Return[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewReturn, setShowNewReturn] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchReturns();
      fetchOrders();
    }
  }, [user]);

  const fetchReturns = async () => {
    try {
      const { data, error } = await supabase
        .from('returns')
        .select(`
          *,
          order:orders(order_number, total)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReturns(data || []);
    } catch (error) {
      console.error('Error fetching returns:', error);
      toast.error('Fehler beim Laden der Retouren');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, total, created_at, status')
        .eq('user_id', user?.id)
        .in('status', ['completed', 'shipped'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId || !reason.trim()) {
      toast.error('Bitte alle Pflichtfelder ausfüllen');
      return;
    }

    setSubmitting(true);
    try {
      const selectedOrder = orders.find(o => o.id === selectedOrderId);

      const { data, error } = await supabase.from('returns').insert({
        order_id: selectedOrderId,
        user_id: user?.id,
        reason: reason.trim(),
        notes: notes.trim() || null,
        status: 'pending'
      }).select().single();

      if (error) throw error;

      // Send notification email
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name, email')
          .eq('id', user?.id)
          .single();

        await supabase.functions.invoke('send-return-notification', {
          body: {
            type: 'new_return',
            returnId: data.id,
            customerEmail: profile?.email || user?.email,
            customerName: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Kunde',
            orderNumber: selectedOrder?.order_number || '',
            reason: reason
          }
        });
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
      }

      toast.success('Retoure erfolgreich eingereicht');
      setShowNewReturn(false);
      setSelectedOrderId('');
      setReason('');
      setNotes('');
      fetchReturns();
    } catch (error) {
      console.error('Error submitting return:', error);
      toast.error('Fehler beim Einreichen der Retoure');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Ausstehend', icon: Clock, color: 'text-warning', bg: 'bg-warning/10' };
      case 'approved':
        return { label: 'Genehmigt', icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' };
      case 'rejected':
        return { label: 'Abgelehnt', icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10' };
      case 'received':
        return { label: 'Ware eingegangen', icon: Package, color: 'text-accent', bg: 'bg-accent/10' };
      case 'refunded':
        return { label: 'Erstattet', icon: RefreshCw, color: 'text-success', bg: 'bg-success/10' };
      case 'completed':
        return { label: 'Abgeschlossen', icon: CheckCircle2, color: 'text-muted-foreground', bg: 'bg-muted' };
      default:
        return { label: status, icon: Package, color: 'text-muted-foreground', bg: 'bg-muted' };
    }
  };

  if (authLoading || loading) {
    return (
      <PremiumPageLayout>
        <div className="container-premium py-16">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-muted" />
            <div className="h-64 bg-muted" />
          </div>
        </div>
      </PremiumPageLayout>
    );
  }

  return (
    <PremiumPageLayout>
      <Seo
        title="Meine Retouren | ALDENAIR"
        description="Verwalte deine Retouren und Rücksendungen"
        canonicalPath="/my-returns"
      />

      <div className="container-premium py-8 lg:py-12">
        <Breadcrumb
          items={[
            { label: 'Konto', path: '/account' },
            { label: 'Meine Retouren' }
          ]}
          className="mb-8"
        />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl lg:text-3xl text-foreground mb-2">
                Meine Retouren
              </h1>
              <p className="text-muted-foreground text-sm">
                Erstelle und verfolge deine Rücksendungen
              </p>
            </div>
            
            <button
              onClick={() => setShowNewReturn(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors"
            >
              <Plus className="w-4 h-4" strokeWidth={1.5} />
              Neue Retoure
            </button>
          </div>

          {/* New Return Form */}
          {showNewReturn && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-card border border-border p-6"
            >
              <h2 className="text-lg font-display text-foreground mb-6">
                Neue Retoure einreichen
              </h2>

              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" strokeWidth={1.5} />
                  <p className="text-muted-foreground">
                    Keine retournierbare Bestellungen gefunden
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReturn} className="space-y-6">
                  <div>
                    <label className="block text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-2">
                      Bestellung auswählen *
                    </label>
                    <select
                      value={selectedOrderId}
                      onChange={(e) => setSelectedOrderId(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border text-foreground focus:outline-none focus:border-accent"
                      required
                    >
                      <option value="">Bestellung wählen...</option>
                      {orders.map((order) => (
                        <option key={order.id} value={order.id}>
                          {order.order_number} - €{Number(order.total).toFixed(2)} - {new Date(order.created_at).toLocaleDateString('de-DE')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-2">
                      Grund für Retoure *
                    </label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border text-foreground focus:outline-none focus:border-accent"
                      required
                    >
                      <option value="">Grund wählen...</option>
                      <option value="Falsche Größe">Falsche Größe</option>
                      <option value="Nicht wie erwartet">Nicht wie erwartet</option>
                      <option value="Beschädigt">Beschädigt</option>
                      <option value="Falsches Produkt">Falsches Produkt</option>
                      <option value="Qualitätsmangel">Qualitätsmangel</option>
                      <option value="Sonstiges">Sonstiges</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-2">
                      Zusätzliche Anmerkungen
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 bg-background border border-border text-foreground focus:outline-none focus:border-accent resize-none"
                      placeholder="Beschreibe das Problem genauer..."
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setShowNewReturn(false)}
                      className="px-6 py-3 border border-border text-foreground text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-muted transition-colors"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-3 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50"
                    >
                      {submitting ? 'Wird eingereicht...' : 'Retoure einreichen'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          )}

          {/* Returns List */}
          {returns.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" strokeWidth={1} />
              <h2 className="text-xl font-display text-foreground mb-2">
                Keine Retouren
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                Du hast noch keine Retouren eingereicht
              </p>
              <Link
                to="/orders"
                className="inline-flex items-center gap-2 text-accent hover:underline text-sm"
              >
                <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                Zu meinen Bestellungen
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {returns.map((ret) => {
                const status = getStatusInfo(ret.status);
                const StatusIcon = status.icon;
                
                return (
                  <motion.div
                    key={ret.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border p-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 ${status.bg}`}>
                            <StatusIcon className={`w-5 h-5 ${status.color}`} strokeWidth={1.5} />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              Retoure #{ret.id.slice(0, 8).toUpperCase()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {ret.order?.order_number || 'Bestellung nicht gefunden'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="pl-12 space-y-2">
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">Grund:</span> {ret.reason}
                          </p>
                          {ret.notes && (
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">Anmerkungen:</span> {ret.notes}
                            </p>
                          )}
                          {ret.tracking_number && (
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <Truck className="w-4 h-4" strokeWidth={1.5} />
                              Sendungsnummer: {ret.tracking_number}
                            </p>
                          )}
                          {ret.refund_amount && ret.status === 'refunded' && (
                            <p className="text-sm text-success font-medium">
                              Erstattet: €{Number(ret.refund_amount).toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 text-[10px] tracking-[0.1em] uppercase font-medium ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {new Date(ret.created_at).toLocaleDateString('de-DE', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </PremiumPageLayout>
  );
}
