import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { PremiumPageLayout } from "@/components/premium/PremiumPageLayout";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Seo } from "@/components/Seo";
import { Minus, Plus, Sparkles, ArrowRight } from "lucide-react";

type VariantInfo = {
  id: string;
  size: string;
  price: number;
};

type Fragrance = {
  productId: string;
  name: string;
  slug: string;
  imageUrl: string;
  variants: Record<"50ml" | "5ml", VariantInfo | null>;
};

function normalizeSize(size: string) {
  return size.toLowerCase().replace(/\s+/g, "");
}

export default function SparkitsPage() {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get("type");

  const [mode, setMode] = useState<"50ml" | "5ml">(
    initialType === "samples" ? "5ml" : "50ml"
  );
  const [kitSize, setKitSize] = useState<3 | 5>(3);
  const [loading, setLoading] = useState(true);
  const [fragrances, setFragrances] = useState<Fragrance[]>([]);
  const [qtyByProduct, setQtyByProduct] = useState<Record<string, number>>({});

  const { addItem } = useCart();
  const navigate = useNavigate();

  const targetCount = mode === "5ml" ? 5 : kitSize;

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("product_variants")
        .select(`id, size, price, product_id, products (id, name, slug, image_url, categories ( slug ))`);

      if (!mounted) return;
      if (error) {
        console.error("[Sparkits] load error", error);
        setFragrances([]);
        setLoading(false);
        return;
      }

      const rows = (data || []) as any[];
      const base = rows.filter((r) => r.products?.categories?.slug === "herren");
      const byProduct = new Map<string, Fragrance>();

      for (const r of base) {
        const p = r.products;
        if (!p?.id) continue;
        const key = p.id as string;
        const existing = byProduct.get(key) || {
          productId: p.id,
          name: p.name,
          slug: p.slug,
          imageUrl: p.image_url || "/placeholder.svg",
          variants: { "50ml": null, "5ml": null },
        };

        const s = normalizeSize(String(r.size || ""));
        if (s === "50ml") existing.variants["50ml"] = { id: r.id, size: String(r.size), price: Number(r.price) };
        if (s === "5ml") existing.variants["5ml"] = { id: r.id, size: String(r.size), price: Number(r.price) };
        byProduct.set(key, existing);
      }

      setFragrances(Array.from(byProduct.values()));
      setLoading(false);
    }

    load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    setQtyByProduct({});
    if (mode === "5ml") setKitSize(5);
  }, [mode]);

  const selectedCount = useMemo(() => Object.values(qtyByProduct).reduce((sum, q) => sum + q, 0), [qtyByProduct]);
  const remaining = targetCount - selectedCount;
  const canIncrease = remaining > 0;

  const setQty = (productId: string, next: number) => {
    setQtyByProduct((prev) => {
      const safe = Math.max(0, Math.min(targetCount, next));
      if (safe === 0) { const { [productId]: _, ...rest } = prev; return rest; }
      return { ...prev, [productId]: safe };
    });
  };

  const handleAddToCart = async () => {
    if (remaining !== 0) return;
    const cartItems = fragrances
      .map((f) => {
        const q = qtyByProduct[f.productId] || 0;
        const variant = f.variants[mode];
        return q > 0 && variant ? {
          variantId: variant.id, productId: f.productId, productName: f.name,
          variantSize: variant.size, price: variant.price, quantity: q, image: f.imageUrl,
        } : null;
      })
      .filter(Boolean) as any[];

    for (const it of cartItems) await addItem(it);
    navigate("/cart");
  };

  return (
    <PremiumPageLayout>
      <Seo title="Sparkits konfigurieren | ALDENAIR" description="Stelle dein Sparkits-Set zusammen." canonicalPath="/sparkits" />

      {/* Header */}
      <section className="border-b border-border">
        <div className="container-premium py-8 lg:py-12">
          <Breadcrumb className="mb-6" />
          <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-3">Konfigurieren</span>
          <h1 className="font-display text-3xl lg:text-4xl text-foreground mb-3">Sparkits zusammenstellen</h1>
          <p className="text-muted-foreground text-sm max-w-lg">
            Wähle {mode === "50ml" ? "50ml Flakons" : "5ml Proben"} und stelle dein individuelles Set zusammen.
          </p>
        </div>
      </section>

      {/* Mode Selector */}
      <section className="border-b border-border">
        <div className="container-premium">
          <div className="flex items-center gap-0 h-14">
            <button
              onClick={() => setMode("50ml")}
              className={`h-full px-6 text-[11px] tracking-[0.1em] uppercase font-medium border-b-2 transition-colors ${
                mode === "50ml" ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              50ml Flakons
            </button>
            <button
              onClick={() => setMode("5ml")}
              className={`h-full px-6 text-[11px] tracking-[0.1em] uppercase font-medium border-b-2 transition-colors ${
                mode === "5ml" ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              5ml Proben
            </button>
          </div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="container-premium">
          <div className="grid lg:grid-cols-[1fr_320px] gap-8 lg:gap-12">
            {/* Product List */}
            <div>
              {/* Kit size selector for 50ml */}
              {mode === "50ml" && (
                <div className="flex items-center gap-4 mb-8 p-4 border border-border">
                  <Sparkles className="w-5 h-5 text-accent" strokeWidth={1.5} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Set-Größe</p>
                    <p className="text-xs text-muted-foreground">Wähle 3er oder 5er Set</p>
                  </div>
                  <div className="flex gap-2">
                    {([3, 5] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => setKitSize(size)}
                        className={`px-4 py-2 text-[10px] tracking-[0.1em] uppercase font-medium border transition-colors ${
                          kitSize === size ? "bg-foreground text-background border-foreground" : "border-border text-foreground hover:bg-muted"
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
              ) : fragrances.length === 0 ? (
                <p className="text-muted-foreground text-center py-16">Keine passenden Produkte gefunden.</p>
              ) : (
                <div className="space-y-0">
                  {fragrances.map((f, index) => {
                    const q = qtyByProduct[f.productId] || 0;
                    const variant = f.variants[mode];
                    const disabled = !variant;
                    return (
                      <div
                        key={f.productId}
                        className={`flex items-center gap-4 py-4 px-4 ${index > 0 ? "border-t border-border" : ""} ${disabled ? "opacity-50" : ""}`}
                      >
                        <img src={f.imageUrl} alt={f.name} className="w-14 h-14 object-cover bg-muted flex-shrink-0" loading="lazy" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{f.name}</p>
                          <p className="text-xs text-muted-foreground">{variant ? `${variant.price.toFixed(2)} €` : "Nicht verfügbar"}</p>
                        </div>
                        <div className="flex items-center border border-border">
                          <button disabled={q === 0 || disabled} onClick={() => setQty(f.productId, q - 1)} className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30">
                            <Minus className="w-3.5 h-3.5" strokeWidth={1.5} />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{q}</span>
                          <button disabled={!canIncrease || disabled} onClick={() => setQty(f.productId, q + 1)} className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30">
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
                <h2 className="text-[10px] tracking-[0.2em] uppercase text-accent">Dein Set</h2>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Ausgewählt</span>
                  <span className="font-medium text-foreground">{selectedCount} / {targetCount}</span>
                </div>
                <div className="h-1 bg-muted overflow-hidden">
                  <div className="h-full bg-accent transition-all duration-300" style={{ width: `${(selectedCount / targetCount) * 100}%` }} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {remaining > 0 ? `Noch ${remaining} Stück auswählen.` : remaining < 0 ? "Zu viele ausgewählt." : "Set ist vollständig."}
                </p>
                <button
                  disabled={remaining !== 0 || loading}
                  onClick={handleAddToCart}
                  className="w-full py-4 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50"
                >
                  In den Warenkorb
                </button>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </PremiumPageLayout>
  );
}