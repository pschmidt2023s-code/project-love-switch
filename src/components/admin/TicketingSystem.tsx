import { useState, useEffect, useMemo } from 'react';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  User,
  Mail,
  X,
  Send,
  RefreshCw,
  AlertTriangle,
  Timer,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

interface Ticket {
  id: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string | null;
  created_at: string;
  updated_at: string;
}

// SLA Configuration (in hours)
const SLA_TARGETS = {
  urgent: { response: 1, resolution: 4 },
  high: { response: 4, resolution: 24 },
  medium: { response: 8, resolution: 48 },
  low: { response: 24, resolution: 72 }
};

interface TicketReply {
  id: string;
  ticket_id: string;
  user_id: string | null;
  message: string;
  is_internal: boolean;
  created_at: string;
}

export function TicketingSystem() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [replies, setReplies] = useState<TicketReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [replyMessage, setReplyMessage] = useState('');
  const [sending, setSending] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchTickets();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('tickets-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tickets' },
        () => fetchTickets()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      fetchReplies(selectedTicket.id);
    }
  }, [selectedTicket?.id]);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets((data as Ticket[]) || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Fehler beim Laden der Tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from('ticket_replies')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setReplies((data as TicketReply[]) || []);
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  const updateTicketStatus = async (id: string, status: Ticket['status']) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setTickets(prev =>
        prev.map(t => (t.id === id ? { ...t, status } : t))
      );

      if (selectedTicket?.id === id) {
        setSelectedTicket({ ...selectedTicket, status });
      }

      toast.success('Status aktualisiert');
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast.error('Fehler beim Aktualisieren');
    }
  };

  const sendReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;

    setSending(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { error } = await supabase.from('ticket_replies').insert({
        ticket_id: selectedTicket.id,
        user_id: userData.user?.id || null,
        message: replyMessage.trim(),
        is_internal: false,
      });

      if (error) throw error;

      // Update ticket status to in_progress if it was open
      if (selectedTicket.status === 'open') {
        await updateTicketStatus(selectedTicket.id, 'in_progress');
      }

      toast.success('Antwort gesendet');
      setReplyMessage('');
      fetchReplies(selectedTicket.id);
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Fehler beim Senden');
    } finally {
      setSending(false);
    }
  };

  const filteredTickets = tickets.filter(t => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  // SLA Calculations
  const getSlaStatus = (ticket: Ticket) => {
    const createdAt = new Date(ticket.created_at);
    const now = new Date();
    const hoursElapsed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    const slaTarget = SLA_TARGETS[ticket.priority];

    if (ticket.status === 'resolved' || ticket.status === 'closed') {
      return { status: 'met', label: 'Erfüllt', color: 'text-success' };
    }

    const responseBreached = hoursElapsed > slaTarget.response;
    const resolutionBreached = hoursElapsed > slaTarget.resolution;
    const resolutionWarning = hoursElapsed > slaTarget.resolution * 0.75;

    if (resolutionBreached) {
      return { status: 'breached', label: 'Überfällig', color: 'text-destructive' };
    }
    if (resolutionWarning) {
      return { status: 'warning', label: 'Bald fällig', color: 'text-warning' };
    }
    return { status: 'on_track', label: 'Im Zeitplan', color: 'text-success' };
  };

  const slaMetrics = useMemo(() => {
    const openTickets = tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed');
    const breached = openTickets.filter(t => getSlaStatus(t).status === 'breached').length;
    const warning = openTickets.filter(t => getSlaStatus(t).status === 'warning').length;
    const onTrack = openTickets.filter(t => getSlaStatus(t).status === 'on_track').length;
    
    const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed');
    const avgResolutionTime = resolvedTickets.length > 0
      ? resolvedTickets.reduce((acc, t) => {
          const created = new Date(t.created_at);
          const updated = new Date(t.updated_at);
          return acc + (updated.getTime() - created.getTime()) / (1000 * 60 * 60);
        }, 0) / resolvedTickets.length
      : 0;

    return { breached, warning, onTrack, avgResolutionTime };
  }, [tickets]);

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length,
  };

  const getStatusInfo = (status: Ticket['status']) => {
    switch (status) {
      case 'open':
        return { label: 'Offen', class: 'badge-warning', icon: AlertCircle };
      case 'in_progress':
        return { label: 'In Bearbeitung', class: 'badge-info', icon: Clock };
      case 'resolved':
      case 'closed':
        return { label: 'Gelöst', class: 'badge-success', icon: CheckCircle2 };
      default:
        return { label: status, class: 'badge-neutral', icon: MessageSquare };
    }
  };

  const getPriorityInfo = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'urgent':
        return { label: 'Dringend', class: 'text-destructive' };
      case 'high':
        return { label: 'Hoch', class: 'text-warning' };
      case 'medium':
        return { label: 'Mittel', class: 'text-accent' };
      case 'low':
        return { label: 'Niedrig', class: 'text-muted-foreground' };
      default:
        return { label: priority, class: 'text-muted-foreground' };
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display text-foreground mb-1">Support-Tickets</h1>
          <p className="text-sm text-muted-foreground">
            Verwalte Kundenanfragen und Kontaktformular-Nachrichten
          </p>
        </div>
        <button
          onClick={fetchTickets}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground">
              Gesamt
            </span>
            <MessageSquare className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <p className="text-2xl font-display text-foreground">{stats.total}</p>
        </div>

        <div className="kpi-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground">
              Offen
            </span>
            <AlertCircle className="w-4 h-4 text-warning" strokeWidth={1.5} />
          </div>
          <p className="text-2xl font-display text-warning">{stats.open}</p>
        </div>

        <div className="kpi-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground">
              In Bearbeitung
            </span>
            <Clock className="w-4 h-4 text-accent" strokeWidth={1.5} />
          </div>
          <p className="text-2xl font-display text-accent">{stats.inProgress}</p>
        </div>

        <div className="kpi-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground">
              Gelöst
            </span>
            <CheckCircle2 className="w-4 h-4 text-success" strokeWidth={1.5} />
          </div>
          <p className="text-2xl font-display text-success">{stats.resolved}</p>
        </div>
      </div>

      {/* SLA Monitoring */}
      <div className="bg-card border border-border p-4">
        <div className="flex items-center gap-2 mb-4">
          <Timer className="w-4 h-4 text-accent" strokeWidth={1.5} />
          <h2 className="text-sm font-medium text-foreground">SLA-Monitoring</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3 bg-destructive/10 border border-destructive/20">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-destructive" strokeWidth={1.5} />
              <span className="text-[10px] tracking-[0.1em] uppercase text-destructive">Überfällig</span>
            </div>
            <p className="text-xl font-display text-destructive">{slaMetrics.breached}</p>
          </div>
          <div className="p-3 bg-warning/10 border border-warning/20">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-warning" strokeWidth={1.5} />
              <span className="text-[10px] tracking-[0.1em] uppercase text-warning">Bald fällig</span>
            </div>
            <p className="text-xl font-display text-warning">{slaMetrics.warning}</p>
          </div>
          <div className="p-3 bg-success/10 border border-success/20">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-success" strokeWidth={1.5} />
              <span className="text-[10px] tracking-[0.1em] uppercase text-success">Im Zeitplan</span>
            </div>
            <p className="text-xl font-display text-success">{slaMetrics.onTrack}</p>
          </div>
          <div className="p-3 bg-muted border border-border">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground">Ø Lösungszeit</span>
            </div>
            <p className="text-xl font-display text-foreground">
              {slaMetrics.avgResolutionTime.toFixed(1)}h
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['all', 'open', 'in_progress', 'resolved'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-[11px] tracking-[0.1em] uppercase font-medium border whitespace-nowrap transition-colors ${
              filter === f
                ? 'bg-foreground text-background border-foreground'
                : 'bg-card text-foreground border-border hover:border-accent'
            }`}
          >
            {f === 'all' ? 'Alle' : f === 'open' ? 'Offen' : f === 'in_progress' ? 'In Bearbeitung' : 'Gelöst'}
          </button>
        ))}
      </div>

      {/* Ticket List */}
      <div className="grid grid-cols-12 gap-6">
        {/* List */}
        <div className={`${selectedTicket && !isMobile ? 'col-span-12 lg:col-span-5' : 'col-span-12'}`}>
          <div className="bg-card border border-border">
            <div className="p-4 border-b border-border">
              <h2 className="text-sm font-medium text-foreground">
                Tickets ({filteredTickets.length})
              </h2>
            </div>
            
            <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
              {filteredTickets.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  Keine Tickets vorhanden
                </div>
              ) : (
                filteredTickets.map((ticket) => {
                  const status = getStatusInfo(ticket.status);
                  const priority = getPriorityInfo(ticket.priority);
                  const sla = getSlaStatus(ticket);
                  
                  return (
                    <button
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                        selectedTicket?.id === ticket.id ? 'bg-muted/50' : ''
                      } ${sla.status === 'breached' ? 'border-l-2 border-l-destructive' : sla.status === 'warning' ? 'border-l-2 border-l-warning' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
                            <span className="text-sm font-medium text-foreground truncate">
                              {ticket.customer_name}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] uppercase font-medium ${priority.class}`}>
                            {priority.label}
                          </span>
                          <span className={`badge-status ${status.class}`}>
                            {status.label}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm font-medium text-foreground mb-1 line-clamp-1">
                        {ticket.subject}
                      </p>
                      
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {ticket.message}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" strokeWidth={1.5} />
                          {new Date(ticket.created_at).toLocaleDateString('de-DE', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                          <span className={`text-[9px] uppercase font-medium ${sla.color}`}>
                            {sla.label}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Detail */}
        {selectedTicket && (
          <div className={`${isMobile ? 'fixed inset-0 z-50 bg-background' : 'col-span-12 lg:col-span-7'}`}>
            <div className={`bg-card border border-border ${isMobile ? 'h-full flex flex-col' : 'sticky top-24'}`}>
              {/* Header */}
              <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-display text-foreground truncate">
                    {selectedTicket.subject}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-3 h-3 flex-shrink-0" strokeWidth={1.5} />
                    <span className="truncate">{selectedTicket.customer_name}</span>
                    <span>•</span>
                    <Mail className="w-3 h-3 flex-shrink-0" strokeWidth={1.5} />
                    <span className="truncate">{selectedTicket.customer_email}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>

              {/* Content */}
              <div className={`p-4 space-y-4 ${isMobile ? 'flex-1 overflow-y-auto' : ''}`}>
                {/* Status Actions */}
                <div className="flex flex-wrap gap-2">
                  {selectedTicket.status === 'open' && (
                    <button
                      onClick={() => updateTicketStatus(selectedTicket.id, 'in_progress')}
                      className="px-3 py-1.5 text-xs border border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      In Bearbeitung
                    </button>
                  )}
                  {(selectedTicket.status === 'open' || selectedTicket.status === 'in_progress') && (
                    <button
                      onClick={() => updateTicketStatus(selectedTicket.id, 'resolved')}
                      className="px-3 py-1.5 text-xs border border-success text-success hover:bg-success hover:text-success-foreground transition-colors"
                    >
                      Als gelöst markieren
                    </button>
                  )}
                </div>

                {/* Original Message */}
                <div className="p-4 bg-muted/30 border border-border">
                  <p className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground mb-2">
                    Ursprüngliche Nachricht
                  </p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {selectedTicket.message}
                  </p>
                </div>

                {/* Replies */}
                {replies.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground">
                      Antworten ({replies.length})
                    </p>
                    {replies.map((reply) => (
                      <div
                        key={reply.id}
                        className={`p-4 border ${reply.is_internal ? 'bg-warning/10 border-warning/30' : 'bg-accent/5 border-accent/30'}`}
                      >
                        <p className="text-xs text-muted-foreground mb-2">
                          {new Date(reply.created_at).toLocaleDateString('de-DE', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {reply.is_internal && ' • Intern'}
                        </p>
                        <p className="text-sm text-foreground whitespace-pre-wrap">
                          {reply.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply */}
                <div className="space-y-3">
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Antwort schreiben..."
                    rows={4}
                    className="w-full px-4 py-3 bg-muted/50 border border-border text-sm focus:outline-none focus:border-accent transition-colors resize-none"
                  />
                  <button
                    onClick={sendReply}
                    disabled={sending || !replyMessage.trim()}
                    className="inline-flex items-center px-6 py-2 bg-foreground text-background text-[11px] tracking-[0.1em] uppercase font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5 mr-2" strokeWidth={1.5} />
                    {sending ? 'Senden...' : 'Antworten'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
