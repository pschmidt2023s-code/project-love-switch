import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { PremiumPageLayout } from '@/components/premium/PremiumPageLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Seo } from '@/components/Seo';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Zap, Shield, Truck } from 'lucide-react';

export default function CartPage() {
  const { items, itemCount, total, updateQuantity, removeItem, loading } = useCart();

  const shippingCost = total >= 50 ? 0 : 4.99;
  const grandTotal = total + shippingCost;

  if (items.length === 0) {
    return (
      <PremiumPageLayout>
        <Seo title="Warenkorb | ALDENAIR" description="Dein Warenkorb bei ALDENAIR." canonicalPath="/cart" />
        <section className="section-spacing">
          <div className="container-premium text-center max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-muted">
              <ShoppingBag className="w-7 h-7 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <h1 className="font-display text-2xl text-foreground mb-3">Dein Warenkorb ist leer</h1>
            <p className="text-sm text-muted-foreground mb-8">
              Entdecke unsere exklusiven Düfte und füge deine Favoriten hinzu.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center px-8 py-4 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors"
            >
              Jetzt einkaufen
              <ArrowRight className="ml-2 w-4 h-4" strokeWidth={1.5} />
            </Link>
          </div>
        </section>
      </PremiumPageLayout>
    );
  }

  return (
    <PremiumPageLayout>
      <Seo title="Warenkorb | ALDENAIR" description="Dein Warenkorb bei ALDENAIR." canonicalPath="/cart" />

      {/* Header */}
      <section className="border-b border-border">
        <div className="container-premium py-8 lg:py-12">
          <Breadcrumb className="mb-6" />
          <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-3">Warenkorb</span>
          <h1 className="font-display text-3xl lg:text-4xl text-foreground">
            {itemCount} {itemCount === 1 ? 'Artikel' : 'Artikel'}
          </h1>
        </div>
      </section>

      {/* Cart Content */}
      <section className="section-spacing">
        <div className="container-premium">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Items */}
            <div className="lg:col-span-2 space-y-0">
              {items.map((item, index) => (
                <div
                  key={item.variantId}
                  className={`flex gap-4 lg:gap-6 py-6 ${index > 0 ? 'border-t border-border' : ''}`}
                >
                  {/* Image */}
                  <div className="w-24 h-28 lg:w-28 lg:h-32 flex-shrink-0 bg-muted overflow-hidden">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=200&h=200&fit=crop'}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display text-base lg:text-lg text-foreground line-clamp-1">
                        {item.productName}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Größe: {item.variantSize}
                      </p>
                    </div>

                    <div className="flex items-end justify-between mt-3">
                      {/* Quantity */}
                      <div className="flex items-center border border-border">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                        <span className="w-10 text-center text-sm font-medium text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                      </div>

                      {/* Price & Remove */}
                      <div className="flex items-center gap-4">
                        <span className="text-base font-medium text-foreground">
                          {(item.price * item.quantity).toFixed(2).replace('.', ',')} €
                        </span>
                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          aria-label="Entfernen"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 border border-border p-6 lg:p-8 space-y-5">
                <h2 className="text-[10px] tracking-[0.2em] uppercase text-accent">Bestellübersicht</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Zwischensumme</span>
                    <span>{total.toFixed(2).replace('.', ',')} €</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Versand</span>
                    <span>
                      {shippingCost === 0 ? (
                        <span className="text-accent font-medium">Kostenlos</span>
                      ) : (
                        `${shippingCost.toFixed(2).replace('.', ',')} €`
                      )}
                    </span>
                  </div>
                  {total < 50 && (
                    <div className="p-3 bg-muted/50 text-xs text-muted-foreground">
                      🚚 Noch <strong className="text-foreground">{(50 - total).toFixed(2).replace('.', ',')} €</strong> bis zum kostenlosen Versand
                      <div className="mt-2 h-1 bg-muted overflow-hidden">
                        <div className="h-full bg-accent transition-all duration-500" style={{ width: `${Math.min((total / 50) * 100, 100)}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-4 flex justify-between font-display text-lg">
                  <span>Gesamt</span>
                  <span className="text-foreground">{grandTotal.toFixed(2).replace('.', ',')} €</span>
                </div>

                {/* CTA */}
                <Link
                  to="/express-checkout"
                  className="flex items-center justify-center gap-2 w-full py-4 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors"
                >
                  <Zap className="w-4 h-4" strokeWidth={1.5} />
                  Express Checkout
                </Link>

                <Link
                  to="/checkout"
                  className="flex items-center justify-center gap-2 w-full py-4 border border-border text-foreground text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-muted transition-colors"
                >
                  Zur Kasse
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </Link>

                {/* Trust */}
                <div className="flex items-center justify-center gap-6 pt-4 border-t border-border text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Sicher</span>
                  <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" /> Schnell</span>
                </div>

                <p className="text-[10px] text-muted-foreground text-center">inkl. MwSt., zzgl. Versand</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PremiumPageLayout>
  );
}