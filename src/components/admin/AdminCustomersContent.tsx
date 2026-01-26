import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Search, Mail } from 'lucide-react';

export function AdminCustomersContent() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
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
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'gold':
        return 'bg-accent/10 text-accent';
      case 'silver':
        return 'bg-charcoal-light/10 text-charcoal';
      case 'bronze':
      default:
        return 'bg-sand text-charcoal';
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display text-foreground mb-1">Kunden</h1>
        <p className="text-sm text-muted-foreground">
          {customers.length} Kunden insgesamt
        </p>
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

      {/* Customers Table */}
      <div className="bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Kunde</th>
                <th>E-Mail</th>
                <th>Tier</th>
                <th>Gesamtausgaben</th>
                <th>Payback</th>
                <th>Registriert</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted-foreground py-12">
                    Keine Kunden gefunden
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
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
                    <td className="text-muted-foreground">
                      {customer.email || '-'}
                    </td>
                    <td>
                      <span className={`badge-status ${getTierColor(customer.tier)}`}>
                        {(customer.tier || 'bronze').charAt(0).toUpperCase() + (customer.tier || 'bronze').slice(1)}
                      </span>
                    </td>
                    <td className="font-medium">
                      €{Number(customer.total_spent || 0).toFixed(2)}
                    </td>
                    <td className="text-muted-foreground">
                      €{Number(customer.payback_balance || 0).toFixed(2)}
                    </td>
                    <td className="text-muted-foreground">
                      {new Date(customer.created_at).toLocaleDateString('de-DE')}
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
