import { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  User,
  Mail,
  Plus,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  customer_email: string;
  customer_name: string;
  created_at: string;
  updated_at: string;
}

// Using chat_sessions table as ticket storage for now
export function TicketingSystem() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setTickets(prev => 
        prev.map(t => t.id === id ? { ...t, status } : t)
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

  const filteredTickets = tickets.filter(t => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'waiting' || t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress' || t.status === 'active').length,
    resolved: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length,
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'waiting':
      case 'open':
        return { label: 'Offen', class: 'badge-warning', icon: AlertCircle };
      case 'active':
      case 'in_progress':
        return { label: 'In Bearbeitung', class: 'badge-info', icon: Clock };
      case 'resolved':
      case 'closed':
        return { label: 'Gelöst', class: 'badge-success', icon: CheckCircle2 };
      default:
        return { label: status, class: 'badge-neutral', icon: MessageSquare };
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
            Verwalte Kundenanfragen und Support-Tickets
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'open', 'in_progress', 'resolved'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-[11px] tracking-[0.1em] uppercase font-medium border transition-colors ${
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
        <div className={`${selectedTicket ? 'col-span-12 lg:col-span-5' : 'col-span-12'}`}>
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
                  
                  return (
                    <button
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                        selectedTicket?.id === ticket.id ? 'bg-muted/50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                          <span className="text-sm font-medium text-foreground">
                            {ticket.visitor_name || ticket.visitor_email || 'Unbekannt'}
                          </span>
                        </div>
                        <span className={`badge-status ${status.class}`}>
                          {status.label}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {ticket.last_message || 'Keine Nachricht'}
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" strokeWidth={1.5} />
                        {new Date(ticket.created_at).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
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
          <div className="col-span-12 lg:col-span-7">
            <div className="bg-card border border-border sticky top-24">
              {/* Header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-display text-foreground">
                    {selectedTicket.visitor_name || 'Kundenanfrage'}
                  </h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Mail className="w-3 h-3" strokeWidth={1.5} />
                    {selectedTicket.visitor_email || 'Keine E-Mail'}
                  </p>
                </div>
                
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Status Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => updateTicketStatus(selectedTicket.id, 'active')}
                    className="px-3 py-1.5 text-xs border border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    In Bearbeitung
                  </button>
                  <button
                    onClick={() => updateTicketStatus(selectedTicket.id, 'closed')}
                    className="px-3 py-1.5 text-xs border border-success text-success hover:bg-success hover:text-success-foreground transition-colors"
                  >
                    Als gelöst markieren
                  </button>
                </div>

                {/* Message */}
                <div className="p-4 bg-muted/30 border border-border">
                  <p className="text-sm text-foreground">
                    {selectedTicket.last_message || 'Keine Nachricht vorhanden'}
                  </p>
                </div>

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
                    onClick={() => {
                      toast.success('Antwort gesendet (Demo)');
                      setReplyMessage('');
                    }}
                    className="px-6 py-2 bg-foreground text-background text-[11px] tracking-[0.1em] uppercase font-medium hover:bg-foreground/90 transition-colors"
                  >
                    Antworten
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
