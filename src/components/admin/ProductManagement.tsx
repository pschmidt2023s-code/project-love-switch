import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Search, Package, Edit, Trash2, Eye, Plus, X, Save } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  base_price: number;
  original_price: number | null;
  is_active: boolean | null;
  image_url: string | null;
  brand: string | null;
  gender: string | null;
  inspired_by: string | null;
  top_notes: string[] | null;
  middle_notes: string[] | null;
  base_notes: string[] | null;
  seasons: string[] | null;
  occasions: string[] | null;
  created_at: string;
}

interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  price: number;
  original_price: number | null;
  stock: number | null;
  in_stock: boolean | null;
  sku: string | null;
}

const initialProductForm = {
  name: '',
  slug: '',
  description: '',
  base_price: '',
  original_price: '',
  brand: 'ALDENAIR',
  gender: 'unisex',
  inspired_by: '',
  image_url: '',
  is_active: true,
  top_notes: '',
  middle_notes: '',
  base_notes: '',
};

export default function ProductManagement() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState(initialProductForm);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVariants = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .order('price', { ascending: true });

      if (error) throw error;
      setVariants(data || []);
    } catch (error) {
      console.error('Error loading variants:', error);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[äöüß]/g, (match) => {
        const map: Record<string, string> = { ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss' };
        return map[match] || match;
      })
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleCreate = async () => {
    try {
      const productData = {
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        description: formData.description || null,
        base_price: parseFloat(formData.base_price) || 0,
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        brand: formData.brand || 'ALDENAIR',
        gender: formData.gender,
        inspired_by: formData.inspired_by || null,
        image_url: formData.image_url || null,
        is_active: formData.is_active,
        top_notes: formData.top_notes ? formData.top_notes.split(',').map((n) => n.trim()) : null,
        middle_notes: formData.middle_notes ? formData.middle_notes.split(',').map((n) => n.trim()) : null,
        base_notes: formData.base_notes ? formData.base_notes.split(',').map((n) => n.trim()) : null,
      };

      const { error } = await supabase.from('products').insert(productData);

      if (error) throw error;

      toast({ title: 'Erfolg', description: 'Produkt erstellt' });
      setDialogOpen(false);
      setFormData(initialProductForm);
      loadProducts();
    } catch (error) {
      toast({ title: 'Fehler', description: 'Produkt konnte nicht erstellt werden', variant: 'destructive' });
    }
  };

  const handleUpdate = async () => {
    if (!editingProduct) return;

    try {
      const productData = {
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        description: formData.description || null,
        base_price: parseFloat(formData.base_price) || 0,
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        brand: formData.brand || 'ALDENAIR',
        gender: formData.gender,
        inspired_by: formData.inspired_by || null,
        image_url: formData.image_url || null,
        is_active: formData.is_active,
        top_notes: formData.top_notes ? formData.top_notes.split(',').map((n) => n.trim()) : null,
        middle_notes: formData.middle_notes ? formData.middle_notes.split(',').map((n) => n.trim()) : null,
        base_notes: formData.base_notes ? formData.base_notes.split(',').map((n) => n.trim()) : null,
      };

      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id);

      if (error) throw error;

      toast({ title: 'Erfolg', description: 'Produkt aktualisiert' });
      setDialogOpen(false);
      setEditingProduct(null);
      setFormData(initialProductForm);
      loadProducts();
    } catch (error) {
      toast({ title: 'Fehler', description: 'Produkt konnte nicht aktualisiert werden', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Produkt wirklich löschen? Alle Varianten werden ebenfalls gelöscht.')) return;

    try {
      // First delete variants
      await supabase.from('product_variants').delete().eq('product_id', id);
      // Then delete product
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Erfolg', description: 'Produkt gelöscht' });
      loadProducts();
    } catch (error) {
      toast({ title: 'Fehler', description: 'Produkt konnte nicht gelöscht werden', variant: 'destructive' });
    }
  };

  const toggleActive = async (id: string, isActive: boolean | null) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
      loadProducts();
    } catch (error) {
      toast({ title: 'Fehler', description: 'Status konnte nicht geändert werden', variant: 'destructive' });
    }
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      base_price: product.base_price.toString(),
      original_price: product.original_price?.toString() || '',
      brand: product.brand || 'ALDENAIR',
      gender: product.gender || 'unisex',
      inspired_by: product.inspired_by || '',
      image_url: product.image_url || '',
      is_active: product.is_active ?? true,
      top_notes: product.top_notes?.join(', ') || '',
      middle_notes: product.middle_notes?.join(', ') || '',
      base_notes: product.base_notes?.join(', ') || '',
    });
    setDialogOpen(true);
  };

  const openVariantsDialog = async (productId: string) => {
    setSelectedProductId(productId);
    await loadVariants(productId);
    setVariantDialogOpen(true);
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center py-8">Laden...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Produkte</h2>
          <p className="text-muted-foreground">{products.length} Produkte</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingProduct(null);
            setFormData(initialProductForm);
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Neues Produkt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Produkt bearbeiten' : 'Neues Produkt erstellen'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Produktname"
                  />
                </div>
                <div>
                  <Label>Slug</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="produkt-slug"
                  />
                </div>
              </div>

              <div>
                <Label>Beschreibung</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Produktbeschreibung"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Preis (€) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                    placeholder="49.99"
                  />
                </div>
                <div>
                  <Label>Originalpreis (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                    placeholder="69.99"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Marke</Label>
                  <Input
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="ALDENAIR"
                  />
                </div>
                <div>
                  <Label>Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(v) => setFormData({ ...formData, gender: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unisex">Unisex</SelectItem>
                      <SelectItem value="herren">Herren</SelectItem>
                      <SelectItem value="damen">Damen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Inspiriert von</Label>
                <Input
                  value={formData.inspired_by}
                  onChange={(e) => setFormData({ ...formData, inspired_by: e.target.value })}
                  placeholder="z.B. Dior Sauvage"
                />
              </div>

              <div>
                <Label>Bild-URL</Label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Kopfnoten</Label>
                  <Input
                    value={formData.top_notes}
                    onChange={(e) => setFormData({ ...formData, top_notes: e.target.value })}
                    placeholder="Bergamotte, Zitrone"
                  />
                </div>
                <div>
                  <Label>Herznoten</Label>
                  <Input
                    value={formData.middle_notes}
                    onChange={(e) => setFormData({ ...formData, middle_notes: e.target.value })}
                    placeholder="Rose, Jasmin"
                  />
                </div>
                <div>
                  <Label>Basisnoten</Label>
                  <Input
                    value={formData.base_notes}
                    onChange={(e) => setFormData({ ...formData, base_notes: e.target.value })}
                    placeholder="Sandelholz, Moschus"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Aktiv</Label>
                  <p className="text-sm text-muted-foreground">Produkt im Shop anzeigen</p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                />
              </div>

              <Button
                onClick={editingProduct ? handleUpdate : handleCreate}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingProduct ? 'Speichern' : 'Erstellen'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Package className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{products.length}</p>
                <p className="text-sm text-muted-foreground">Gesamt</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Package className="w-8 h-8 text-success" />
              <div>
                <p className="text-2xl font-bold">
                  {products.filter((p) => p.is_active).length}
                </p>
                <p className="text-sm text-muted-foreground">Aktiv</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Package className="w-8 h-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">
                  {products.filter((p) => !p.is_active).length}
                </p>
                <p className="text-sm text-muted-foreground">Inaktiv</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Produkt suchen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produkt</TableHead>
                <TableHead>Marke</TableHead>
                <TableHead>Preis</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Erstellt</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      )}
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{product.brand || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">€{product.base_price.toFixed(2)}</span>
                      {product.original_price && (
                        <span className="text-sm text-muted-foreground line-through">
                          €{product.original_price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.gender || 'Unisex'}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={product.is_active ? 'default' : 'secondary'}
                      className="cursor-pointer"
                      onClick={() => toggleActive(product.id, product.is_active)}
                    >
                      {product.is_active ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(product.created_at).toLocaleDateString('de-DE')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/products/${product.slug}`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(product)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Variants Dialog */}
      <Dialog open={variantDialogOpen} onOpenChange={setVariantDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Produktvarianten</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {variants.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Keine Varianten vorhanden
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Größe</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Preis</TableHead>
                    <TableHead>Bestand</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {variants.map((variant) => (
                    <TableRow key={variant.id}>
                      <TableCell className="font-medium">{variant.size}</TableCell>
                      <TableCell className="font-mono text-sm">{variant.sku || '-'}</TableCell>
                      <TableCell>€{variant.price.toFixed(2)}</TableCell>
                      <TableCell>{variant.stock ?? 0}</TableCell>
                      <TableCell>
                        <Badge variant={variant.in_stock ? 'default' : 'secondary'}>
                          {variant.in_stock ? 'Auf Lager' : 'Ausverkauft'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
