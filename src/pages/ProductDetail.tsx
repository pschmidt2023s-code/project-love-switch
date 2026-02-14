import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingBag, Truck, Shield, Plus, Minus, Star, RotateCcw, Sparkles, Leaf, ArrowLeft, Clock, Wind, Droplet, Anchor } from 'lucide-react';
import { motion } from 'framer-motion';
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
import { SocialShare } from '@/components/SocialShare';
import { toast } from 'sonner';

// Reusable scent layer component
function ScentLayer({ 
  label, 
  sublabel, 
  notes, 
  icon: Icon, 
  accentClass 
}: { 
  label: string; 
  sublabel: string; 
  notes: string[]; 
  icon: React.ElementType; 
  accentClass: string;
}) {
  if (!notes || notes.length === 0) return null;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5">
        <div className={`w-8 h-8 flex items-center justify-center border border-border ${accentClass}`}>
          <Icon className="w-4 h-4" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-xs font-medium text-foreground">{label}</p>
          <p className="text-[10px] text-muted-foreground">{sublabel}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 pl-[42px]">
        {notes.map((note, i) => (
          <span
            key={i}
            className="px-2.5 py-1 bg-muted text-muted-foreground text-[11px] border border-border"
          >
            {typeof note === 'string' ? note : (note as any).name || note}
          </span>
        ))}
      </div>
    </div>
  );
}

