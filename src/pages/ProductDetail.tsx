import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingBag, Truck, Shield, Plus, Minus, Star, RotateCcw, Sparkles, Leaf, ArrowLeft } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useProduct } from '@/hooks/useProducts';
import { useExternalProduct } from '@/hooks/useExternalProducts';
import { PremiumPageLayout } from '@/components/premium/PremiumPageLayout';
import { ProductReviews } from '@/components/products/ProductReviews';
import { SubscriptionCard } from '@/components/subscription/SubscriptionCard';
import { ProductRecommendations } from '@/components/ai/ProductRecommendations';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Seo } from '@/components/Seo';
import { ProductSchema, BreadcrumbSchema } from '@/components/seo';
import { ScentNotesVisualization } from '@/components/features/ScentNotesVisualization';
import { SocialShare } from '@/components/SocialShare';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { product: localProduct, variants, loading: localLoading, error: localError } = useProduct(slug || '');
  const { product: externalProduct, loading: extLoading, error: extError } = useExternalProduct(slug);
  const { addItem } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Determine data source
  const isExternal = !localProduct && !!externalProduct;
  const loading = localLoading && extLoading;
  const product = localProduct || null;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug]);

  useEffect(() => {
    if (variants.length > 0 && !selectedVariantId) {
      setSelectedVariantId(variants[0].id);
    }
  }, [variants, selectedVariantId]);

  const selectedVariant = variants.find(v => v.id === selectedVariantId) || variants[0];

  const handleAddToCart = async () => {
    if (isExternal && externalProduct) {
      await addItem({
        variantId: externalProduct.id,
        productId: externalProduct.id,
        productName: externalProduct.name,
        variantSize: '50ml',
        price: externalProduct.price,
        quantity,
        image: externalProduct.image_url || '',
      });
      toast.success('In den Warenkorb gelegt');
      return;
    }

    if (!selectedVariant || !product) return;
    await addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      productName: product.name,
      variantSize: selectedVariant.size,
      price: Number(selectedVariant.price),
      quantity,
      image: product.image_url || '',
    });
    toast.success('In den Warenkorb gelegt');
  };

  if (loading) {
    return (
      <PremiumPageLayout>
        <div className="container-premium py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-[3/4] bg-muted animate-pulse" />
            <div className="space-y-6">
              <div className="h-4 w-24 bg-muted animate-pulse" />
              <div className="h-10 w-3/4 bg-muted animate-pulse" />
              <div className="h-20 w-full bg-muted animate-pulse" />
              <div className="h-8 w-32 bg-muted animate-pulse" />
            </div>
          </div>
        </div>
      </PremiumPageLayout>
    );
  }

  // External product detail view
  if (isExternal && externalProduct) {
    const inStock = externalProduct.stock > 0;
    const ingredientsList = externalProduct.ingredients
      ? externalProduct.ingredients.split(',').map(s => s.trim())
      : [];

    return (
      <PremiumPageLayout>
        <Seo
          title={`${externalProduct.name} | ALDENAIR`}
          description={externalProduct.description || `Entdecke ${externalProduct.name} - Premium Parfüm von ALDENAIR`}
          canonicalPath={`/products/${slug}`}
        />

        <div className="container-premium py-8 lg:py-12">
          <Breadcrumb
            items={[
              { label: 'Kollektion', path: '/products' },
              { label: externalProduct.name }
            ]}
            className="mb-8"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Product Image */}
            <div className="relative">
              <div className="aspect-[3/4] bg-sand dark:bg-muted overflow-hidden">
                <img
                  src={externalProduct.image_url || 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=1000&fit=crop'}
                  alt={externalProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <button
                className="absolute top-4 right-4 w-10 h-10 bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                aria-label="Zu Favoriten hinzufügen"
              >
                <Heart className="w-5 h-5" strokeWidth={1.5} />
              </button>

              {!inStock && (
                <div className="absolute top-4 left-4">
                  <span className="px-2 py-1 bg-muted text-muted-foreground text-[10px] tracking-[0.1em] uppercase font-medium">
                    Ausverkauft
                  </span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <span className="text-[10px] tracking-[0.2em] uppercase text-accent font-medium">
                  ALDENAIR
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                  {externalProduct.category || 'Parfüm'}
                </span>
              </div>

              <h1 className="font-display text-3xl lg:text-4xl text-foreground">
                {externalProduct.name}
              </h1>

              {externalProduct.similar_to && (
                <div className="flex items-center gap-2 px-4 py-3 bg-accent/10 border border-accent/20">
                  <Sparkles className="w-4 h-4 text-accent" strokeWidth={1.5} />
                  <span className="text-sm">
                    <span className="text-muted-foreground">Inspiriert von</span>{' '}
                    <span className="font-medium text-foreground">{externalProduct.similar_to}</span>
                  </span>
                </div>
              )}

              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-display text-foreground">
                  €{externalProduct.price.toFixed(2)}
                </span>
              </div>

              <div className="h-px bg-border" />

              {/* Stock Info */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 ${inStock ? 'bg-green-500' : 'bg-destructive'}`} />
                <span className="text-sm text-muted-foreground">
                  {inStock ? `${externalProduct.stock} auf Lager` : 'Nicht verfügbar'}
                </span>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-3">
                  Menge
                </label>
                <div className="flex items-center border border-border w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                  >
                    <Minus className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                  <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(externalProduct.stock, quantity + 1))}
                    className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                  >
                    <Plus className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* Add to Cart */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className="flex-1 py-4 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
                  {inStock ? 'In den Warenkorb' : 'Nicht verfügbar'}
                </button>
                <button
                  className="w-14 flex items-center justify-center border border-border hover:bg-muted transition-colors"
                  aria-label="Zu Favoriten hinzufügen"
                >
                  <Heart className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>

              {/* Social Share */}
              <div className="pt-2">
                <SocialShare
                  url={window.location.href}
                  title={externalProduct.name}
                  description={externalProduct.description || ''}
                />
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center py-4 border border-border">
                  <Truck className="w-5 h-5 text-accent mx-auto mb-2" strokeWidth={1.5} />
                  <span className="text-[10px] text-muted-foreground block">Gratis ab 50€</span>
                </div>
                <div className="text-center py-4 border border-border">
                  <Shield className="w-5 h-5 text-accent mx-auto mb-2" strokeWidth={1.5} />
                  <span className="text-[10px] text-muted-foreground block">Sichere Zahlung</span>
                </div>
                <div className="text-center py-4 border border-border">
                  <RotateCcw className="w-5 h-5 text-accent mx-auto mb-2" strokeWidth={1.5} />
                  <span className="text-[10px] text-muted-foreground block">14 Tage Rückgabe</span>
                </div>
              </div>

              {/* Description */}
              {externalProduct.description && (
                <div className="pt-6 border-t border-border">
                  <h3 className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-4">
                    Beschreibung
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {externalProduct.description}
                  </p>
                </div>
              )}

              {/* Ingredients */}
              {ingredientsList.length > 0 && (
                <div className="pt-6 border-t border-border">
                  <h3 className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-4 flex items-center gap-2">
                    <Leaf className="w-4 h-4" strokeWidth={1.5} />
                    Inhaltsstoffe
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {ingredientsList.map((ingredient, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-muted text-muted-foreground text-xs"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </PremiumPageLayout>
    );
  }

  // Not found
  if (localError || !product) {
    return (
      <PremiumPageLayout>
        <div className="container-premium py-24 text-center">
          <div className="max-w-md mx-auto space-y-6">
            <div className="w-16 h-16 mx-auto bg-muted flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-muted-foreground" strokeWidth={1} />
            </div>
            <h1 className="font-display text-2xl text-foreground">
              Produkt nicht gefunden
            </h1>
            <p className="text-sm text-muted-foreground">
              Das gewünschte Produkt ist leider nicht verfügbar.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
              Zur Kollektion
            </Link>
          </div>
        </div>
      </PremiumPageLayout>
    );
  }

  // Local product detail (existing logic)
  const discount = selectedVariant?.original_price
    ? Math.round((1 - Number(selectedVariant.price) / Number(selectedVariant.original_price)) * 100)
    : 0;
  const rating = product.rating ? Number(product.rating) : null;
  const inStock = selectedVariant?.stock === null || (selectedVariant?.stock ?? 0) > 0;

  return (
    <PremiumPageLayout>
      <Seo
        title={`${product.name} | ALDENAIR`}
        description={product.description || `Entdecke ${product.name} - Premium Parfüm von ALDENAIR`}
        canonicalPath={`/products/${slug}`}
      />
      <ProductSchema
        product={{
          name: product.name,
          description: product.description || `Premium Parfüm ${product.name} von ALDENAIR`,
          image: product.image_url || 'https://aldenairperfumes.de/images/aldenair-prestige.png',
          price: selectedVariant ? Number(selectedVariant.price) : Number(product.base_price),
          originalPrice: selectedVariant?.original_price ? Number(selectedVariant.original_price) : undefined,
          currency: 'EUR',
          sku: selectedVariant?.sku || product.id,
          brand: 'ALDENAIR',
          availability: inStock ? 'InStock' : 'OutOfStock',
          rating: rating || undefined,
          reviewCount: product.review_count || undefined,
          url: `https://aldenairperfumes.de/products/${slug}`
        }}
      />
      <BreadcrumbSchema
        items={[
          { name: 'Startseite', url: 'https://aldenairperfumes.de' },
          { name: 'Kollektion', url: 'https://aldenairperfumes.de/products' },
          { name: product.name, url: `https://aldenairperfumes.de/products/${slug}` }
        ]}
      />

      <div className="container-premium py-8 lg:py-12">
        <Breadcrumb
          items={[
            { label: 'Kollektion', path: '/products' },
            { label: product.name }
          ]}
          className="mb-8"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Product Image */}
          <div className="relative">
            <div className="aspect-[3/4] bg-sand dark:bg-muted overflow-hidden">
              <img
                src={product.image_url || 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=1000&fit=crop'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <button
              className="absolute top-4 right-4 w-10 h-10 bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
              aria-label="Zu Favoriten hinzufügen"
            >
              <Heart className="w-5 h-5" strokeWidth={1.5} />
            </button>

            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {discount > 0 && (
                <span className="px-2 py-1 bg-destructive text-destructive-foreground text-[10px] tracking-[0.1em] uppercase font-medium">
                  -{discount}% Sale
                </span>
              )}
              {!inStock && (
                <span className="px-2 py-1 bg-muted text-muted-foreground text-[10px] tracking-[0.1em] uppercase font-medium">
                  Ausverkauft
                </span>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-[0.2em] uppercase text-accent font-medium">
                ALDENAIR
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                {(product as any).categories?.name || 'Parfüm'}
              </span>
            </div>

            <h1 className="font-display text-3xl lg:text-4xl text-foreground">
              {product.name}
            </h1>

            {product.inspired_by && (
              <div className="flex items-center gap-2 px-4 py-3 bg-accent/10 border border-accent/20">
                <Sparkles className="w-4 h-4 text-accent" strokeWidth={1.5} />
                <span className="text-sm">
                  <span className="text-muted-foreground">Inspiriert von</span>{' '}
                  <span className="font-medium text-foreground">{product.inspired_by}</span>
                </span>
              </div>
            )}

            {rating && rating > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-accent text-accent' : 'text-muted'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {rating.toFixed(1)} ({product.review_count || 0} Bewertungen)
                </span>
              </div>
            )}

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-display text-foreground">
                €{selectedVariant ? Number(selectedVariant.price).toFixed(2) : '0.00'}
              </span>
              {selectedVariant?.original_price && (
                <span className="text-lg text-muted-foreground line-through">
                  €{Number(selectedVariant.original_price).toFixed(2)}
                </span>
              )}
            </div>

            <div className="h-px bg-border" />

            {variants.length > 1 && (
              <div>
                <label className="block text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-3">
                  Größe wählen
                </label>
                <div className="flex flex-wrap gap-2">
                  {variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariantId(variant.id)}
                      disabled={variant.stock !== null && variant.stock <= 0}
                      className={`px-4 py-2.5 text-sm transition-colors ${
                        selectedVariant?.id === variant.id
                          ? 'bg-foreground text-background'
                          : (variant.stock === null || variant.stock > 0)
                          ? 'border border-border text-foreground hover:border-foreground'
                          : 'border border-border text-muted-foreground opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {variant.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-3">
                Menge
              </label>
              <div className="flex items-center border border-border w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                >
                  <Minus className="w-4 h-4" strokeWidth={1.5} />
                </button>
                <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                >
                  <Plus className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className="flex-1 py-4 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
                {inStock ? 'In den Warenkorb' : 'Nicht verfügbar'}
              </button>
              <button
                className="w-14 flex items-center justify-center border border-border hover:bg-muted transition-colors"
                aria-label="Zu Favoriten hinzufügen"
              >
                <Heart className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Social Share */}
            <div className="pt-2">
              <SocialShare
                url={window.location.href}
                title={product.name}
                description={product.description || ''}
              />
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center py-4 border border-border">
                <Truck className="w-5 h-5 text-accent mx-auto mb-2" strokeWidth={1.5} />
                <span className="text-[10px] text-muted-foreground block">Gratis ab 50€</span>
              </div>
              <div className="text-center py-4 border border-border">
                <Shield className="w-5 h-5 text-accent mx-auto mb-2" strokeWidth={1.5} />
                <span className="text-[10px] text-muted-foreground block">Sichere Zahlung</span>
              </div>
              <div className="text-center py-4 border border-border">
                <RotateCcw className="w-5 h-5 text-accent mx-auto mb-2" strokeWidth={1.5} />
                <span className="text-[10px] text-muted-foreground block">14 Tage Rückgabe</span>
              </div>
            </div>

            {(product.ai_description || product.description) && (
              <div className="pt-6 border-t border-border">
                <h3 className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-4">
                  Beschreibung
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.ai_description || product.description}
                </p>
              </div>
            )}

            {(product.top_notes?.length || product.middle_notes?.length || product.base_notes?.length) && (
              <div className="pt-6 border-t border-border">
                <h3 className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-6 flex items-center gap-2">
                  <Leaf className="w-4 h-4" strokeWidth={1.5} />
                  Duftpyramide
                </h3>
                <ScentNotesVisualization
                  topNotes={product.top_notes || []}
                  middleNotes={product.middle_notes || []}
                  baseNotes={product.base_notes || []}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedVariant && (
        <section className="py-8 lg:py-12 border-t border-border">
          <div className="container-premium">
            <div className="text-center mb-8">
              <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-2">
                Spar-Abo
              </span>
              <h2 className="font-display text-2xl lg:text-3xl text-foreground mb-2">
                Regelmäßig liefern lassen
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Spare bis zu 15% mit unserem flexiblen Abo-Modell
              </p>
            </div>
            <div className="max-w-2xl mx-auto">
              <SubscriptionCard
                productId={product.id}
                variantId={selectedVariant.id}
                productName={product.name}
                basePrice={Number(selectedVariant.price)}
              />
            </div>
          </div>
        </section>
      )}

      <ProductReviews
        productId={product.id}
        productName={product.name}
        averageRating={rating || 4.5}
        reviewCount={product.review_count || 0}
      />

      <section className="py-8 lg:py-12 border-t border-border">
        <div className="container-premium">
          <ProductRecommendations />
        </div>
      </section>
    </PremiumPageLayout>
  );
}
