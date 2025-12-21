import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProduct } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ShoppingCart, Heart, Star, Truck, Shield, RotateCcw, Minus, Plus, ArrowLeft,
  Sparkles, Leaf, Sun, CloudSnow, TreeDeciduous, Calendar, Award, ShoppingBag
} from 'lucide-react';

export default function ProductDetailPage() {
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
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${
              i < Math.floor(rating)
                ? 'fill-primary text-primary'
                : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    );
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
          <Button onClick={() => navigate('/products')}>
            Zurück zur Kollektion
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const discount = selectedVariant?.original_price 
    ? Math.round((1 - Number(selectedVariant.price) / Number(selectedVariant.original_price)) * 100) 
    : 0;

  const rating = product.rating ? Number(product.rating) : null;
  const reviewCount = product.review_count || 0;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück
        </Button>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* Product Image */}
          <div className="relative">
            <Card className="overflow-hidden">
              <img
                src={product.image_url || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-96 lg:h-[500px] object-cover"
              />
            </Card>

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {discount > 0 && (
                <Badge variant="destructive" className="bg-primary text-primary-foreground">
                  -{discount}% SALE
                </Badge>
              )}
              {selectedVariant && !(selectedVariant.stock === null || selectedVariant.stock > 0) && (
                <Badge variant="secondary">
                  Ausverkauft
                </Badge>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-primary font-medium text-sm uppercase tracking-wide mb-2">
                ALDENAIR
              </p>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                {product.name}
              </h1>

              {rating && reviewCount > 0 ? (
                <div className="flex items-center gap-2 mb-4">
                  {renderStars(rating)}
                  <span className="text-sm text-muted-foreground">
                    {rating.toFixed(1)} ({reviewCount} Bewertungen)
                  </span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground block mb-4">Noch keine Bewertungen</span>
              )}
            </div>

            {/* Variant Selection */}
            {variants.length > 1 && (
              <div className="space-y-4">
                <label className="text-lg font-semibold">Größe wählen</label>
                <div className="flex flex-wrap gap-3">
                  {variants.map((variant) => (
                    <Button
                      key={variant.id}
                      variant={selectedVariant?.id === variant.id ? 'default' : 'outline'}
                      className="min-w-[100px]"
                      onClick={() => setSelectedVariantId(variant.id)}
                    >
                      {variant.size}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Variant Details */}
            {selectedVariant && (
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{selectedVariant.size}</h3>
                  {product.inspired_by && (
                    <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                      <span className="text-sm font-semibold text-primary">Inspiriert von:</span>
                      <span className="ml-2 text-sm font-medium">{product.inspired_by}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Preis:</span>
                      <span className="ml-2 font-bold text-lg text-primary">
                        {Number(selectedVariant.price).toFixed(2)} €
                      </span>
                    </div>
                    {selectedVariant.original_price && (
                      <div>
                        <span className="text-muted-foreground">UVP:</span>
                        <span className="ml-2 line-through text-muted-foreground">
                          {Number(selectedVariant.original_price).toFixed(2)} €
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Verfügbarkeit:</span>
                      <span className="ml-2 font-medium">
                        {selectedVariant.stock === null || selectedVariant.stock > 0 ? 'Auf Lager' : 'Ausverkauft'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quantity Selection */}
            <div className="flex items-center gap-4">
              <span className="font-medium">Menge:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
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
            <div className="flex gap-3 pt-4">
              <Button
                className="flex-1"
                size="lg"
                variant="default"
                onClick={handleAddToCart}
                disabled={!selectedVariant || (selectedVariant.stock !== null && selectedVariant.stock <= 0)}
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                {selectedVariant?.stock === null || (selectedVariant?.stock ?? 0) > 0 
                  ? "In den Warenkorb" 
                  : "Nicht verfügbar"}
              </Button>
              <Button variant="outline" size="lg">
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

        {/* Scent Information Section */}
        {(product.top_notes?.length || product.middle_notes?.length || product.base_notes?.length || 
          product.scent_notes?.length || product.ai_description || product.seasons?.length || 
          product.occasions?.length || product.ingredients?.length) && (
          <Card className="mb-12">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Duftprofil</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* AI Description */}
                  {product.ai_description && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Award className="w-4 h-4 text-primary" />
                        Beschreibung
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {product.ai_description}
                      </p>
                    </div>
                  )}

                  {/* Description fallback */}
                  {!product.ai_description && product.description && (
                    <div>
                      <h3 className="font-semibold mb-3">Beschreibung</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  )}

                  {/* Inspired By */}
                  {product.inspired_by && (
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <h3 className="font-semibold mb-2 text-primary">Inspiriert von</h3>
                      <p className="text-lg font-medium">{product.inspired_by}</p>
                    </div>
                  )}

                  {/* Fragrance Notes Pyramid */}
                  {(product.top_notes?.length || product.middle_notes?.length || product.base_notes?.length) && (
                    <div className="space-y-4">
                      {product.top_notes && product.top_notes.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2 text-sm text-muted-foreground">Kopfnoten</h4>
                          <div className="flex flex-wrap gap-2">
                            {product.top_notes.map((note) => (
                              <Badge key={note} variant="secondary" className="text-sm">{note}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {product.middle_notes && product.middle_notes.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2 text-sm text-muted-foreground">Herznoten</h4>
                          <div className="flex flex-wrap gap-2">
                            {product.middle_notes.map((note) => (
                              <Badge key={note} variant="secondary" className="text-sm">{note}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {product.base_notes && product.base_notes.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2 text-sm text-muted-foreground">Basisnoten</h4>
                          <div className="flex flex-wrap gap-2">
                            {product.base_notes.map((note) => (
                              <Badge key={note} variant="secondary" className="text-sm">{note}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Legacy Scent Notes */}
                  {!(product.top_notes?.length || product.middle_notes?.length || product.base_notes?.length) && 
                   product.scent_notes && product.scent_notes.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Leaf className="w-4 h-4" />
                        Duftnoten
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {product.scent_notes.map((note) => (
                          <Badge key={note} variant="secondary" className="text-sm">
                            {note}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ingredients */}
                  {product.ingredients && product.ingredients.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Leaf className="w-4 h-4" />
                        Inhaltsstoffe
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {product.ingredients.map((ingredient) => (
                          <Badge key={ingredient} variant="outline" className="text-sm">
                            {ingredient}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Seasons */}
                  {product.seasons && product.seasons.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Sun className="w-4 h-4" />
                        Passende Jahreszeiten
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {product.seasons.map((season) => {
                          const SeasonIcon = season === 'Frühling' ? Leaf :
                                           season === 'Sommer' ? Sun :
                                           season === 'Herbst' ? TreeDeciduous : CloudSnow;
                          return (
                            <Badge key={season} variant="outline" className="gap-1.5">
                              <SeasonIcon className="w-3 h-3" />
                              {season}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Occasions */}
                  {product.occasions && product.occasions.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Passende Anlässe
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {product.occasions.map((occasion) => (
                          <Badge key={occasion} variant="outline">
                            {occasion}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Product Details */}
        <Card className="mb-12">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">Produktdetails</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Allgemeine Informationen</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong>Marke:</strong> {product.brand || 'ALDENAIR'}</p>
                  <p><strong>Größe:</strong> {selectedVariant?.size || product.size || '-'}</p>
                  <p><strong>Kategorie:</strong> {(product as any).categories?.name || 'Parfüm'}</p>
                  <p><strong>Varianten:</strong> {variants.length}</p>
                  {product.gender && <p><strong>Geschlecht:</strong> {product.gender}</p>}
                </div>
              </div>
              {selectedVariant && (
                <div>
                  <h3 className="font-semibold mb-2">Ausgewählte Variante</h3>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>Größe:</strong> {selectedVariant.size}</p>
                    <p><strong>Preis:</strong> {Number(selectedVariant.price).toFixed(2)} €</p>
                    {selectedVariant.original_price && (
                      <p><strong>UVP:</strong> {Number(selectedVariant.original_price).toFixed(2)} €</p>
                    )}
                    <p><strong>Lagerbestand:</strong> {selectedVariant.stock ?? 'Verfügbar'}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
