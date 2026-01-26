import { useState, useEffect } from 'react';
import { 
  History, 
  User, 
  Package, 
  ShoppingCart,
  Settings,
  Filter,
  Search,
  Clock,
  Shield
} from 'lucide-react';

// Simulated audit log entries for demo
interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  user_email: string;
  details: string;
  ip_address: string;
  created_at: string;
}

const mockLogs: AuditLog[] = [
  {
    id: '1',
    action: 'update',
    entity_type: 'product',
    entity_id: 'prod-123',
    user_email: 'admin@aldenair.de',
    details: 'Preis von €29.99 auf €24.99 geändert',
    ip_address: '192.168.1.1',
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: '2',
    action: 'create',
    entity_type: 'order',
    entity_id: 'ORD-20240115-00001',
    user_email: 'system',
    details: 'Neue Bestellung erstellt - €89.97',
    ip_address: '10.0.0.1',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: '3',
    action: 'login',
    entity_type: 'user',
    entity_id: 'user-456',
    user_email: 'admin@aldenair.de',
    details: 'Admin-Login erfolgreich',
    ip_address: '192.168.1.1',
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: '4',
    action: 'update',
    entity_type: 'settings',
    entity_id: 'shop-settings',
    user_email: 'admin@aldenair.de',
    details: 'Versandkosten aktualisiert',
    ip_address: '192.168.1.1',
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: '5',
    action: 'delete',
    entity_type: 'coupon',
    entity_id: 'SUMMER20',
    user_email: 'admin@aldenair.de',
    details: 'Gutscheincode gelöscht',
    ip_address: '192.168.1.1',
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
];

export function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>(mockLogs);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState<string>('all');

  const getActionIcon = (entityType: string) => {
    switch (entityType) {
      case 'product':
        return Package;
      case 'order':
        return ShoppingCart;
      case 'user':
        return User;
      case 'settings':
        return Settings;
      default:
        return History;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'text-success';
      case 'update':
        return 'text-accent';
      case 'delete':
        return 'text-destructive';
      case 'login':
        return 'text-info';
      default:
        return 'text-muted-foreground';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'create':
        return 'Erstellt';
      case 'update':
        return 'Aktualisiert';
      case 'delete':
        return 'Gelöscht';
      case 'login':
        return 'Anmeldung';
      default:
        return action;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `vor ${diffMins} Min.`;
    if (diffHours < 24) return `vor ${diffHours} Std.`;
    return `vor ${diffDays} Tagen`;
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity_id.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (entityFilter === 'all') return matchesSearch;
    return matchesSearch && log.entity_type === entityFilter;
  });

  const entityTypes = ['all', 'product', 'order', 'user', 'settings', 'coupon'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display text-foreground mb-1">Audit-Protokoll</h1>
        <p className="text-sm text-muted-foreground">
          Übersicht über alle Systemaktivitäten (DSGVO-konform)
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-accent/5 border border-accent/20 p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-accent mt-0.5" strokeWidth={1.5} />
        <div>
          <p className="text-sm font-medium text-foreground mb-1">
            DSGVO-konformes Logging
          </p>
          <p className="text-xs text-muted-foreground">
            Alle Aktionen werden protokolliert und für 90 Tage gespeichert. 
            IP-Adressen werden nach 30 Tagen anonymisiert.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border text-sm focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {entityTypes.map((type) => (
            <button
              key={type}
              onClick={() => setEntityFilter(type)}
              className={`px-3 py-2 text-[10px] tracking-[0.1em] uppercase font-medium border transition-colors ${
                entityFilter === type
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-card text-foreground border-border hover:border-accent'
              }`}
            >
              {type === 'all' ? 'Alle' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-card border border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">
            Aktivitäten ({filteredLogs.length})
          </h2>
          <span className="text-xs text-muted-foreground">
            Letzte 7 Tage
          </span>
        </div>

        <div className="divide-y divide-border">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Keine Aktivitäten gefunden
            </div>
          ) : (
            filteredLogs.map((log) => {
              const Icon = getActionIcon(log.entity_type);
              
              return (
                <div key={log.id} className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-muted/50">
                      <Icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-medium ${getActionColor(log.action)}`}>
                          {getActionLabel(log.action)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          •
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {log.entity_type}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          #{log.entity_id}
                        </span>
                      </div>
                      
                      <p className="text-sm text-foreground mb-2">
                        {log.details}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" strokeWidth={1.5} />
                          {log.user_email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" strokeWidth={1.5} />
                          {formatTimeAgo(log.created_at)}
                        </span>
                        <span className="font-mono">
                          {log.ip_address}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
