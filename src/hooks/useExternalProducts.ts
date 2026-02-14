import { useState, useEffect } from 'react';

const EXTERNAL_API = 'https://lfkmrgsxxtijxdmfuzbv.supabase.co/functions/v1/public-products';

export interface ExternalProduct {
  id: string;
  name: string;
  sku: string | null;
  description: string | null;
  price: number;
  stock: number;
  category: string;
  image_url: string | null;
  similar_to: string | null;
  ingredients: string | null;
  is_active: boolean;
}

export function useExternalProducts() {
  const [products, setProducts] = useState<ExternalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const response = await fetch(EXTERNAL_API);
        if (!response.ok) throw new Error('Failed to fetch external products');
        const data = await response.json();
        setProducts((data.products || []).filter((p: ExternalProduct) => p.is_active));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading external products');
        console.error('[ExternalProducts] Error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return { products, loading, error };
}
