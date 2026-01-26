import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useState } from 'react';

interface PremiumProductCardProps {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  inspiredBy?: string;
}

export function PremiumProductCard({
  id,
  name,
  category,
  price,
  originalPrice,
  image,
  rating = 0,
  reviewCount = 0,
  inStock = true,
  inspiredBy,
}: PremiumProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const discount = originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0;

  return (
    <article 
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <Link to={`/products/${id}`} className="block relative aspect-[3/4] overflow-hidden bg-sand dark:bg-muted mb-4">
        {/* Loading Skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        
        <img
          src={image}
          alt={name}
          className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
            isHovered ? 'scale-105' : 'scale-100'
          } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />

        {/* Overlay Actions */}
        <div 
          className={`absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-foreground/80 to-transparent transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex gap-2">
            <Link
              to={`/products/${id}`}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-background text-foreground text-[10px] tracking-[0.1em] uppercase font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" strokeWidth={1.5} />
              Details
            </Link>
            <button
              className="flex items-center justify-center w-12 bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              aria-label="Zu Favoriten hinzufügen"
            >
              <Heart className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discount > 0 && (
            <span className="px-2 py-1 bg-destructive text-destructive-foreground text-[9px] tracking-[0.05em] uppercase font-medium">
              -{discount}%
            </span>
          )}
          {!inStock && (
            <span className="px-2 py-1 bg-muted text-muted-foreground text-[9px] tracking-[0.05em] uppercase font-medium">
              Ausverkauft
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="space-y-2">
        {/* Category */}
        <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
          {category}
        </p>

        {/* Name */}
        <Link to={`/products/${id}`}>
          <h3 className="font-display text-lg text-foreground hover:text-accent transition-colors line-clamp-1">
            {name}
          </h3>
        </Link>

        {/* Inspired By */}
        {inspiredBy && (
          <p className="text-xs text-muted-foreground italic line-clamp-1">
            Inspiriert von {inspiredBy}
          </p>
        )}

        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-3 h-3 ${i < Math.floor(rating) ? 'text-accent' : 'text-muted'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            {reviewCount > 0 && (
              <span className="text-[10px] text-muted-foreground">
                ({reviewCount})
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-lg font-medium text-foreground">
            ab {price.toFixed(2)} €
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-sm text-muted-foreground line-through">
              {originalPrice.toFixed(2)} €
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
