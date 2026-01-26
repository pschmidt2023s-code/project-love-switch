import { useState, useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface ImageSize {
  width: number;
  descriptor: string;
}

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  sizes?: string;
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  onLoad?: () => void;
  onError?: () => void;
}

// Generate srcset for responsive images
const generateSrcSet = (src: string): string => {
  // For external URLs or data URLs, return as-is
  if (src.startsWith('http') || src.startsWith('data:')) {
    return '';
  }
  
  // For local images, we can't generate different sizes without a CDN
  // But we can still provide the original for all sizes
  return '';
};

// Default responsive sizes
const DEFAULT_SIZES = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';

export function OptimizedImage({
  src,
  alt,
  className,
  wrapperClassName,
  width,
  height,
  priority = false,
  placeholder = 'blur',
  sizes = DEFAULT_SIZES,
  aspectRatio,
  objectFit = 'cover',
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Generate srcset
  const srcSet = useMemo(() => generateSrcSet(src), [src]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isLoaded) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '200px', // Start loading 200px before entering viewport
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isLoaded]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Fallback image
  const fallbackSrc = '/placeholder.svg';

  // Calculate aspect ratio style
  const aspectRatioStyle = aspectRatio 
    ? { aspectRatio } 
    : height && width 
      ? { aspectRatio: `${width}/${height}` } 
      : undefined;

  return (
    <div
      ref={imgRef}
      className={cn(
        'relative overflow-hidden bg-muted',
        wrapperClassName
      )}
      style={{ 
        width: width ? `${width}px` : undefined, 
        height: height ? `${height}px` : undefined,
        ...aspectRatioStyle
      }}
    >
      {/* Placeholder/Skeleton with blur effect */}
      {placeholder === 'blur' && !isLoaded && (
        <div 
          className={cn(
            'absolute inset-0 bg-gradient-to-br from-muted via-muted to-muted-foreground/5',
            'animate-pulse',
            isLoaded && 'opacity-0 transition-opacity duration-500'
          )}
        >
          {/* Shimmer effect */}
          <div 
            className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"
          />
        </div>
      )}
      
      {/* Low-quality placeholder */}
      {placeholder === 'blur' && !isLoaded && !hasError && (
        <div 
          className="absolute inset-0 bg-muted/50 backdrop-blur-xl"
          aria-hidden="true"
        />
      )}
      
      {/* Actual Image */}
      {isInView && (
        <picture>
          {/* WebP source for modern browsers */}
          {src && !src.startsWith('http') && !src.startsWith('data:') && (
            <source
              type="image/webp"
              srcSet={src.replace(/\.(png|jpg|jpeg)$/i, '.webp')}
            />
          )}
          
          <img
            src={hasError ? fallbackSrc : src}
            alt={alt}
            width={width}
            height={height}
            sizes={sizes}
            loading={priority ? 'eager' : 'lazy'}
            decoding={priority ? 'sync' : 'async'}
            fetchPriority={priority ? 'high' : 'auto'}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              'w-full h-full transition-opacity duration-500',
              objectFit === 'cover' && 'object-cover',
              objectFit === 'contain' && 'object-contain',
              objectFit === 'fill' && 'object-fill',
              objectFit === 'none' && 'object-none',
              isLoaded ? 'opacity-100' : 'opacity-0',
              className
            )}
          />
        </picture>
      )}
      
      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
          <span className="text-xs">Bild nicht verfügbar</span>
        </div>
      )}
    </div>
  );
}

// Preload critical images
export function preloadImage(src: string): void {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  
  // Add WebP alternative
  if (!src.startsWith('http') && !src.startsWith('data:')) {
    const webpLink = document.createElement('link');
    webpLink.rel = 'preload';
    webpLink.as = 'image';
    webpLink.href = src.replace(/\.(png|jpg|jpeg)$/i, '.webp');
    webpLink.type = 'image/webp';
    document.head.appendChild(webpLink);
  }
  
  document.head.appendChild(link);
}

// Hook for preloading images
export function usePreloadImages(srcs: string[]): void {
  useEffect(() => {
    srcs.forEach(preloadImage);
  }, [srcs]);
}
