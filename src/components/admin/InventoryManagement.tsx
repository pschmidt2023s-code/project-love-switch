import { useState, useEffect } from 'react';
import { 
  Package, 
  AlertTriangle, 
  TrendingDown,
  ArrowUpRight,
  Search,
  Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface InventoryItem {
  id: string;
  product_name: string;
  variant_size: string;
  sku: string | null;
  stock: number;
  in_stock: boolean;
  price: number;
}

export function InventoryManagement() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .select(`
          id,
          size,
          sku,
          stock,
          in_stock,
          price,
          products!inner (name)
        `)
        .order('stock', { ascending: true });

      if (error) throw error;

      const formattedData = (data || []).map((item: any) => ({
        id: item.id,
        product_name: item.products?.name || 'Unbekannt',
        variant_size: item.size,
        sku: item.sku,
        stock: item.stock || 0,
        in_stock: item.in_stock,
        price: item.price,
      }));

      setInventory(formattedData);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (id: string, newStock: number) => {
    try {
      const { error } = await supabase
        .from('product_variants')
        .update({ 
          stock: newStock,
          in_stock: newStock > 0
        })
        .eq('id', id);

      if (error) throw error;

      setInventory(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, stock: newStock, in_stock: newStock > 0 }
            : item
        )
      );
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.sku?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (filter === 'low') return matchesSearch && item.stock > 0 && item.stock <= 10;
    if (filter === 'out') return matchesSearch && item.stock === 0;
    return matchesSearch;
  });

  const stats = {
    total: inventory.length,
    lowStock: inventory.filter(i => i.stock > 0 && i.stock <= 10).length,
    outOfStock: inventory.filter(i => i.stock === 0).length,
    totalValue: inventory.reduce((sum, i) => sum + (i.stock * i.price), 0),
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Ausverkauft', class: 'badge-error' };
    if (stock <= 10) return { label: 'Niedriger Bestand', class: 'badge-warning' };
    return { label: 'Auf Lager', class: 'badge-success' };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card border border-border p-6 animate-pulse">
              <div className="h-4 w-20 bg-muted mb-3" />
              <div className="h-8 w-32 bg-muted" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display text-foreground mb-1">Lagerbestand</h1>
        <p className="text-sm text-muted-foreground">
          Verwalte deinen Produktbestand
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground">
              Gesamt Varianten
            </span>
            <Package className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <p className="text-2xl font-display text-foreground">{stats.total}</p>
        </div>

        <div className="kpi-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground">
              Niedriger Bestand
            </span>
            <TrendingDown className="w-4 h-4 text-warning" strokeWidth={1.5} />
          </div>
          <p className="text-2xl font-display text-warning">{stats.lowStock}</p>
        </div>

        <div className="kpi-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground">
              Ausverkauft
            </span>
            <AlertTriangle className="w-4 h-4 text-destructive" strokeWidth={1.5} />
          </div>
          <p className="text-2xl font-display text-destructive">{stats.outOfStock}</p>
        </div>

        <div className="kpi-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground">
              Lagerwert
            </span>
            <ArrowUpRight className="w-4 h-4 text-success" strokeWidth={1.5} />
          </div>
          <p className="text-2xl font-display text-foreground">
            €{stats.totalValue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Produkt oder SKU suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border text-sm focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        <div className="flex gap-2">
          {(['all', 'low', 'out'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-[11px] tracking-[0.1em] uppercase font-medium border transition-colors ${
                filter === f
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-card text-foreground border-border hover:border-accent'
              }`}
            >
              {f === 'all' ? 'Alle' : f === 'low' ? 'Niedrig' : 'Ausverkauft'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Produkt</th>
                <th>Variante</th>
                <th>SKU</th>
                <th>Bestand</th>
                <th>Status</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted-foreground py-8">
                    Keine Produkte gefunden
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => {
                  const status = getStockStatus(item.stock);
                  
                  return (
                    <tr key={item.id}>
                      <td className="font-medium text-foreground">
                        {item.product_name}
                      </td>
                      <td className="text-muted-foreground">
                        {item.variant_size}
                      </td>
                      <td className="text-muted-foreground font-mono text-xs">
                        {item.sku || '-'}
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.stock}
                          onChange={(e) => updateStock(item.id, parseInt(e.target.value) || 0)}
                          min="0"
                          className="w-20 px-2 py-1 bg-muted/50 border border-border text-sm text-center focus:outline-none focus:border-accent"
                        />
                      </td>
                      <td>
                        <span className={`badge-status ${status.class}`}>
                          {status.label}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => updateStock(item.id, item.stock + 10)}
                          className="px-3 py-1 text-xs text-accent hover:text-accent/80 transition-colors"
                        >
                          +10
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
