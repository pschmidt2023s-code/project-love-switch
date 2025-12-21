import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProduct } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, Heart, Star, Truck, Shield, RotateCcw, Minus, Plus, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { product, variants, loading, error } = useProduct(slug || '');
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const activeVariant = variants.find(v => v.id === selectedVariant) || variants[0];

  const handleAddToCart = async () => {
    if (!activeVariant || !product) return;

    await addItem({
      variantId: activeVariant.id,
      productId: product.id,
      productName: product.name,
      variantSize: activeVariant.size,
      price: Number(activeVariant.price),
      quantity,
      image: product.image_url || '',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Produkt nicht gefunden</h1>
          <Button asChild>
            <Link to="/products">Zurück zur Kollektion</Link>
          </Button>
        </main>
      </div>
    );
  }

  const discount = product.original_price 
    ? Math.round((1 - Number(product.base_price) / Number(product.original_price)) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/products" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Zurück zur Kollektion
            </Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted/30">
              <img
                src={product.image_url || 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=800&fit=crop'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {discount > 0 && (
              <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-lg px-3 py-1">
                -{discount}%
              </Badge>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
                {(product as any).categories?.name || 'Parfüm'}
              </p>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                {product.name}
              </h1>
              
              {product.rating && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-primary text-primary" />
                    <span className="font-semibold">{Number(product.rating).toFixed(1)}</span>
                  </div>
                  <span className="text-muted-foreground">
                    ({product.review_count} Bewertungen)
                  </span>
                </div>
              )}

              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Variant Selection */}
            <div className="space-y-3">
              <p className="font-medium">Größe wählen:</p>
              <div className="flex flex-wrap gap-3">
                {variants.map((variant) => (
                  <Button
                    key={variant.id}
                    variant={activeVariant?.id === variant.id ? 'default' : 'outline'}
                    className="min-w-[80px]"
                    onClick={() => setSelectedVariant(variant.id)}
                  >
                    {variant.size}
                  </Button>
                ))}
              </div>
            </div>

            {/* Price */}
            {activeVariant && (
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-foreground">
                  {Number(activeVariant.price).toFixed(2)} €
                </span>
                {activeVariant.original_price && (
                  <span className="text-xl text-muted-foreground line-through">
                    {Number(activeVariant.original_price).toFixed(2)} €
                  </span>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <p className="font-medium">Menge:</p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button size="lg" className="flex-1 gap-2" onClick={handleAddToCart}>
                <ShoppingCart className="w-5 h-5" />
                In den Warenkorb
              </Button>
              <Button size="lg" variant="outline">
                <Heart className="w-5 h-5" />
              </Button>
            </div>

            {/* Trust Badges */}
            <Card className="bg-muted/30 border-border/50">
              <CardContent className="grid grid-cols-3 gap-4 p-4">
                <div className="text-center">
                  <Truck className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Gratis ab 50€</p>
                </div>
                <div className="text-center">
                  <Shield className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Sichere Zahlung</p>
                </div>
                <div className="text-center">
                  <RotateCcw className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">14 Tage Rückgabe</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
