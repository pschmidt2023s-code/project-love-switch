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

let cachedProducts: ExternalProduct[] | null = null;
let cachePromise: Promise<ExternalProduct[]> | null = null;

async function fetchAllProducts(): Promise<ExternalProduct[]> {
  if (cachedProducts) return cachedProducts;
  if (cachePromise) return cachePromise;

  cachePromise = fetch(EXTERNAL_API)
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch external products');
      return res.json();
    })
    .then(data => {
      cachedProducts = (data.products || []).filter((p: ExternalProduct) => p.is_active);
      return cachedProducts!;
    })
    .catch(err => {
      cachePromise = null;
      throw err;
    });

  return cachePromise;
}

export function useExternalProducts() {
  const [products, setProducts] = useState<ExternalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllProducts()
      .then(setProducts)
      .catch(err => setError(err instanceof Error ? err.message : 'Error loading external products'))
      .finally(() => setLoading(false));
  }, []);

  return { products, loading, error };
}

export function useExternalProduct(id: string | undefined) {
  const [product, setProduct] = useState<ExternalProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    fetchAllProducts()
      .then(products => {
        const found = products.find(p => p.id === id);
        if (found) {
          setProduct(found);
        } else {
          setError('Product not found');
        }
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Error loading product'))
      .finally(() => setLoading(false));
  }, [id]);

  return { product, loading, error };
}
