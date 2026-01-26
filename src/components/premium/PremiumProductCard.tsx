import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

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
    <motion.article 
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -4 }}
    >
      {/* Image Container */}
      <Link to={`/products/${id}`} className="block relative aspect-[3/4] overflow-hidden bg-sand dark:bg-muted mb-4">
        {/* Loading Skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        
        <motion.img
          src={image}
          alt={name}
          className={`w-full h-full object-cover ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        />

        {/* Overlay Actions */}
        <motion.div 
          className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-foreground/80 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex gap-2">
            <motion.div
              className="flex-1"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: isHovered ? 0 : 10, opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
            >
              <Link
                to={`/products/${id}`}
                className="flex items-center justify-center gap-2 py-3 w-full bg-background text-foreground text-[10px] tracking-[0.1em] uppercase font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <ShoppingBag className="w-3.5 h-3.5" strokeWidth={1.5} />
                Details
              </Link>
            </motion.div>
            <motion.button
              className="flex items-center justify-center w-12 bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              aria-label="Zu Favoriten hinzufügen"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: isHovered ? 0 : 10, opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Heart className="w-4 h-4" strokeWidth={1.5} />
            </motion.button>
          </div>
        </motion.div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discount > 0 && (
            <motion.span 
              className="px-2 py-1 bg-destructive text-destructive-foreground text-[9px] tracking-[0.05em] uppercase font-medium"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              -{discount}%
            </motion.span>
          )}
          {!inStock && (
            <motion.span 
              className="px-2 py-1 bg-muted text-muted-foreground text-[9px] tracking-[0.05em] uppercase font-medium"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              Ausverkauft
            </motion.span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="space-y-2">
        {/* Category */}
        <motion.p 
          className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {category}
        </motion.p>

        {/* Name */}
        <Link to={`/products/${id}`}>
          <motion.h3 
            className="font-display text-lg text-foreground hover:text-accent transition-colors line-clamp-1"
            whileHover={{ x: 2 }}
            transition={{ duration: 0.2 }}
          >
            {name}
          </motion.h3>
        </Link>

        {/* Inspired By */}
        {inspiredBy && (
          <motion.p 
            className="text-xs text-muted-foreground italic line-clamp-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            Inspiriert von {inspiredBy}
          </motion.p>
        )}

        {/* Rating */}
        {rating > 0 && (
          <motion.div 
            className="flex items-center gap-1.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <motion.svg
                  key={i}
                  className={`w-3 h-3 ${i < Math.floor(rating) ? 'text-accent' : 'text-muted'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2, delay: 0.25 + i * 0.05 }}
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </motion.svg>
              ))}
            </div>
            {reviewCount > 0 && (
              <span className="text-[10px] text-muted-foreground">
                ({reviewCount})
              </span>
            )}
          </motion.div>
        )}

        {/* Price */}
        <motion.div 
          className="flex items-baseline gap-2 pt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <span className="text-lg font-medium text-foreground">
            ab {price.toFixed(2)} €
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-sm text-muted-foreground line-through">
              {originalPrice.toFixed(2)} €
            </span>
          )}
        </motion.div>
      </div>
    </motion.article>
  );
}
