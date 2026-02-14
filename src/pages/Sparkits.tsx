import { useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useExternalProducts, ExternalProduct } from "@/hooks/useExternalProducts";
import { useCart } from "@/contexts/CartContext";
import { PremiumPageLayout } from "@/components/premium/PremiumPageLayout";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Seo } from "@/components/Seo";
import { Minus, Plus, Sparkles, ArrowRight } from "lucide-react";

export default function SparkitsPage() {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get("type");

  const [mode, setMode] = useState<"50ml" | "5ml">(
    initialType === "samples" ? "5ml" : "50ml"
  );
  const [kitSize, setKitSize] = useState<3 | 5>(3);
  const { products, loading } = useExternalProducts();
  const [qtyByProduct, setQtyByProduct] = useState<Record<string, number>>({});

  const { addItem } = useCart();
  const navigate = useNavigate();

  const targetCount = mode === "5ml" ? 5 : kitSize;

  // Filter products - all active products are available for kits
  const availableProducts = useMemo(() => {
    return products.filter(p => p.is_active && p.stock > 0);
  }, [products]);

  // Calculate price per item based on mode
  const getPrice = (product: ExternalProduct) => {
    if (mode === "5ml") {
      // 5ml samples are roughly 1/10 of the 50ml price
      return Math.round((product.price / 10) * 100) / 100;
    }
    return product.price;
  };

  // Reset selection when mode changes
  const handleModeChange = (newMode: "50ml" | "5ml") => {
    setMode(newMode);
    setQtyByProduct({});
    if (newMode === "5ml") setKitSize(5);
  };

  const selectedCount = useMemo(
    () => Object.values(qtyByProduct).reduce((sum, q) => sum + q, 0),
    [qtyByProduct]
  );
  const remaining = targetCount - selectedCount;
  const canIncrease = remaining > 0;

  const totalPrice = useMemo(() => {
    return availableProducts.reduce((sum, p) => {
      const q = qtyByProduct[p.id] || 0;
      return sum + q * getPrice(p);
    }, 0);
  }, [availableProducts, qtyByProduct, mode]);

  const setQty = (productId: string, next: number) => {
    setQtyByProduct((prev) => {
      const safe = Math.max(0, Math.min(targetCount, next));
      if (safe === 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: safe };
    });
  };

  const handleAddToCart = async () => {
    if (remaining !== 0) return;
    const cartItems = availableProducts
      .map((p) => {
        const q = qtyByProduct[p.id] || 0;
        return q > 0
          ? {
              variantId: p.id,
              productId: p.id,
              productName: `${p.name} (${mode} Sparset)`,
              variantSize: mode,
              price: getPrice(p),
              quantity: q,
              image: p.image_url || "/placeholder.svg",
            }
          : null;
      })
      .filter(Boolean) as any[];

    for (const it of cartItems) await addItem(it);
    navigate("/cart");
  };

  return (
    <PremiumPageLayout>
      <Seo
        title="Sparkits konfigurieren | ALDENAIR"
        description="Stelle dein Sparkits-Set zusammen."
        canonicalPath="/sparkits"
      />

      {/* Header */}
      <section className="border-b border-border">
        <div className="container-premium py-8 lg:py-12">
          <Breadcrumb className="mb-6" />
          <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-3">
            Konfigurieren
          </span>
          <h1 className="font-display text-3xl lg:text-4xl text-foreground mb-3">
            Sparkits zusammenstellen
          </h1>
          <p className="text-muted-foreground text-sm max-w-lg">
            Wähle {mode === "50ml" ? "50ml Flakons" : "5ml Proben"} und stelle
            dein individuelles Set zusammen.
          </p>
        </div>
      </section>

      {/* Mode Selector */}
      <section className="border-b border-border">
        <div className="container-premium">
          <div className="flex items-center gap-0 h-14">
            <button
              onClick={() => handleModeChange("50ml")}
              className={`h-full px-6 text-[11px] tracking-[0.1em] uppercase font-medium border-b-2 transition-colors ${
                mode === "50ml"
                  ? "border-accent text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              50ml Flakons
            </button>
            <button
              onClick={() => handleModeChange("5ml")}
              className={`h-full px-6 text-[11px] tracking-[0.1em] uppercase font-medium border-b-2 transition-colors ${
                mode === "5ml"
                  ? "border-accent text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              5ml Proben
            </button>
          </div>
        </div>
      </section>

      <section className="py-8 lg:py-12">
        <div className="container-premium">
          <div className="grid lg:grid-cols-[1fr_320px] gap-8 lg:gap-12">
            {/* Product List */}
            <div>
              {/* Kit size selector for 50ml */}
              {mode === "50ml" && (
                <div className="flex items-center gap-4 mb-8 p-4 border border-border">
                  <Sparkles
                    className="w-5 h-5 text-accent"
                    strokeWidth={1.5}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      Set-Größe
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Wähle 3er oder 5er Set
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {([3, 5] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                          setKitSize(size);
                          setQtyByProduct({});
                        }}
                        className={`px-4 py-2 text-[10px] tracking-[0.1em] uppercase font-medium border transition-colors ${
                          kitSize === size
                            ? "bg-foreground text-background border-foreground"
                            : "border-border text-foreground hover:bg-muted"
                        }`}
                      >
                        {size}er Set
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 p-4 border border-border">
                      <div className="w-16 h-16 bg-muted animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-1/2 bg-muted animate-pulse" />
                        <div className="h-3 w-1/4 bg-muted animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : availableProducts.length === 0 ? (
                <p className="text-muted-foreground text-center py-16">
                  Keine passenden Produkte gefunden.
                </p>
              ) : (
                <div className="space-y-0">
                  {availableProducts.map((product, index) => {
                    const q = qtyByProduct[product.id] || 0;
                    const price = getPrice(product);
                    return (
                      <div
                        key={product.id}
                        className={`flex items-center gap-4 py-4 px-4 ${
                          index > 0 ? "border-t border-border" : ""
                        }`}
                      >
                        <img
                          src={
                            product.image_url ||
                            "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=500&fit=crop"
                          }
                          alt={product.name}
                          className="w-14 h-14 object-cover bg-muted flex-shrink-0"
                          loading="lazy"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {price.toFixed(2)} € / {mode}
                          </p>
                          {product.similar_to && (
                            <p className="text-[10px] text-accent truncate">
                              Inspiriert von {product.similar_to}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center border border-border">
                          <button
                            disabled={q === 0}
                            onClick={() => setQty(product.id, q - 1)}
                            className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30"
                          >
                            <Minus className="w-3.5 h-3.5" strokeWidth={1.5} />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {q}
                          </span>
                          <button
                            disabled={!canIncrease}
                            onClick={() => setQty(product.id, q + 1)}
                            className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30"
                          >
                            <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside>
              <div className="sticky top-24 border border-border p-6 space-y-5">
                <h2 className="text-[10px] tracking-[0.2em] uppercase text-accent">
                  Dein Set
                </h2>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Ausgewählt</span>
                  <span className="font-medium text-foreground">
                    {selectedCount} / {targetCount}
                  </span>
                </div>
                <div className="h-1 bg-muted overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-300"
                    style={{
                      width: `${(selectedCount / targetCount) * 100}%`,
                    }}
                  />
                </div>

                {/* Selected items summary */}
                {selectedCount > 0 && (
                  <div className="space-y-2 border-t border-border pt-4">
                    {availableProducts
                      .filter((p) => (qtyByProduct[p.id] || 0) > 0)
                      .map((p) => (
                        <div
                          key={p.id}
                          className="flex justify-between text-xs"
                        >
                          <span className="text-muted-foreground truncate mr-2">
                            {qtyByProduct[p.id]}x {p.name}
                          </span>
                          <span className="text-foreground whitespace-nowrap">
                            {(getPrice(p) * (qtyByProduct[p.id] || 0)).toFixed(2)} €
                          </span>
                        </div>
                      ))}
                    <div className="flex justify-between text-sm font-medium pt-2 border-t border-border">
                      <span className="text-foreground">Gesamt</span>
                      <span className="text-foreground">
                        {totalPrice.toFixed(2)} €
                      </span>
                    </div>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  {remaining > 0
                    ? `Noch ${remaining} Stück auswählen.`
                    : remaining < 0
                    ? "Zu viele ausgewählt."
                    : "Set ist vollständig."}
                </p>
                <button
                  disabled={remaining !== 0 || loading}
                  onClick={handleAddToCart}
                  className="w-full py-4 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  In den Warenkorb
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </PremiumPageLayout>
  );
}
