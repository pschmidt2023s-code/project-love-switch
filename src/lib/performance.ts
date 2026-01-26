/**
 * Performance utilities for optimizing the application
 */

// Debounce function for expensive operations
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => func(...args), wait);
  };
}

// Throttle function for rate-limiting operations
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// Measure performance of async operations
export async function measureAsync<T>(
  name: string,
  operation: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await operation();
    const duration = performance.now() - start;
    if (import.meta.env.DEV) {
      console.log(`[Perf] ${name}: ${duration.toFixed(2)}ms`);
    }
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    if (import.meta.env.DEV) {
      console.error(`[Perf] ${name} failed after ${duration.toFixed(2)}ms`, error);
    }
    throw error;
  }
}

// Preload critical images
export function preloadImages(urls: string[]): void {
  urls.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
}

// Check if reduced motion is preferred
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Request idle callback polyfill
export function requestIdleCallback(
  callback: IdleRequestCallback,
  options?: IdleRequestOptions
): number {
  const win = typeof window !== 'undefined' ? window : undefined;
  if (win && 'requestIdleCallback' in win) {
    return (win as Window & { requestIdleCallback: (cb: IdleRequestCallback, opts?: IdleRequestOptions) => number }).requestIdleCallback(callback, options);
  }
  // Fallback for Safari or SSR
  const timeoutFn = win ? win.setTimeout : globalThis.setTimeout;
  return timeoutFn(() => {
    callback({
      didTimeout: false,
      timeRemaining: () => 50,
    });
  }, 1) as unknown as number;
}

// Cancel idle callback polyfill
export function cancelIdleCallback(id: number): void {
  const win = typeof window !== 'undefined' ? window : undefined;
  if (win && 'cancelIdleCallback' in win) {
    (win as Window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(id);
  } else {
    const clearFn = win ? win.clearTimeout : globalThis.clearTimeout;
    clearFn(id);
  }
}

// Lazy load component when idle
export function loadWhenIdle<T>(
  loader: () => Promise<T>,
  timeout = 2000
): Promise<T> {
  return new Promise((resolve, reject) => {
    requestIdleCallback(
      async () => {
        try {
          const result = await loader();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      },
      { timeout }
    );
  });
}

// Memory-efficient cache with LRU eviction
export class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove oldest (first) entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}
