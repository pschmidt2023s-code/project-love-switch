import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, ShoppingCart, Loader2, Filter, Sparkles, Star } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';

interface ProductVariant {
  id: string;
  name: string | null;
  price: number;
  original_price: number | null;
  in_stock: boolean | null;
  size: string;
  image: string | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  base_price: number;
  original_price: number | null;
  rating: number | null;
  review_count: number | null;
  inspired_by: string | null;
  categories: { name: string; slug: string } | null;
  product_variants: ProductVariant[];
}

function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const variant = product.product_variants?.[0];
  const price = variant?.price || product.base_price;
  const originalPrice = variant?.original_price || product.original_price;
  const inStock = variant?.in_stock ?? true;
  const image = variant?.image || product.image_url || '/placeholder.svg';

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    
    await addItem({
      variantId: variant?.id || product.id,
      productId: product.id,
      productName: product.name,
      variantSize: variant?.size || '50ml',
      price: price,
      quantity: 1,
      image: image,
    });
  };

  return (
    <Card className="group glass-card transition-shadow duration-200 overflow-hidden hover:shadow-glow">
      <CardContent className="p-0">
        <div className="relative">
          <Link to={`/product/${product.slug}`}>
            <img
              src={image}
              alt={product.name}
              className="w-full h-40 sm:h-52 object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button size="icon" variant="secondary" className="h-8 w-8">
              <Heart className="w-4 h-4" />
            </Button>
          </div>

          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {inStock ? (
              <Badge variant="secondary" className="text-xs">Auf Lager</Badge>
            ) : (
              <Badge variant="destructive" className="text-xs">Ausverkauft</Badge>
            )}
            {product.inspired_by && (
              <Badge variant="outline" className="text-xs bg-background/80 backdrop-blur-sm">
                <Sparkles className="w-3 h-3 mr-1" />
                Inspiriert
              </Badge>
            )}
          </div>
        </div>

        <div className="p-3 sm:p-4">
          <Link to={`/product/${product.slug}`} className="block">
            <h3 className="font-semibold text-sm sm:text-base mb-1 group-hover:text-primary transition-colors line-clamp-1">
              {product.name}
            </h3>

            {product.inspired_by && (
              <p className="text-xs text-muted-foreground mb-1 line-clamp-1">
                Inspiriert von {product.inspired_by}
              </p>
            )}

            <p className="text-xs text-muted-foreground mb-2">
              {variant?.size || '50ml'}
            </p>

            {product.rating && product.rating > 0 && (
              <div className="flex items-center gap-1 mb-2">
                <Star className="w-3 h-3 fill-primary text-primary" />
                <span className="text-xs text-muted-foreground">
                  {Number(product.rating).toFixed(1)} ({product.review_count || 0})
                </span>
              </div>
            )}

            <div className="flex items-center justify-between mb-3 gap-2">
              <span className="text-base sm:text-lg font-bold text-primary">
                {price.toFixed(2).replace('.', ',')} €
              </span>
              {originalPrice && originalPrice > price && (
                <span className="text-xs text-muted-foreground line-through">
                  {Number(originalPrice).toFixed(2).replace('.', ',')} €
                </span>
              )}
            </div>
          </Link>

          <div className="flex gap-2">
            <Button className="flex-1 text-xs sm:text-sm" variant="outline" size="sm" asChild>
              <Link to={`/product/${product.slug}`}>Ansehen</Link>
            </Button>
            <Button
              size="icon"
              variant="default"
              onClick={handleQuickAdd}
              disabled={!inStock}
            >
              <ShoppingCart className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Products() {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const [sortBy, setSortBy] = useState('name');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, [categoryFilter]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('products')
        .select(`
          *,
          categories (name, slug),
          product_variants (*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (categoryFilter) {
        const { data: category } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', categoryFilter)
          .maybeSingle();
        
        if (category) {
          query = query.eq('category_id', category.id);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryTitle = () => {
    switch (categoryFilter) {
      case '50ml':
        return { title: 'ALDENAIR Prestige Edition', description: 'Exklusive 50ml Parfüm-Flakons der Premium-Kollektion' };
      case 'proben':
        return { title: 'ALDENAIR Proben Kollektion', description: 'Entdecke alle Düfte in praktischen 5ml Proben' };
      case 'testerkits':
        return { title: 'ALDENAIR Testerkits', description: 'Komplette Sets zum Kennenlernen' };
      default:
        return { title: 'ALDENAIR Parfüm-Kollektion', description: 'Entdecke unsere komplette Parfüm-Kollektion' };
    }
  };

  const { title: pageTitle, description: pageDescription } = getCategoryTitle();

  const sortedProducts = [...products].sort((a, b) => {
    const priceA = a.product_variants?.[0]?.price || a.base_price;
    const priceB = b.product_variants?.[0]?.price || b.base_price;
    
    switch (sortBy) {
      case 'price-low':
        return priceA - priceB;
      case 'price-high':
        return priceB - priceA;
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Navigation />

      <main>
        <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-12 sm:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="animate-slide-up">
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-3">
                  {pageTitle}
                </h1>
                <p className="text-base sm:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-4">
                  {pageDescription}
                </p>
                <p className="text-sm sm:text-lg text-primary-foreground/90">
                  {products.length} Produkte verfügbar
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-8 sm:py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{products.length} Produkte</span>
                </div>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sortieren" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="price-low">Preis aufsteigend</SelectItem>
                    <SelectItem value="price-high">Preis absteigend</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : sortedProducts.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-lg text-muted-foreground">Keine Produkte gefunden</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                  {sortedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
