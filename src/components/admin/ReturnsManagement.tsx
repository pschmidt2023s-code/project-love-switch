import { useState, useEffect } from 'react';
import { 
  RotateCcw, 
  Package, 
  Check, 
  X, 
  Clock, 
  Euro,
  Search,
  ChevronDown,
  ChevronUp,
  Truck
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

interface Return {
  id: string;
  order_id: string | null;
  user_id: string | null;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'received' | 'refunded';
  refund_amount: number;
  notes: string | null;
  tracking_number: string | null;
  created_at: string;
  updated_at: string;
}

export function ReturnsManagement() {
  const [returns, setReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'received' | 'refunded'>('all');
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchReturns();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('returns-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'returns' },
        () => fetchReturns()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchReturns = async () => {
    try {
      const { data, error } = await supabase
        .from('returns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReturns((data as Return[]) || []);
    } catch (error) {
      console.error('Error fetching returns:', error);
      toast.error('Fehler beim Laden der Retouren');
    } finally {
      setLoading(false);
    }
  };

  const updateReturnStatus = async (id: string, status: Return['status'], refundAmount?: number) => {
    try {
      const updateData: Partial<Return> = { status };
      if (refundAmount !== undefined) {
        updateData.refund_amount = refundAmount;
      }

      const { error } = await supabase
        .from('returns')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setReturns(prev =>
        prev.map(r => (r.id === id ? { ...r, ...updateData } : r))
      );

      toast.success(`Retoure ${status === 'approved' ? 'genehmigt' : status === 'rejected' ? 'abgelehnt' : status === 'received' ? 'erhalten' : 'erstattet'}`);
    } catch (error) {
      console.error('Error updating return:', error);
      toast.error('Fehler beim Aktualisieren');
    }
  };

  const getStatusInfo = (status: Return['status']) => {
    switch (status) {
      case 'pending':
        return { label: 'Ausstehend', class: 'badge-warning', icon: Clock };
      case 'approved':
        return { label: 'Genehmigt', class: 'badge-info', icon: Check };
      case 'rejected':
        return { label: 'Abgelehnt', class: 'badge-error', icon: X };
      case 'received':
        return { label: 'Erhalten', class: 'badge-success', icon: Package };
      case 'refunded':
        return { label: 'Erstattet', class: 'badge-success', icon: Euro };
      default:
        return { label: status, class: 'badge-neutral', icon: Package };
    }
  };

  const filteredReturns = returns.filter(r => {
    const matchesSearch = r.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || r.status === filter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: returns.length,
    pending: returns.filter(r => r.status === 'pending').length,
    approved: returns.filter(r => r.status === 'approved').length,
    refunded: returns.filter(r => r.status === 'refunded').length,
    totalRefunded: returns.filter(r => r.status === 'refunded').reduce((sum, r) => sum + (r.refund_amount || 0), 0),
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card border border-border p-6 animate-pulse">
              <div className="h-4 w-20 bg-muted mb-3" />
              <div className="h-8 w-16 bg-muted" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display text-foreground mb-1">Retouren</h1>
          <p className="text-sm text-muted-foreground">
            Verwalte Rücksendungen und Erstattungen
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground">
              Gesamt
            </span>
            <RotateCcw className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <p className="text-2xl font-display text-foreground">{stats.total}</p>
        </div>

        <div className="kpi-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground">
              Ausstehend
            </span>
            <Clock className="w-4 h-4 text-warning" strokeWidth={1.5} />
          </div>
          <p className="text-2xl font-display text-warning">{stats.pending}</p>
        </div>

        <div className="kpi-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground">
              Genehmigt
            </span>
            <Check className="w-4 h-4 text-accent" strokeWidth={1.5} />
          </div>
          <p className="text-2xl font-display text-accent">{stats.approved}</p>
        </div>

        <div className="kpi-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground">
              Erstattet
            </span>
            <Euro className="w-4 h-4 text-success" strokeWidth={1.5} />
          </div>
          <p className="text-2xl font-display text-success">€{stats.totalRefunded.toFixed(2)}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border text-sm focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {(['all', 'pending', 'approved', 'received', 'refunded'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-[11px] tracking-[0.1em] uppercase font-medium border whitespace-nowrap transition-colors ${
                filter === f
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-card text-foreground border-border hover:border-accent'
              }`}
            >
              {f === 'all' ? 'Alle' : f === 'pending' ? 'Ausstehend' : f === 'approved' ? 'Genehmigt' : f === 'received' ? 'Erhalten' : 'Erstattet'}
            </button>
          ))}
        </div>
      </div>

      {/* Returns List */}
      <div className="bg-card border border-border">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-medium text-foreground">
            Retouren ({filteredReturns.length})
          </h2>
        </div>

        {filteredReturns.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Keine Retouren vorhanden
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredReturns.map((returnItem) => {
              const status = getStatusInfo(returnItem.status);
              const isExpanded = expandedId === returnItem.id;

              return (
                <div key={returnItem.id} className="p-4">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : returnItem.id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-foreground truncate">
                            #{returnItem.id.slice(0, 8)}
                          </span>
                          <span className={`badge-status ${status.class}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {returnItem.reason}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(returnItem.created_at).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-border space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground mb-1">
                            Erstattungsbetrag
                          </p>
                          <p className="font-medium text-foreground">
                            €{returnItem.refund_amount?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground mb-1">
                            Tracking
                          </p>
                          <p className="font-medium text-foreground">
                            {returnItem.tracking_number || 'Keine Sendungsverfolgung'}
                          </p>
                        </div>
                      </div>

                      {returnItem.notes && (
                        <div>
                          <p className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground mb-1">
                            Notizen
                          </p>
                          <p className="text-sm text-foreground">{returnItem.notes}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        {returnItem.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateReturnStatus(returnItem.id, 'approved')}
                              className="px-3 py-1.5 text-xs border border-success text-success hover:bg-success hover:text-success-foreground transition-colors"
                            >
                              Genehmigen
                            </button>
                            <button
                              onClick={() => updateReturnStatus(returnItem.id, 'rejected')}
                              className="px-3 py-1.5 text-xs border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                            >
                              Ablehnen
                            </button>
                          </>
                        )}
                        {returnItem.status === 'approved' && (
                          <button
                            onClick={() => updateReturnStatus(returnItem.id, 'received')}
                            className="px-3 py-1.5 text-xs border border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-colors"
                          >
                            Als erhalten markieren
                          </button>
                        )}
                        {returnItem.status === 'received' && (
                          <button
                            onClick={() => updateReturnStatus(returnItem.id, 'refunded', returnItem.refund_amount || 0)}
                            className="px-3 py-1.5 text-xs border border-success text-success hover:bg-success hover:text-success-foreground transition-colors"
                          >
                            Erstatten
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
