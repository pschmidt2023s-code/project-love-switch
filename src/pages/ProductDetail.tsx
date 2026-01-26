import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Truck, Shield, Plus, Minus, Star, RotateCcw, Sparkles, Leaf } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useProduct } from '@/hooks/useProducts';
import { PremiumPageLayout } from '@/components/premium/PremiumPageLayout';
import { ProductReviews } from '@/components/products/ProductReviews';
import { SubscriptionCard } from '@/components/subscription/SubscriptionCard';
import { ProductRecommendations } from '@/components/ai/ProductRecommendations';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Seo } from '@/components/Seo';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { product, variants, loading, error } = useProduct(slug || '');
  const { addItem } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Set default variant when variants load
  useEffect(() => {
    if (variants.length > 0 && !selectedVariantId) {
      setSelectedVariantId(variants[0].id);
    }
  }, [variants, selectedVariantId]);

  const selectedVariant = variants.find(v => v.id === selectedVariantId) || variants[0];

  const handleAddToCart = async () => {
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

  if (error || !product) {
    return (
      <PremiumPageLayout>
        <div className="container-premium py-16 text-center">
          <h1 className="text-2xl font-display text-foreground mb-4">Produkt nicht gefunden</h1>
          <Link to="/products" className="text-accent hover:underline">
            Zurück zur Kollektion
          </Link>
        </div>
      </PremiumPageLayout>
    );
  }

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

      <div className="container-premium py-8 lg:py-12">
        {/* Breadcrumb */}
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
            
            {/* Wishlist Button */}
            <button
              className="absolute top-4 right-4 w-10 h-10 bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
              aria-label="Zu Favoriten hinzufügen"
            >
              <Heart className="w-5 h-5" strokeWidth={1.5} />
            </button>

            {/* Badges */}
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
            {/* Brand & Category */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-[0.2em] uppercase text-accent font-medium">
                ALDENAIR
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                {(product as any).categories?.name || 'Parfüm'}
              </span>
            </div>

            {/* Name */}
            <h1 className="font-display text-3xl lg:text-4xl text-foreground">
              {product.name}
            </h1>

            {/* Inspired By */}
            {product.inspired_by && (
              <div className="flex items-center gap-2 px-4 py-3 bg-accent/10 border border-accent/20">
                <Sparkles className="w-4 h-4 text-accent" strokeWidth={1.5} />
                <span className="text-sm">
                  <span className="text-muted-foreground">Inspiriert von</span>{' '}
                  <span className="font-medium text-foreground">{product.inspired_by}</span>
                </span>
              </div>
            )}

            {/* Rating */}
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

            {/* Price */}
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

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* Variant Selection */}
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

            {/* Quantity */}
            <div>
              <label className="block text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-3">
                Menge
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                  >
                    <Minus className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                  <span className="w-12 text-center text-sm font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                  >
                    <Plus className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
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

            {/* Notes */}
            {(product.top_notes?.length || product.middle_notes?.length || product.base_notes?.length) && (
              <div className="pt-6 border-t border-border">
                <h3 className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-4 flex items-center gap-2">
                  <Leaf className="w-4 h-4" strokeWidth={1.5} />
                  Duftnoten
                </h3>
                <div className="space-y-4">
                  {product.top_notes && product.top_notes.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Kopfnote</p>
                      <div className="flex flex-wrap gap-2">
                        {product.top_notes.map((note) => (
                          <span key={note} className="px-3 py-1.5 bg-secondary text-sm">
                            {note}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {product.middle_notes && product.middle_notes.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Herznote</p>
                      <div className="flex flex-wrap gap-2">
                        {product.middle_notes.map((note) => (
                          <span key={note} className="px-3 py-1.5 bg-secondary text-sm">
                            {note}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {product.base_notes && product.base_notes.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Basisnote</p>
                      <div className="flex flex-wrap gap-2">
                        {product.base_notes.map((note) => (
                          <span key={note} className="px-3 py-1.5 bg-secondary text-sm">
                            {note}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subscription Option */}
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

      {/* Reviews Section */}
      <ProductReviews 
        productId={product.id}
        productName={product.name}
        averageRating={rating || 4.5}
        reviewCount={product.review_count || 0}
      />

      {/* AI Recommendations */}
      <section className="py-8 lg:py-12 border-t border-border">
        <div className="container-premium">
          <ProductRecommendations />
        </div>
      </section>
    </PremiumPageLayout>
  );
}
