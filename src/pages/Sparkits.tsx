import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { PageLayout } from "@/components/PageLayout";
import { Seo } from "@/components/Seo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Sparkles, ArrowLeft } from "lucide-react";

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
        .select(
          `
          id,
          size,
          price,
          product_id,
          products (
            id,
            name,
            slug,
            image_url,
            categories ( slug )
          )
        `
        );

      if (!mounted) return;

      if (error) {
        console.error("[Sparkits] load error", error);
        setFragrances([]);
        setLoading(false);
        return;
      }

      const rows = (data || []) as any[];

      // Only use base fragrances (category = herren)
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
        if (s === "50ml") {
          existing.variants["50ml"] = {
            id: r.id,
            size: String(r.size),
            price: Number(r.price),
          };
        }
        if (s === "5ml") {
          existing.variants["5ml"] = {
            id: r.id,
            size: String(r.size),
            price: Number(r.price),
          };
        }

        byProduct.set(key, existing);
      }

      setFragrances(Array.from(byProduct.values()));
      setLoading(false);
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Reset quantities if mode changes (keeps it simple and avoids invalid selections)
  useEffect(() => {
    setQtyByProduct({});
    if (mode === "5ml") setKitSize(5);
  }, [mode]);

  const selectedCount = useMemo(() => {
    return Object.values(qtyByProduct).reduce((sum, q) => sum + q, 0);
  }, [qtyByProduct]);

  const remaining = targetCount - selectedCount;

  const canIncrease = remaining > 0;

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

    const items = fragrances
      .map((f) => {
        const q = qtyByProduct[f.productId] || 0;
        const variant = f.variants[mode];
        return q > 0 && variant
          ? {
              variantId: variant.id,
              productId: f.productId,
              productName: f.name,
              variantSize: variant.size,
              price: variant.price,
              quantity: q,
              image: f.imageUrl,
            }
          : null;
      })
      .filter(Boolean) as any[];

    for (const it of items) {
      // addItem already handles guest vs logged-in cart
      await addItem(it);
    }

    navigate("/cart");
  };

  return (
    <PageLayout>
      <Seo
        title="Sparkits konfigurieren | ALDENAIR"
        description="Stelle dein 3er oder 5er Sparkits-Set aus 50ml Flakons oder 5ml Proben zusammen."
        canonicalPath="/sparkits"
      />

      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Sparkits zusammenstellen</h1>
          <p className="text-muted-foreground">
            Wähle {mode === "50ml" ? "50ml Flakons" : "5ml Proben"} und stelle dein Set zusammen.
          </p>
        </div>
      </div>

      <Tabs value={mode} onValueChange={(v) => setMode(v as "50ml" | "5ml")}>
        <TabsList>
          <TabsTrigger value="50ml">50ml Flakons</TabsTrigger>
          <TabsTrigger value="5ml">5ml Proben</TabsTrigger>
        </TabsList>

        <TabsContent value="50ml" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> 50ml Sparkits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="font-medium">Set-Größe</p>
                  <p className="text-sm text-muted-foreground">Wähle 3er oder 5er Set.</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={kitSize === 3 ? "default" : "outline"}
                    onClick={() => setKitSize(3)}
                  >
                    3er Set
                  </Button>
                  <Button
                    variant={kitSize === 5 ? "default" : "outline"}
                    onClick={() => setKitSize(5)}
                  >
                    5er Set
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="5ml" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Probenset (5 Stück)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Proben gibt es als 5er Set. Wähle insgesamt 5 Proben.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6 mt-8">
        <section className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-6 text-muted-foreground">Lade Düfte…</CardContent>
            </Card>
          ) : fragrances.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-muted-foreground">
                Keine passenden Produkte gefunden.
              </CardContent>
            </Card>
          ) : (
            fragrances.map((f) => {
              const q = qtyByProduct[f.productId] || 0;
              const variant = f.variants[mode];
              const disabled = !variant;

              return (
                <Card key={f.productId} className={disabled ? "opacity-60" : ""}>
                  <CardContent className="p-4">
                    <div className="flex gap-4 items-center">
                      <img
                        src={f.imageUrl}
                        alt={`${f.name} ${mode === "50ml" ? "50ml" : "5ml"} Duft`}
                        className="h-16 w-16 rounded-lg object-cover bg-muted"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{f.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {variant ? `${variant.price.toFixed(2)} €` : "Nicht verfügbar"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          disabled={q === 0 || disabled}
                          onClick={() => setQty(f.productId, q - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">{q}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          disabled={!canIncrease || disabled}
                          onClick={() => setQty(f.productId, q + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </section>

        <aside>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Dein Set</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Ausgewählt</span>
                <span className="font-semibold">{selectedCount} / {targetCount}</span>
              </div>
              <Separator />
              <p className="text-sm text-muted-foreground">
                {remaining > 0
                  ? `Bitte noch ${remaining} Stück auswählen.`
                  : remaining < 0
                    ? "Zu viele ausgewählt – bitte reduzieren."
                    : "Perfekt – Set ist vollständig."}
              </p>

              <Button className="w-full" disabled={remaining !== 0 || loading} onClick={handleAddToCart}>
                In den Warenkorb
              </Button>

              <p className="text-xs text-muted-foreground">
                Hinweis: Aktuell werden die ausgewählten Produkte einzeln in den Warenkorb gelegt.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </PageLayout>
  );
}
