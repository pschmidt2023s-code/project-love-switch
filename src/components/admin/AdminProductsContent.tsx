import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Search, Edit2, Trash2, MoreHorizontal } from 'lucide-react';

export function AdminProductsContent() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(*), product_variants(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Fehler beim Laden der Produkte');
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Produkt wirklich löschen?')) return;
    
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      
      toast.success('Produkt gelöscht');
      fetchProducts();
    } catch (error) {
      toast.error('Fehler beim Löschen');
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.slug?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-64 bg-muted animate-pulse" />
        <div className="bg-card border border-border">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 border-b border-border animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display text-foreground mb-1">Produkte</h1>
          <p className="text-sm text-muted-foreground">
            {products.length} Produkte insgesamt
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          Produkt hinzufügen
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
        <input
          type="text"
          placeholder="Produkte suchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-card border border-border text-sm focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {/* Products Table */}
      <div className="bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Produkt</th>
                <th>Kategorie</th>
                <th>Preis</th>
                <th>Varianten</th>
                <th>Status</th>
                <th className="text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted-foreground py-12">
                    Keine Produkte gefunden
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-muted flex-shrink-0 overflow-hidden">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-muted-foreground">
                      {product.categories?.name || '-'}
                    </td>
                    <td className="font-medium">
                      €{Number(product.base_price).toFixed(2)}
                    </td>
                    <td className="text-muted-foreground">
                      {product.product_variants?.length || 0}
                    </td>
                    <td>
                      <span className={`badge-status ${product.is_active ? 'badge-success' : 'badge-neutral'}`}>
                        {product.is_active ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setShowForm(true);
                          }}
                          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          title="Bearbeiten"
                        >
                          <Edit2 className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                          title="Löschen"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      </div>
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
