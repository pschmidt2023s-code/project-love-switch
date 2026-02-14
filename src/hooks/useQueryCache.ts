import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

/**
 * Advanced caching utilities for React Query.
 * Implements stale-while-revalidate and prefetching patterns.
 */

// Cache time constants (in ms)
export const CACHE_TIMES = {
  /** Products rarely change - cache for 10 min */
  PRODUCTS: 10 * 60 * 1000,
  /** Categories almost never change - cache for 30 min */
  CATEGORIES: 30 * 60 * 1000,
  /** User data should be fresh - cache for 2 min */
  USER: 2 * 60 * 1000,
  /** Orders change frequently - cache for 1 min */
  ORDERS: 60 * 1000,
  /** Static content - cache for 1 hour */
  STATIC: 60 * 60 * 1000,
} as const;

// GC time constants (how long to keep unused cache)
export const GC_TIMES = {
  PRODUCTS: 30 * 60 * 1000,
  CATEGORIES: 60 * 60 * 1000,
  USER: 5 * 60 * 1000,
  ORDERS: 5 * 60 * 1000,
  STATIC: 2 * 60 * 60 * 1000,
} as const;

/**
 * Hook for prefetching product data on hover/link visibility.
 * Implements "prefetch on intent" pattern like Amazon.
 */
export function usePrefetchProduct() {
  const queryClient = useQueryClient();

  const prefetchProduct = useCallback(
    (slug: string) => {
      queryClient.prefetchQuery({
        queryKey: ['product', slug],
        staleTime: CACHE_TIMES.PRODUCTS,
        gcTime: GC_TIMES.PRODUCTS,
        queryFn: async () => {
          // Dynamic import to avoid circular deps
          const { supabase } = await import('@/integrations/supabase/client');
          const { data } = await supabase
            .from('products')
            .select('*, categories(id, name, slug), product_variants(*)')
            .eq('slug', slug)
            .maybeSingle();
          return data;
        },
      });
    },
    [queryClient]
  );

  return { prefetchProduct };
}

/**
 * Hook to warm the cache for the products list page.
 * Called from homepage to pre-populate product data.
 */
export function useWarmProductCache() {
  const queryClient = useQueryClient();

  const warmCache = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ['products', 'all'],
      staleTime: CACHE_TIMES.PRODUCTS,
      gcTime: GC_TIMES.PRODUCTS,
      queryFn: async () => {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data } = await supabase
          .from('products')
          .select('*, categories(name, slug), product_variants(*)')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        return data || [];
      },
    });
  }, [queryClient]);

  return { warmCache };
}
