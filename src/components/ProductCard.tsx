import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

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

  return (
    <Card className="group overflow-hidden bg-card border-border/50 hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-muted/30">
        <Link to={`/products/${id}`}>
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
        >
          <Heart className="w-4 h-4" />
        </Button>

        {/* Quick Add Button */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <Button 
            className="w-full gap-2" 
            disabled={!inStock}
          >
            <ShoppingCart className="w-4 h-4" />
            In den Warenkorb
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
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-primary text-primary" />
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
              {price.toFixed(2)} €
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
  );
}
