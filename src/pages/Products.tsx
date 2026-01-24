import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, ShoppingCart, Loader2, Sparkles, Star, Grid3X3, LayoutList } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/hooks/useFavorites';
import { ProductFilters, FilterState } from '@/components/products/ProductFilters';
import { toast } from 'sonner';

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
  gender: string | null;
  seasons: string[] | null;
  occasions: string[] | null;
  categories: { name: string; slug: string } | null;
  product_variants: ProductVariant[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  const variant = product.product_variants?.[0];
  const price = variant?.price || product.base_price;
  const originalPrice = variant?.original_price || product.original_price;
  const inStock = variant?.in_stock ?? true;
  const image = variant?.image || product.image_url || '/placeholder.svg';
  const productIsFavorite = isFavorite(product.id);

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock || isAddingToCart) return;
    
    setIsAddingToCart(true);
    try {
      await addItem({
        variantId: variant?.id || product.id,
        productId: product.id,
        productName: product.name,
        variantSize: variant?.size || '50ml',
        price: price,
        quantity: 1,
        image: image,
      });
      toast.success('Zum Warenkorb hinzugefügt');
    } catch (error) {
      toast.error('Fehler beim Hinzufügen');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  return (
    <Card className="group glass-card transition-all duration-200 overflow-hidden hover:shadow-glow">
      <CardContent className="p-0">
        <div className="relative">
          <Link to={`/product/${product.slug}`}>
            <img
              src={image}
              alt={product.name}
              className="w-full h-40 sm:h-52 object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </Link>

          <Button
            size="icon"
            variant="secondary"
            className={`absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity ${
              productIsFavorite ? 'opacity-100 bg-primary text-primary-foreground' : ''
            }`}
            onClick={handleToggleFavorite}
          >
            <Heart className={`w-4 h-4 ${productIsFavorite ? 'fill-current' : ''}`} />
          </Button>

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
              disabled={!inStock || isAddingToCart}
            >
              {isAddingToCart ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShoppingCart className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Initialize filters from URL
  const [filters, setFilters] = useState<FilterState>(() => ({
    categories: searchParams.get('category')?.split(',').filter(Boolean) || [],
    priceRange: [
      Number(searchParams.get('minPrice')) || 0,
      Number(searchParams.get('maxPrice')) || 200,
    ] as [number, number],
    genders: searchParams.get('gender')?.split(',').filter(Boolean) || [],
    seasons: searchParams.get('season')?.split(',').filter(Boolean) || [],
    occasions: searchParams.get('occasion')?.split(',').filter(Boolean) || [],
  }));

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.categories.length) params.set('category', filters.categories.join(','));
    if (filters.genders.length) params.set('gender', filters.genders.join(','));
    if (filters.seasons.length) params.set('season', filters.seasons.join(','));
    if (filters.occasions.length) params.set('occasion', filters.occasions.join(','));
    if (filters.priceRange[0] > 0) params.set('minPrice', filters.priceRange[0].toString());
    if (filters.priceRange[1] < 200) params.set('maxPrice', filters.priceRange[1].toString());
    
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  // Load categories
  useEffect(() => {
    async function loadCategories() {
      const { data } = await supabase.from('categories').select('*').order('name');
      if (data) setCategories(data);
    }
    loadCategories();
  }, []);

  // Load products
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (name, slug),
          product_variants (*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by category
    if (filters.categories.length > 0) {
      result = result.filter((p) => 
        p.categories && filters.categories.includes(p.categories.slug)
      );
    }

    // Filter by price
    result = result.filter((p) => {
      const price = p.product_variants?.[0]?.price || p.base_price;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    // Filter by gender
    if (filters.genders.length > 0) {
      result = result.filter((p) => 
        p.gender && filters.genders.includes(p.gender.toLowerCase())
      );
    }

    // Filter by seasons
    if (filters.seasons.length > 0) {
      result = result.filter((p) => 
        p.seasons && p.seasons.some((s) => filters.seasons.includes(s))
      );
    }

    // Filter by occasions
    if (filters.occasions.length > 0) {
      result = result.filter((p) => 
        p.occasions && p.occasions.some((o) => filters.occasions.includes(o))
      );
    }

    // Sort
    result.sort((a, b) => {
      const priceA = a.product_variants?.[0]?.price || a.base_price;
      const priceB = b.product_variants?.[0]?.price || b.base_price;
      
      switch (sortBy) {
        case 'price-low':
          return priceA - priceB;
        case 'price-high':
          return priceB - priceA;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [products, filters, sortBy]);

  const maxPrice = useMemo(() => {
    if (products.length === 0) return 200;
    return Math.max(...products.map((p) => p.product_variants?.[0]?.price || p.base_price));
  }, [products]);

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Navigation />

      <main>
        {/* Hero */}
        <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-12 sm:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-3">
                ALDENAIR Parfüm-Kollektion
              </h1>
              <p className="text-base sm:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-4">
                Entdecke unsere komplette Parfüm-Kollektion mit Premium-Düften
              </p>
              <p className="text-sm sm:text-lg text-primary-foreground/90">
                {filteredProducts.length} Produkte gefunden
              </p>
            </div>
          </div>
        </section>

        <section className="py-8 sm:py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filters Sidebar */}
              <div className="lg:w-64 flex-shrink-0">
                <ProductFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  categories={categories}
                  maxPrice={maxPrice}
                />
              </div>

              {/* Products Grid */}
              <div className="flex-1">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <p className="text-sm text-muted-foreground">
                    {filteredProducts.length} Produkte
                  </p>

                  <div className="flex items-center gap-2">
                    {/* View Mode Toggle */}
                    <div className="hidden sm:flex border rounded-lg overflow-hidden">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="rounded-none"
                      >
                        <Grid3X3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="rounded-none"
                      >
                        <LayoutList className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Sort Dropdown */}
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sortieren" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name A-Z</SelectItem>
                        <SelectItem value="price-low">Preis aufsteigend</SelectItem>
                        <SelectItem value="price-high">Preis absteigend</SelectItem>
                        <SelectItem value="rating">Bewertung</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Products */}
                {loading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="space-y-3">
                        <Skeleton className="aspect-square w-full rounded-xl" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-lg text-muted-foreground mb-4">
                      Keine Produkte gefunden
                    </p>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setFilters({
                          categories: [],
                          priceRange: [0, maxPrice],
                          genders: [],
                          seasons: [],
                          occasions: [],
                        })
                      }
                    >
                      Filter zurücksetzen
                    </Button>
                  </div>
                ) : (
                  <div
                    className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6'
                        : 'space-y-4'
                    }
                  >
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
