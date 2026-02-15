import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingBag, Truck, Shield, Plus, Minus, Star, RotateCcw, Sparkles, Leaf, ArrowLeft, Clock, Wind, Droplet, Anchor, Check } from 'lucide-react';
import { DeliveryEstimate } from '@/components/DeliveryEstimate';
import { motion, AnimatePresence } from 'framer-motion';
import { SwipeGallery } from '@/components/SwipeGallery';
import { useCart } from '@/contexts/CartContext';
import { useProduct } from '@/hooks/useProducts';
import { useExternalProduct } from '@/hooks/useExternalProducts';
import { PremiumPageLayout } from '@/components/premium/PremiumPageLayout';
import { ProductReviews } from '@/components/products/ProductReviews';
import { SubscriptionCard } from '@/components/subscription/SubscriptionCard';
import { ProductRecommendations } from '@/components/ai/ProductRecommendations';
import { RecentlyViewed } from '@/components/RecentlyViewed';
import { StickyAddToCart } from '@/components/StickyAddToCart';
import { Breadcrumb } from '@/components/Breadcrumb';
import { BackInStockNotify } from '@/components/BackInStockNotify';
import { Seo } from '@/components/Seo';
import { ProductSchema, BreadcrumbSchema, RelatedProducts, ProductFAQ } from '@/components/seo';
import { SocialShare } from '@/components/SocialShare';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { toast } from 'sonner';

/* ═══════════════════════════════════════════════════════════════════════════
   SCENT PYRAMID — Visual staircase with progressive widths
   ═══════════════════════════════════════════════════════════════════════════ */
