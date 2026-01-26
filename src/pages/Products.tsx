import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Filter, Grid, List, X, Heart, ShoppingBag, Star, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/hooks/useFavorites';
import { PremiumPageLayout } from '@/components/premium/PremiumPageLayout';
import { Seo } from '@/components/Seo';
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

function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const variant = product.product_variants?.[0];
  const price = variant?.price || product.base_price;
  const originalPrice = variant?.original_price || product.original_price;
  const inStock = variant?.in_stock ?? true;
  const image = variant?.image || product.image_url || 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=500&fit=crop';
  const productIsFavorite = isFavorite(product.id);

  const discount = originalPrice && originalPrice > price
    ? Math.round((1 - price / Number(originalPrice)) * 100)
    : 0;

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
    <article 
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <Link to={`/products/${product.slug}`} className="block relative aspect-[3/4] overflow-hidden bg-sand dark:bg-muted mb-4">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        
        <img
          src={image}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
            isHovered ? 'scale-105' : 'scale-100'
          } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />

        {/* Overlay Actions */}
        <div 
          className={`absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-foreground/80 to-transparent transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex gap-2">
            <button
              onClick={handleQuickAdd}
              disabled={!inStock || isAddingToCart}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-background text-foreground text-[10px] tracking-[0.1em] uppercase font-medium hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
            >
              {isAddingToCart ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Hinzufügen
                </>
              )}
            </button>
            <button
              onClick={handleToggleFavorite}
              className={`flex items-center justify-center w-12 transition-colors ${
                productIsFavorite 
                  ? 'bg-accent text-accent-foreground' 
                  : 'bg-background text-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
              aria-label="Zu Favoriten hinzufügen"
            >
              <Heart className={`w-4 h-4 ${productIsFavorite ? 'fill-current' : ''}`} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discount > 0 && (
            <span className="px-2 py-1 bg-destructive text-destructive-foreground text-[9px] tracking-[0.05em] uppercase font-medium">
              -{discount}%
            </span>
          )}
          {!inStock && (
            <span className="px-2 py-1 bg-muted text-muted-foreground text-[9px] tracking-[0.05em] uppercase font-medium">
              Ausverkauft
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="space-y-2">
        <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
          {product.categories?.name || 'Parfüm'}
        </p>

        <Link to={`/products/${product.slug}`}>
          <h3 className="font-display text-lg text-foreground hover:text-accent transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {product.inspired_by && (
          <p className="text-xs text-muted-foreground italic line-clamp-1">
            Inspiriert von {product.inspired_by}
          </p>
        )}

        {product.rating && Number(product.rating) > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${i < Math.floor(Number(product.rating)) ? 'fill-accent text-accent' : 'text-muted'}`}
                />
              ))}
            </div>
            {product.review_count && product.review_count > 0 && (
              <span className="text-[10px] text-muted-foreground">
                ({product.review_count})
              </span>
            )}
          </div>
        )}

        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-lg font-medium text-foreground">
            {price.toFixed(2).replace('.', ',')} €
          </span>
          {originalPrice && Number(originalPrice) > price && (
            <span className="text-sm text-muted-foreground line-through">
              {Number(originalPrice).toFixed(2).replace('.', ',')} €
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filter states from URL
  const [selectedGender, setSelectedGender] = useState(searchParams.get('gender') || '');
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(searchParams.get('minPrice')) || 0,
    Number(searchParams.get('maxPrice')) || 200,
  ]);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'name');

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedGender) params.set('gender', selectedGender);
    if (priceRange[0] > 0) params.set('minPrice', priceRange[0].toString());
    if (priceRange[1] < 200) params.set('maxPrice', priceRange[1].toString());
    if (sortBy !== 'name') params.set('sort', sortBy);
    setSearchParams(params, { replace: true });
  }, [selectedGender, priceRange, sortBy, setSearchParams]);

  // Load products
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select(`*, categories (name, slug), product_variants (*)`)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by gender
    if (selectedGender) {
      result = result.filter((p) => p.gender?.toLowerCase() === selectedGender.toLowerCase());
    }

    // Filter by price
    result = result.filter((p) => {
      const price = p.product_variants?.[0]?.price || p.base_price;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sort
    result.sort((a, b) => {
      const priceA = a.product_variants?.[0]?.price || a.base_price;
      const priceB = b.product_variants?.[0]?.price || b.base_price;
      
      switch (sortBy) {
        case 'price-asc':
          return priceA - priceB;
        case 'price-desc':
          return priceB - priceA;
        case 'rating':
          return (Number(b.rating) || 0) - (Number(a.rating) || 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [products, selectedGender, priceRange, sortBy]);

  const clearFilters = () => {
    setSelectedGender('');
    setPriceRange([0, 200]);
    setSortBy('name');
    setSearchParams({});
  };

  const hasActiveFilters = selectedGender || priceRange[0] > 0 || priceRange[1] < 200 || sortBy !== 'name';

  return (
    <PremiumPageLayout>
      <Seo
        title="Kollektion | ALDENAIR"
        description="Entdecke unsere exklusive Kollektion hochwertiger Parfüms. Premium-Düfte inspiriert von weltbekannten Luxusmarken."
        canonicalPath="/products"
      />

      {/* Page Header */}
      <section className="border-b border-border">
        <div className="container-premium py-12 lg:py-16">
          <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-4">
            Entdecken
          </span>
          <h1 className="font-display text-4xl lg:text-5xl text-foreground mb-4">
            Unsere Kollektion
          </h1>
          <p className="text-muted-foreground max-w-lg">
            Premium-Düfte inspiriert von weltbekannten Luxusmarken, 
            gefertigt mit höchsten Qualitätsansprüchen.
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="border-b border-border sticky top-[88px] bg-background z-30">
        <div className="container-premium">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-sm text-foreground hover:text-muted-foreground transition-colors"
              >
                <Filter className="w-4 h-4" strokeWidth={1.5} />
                <span className="hidden sm:inline">Filter</span>
                {hasActiveFilters && <span className="w-2 h-2 bg-accent" />}
              </button>
              <span className="text-sm text-muted-foreground">
                {filteredProducts.length} Produkte
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground hidden sm:inline">Sortieren:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm bg-transparent border-none focus:outline-none cursor-pointer text-foreground"
                >
                  <option value="name">Name</option>
                  <option value="price-asc">Preis: Niedrig → Hoch</option>
                  <option value="price-desc">Preis: Hoch → Niedrig</option>
                  <option value="rating">Bewertung</option>
                </select>
              </div>

              <div className="hidden sm:flex items-center border-l border-border pl-4">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 ${viewMode === 'grid' ? 'text-foreground' : 'text-muted-foreground'}`}
                >
                  <Grid className="w-4 h-4" strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 ${viewMode === 'list' ? 'text-foreground' : 'text-muted-foreground'}`}
                >
                  <List className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Panel */}
      {showFilters && (
        <section className="border-b border-border bg-secondary/50 animate-fade-in">
          <div className="container-premium py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-3">
                  Kategorie
                </label>
                <div className="space-y-2">
                  {['', 'herren', 'damen', 'unisex'].map((gender) => (
                    <button
                      key={gender}
                      onClick={() => setSelectedGender(gender)}
                      className={`block w-full text-left py-2 px-3 text-sm transition-colors ${
                        selectedGender === gender
                          ? 'bg-foreground text-background'
                          : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      {gender === '' ? 'Alle' : gender.charAt(0).toUpperCase() + gender.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-3">
                  Preisbereich
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="w-20 px-2 py-2 text-sm bg-background border border-border focus:outline-none focus:border-accent"
                    placeholder="Min"
                  />
                  <span className="text-muted-foreground">—</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-20 px-2 py-2 text-sm bg-background border border-border focus:outline-none focus:border-accent"
                    placeholder="Max"
                  />
                </div>
              </div>

              {hasActiveFilters && (
                <div className="col-span-2 md:col-span-1 flex items-end">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" strokeWidth={1.5} />
                    Filter zurücksetzen
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Products Grid */}
      <section className="section-spacing">
        <div className="container-premium">
          {loading ? (
            <div className={`grid gap-6 lg:gap-8 ${
              viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'
            }`}>
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-[3/4] bg-muted animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-3 w-16 bg-muted animate-pulse" />
                    <div className="h-5 w-3/4 bg-muted animate-pulse" />
                    <div className="h-4 w-1/2 bg-muted animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground mb-4">Keine Produkte gefunden</p>
              <button onClick={clearFilters} className="text-sm text-accent hover:underline">
                Filter zurücksetzen
              </button>
            </div>
          ) : (
            <div className={`grid gap-6 lg:gap-8 ${
              viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'
            }`}>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </PremiumPageLayout>
  );
}
