import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Search, RefreshCw, Users, ChevronDown, Mail } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export function AdminCustomersContent() {
  const isMobile = useIsMobile();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);

  const fetchCustomers = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('admin-customers')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => fetchCustomers()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'gold':
        return 'bg-accent/10 text-accent';
      case 'silver':
        return 'bg-muted text-foreground';
      case 'bronze':
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'gold':
        return 'Gold';
      case 'silver':
        return 'Silber';
      case 'bronze':
      default:
        return 'Bronze';
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-xl lg:text-2xl font-display text-foreground mb-1">Kunden</h1>
          <p className="text-xs lg:text-sm text-muted-foreground">
            {customers.length} Kunden insgesamt
          </p>
        </div>
        <button
          onClick={() => fetchCustomers(true)}
          disabled={refreshing}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          title="Aktualisieren"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} strokeWidth={1.5} />
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
        <input
          type="text"
          placeholder="Kunden suchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-card border border-border text-sm focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {/* Customers */}
      <div className="bg-card border border-border overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" strokeWidth={1} />
            <p className="text-muted-foreground">Keine Kunden gefunden</p>
          </div>
        ) : isMobile ? (
          /* Mobile Card View */
          <div className="divide-y divide-border">
            {filteredCustomers.map((customer) => (
              <div key={customer.id} className="p-4">
                <div 
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => setExpandedCustomer(expandedCustomer === customer.id ? null : customer.id)}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-accent/10 flex items-center justify-center text-accent text-sm font-medium flex-shrink-0">
                    {(customer.first_name?.[0] || customer.email?.[0] || '?').toUpperCase()}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">
                      {customer.first_name && customer.last_name
                        ? `${customer.first_name} ${customer.last_name}`
                        : 'Kein Name'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {customer.email || '-'}
                    </p>
                  </div>

                  {/* Tier Badge */}
                  <span className={`text-[10px] px-2 py-1 ${getTierColor(customer.tier)}`}>
                    {getTierLabel(customer.tier)}
                  </span>

                  <ChevronDown 
                    className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${
                      expandedCustomer === customer.id ? 'rotate-180' : ''
                    }`} 
                    strokeWidth={1.5} 
                  />
                </div>

                {/* Expanded Content */}
                {expandedCustomer === customer.id && (
                  <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-muted-foreground">Gesamtausgaben</p>
                      <p className="font-medium text-foreground mt-0.5">
                        €{Number(customer.total_spent || 0).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Payback-Guthaben</p>
                      <p className="font-medium text-foreground mt-0.5">
                        €{Number(customer.payback_balance || 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Registriert am</p>
                      <p className="font-medium text-foreground mt-0.5">
                        {new Date(customer.created_at).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <a 
                        href={`mailto:${customer.email}`}
                        className="flex items-center justify-center gap-2 w-full py-2 text-muted-foreground hover:text-foreground hover:bg-muted border border-border transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" strokeWidth={1.5} />
                        E-Mail senden
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Desktop Table View */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">
                    Kunde
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">
                    E-Mail
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">
                    Tier
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">
                    Gesamtausgaben
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">
                    Payback
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">
                    Registriert
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-accent/10 flex items-center justify-center text-accent text-sm font-medium">
                          {(customer.first_name?.[0] || customer.email?.[0] || '?').toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {customer.first_name && customer.last_name
                              ? `${customer.first_name} ${customer.last_name}`
                              : 'Kein Name'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {customer.email || '-'}
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 ${getTierColor(customer.tier)}`}>
                        {getTierLabel(customer.tier)}
                      </span>
                    </td>
                    <td className="p-4 font-medium">
                      €{Number(customer.total_spent || 0).toFixed(2)}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      €{Number(customer.payback_balance || 0).toFixed(2)}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(customer.created_at).toLocaleDateString('de-DE')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