function ScentPyramid({ topNotes, middleNotes, baseNotes }: { topNotes: string[]; middleNotes: string[]; baseNotes: string[] }) {
  const layers = [
    { label: 'Kopfnote', sublabel: '0–30 Min', notes: topNotes, Icon: Droplet, width: 'w-[55%]', barWidth: 'w-10' },
    { label: 'Herznote', sublabel: '30 Min – 3 Std', notes: middleNotes, Icon: Heart, width: 'w-[75%]', barWidth: 'w-16' },
    { label: 'Basisnote', sublabel: '3+ Stunden', notes: baseNotes, Icon: Anchor, width: 'w-full', barWidth: 'w-24' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center gap-2.5">
        {layers.map((layer, index) => {
          if (!layer.notes || layer.notes.length === 0) return null;
          return (
            <motion.div
              key={layer.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
              className={`${layer.width} mx-auto`}
            >
              <div className="border border-border bg-muted/30 p-3.5">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <layer.Icon className="w-3 h-3 text-accent" strokeWidth={1.5} />
                    <span className="text-[10px] tracking-[0.12em] uppercase font-medium text-foreground">{layer.label}</span>
                  </div>
                  <span className="text-[9px] text-muted-foreground">{layer.sublabel}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {layer.notes.map((note, i) => (
                    <span key={i} className="px-2 py-0.5 text-[10px] bg-background border border-border text-foreground">
                      {typeof note === 'string' ? note : (note as any).name || note}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      {/* Minimal pyramid indicator */}
      <div className="flex flex-col items-center gap-[3px] pt-1">
        <div className="w-8 h-[2px] bg-accent/40" />
        <div className="w-14 h-[2px] bg-accent/60" />
        <div className="w-20 h-[2px] bg-accent/80" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   INFO ACCORDION — Clean collapsible sections
   ═══════════════════════════════════════════════════════════════════════════ */
function InfoSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <span className="text-[11px] tracking-[0.15em] uppercase font-medium text-foreground">{title}</span>
        <div className={`w-5 h-5 flex items-center justify-center border border-border transition-all duration-200 ${open ? 'bg-foreground' : 'group-hover:border-foreground'}`}>
          <Plus className={`w-3 h-3 transition-all duration-200 ${open ? 'rotate-45 text-background' : 'text-muted-foreground'}`} strokeWidth={1.5} />
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PRODUCT ATTRIBUTE PILL — Reusable stat display
   ═══════════════════════════════════════════════════════════════════════════ */
function AttributePill({ icon: Icon, value, label }: { icon: any; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center py-4 border border-border bg-muted/20 hover:bg-muted/40 transition-colors">
      <Icon className="w-4 h-4 text-accent mb-2" strokeWidth={1.5} />
      <span className="text-xs font-medium text-foreground tracking-tight">{value}</span>
      <span className="text-[9px] text-muted-foreground mt-0.5">{label}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { product: localProduct, variants, loading: localLoading, error: localError } = useProduct(slug || '');
  const { product: externalProduct, loading: extLoading, error: extError } = useExternalProduct(slug);
  const { addItem } = useCart();
  const { addItem: addRecentlyViewed } = useRecentlyViewed();
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const isExternal = !localProduct && !!externalProduct;
  const loading = localProduct ? false : (localLoading || extLoading);
  const product = localProduct || null;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug]);

  // Track recently viewed
  useEffect(() => {
    if (product && slug) {
      addRecentlyViewed({
        id: product.id,
        slug,
        name: product.name,
        image: product.image_url || 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=500&fit=crop',
        price: Number(product.base_price),
      });
    } else if (externalProduct && slug) {
      addRecentlyViewed({
        id: externalProduct.id,
        slug,
        name: externalProduct.name,
        image: externalProduct.image_url || '',
        price: externalProduct.price,
      });
    }
  }, [product, externalProduct, slug]);

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
      setAddedToCart(true);
      toast.success('In den Warenkorb gelegt');
      setTimeout(() => setAddedToCart(false), 2000);
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
    setAddedToCart(true);
    toast.success('In den Warenkorb gelegt');
    setTimeout(() => setAddedToCart(false), 2000);
  };

  /* ─── Loading skeleton ─── */
  if (loading) {
    return (
      <PremiumPageLayout>
        <div className="container-premium py-8 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-7">
              <div className="aspect-[3/4] bg-muted animate-pulse" />
            </div>
            <div className="lg:col-span-5 space-y-6">
              <div className="h-3 w-20 bg-muted animate-pulse" />
              <div className="h-10 w-3/4 bg-muted animate-pulse" />
              <div className="h-6 w-32 bg-muted animate-pulse" />
              <div className="h-px bg-border" />
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted animate-pulse" />)}
              </div>
              <div className="h-14 bg-muted animate-pulse" />
            </div>
          </div>
        </div>
      </PremiumPageLayout>
    );
  }

  /* ═══════════════════════════════════════════════════════════════════════
     EXTERNAL PRODUCT VIEW
     ═══════════════════════════════════════════════════════════════════════ */
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
          title={`${externalProduct.name} kaufen | ALDENAIR Premium Parfüm`}
          description={externalProduct.description || `${externalProduct.name} – Premium Eau de Parfum von ALDENAIR. Jetzt bestellen ✓ Kostenloser Versand ab 50€`}
          canonicalPath={`/products/${slug}`}
          ogImage={externalProduct.image_url || '/images/aldenair-prestige.png'}
        />

        <div className="container-premium py-6 lg:py-10">
          <Breadcrumb
            items={[
              { label: 'Kollektion', path: '/products' },
              { label: externalProduct.name }
            ]}
            className="mb-8"
          />

          {/* ── Main Grid: 7/5 split for editorial feel ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
            
            {/* ── LEFT: Image ── */}
            <motion.div
              className="lg:col-span-7 relative lg:sticky lg:top-20 lg:self-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <SwipeGallery
                images={[externalProduct.image_url || 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=1000&fit=crop']}
                alt={externalProduct.name}
              >
                {/* Favorite button */}
                <button
                  className="absolute top-4 right-4 z-10 w-11 h-11 bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-all border border-border group"
                  aria-label="Zu Favoriten hinzufügen"
                >
                  <Heart className="w-[18px] h-[18px] group-hover:text-accent transition-colors" strokeWidth={1.5} />
                </button>

                {/* Badges */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                  {!inStock && (
                    <span className="px-3 py-1.5 bg-foreground text-background text-[10px] tracking-[0.15em] uppercase font-medium">
                      Ausverkauft
                    </span>
                  )}
                </div>
              </SwipeGallery>
            </motion.div>

            {/* ── RIGHT: Product Info ── */}
            <motion.div
              className="lg:col-span-5 space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {/* Brand line */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] tracking-[0.2em] uppercase text-accent font-medium">ALDENAIR</span>
                <span className="w-3 h-px bg-border" />
                <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
                  {externalProduct.category || 'Parfum'}
                </span>
              </div>

              {/* Name */}
              <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] text-foreground leading-[1.1] tracking-tight">
                {externalProduct.name}
              </h1>

              {/* Inspired By */}
              {externalProduct.similar_to && (
                <div className="flex items-center gap-3 px-4 py-3 bg-accent/[0.04] border-l-2 border-accent">
                  <Sparkles className="w-4 h-4 text-accent flex-shrink-0" strokeWidth={1.5} />
                  <div>
                    <span className="text-[9px] tracking-[0.12em] uppercase text-muted-foreground">Inspiriert von</span>
                    <span className="text-sm font-medium text-foreground block">{externalProduct.similar_to}</span>
                  </div>
                </div>
              )}

              {/* Price — large editorial */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl lg:text-4xl font-display text-foreground">
                  €{externalProduct.price.toFixed(2)}
                </span>
              </div>

              <div className="h-px bg-border" />

              {/* Attribute pills */}
              <div className="grid grid-cols-3 gap-2">
                <AttributePill icon={Clock} value="8+ Std." label="Haltbarkeit" />
                <AttributePill icon={Wind} value="Moderat" label="Sillage" />
                <AttributePill icon={Droplet} value="50 ml" label="Inhalt" />
              </div>

              {/* Stock indicator */}
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 ${inStock ? 'bg-green-500 animate-pulse' : 'bg-destructive'}`} />
                <span className="text-[11px] text-muted-foreground">
                  {inStock ? `${externalProduct.stock} auf Lager` : 'Nicht verfügbar'}
                </span>
              </div>

              {/* Quantity selector */}
              <div>
                <label className="block text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-2">Menge</label>
                <div className="inline-flex items-center border border-border">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-11 h-11 flex items-center justify-center text-foreground hover:bg-muted transition-colors">
                    <Minus className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                  <span className="w-12 text-center text-sm font-medium tabular-nums">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(externalProduct.stock, quantity + 1))} className="w-11 h-11 flex items-center justify-center text-foreground hover:bg-muted transition-colors">
                    <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* Add to Cart — full-width CTA */}
              <div className="flex gap-2.5">
                <motion.button
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className="flex-1 h-14 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  whileTap={{ scale: 0.98 }}
                >
                  <AnimatePresence mode="wait">
                    {addedToCart ? (
                      <motion.span key="added" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="flex items-center gap-2">
                        <Check className="w-4 h-4" strokeWidth={2} /> Hinzugefügt
                      </motion.span>
                    ) : (
                      <motion.span key="add" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
                        {inStock ? 'In den Warenkorb' : 'Nicht verfügbar'}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
                <button
                  className="w-14 h-14 flex items-center justify-center border border-border hover:border-foreground hover:bg-muted/50 transition-all group"
                  aria-label="Zu Favoriten hinzufügen"
                >
                  <Heart className="w-5 h-5 group-hover:text-accent transition-colors" strokeWidth={1.5} />
                </button>
              </div>

              {/* Delivery Estimate */}
              <DeliveryEstimate inStock={inStock} />

              {/* Trust strip */}
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Shield className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                  <span className="text-[10px]">Sichere Zahlung</span>
                </div>
                <div className="w-px h-3 bg-border" />
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <RotateCcw className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                  <span className="text-[10px]">14 Tage Rückgabe</span>
                </div>
                <div className="w-px h-3 bg-border" />
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Truck className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                  <span className="text-[10px]">Gratis ab 50€</span>
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Accordion Sections */}
              {hasNotes && (
                <InfoSection title="Duftpyramide" defaultOpen={true}>
                  <ScentPyramid topNotes={topNotes} middleNotes={middleNotes} baseNotes={baseNotes} />
                </InfoSection>
              )}

              {externalProduct.description && (
                <InfoSection title="Beschreibung" defaultOpen={true}>
                  <p className="text-[13px] text-muted-foreground leading-[1.7]">
                    {externalProduct.description}
                  </p>
                </InfoSection>
              )}

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
            </motion.div>
          </div>
        </div>
      </PremiumPageLayout>
    );
  }

  /* ═══════════════════════════════════════════════════════════════════════
     NOT FOUND
     ═══════════════════════════════════════════════════════════════════════ */
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

  /* ═══════════════════════════════════════════════════════════════════════
     LOCAL PRODUCT VIEW — Full editorial layout
     ═══════════════════════════════════════════════════════════════════════ */
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
        title={`${product.name} kaufen | ALDENAIR Premium Parfüm`}
        description={product.description || `${product.name} – Premium Eau de Parfum von ALDENAIR${product.inspired_by ? `, inspiriert von ${product.inspired_by}` : ''}. Jetzt bestellen ✓ Kostenloser Versand ab 50€`}
        canonicalPath={`/products/${slug}`}
        ogImage={product.image_url || '/images/aldenair-prestige.png'}
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
          className="mb-8"
        />

        {/* ── Main Grid: 7/5 editorial split ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
          
          {/* ── LEFT: Product Image Gallery ── */}
          <motion.div
            className="lg:col-span-7 relative lg:sticky lg:top-20 lg:self-start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <SwipeGallery
              images={(() => {
                const imgs: string[] = [];
                if (product.image_url) imgs.push(product.image_url);
                variants.forEach(v => {
                  if (v.image && !imgs.includes(v.image)) imgs.push(v.image);
                });
                if (imgs.length === 0) imgs.push('https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=1000&fit=crop');
                return imgs;
              })()}
              alt={product.name}
            >
              {/* Favorite */}
              <button
                className="absolute top-4 right-4 z-10 w-11 h-11 bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-all border border-border group"
                aria-label="Zu Favoriten hinzufügen"
              >
                <Heart className="w-[18px] h-[18px] group-hover:text-accent transition-colors" strokeWidth={1.5} />
              </button>

              {/* Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                {discount > 0 && (
                  <motion.span
                    className="px-3 py-1.5 bg-destructive text-destructive-foreground text-[10px] tracking-[0.15em] uppercase font-medium"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    -{discount}%
                  </motion.span>
                )}
                {!inStock && (
                  <span className="px-3 py-1.5 bg-foreground text-background text-[10px] tracking-[0.15em] uppercase font-medium">
                    Ausverkauft
                  </span>
                )}
              </div>
            </SwipeGallery>
          </motion.div>

          {/* ── RIGHT: Product Details ── */}
          <motion.div
            className="lg:col-span-5 space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Brand line */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-[0.2em] uppercase text-accent font-medium">ALDENAIR</span>
              <span className="w-3 h-px bg-border" />
              <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
                {(product as any).categories?.name || 'Eau de Parfum'}
              </span>
            </div>

            {/* Product Name */}
            <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] text-foreground leading-[1.1] tracking-tight">
              {product.name}
            </h1>

            {/* Inspired By badge */}
            {product.inspired_by && (
              <div className="flex items-center gap-3 px-4 py-3 bg-accent/[0.04] border-l-2 border-accent">
                <Sparkles className="w-4 h-4 text-accent flex-shrink-0" strokeWidth={1.5} />
                <div>
                  <span className="text-[9px] tracking-[0.12em] uppercase text-muted-foreground">Inspiriert von</span>
                  <span className="text-sm font-medium text-foreground block">{product.inspired_by}</span>
                </div>
              </div>
            )}

            {/* Rating */}
            {rating && rating > 0 && (
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? 'fill-accent text-accent' : 'text-border'}`}
                    />
                  ))}
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {rating.toFixed(1)} · {product.review_count || 0} Bewertungen
                </span>
              </div>
            )}

            {/* Price — editorial large */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl lg:text-4xl font-display text-foreground">
                €{selectedVariant ? Number(selectedVariant.price).toFixed(2) : '0.00'}
              </span>
              {selectedVariant?.original_price && (
                <span className="text-base text-muted-foreground line-through">
                  €{Number(selectedVariant.original_price).toFixed(2)}
                </span>
              )}
            </div>

            <div className="h-px bg-border" />

            {/* Attribute pills */}
            <div className="grid grid-cols-3 gap-2">
              <AttributePill icon={Clock} value="8+ Std." label="Haltbarkeit" />
              <AttributePill icon={Wind} value="Moderat" label="Sillage" />
              <AttributePill icon={Droplet} value={selectedVariant?.size || '50 ml'} label="Inhalt" />
            </div>

            {/* Variant selector */}
            {variants.length > 1 && (
              <div>
                <label className="block text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-2.5">Größe wählen</label>
                <div className="flex flex-wrap gap-2">
                  {variants.map((variant) => {
                    const isSelected = selectedVariant?.id === variant.id;
                    const isAvailable = variant.stock === null || variant.stock > 0;
                    return (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariantId(variant.id)}
                        disabled={!isAvailable}
                        className={`px-5 py-2.5 text-sm transition-all ${
                          isSelected
                            ? 'bg-foreground text-background'
                            : isAvailable
                            ? 'border border-border text-foreground hover:border-foreground'
                            : 'border border-border text-muted-foreground opacity-40 cursor-not-allowed line-through'
                        }`}
                      >
                        {variant.size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-2">Menge</label>
              <div className="inline-flex items-center border border-border">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-11 h-11 flex items-center justify-center text-foreground hover:bg-muted transition-colors">
                  <Minus className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
                <span className="w-12 text-center text-sm font-medium tabular-nums">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-11 h-11 flex items-center justify-center text-foreground hover:bg-muted transition-colors">
                  <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Add to Cart CTA */}
            <div className="flex gap-2.5">
              <motion.button
                onClick={handleAddToCart}
                disabled={!inStock}
                className="flex-1 h-14 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                whileTap={{ scale: 0.98 }}
              >
                <AnimatePresence mode="wait">
                  {addedToCart ? (
                    <motion.span key="added" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="flex items-center gap-2">
                      <Check className="w-4 h-4" strokeWidth={2} /> Hinzugefügt
                    </motion.span>
                  ) : (
                    <motion.span key="add" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
                      {inStock ? 'In den Warenkorb' : 'Nicht verfügbar'}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
              <button
                className="w-14 h-14 flex items-center justify-center border border-border hover:border-foreground hover:bg-muted/50 transition-all group"
                aria-label="Zu Favoriten hinzufügen"
              >
                <Heart className="w-5 h-5 group-hover:text-accent transition-colors" strokeWidth={1.5} />
              </button>
            </div>

            {/* Back in Stock */}
            {!inStock && (
              <BackInStockNotify
                productId={product.id}
                variantId={selectedVariant?.id}
                productName={product.name}
              />
            )}

            {/* Delivery Estimate */}
            <DeliveryEstimate inStock={inStock} />

            {/* Trust strip */}
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Shield className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                <span className="text-[10px]">Sichere Zahlung</span>
              </div>
              <div className="w-px h-3 bg-border" />
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <RotateCcw className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                <span className="text-[10px]">14 Tage Rückgabe</span>
              </div>
              <div className="w-px h-3 bg-border" />
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Truck className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                <span className="text-[10px]">Gratis ab 50€</span>
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* ── Accordion Sections ── */}
            {hasNotes && (
              <InfoSection title="Duftpyramide" defaultOpen={true}>
                <ScentPyramid topNotes={topNotes} middleNotes={middleNotes} baseNotes={baseNotes} />
              </InfoSection>
            )}

            {(product.ai_description || product.description) && (
              <InfoSection title="Beschreibung" defaultOpen={true}>
                <p className="text-[13px] text-muted-foreground leading-[1.7]">
                  {product.ai_description || product.description}
                </p>
              </InfoSection>
            )}

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
          </motion.div>
        </div>
      </div>

      {/* ── Full-width sections below the fold ── */}

      {/* Subscription */}
      {selectedVariant && (
        <section className="py-10 lg:py-16 border-t border-border">
          <div className="container-premium">
            <div className="text-center mb-10">
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

      {/* Product FAQ for SEO */}
      <ProductFAQ productName={product.name} inspiredBy={product.inspired_by} />

      {/* Related Products - Internal Linking */}
      <RelatedProducts currentProductId={product.id} gender={product.gender} />

      {/* Recently Viewed */}
      <RecentlyViewed />

      {/* Recommendations */}
      <section className="py-10 lg:py-16 border-t border-border">
        <div className="container-premium">
          <ProductRecommendations />
        </div>
      </section>

      {/* Sticky Add to Cart (Mobile) */}
      <StickyAddToCart
        productName={product.name}
        price={selectedVariant ? Number(selectedVariant.price) : Number(product.base_price)}
        inStock={inStock}
        onAddToCart={handleAddToCart}
      />
    </PremiumPageLayout>
  );
}
