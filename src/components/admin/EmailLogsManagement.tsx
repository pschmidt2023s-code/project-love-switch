import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Mail, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Clock,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';

interface EmailLog {
  id: string;
  type: string;
  recipient_email: string;
  recipient_name: string | null;
  subject: string;
  status: string;
  error_message: string | null;
  resend_id: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: any;
  created_at: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  sent: { label: 'Gesendet', color: 'bg-green-500/10 text-green-600 border-green-500/20', icon: CheckCircle2 },
  skipped: { label: 'Übersprungen', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', icon: AlertTriangle },
  failed: { label: 'Fehlgeschlagen', color: 'bg-red-500/10 text-red-600 border-red-500/20', icon: XCircle },
  pending: { label: 'Ausstehend', color: 'bg-muted text-muted-foreground border-border', icon: Clock },
};

const typeLabels: Record<string, string> = {
  new_ticket: 'Neues Ticket',
  ticket_reply: 'Ticket-Antwort',
  status_change: 'Statusänderung',
  new_return: 'Neue Retoure',
};

export function EmailLogsManagement() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching email logs:', error);
      toast.error('Fehler beim Laden der E-Mail-Logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Stats
  const stats = {
    total: logs.length,
    sent: logs.filter(l => l.status === 'sent').length,
    skipped: logs.filter(l => l.status === 'skipped').length,
    failed: logs.filter(l => l.status === 'failed').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display tracking-tight">E-Mail-Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Übersicht aller versendeten E-Mail-Benachrichtigungen
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchLogs}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Aktualisieren
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted">
              <Mail className="w-4 h-4 text-foreground" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-2xl font-medium">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Gesamt</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10">
              <CheckCircle2 className="w-4 h-4 text-green-600" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-2xl font-medium text-green-600">{stats.sent}</p>
              <p className="text-xs text-muted-foreground">Gesendet</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10">
              <AlertTriangle className="w-4 h-4 text-yellow-600" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-2xl font-medium text-yellow-600">{stats.skipped}</p>
              <p className="text-xs text-muted-foreground">Übersprungen</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10">
              <XCircle className="w-4 h-4 text-red-600" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-2xl font-medium text-red-600">{stats.failed}</p>
              <p className="text-xs text-muted-foreground">Fehlgeschlagen</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Datum</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Typ</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Empfänger</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Betreff</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Status</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Resend ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Laden...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  Keine E-Mail-Logs vorhanden
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => {
                const status = statusConfig[log.status] || statusConfig.pending;
                const StatusIcon = status.icon;

                return (
                  <TableRow 
                    key={log.id} 
                    className="border-border cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                  >
                    <TableCell className="text-sm">
                      {format(new Date(log.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {typeLabels[log.type] || log.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{log.recipient_name || '-'}</p>
                        <p className="text-xs text-muted-foreground">{log.recipient_email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate">
                      {log.subject}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${status.color} border`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {log.resend_id ? (
                        <a 
                          href={`https://resend.com/emails/${log.resend_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-foreground"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {log.resend_id.slice(0, 8)}...
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Detail Panel */}
        {selectedLog && (
          <div className="border-t border-border p-4 bg-muted/30">
            <h3 className="text-sm font-medium mb-3">Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-1">ID</p>
                <p className="font-mono text-xs">{selectedLog.id.slice(0, 8)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Typ</p>
                <p>{typeLabels[selectedLog.type] || selectedLog.type}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Empfänger</p>
                <p>{selectedLog.recipient_email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Zeitpunkt</p>
                <p>{format(new Date(selectedLog.created_at), 'dd.MM.yyyy HH:mm:ss', { locale: de })}</p>
              </div>
            </div>
            
            {selectedLog.error_message && (
              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-1">Fehlermeldung</p>
                <p className="text-sm text-red-600 bg-red-500/10 p-2 rounded font-mono">
                  {selectedLog.error_message}
                </p>
              </div>
            )}

            {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-1">Metadaten</p>
                <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                  {JSON.stringify(selectedLog.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