// Product info accordion section
function InfoSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="text-[11px] tracking-[0.15em] uppercase font-medium text-foreground">{title}</span>
        <Plus className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-45' : ''}`} strokeWidth={1.5} />
      </button>
      {open && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="pb-5"
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { product: localProduct, variants, loading: localLoading, error: localError } = useProduct(slug || '');
  const { product: externalProduct, loading: extLoading, error: extError } = useExternalProduct(slug);
  const { addItem } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const isExternal = !localProduct && !!externalProduct;
  // Show loading until both lookups are done (or one succeeded)
  const loading = localProduct ? false : (localLoading || extLoading);
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

  // Loading state
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

  // --- EXTERNAL PRODUCT ---
  if (isExternal && externalProduct) {
    const inStock = externalProduct.stock > 0;
    const ingredientsList = externalProduct.ingredients
      ? externalProduct.ingredients.split(',').map((s: string) => s.trim())
      : [];
    
    const ext = externalProduct as any;
    const topNotes = ext.top_notes ? (typeof ext.top_notes === 'string' ? ext.top_notes.split(',').map((s: string) => s.trim()) : ext.top_notes) : [];
    const middleNotes = ext.middle_notes ? (typeof ext.middle_notes === 'string' ? ext.middle_notes.split(',').map((s: string) => s.trim()) : ext.middle_notes) : [];
    const baseNotes = ext.base_notes ? (typeof ext.base_notes === 'string' ? ext.base_notes.split(',').map((s: string) => s.trim()) : ext.base_notes) : [];
    const hasNotes = topNotes.length > 0 || middleNotes.length > 0 || baseNotes.length > 0;

    return (
      <PremiumPageLayout>
        <Seo
          title={`${externalProduct.name} | ALDENAIR`}
          description={externalProduct.description || `Entdecke ${externalProduct.name} - Premium Parfüm von ALDENAIR`}
          canonicalPath={`/products/${slug}`}
        />

        <div className="container-premium py-6 lg:py-10">
          <Breadcrumb
            items={[
              { label: 'Kollektion', path: '/products' },
              { label: externalProduct.name }
            ]}
            className="mb-6"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Image */}
            <div className="relative lg:sticky lg:top-24 lg:self-start">
              <div className="aspect-[3/4] bg-muted overflow-hidden">
                <img
                  src={externalProduct.image_url || 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=1000&fit=crop'}
                  alt={externalProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                className="absolute top-4 right-4 w-10 h-10 bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors border border-border"
                aria-label="Zu Favoriten hinzufügen"
              >
                <Heart className="w-5 h-5" strokeWidth={1.5} />
              </button>
              {!inStock && (
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1.5 bg-foreground text-background text-[10px] tracking-[0.15em] uppercase font-medium">
                    Ausverkauft
                  </span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-5">
              {/* Brand & Category */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] tracking-[0.2em] uppercase text-accent font-medium">ALDENAIR</span>
                <span className="text-muted-foreground text-xs">·</span>
                <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                  {externalProduct.category || 'Eau de Parfum'}
                </span>
              </div>

              {/* Name */}
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-foreground leading-tight">
                {externalProduct.name}
              </h1>

              {/* Inspired By */}
              {externalProduct.similar_to && (
                <div className="flex items-center gap-3 px-4 py-3 bg-accent/5 border border-accent/15">
                  <Sparkles className="w-4 h-4 text-accent flex-shrink-0" strokeWidth={1.5} />
                  <div>
                    <span className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground block">Inspiriert von</span>
                    <span className="text-sm font-medium text-foreground">{externalProduct.similar_to}</span>
                  </div>
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-2xl sm:text-3xl font-display text-foreground">
                  €{externalProduct.price.toFixed(2)}
                </span>
              </div>

              <div className="h-px bg-border" />

              {/* Longevity & Sillage Quick Info */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center py-3 border border-border">
                  <Clock className="w-4 h-4 text-accent mb-1.5" strokeWidth={1.5} />
                  <span className="text-[10px] font-medium text-foreground">6-8 Std.</span>
                  <span className="text-[9px] text-muted-foreground">Haltbarkeit</span>
                </div>
                <div className="flex flex-col items-center py-3 border border-border">
                  <Wind className="w-4 h-4 text-accent mb-1.5" strokeWidth={1.5} />
                  <span className="text-[10px] font-medium text-foreground">Moderat</span>
                  <span className="text-[9px] text-muted-foreground">Sillage</span>
                </div>
                <div className="flex flex-col items-center py-3 border border-border">
                  <Droplet className="w-4 h-4 text-accent mb-1.5" strokeWidth={1.5} />
                  <span className="text-[10px] font-medium text-foreground">50 ml</span>
                  <span className="text-[9px] text-muted-foreground">Inhalt</span>
                </div>
              </div>

              {/* Stock */}
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 ${inStock ? 'bg-green-500' : 'bg-destructive'}`} />
                <span className="text-xs text-muted-foreground">
                  {inStock ? `${externalProduct.stock} auf Lager` : 'Nicht verfügbar'}
                </span>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-2">Menge</label>
                <div className="flex items-center border border-border w-fit">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-muted transition-colors">
                    <Minus className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                  <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(externalProduct.stock, quantity + 1))} className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-muted transition-colors">
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

              {/* Trust Icons Row */}
              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Truck className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span className="text-[10px]">Gratis ab 50€</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Shield className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span className="text-[10px]">Sichere Zahlung</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span className="text-[10px]">14 Tage Rückgabe</span>
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Accordion Sections */}
              {/* Scent Pyramid */}
              {hasNotes && (
                <InfoSection title="Duftpyramide" defaultOpen={true}>
                  <div className="space-y-5">
                    <ScentLayer label="Kopfnote" sublabel="Erster Eindruck · 0-30 Min" notes={topNotes} icon={Droplet} accentClass="text-amber-500 dark:text-amber-400" />
                    <ScentLayer label="Herznote" sublabel="Charakter · 30 Min - 3 Std" notes={middleNotes} icon={Heart} accentClass="text-rose-500 dark:text-rose-400" />
                    <ScentLayer label="Basisnote" sublabel="Fondation · 3+ Stunden" notes={baseNotes} icon={Anchor} accentClass="text-stone-500 dark:text-stone-400" />
                  </div>
                </InfoSection>
              )}

              {/* Description */}
              {externalProduct.description && (
                <InfoSection title="Beschreibung" defaultOpen={true}>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {externalProduct.description}
                  </p>
                </InfoSection>
              )}

              {/* Ingredients */}
              {ingredientsList.length > 0 && (
                <InfoSection title="Inhaltsstoffe">
                  <div className="flex flex-wrap gap-1.5">
                    {ingredientsList.map((ingredient: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 bg-muted text-muted-foreground text-[11px] border border-border">
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </InfoSection>
              )}

              {/* Social Share */}
              <div className="pt-2">
                <SocialShare
                  url={window.location.href}
                  title={externalProduct.name}
                  description={externalProduct.description || ''}
                />
              </div>
            </div>
          </div>
        </div>
      </PremiumPageLayout>
    );
  }

  // --- NOT FOUND (only when both local AND external failed) ---
  if (!product && !isExternal) {
    return (
      <PremiumPageLayout>
        <div className="container-premium py-24 text-center">
          <div className="max-w-md mx-auto space-y-6">
            <div className="w-16 h-16 mx-auto bg-muted flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-muted-foreground" strokeWidth={1} />
            </div>
            <h1 className="font-display text-2xl text-foreground">Produkt nicht gefunden</h1>
            <p className="text-sm text-muted-foreground">Das gewünschte Produkt ist leider nicht verfügbar.</p>
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

  // --- LOCAL PRODUCT ---
  const discount = selectedVariant?.original_price
    ? Math.round((1 - Number(selectedVariant.price) / Number(selectedVariant.original_price)) * 100)
    : 0;
  const rating = product.rating ? Number(product.rating) : null;
  const inStock = selectedVariant?.stock === null || (selectedVariant?.stock ?? 0) > 0;

  const topNotes = product.top_notes || [];
  const middleNotes = product.middle_notes || [];
  const baseNotes = product.base_notes || [];
  const hasNotes = topNotes.length > 0 || middleNotes.length > 0 || baseNotes.length > 0;

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

      <div className="container-premium py-6 lg:py-10">
        <Breadcrumb
          items={[
            { label: 'Kollektion', path: '/products' },
            { label: product.name }
          ]}
          className="mb-6"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Product Image - sticky on desktop */}
          <div className="relative lg:sticky lg:top-24 lg:self-start">
            <div className="aspect-[3/4] bg-muted overflow-hidden">
              <img
                src={product.image_url || 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=1000&fit=crop'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <button
              className="absolute top-4 right-4 w-10 h-10 bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors border border-border"
              aria-label="Zu Favoriten hinzufügen"
            >
              <Heart className="w-5 h-5" strokeWidth={1.5} />
            </button>

            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {discount > 0 && (
                <span className="px-3 py-1.5 bg-destructive text-destructive-foreground text-[10px] tracking-[0.15em] uppercase font-medium">
                  -{discount}%
                </span>
              )}
              {!inStock && (
                <span className="px-3 py-1.5 bg-foreground text-background text-[10px] tracking-[0.15em] uppercase font-medium">
                  Ausverkauft
                </span>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-5">
            {/* Brand & Category */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-[0.2em] uppercase text-accent font-medium">ALDENAIR</span>
              <span className="text-muted-foreground text-xs">·</span>
              <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                {(product as any).categories?.name || 'Eau de Parfum'}
              </span>
            </div>

            {/* Name */}
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-foreground leading-tight">
              {product.name}
            </h1>

            {/* Inspired By Badge */}
            {product.inspired_by && (
              <div className="flex items-center gap-3 px-4 py-3 bg-accent/5 border border-accent/15">
                <Sparkles className="w-4 h-4 text-accent flex-shrink-0" strokeWidth={1.5} />
                <div>
                  <span className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground block">Inspiriert von</span>
                  <span className="text-sm font-medium text-foreground">{product.inspired_by}</span>
                </div>
              </div>
            )}

            {/* Rating */}
            {rating && rating > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? 'fill-accent text-accent' : 'text-border'}`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {rating.toFixed(1)} ({product.review_count || 0})
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-2xl sm:text-3xl font-display text-foreground">
                €{selectedVariant ? Number(selectedVariant.price).toFixed(2) : '0.00'}
              </span>
              {selectedVariant?.original_price && (
                <span className="text-base text-muted-foreground line-through">
                  €{Number(selectedVariant.original_price).toFixed(2)}
                </span>
              )}
            </div>

            <div className="h-px bg-border" />

            {/* Longevity & Sillage & Size Quick Info */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center py-3 border border-border">
                <Clock className="w-4 h-4 text-accent mb-1.5" strokeWidth={1.5} />
                <span className="text-[10px] font-medium text-foreground">6-8 Std.</span>
                <span className="text-[9px] text-muted-foreground">Haltbarkeit</span>
              </div>
              <div className="flex flex-col items-center py-3 border border-border">
                <Wind className="w-4 h-4 text-accent mb-1.5" strokeWidth={1.5} />
                <span className="text-[10px] font-medium text-foreground">Moderat</span>
                <span className="text-[9px] text-muted-foreground">Sillage</span>
              </div>
              <div className="flex flex-col items-center py-3 border border-border">
                <Droplet className="w-4 h-4 text-accent mb-1.5" strokeWidth={1.5} />
                <span className="text-[10px] font-medium text-foreground">{selectedVariant?.size || '50 ml'}</span>
                <span className="text-[9px] text-muted-foreground">Inhalt</span>
              </div>
            </div>

            {/* Variant Selector */}
            {variants.length > 1 && (
              <div>
                <label className="block text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-2">Größe wählen</label>
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
              <label className="block text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-2">Menge</label>
              <div className="flex items-center border border-border w-fit">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-muted transition-colors">
                  <Minus className="w-4 h-4" strokeWidth={1.5} />
                </button>
                <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-muted transition-colors">
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

            {/* Trust Icons - inline */}
            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Truck className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span className="text-[10px]">Gratis ab 50€</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Shield className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span className="text-[10px]">Sichere Zahlung</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span className="text-[10px]">14 Tage Rückgabe</span>
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Accordion Info Sections */}
            {/* Scent Pyramid */}
            {hasNotes && (
              <InfoSection title="Duftpyramide" defaultOpen={true}>
                <div className="space-y-5">
                  <ScentLayer label="Kopfnote" sublabel="Erster Eindruck · 0-30 Min" notes={topNotes} icon={Droplet} accentClass="text-amber-500 dark:text-amber-400" />
                  <ScentLayer label="Herznote" sublabel="Charakter · 30 Min - 3 Std" notes={middleNotes} icon={Heart} accentClass="text-rose-500 dark:text-rose-400" />
                  <ScentLayer label="Basisnote" sublabel="Fondation · 3+ Stunden" notes={baseNotes} icon={Anchor} accentClass="text-stone-500 dark:text-stone-400" />
                </div>
              </InfoSection>
            )}

            {/* Description */}
            {(product.ai_description || product.description) && (
              <InfoSection title="Beschreibung" defaultOpen={true}>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.ai_description || product.description}
                </p>
              </InfoSection>
            )}

            {/* Ingredients */}
            {product.ingredients && product.ingredients.length > 0 && (
              <InfoSection title="Inhaltsstoffe">
                <div className="flex flex-wrap gap-1.5">
                  {product.ingredients.map((ingredient, i) => (
                    <span key={i} className="px-2.5 py-1 bg-muted text-muted-foreground text-[11px] border border-border">
                      {ingredient}
                    </span>
                  ))}
                </div>
              </InfoSection>
            )}

            {/* Seasons & Occasions */}
            {(product.seasons?.length || product.occasions?.length) && (
              <InfoSection title="Empfohlen für">
                <div className="space-y-3">
                  {product.seasons && product.seasons.length > 0 && (
                    <div>
                      <span className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground block mb-2">Jahreszeit</span>
                      <div className="flex flex-wrap gap-1.5">
                        {product.seasons.map((s, i) => (
                          <span key={i} className="px-2.5 py-1 bg-muted text-muted-foreground text-[11px] border border-border">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {product.occasions && product.occasions.length > 0 && (
                    <div>
                      <span className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground block mb-2">Anlass</span>
                      <div className="flex flex-wrap gap-1.5">
                        {product.occasions.map((o, i) => (
                          <span key={i} className="px-2.5 py-1 bg-muted text-muted-foreground text-[11px] border border-border">{o}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </InfoSection>
            )}

            {/* Social Share */}
            <div className="pt-2">
              <SocialShare
                url={window.location.href}
                title={product.name}
                description={product.description || ''}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Subscription */}
      {selectedVariant && (
        <section className="py-8 lg:py-12 border-t border-border">
          <div className="container-premium">
            <div className="text-center mb-8">
              <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-2">Spar-Abo</span>
              <h2 className="font-display text-2xl lg:text-3xl text-foreground mb-2">Regelmäßig liefern lassen</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">Spare bis zu 15% mit unserem flexiblen Abo-Modell</p>
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

      {/* Reviews */}
      <ProductReviews
        productId={product.id}
        productName={product.name}
        averageRating={rating || 4.5}
        reviewCount={product.review_count || 0}
      />

      {/* Recommendations */}
      <section className="py-8 lg:py-12 border-t border-border">
        <div className="container-premium">
          <ProductRecommendations />
        </div>
      </section>
    </PremiumPageLayout>
  );
}
