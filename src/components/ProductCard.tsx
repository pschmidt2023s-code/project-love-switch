import { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Heart, Star, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { QuickViewModal } from '@/components/QuickViewModal';

interface ProductCardProps {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
}

export function ProductCard({
  id,
  name,
  category,
  price,
  originalPrice,
  image,
  rating = 4.5,
  reviewCount = 0,
  inStock = true,
}: ProductCardProps) {
  const discount = originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0;
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const handleQuickView = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  }, []);

  return (
    <>
      <Card className="group overflow-hidden bg-card border-border/50 hover-elevate press-scale" role="article" aria-label={`${name}, ${price.toFixed(2)} Euro`}>
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-muted/30">
          <Link to={`/products/${id}`} aria-label={`${name} ansehen`}>
            <img
              src={image}
              alt={`${name} - ${category}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </Link>
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {discount > 0 && (
              <Badge className="bg-destructive text-destructive-foreground">
                -{discount}%
              </Badge>
            )}
            {!inStock && (
              <Badge variant="secondary">
                Ausverkauft
              </Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm press-scale"
            aria-label={`${name} zu Favoriten hinzufügen`}
          >
            <Heart className="w-4 h-4" aria-hidden="true" />
          </Button>

          {/* Quick Actions */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 flex gap-2">
            <Button
              className="flex-1 gap-2"
              disabled={!inStock}
              asChild
            >
              <Link to={`/products/${id}`}>
                <ShoppingCart className="w-4 h-4" />
                Details
              </Link>
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="bg-background/80 backdrop-blur-sm"
              onClick={handleQuickView}
              aria-label={`Schnellansicht für ${name}`}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {category}
            </p>
            <Link to={`/products/${id}`}>
              <h3 className="font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors">
                {name}
              </h3>
            </Link>
            
            {/* Rating */}
            {rating > 0 && (
              <div className="flex items-center gap-1" aria-label={`Bewertung: ${rating.toFixed(1)} von 5 Sternen${reviewCount > 0 ? `, ${reviewCount} Bewertungen` : ''}`}>
                <Star className="w-4 h-4 fill-primary text-primary" aria-hidden="true" />
                <span className="text-sm font-medium">{rating.toFixed(1)}</span>
                {reviewCount > 0 && (
                  <span className="text-xs text-muted-foreground">
                    ({reviewCount})
                  </span>
                )}
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-lg font-bold text-foreground">
                ab {price.toFixed(2)} €
              </span>
              {originalPrice && originalPrice > price && (
                <span className="text-sm text-muted-foreground line-through">
                  {originalPrice.toFixed(2)} €
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <QuickViewModal
        productId={id}
        open={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
      />
    </>
  );
}
