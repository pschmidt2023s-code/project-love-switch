/**
 * Image Pipeline - Advanced image optimization utilities.
 * Implements AVIF/WebP format detection, responsive srcset generation,
 * blur placeholder hashing, and connection-aware loading.
 */

// Supported image formats in preference order
type ImageFormat = 'avif' | 'webp' | 'jpg' | 'png';

// Format support detection (cached)
let _formatSupport: Record<ImageFormat, boolean> | null = null;

export async function detectFormatSupport(): Promise<Record<ImageFormat, boolean>> {
  if (_formatSupport) return _formatSupport;

  const checks: Record<ImageFormat, string> = {
    avif: 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLanAyaAAAAAAAAAsAAHMAAIAAAA==',
    webp: 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA',
    jpg: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//',
    png: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQABNjN9GQA=',
  };

  const results = await Promise.all(
    Object.entries(checks).map(async ([format, src]) => {
      try {
        const img = new Image();
        return new Promise<[string, boolean]>((resolve) => {
          img.onload = () => resolve([format, img.width > 0]);
          img.onerror = () => resolve([format, false]);
          img.src = src;
        });
      } catch {
        return [format, false] as [string, boolean];
      }
    })
  );

  _formatSupport = Object.fromEntries(results) as Record<ImageFormat, boolean>;
  return _formatSupport;
}

/**
 * Generate responsive breakpoints for srcset.
 * Amazon-style: provide multiple sizes for different viewports.
 */
export const RESPONSIVE_WIDTHS = [320, 480, 640, 768, 1024, 1280, 1536] as const;

export function generateSrcSet(src: string, widths: readonly number[] = RESPONSIVE_WIDTHS): string {
  // Only works with Supabase Storage or CDN URLs that support transforms
  if (!src || src.startsWith('data:')) return '';

  // For Supabase storage URLs, use image transforms
  if (src.includes('supabase.co/storage')) {
    return widths
      .map((w) => `${src}?width=${w}&quality=80 ${w}w`)
      .join(', ');
  }

  // For Unsplash-style URLs
  if (src.includes('unsplash.com')) {
    return widths
      .map((w) => `${src.split('?')[0]}?w=${w}&q=80&auto=format ${w}w`)
      .join(', ');
  }

  return '';
}

/**
 * Generate responsive sizes attribute based on layout context.
 */
export function generateSizes(layout: 'grid-4' | 'grid-3' | 'grid-2' | 'full' | 'hero'): string {
  switch (layout) {
    case 'grid-4':
      return '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw';
    case 'grid-3':
      return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
    case 'grid-2':
      return '(max-width: 640px) 100vw, 50vw';
    case 'full':
      return '100vw';
    case 'hero':
      return '100vw';
    default:
      return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
  }
}

/**
 * Connection-aware image quality selection.
 * Reduces quality on slow connections (Save-Data, slow 3G).
 */
export function getOptimalQuality(): number {
  if (typeof navigator === 'undefined') return 80;

  // Check Save-Data header preference
  const conn = (navigator as any).connection;
  if (conn) {
    if (conn.saveData) return 40;
    if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') return 40;
    if (conn.effectiveType === '3g') return 60;
  }

  return 80;
}

/**
 * Generate a tiny CSS gradient placeholder from dominant color.
 * Much faster than blurhash but still provides a visual hint.
 */
export function generatePlaceholderGradient(dominantColor?: string): string {
  const base = dominantColor || 'hsl(var(--muted))';
  return `linear-gradient(135deg, ${base}, ${base}88)`;
}

/**
 * Preload critical above-the-fold images with proper format hints.
 */
export function preloadCriticalImage(src: string, as: 'image' = 'image'): void {
  if (typeof document === 'undefined') return;

  // Avoid duplicate preloads
  const existing = document.querySelector(`link[rel="preload"][href="${src}"]`);
  if (existing) return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = as;
  link.href = src;
  link.setAttribute('fetchpriority', 'high');

  document.head.appendChild(link);
}

/**
 * IntersectionObserver-based image prefetching.
 * Prefetches images when they're 1 viewport away.
 */
export function createImagePrefetcher(): IntersectionObserver | null {
  if (typeof IntersectionObserver === 'undefined') return null;

  return new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const dataSrc = img.dataset.src;
          if (dataSrc) {
            // Prefetch by creating a hidden image
            const prefetchImg = new Image();
            prefetchImg.src = dataSrc;
          }
        }
      });
    },
    {
      rootMargin: '100% 0px', // 1 viewport ahead
      threshold: 0,
    }
  );
}
