import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  base_price: number;
  original_price: number | null;
  image_url: string | null;
  rating: number | null;
  review_count: number | null;
  is_active: boolean | null;
  // Extended fields
  brand: string | null;
  size: string | null;
  gender: string | null;
  inspired_by: string | null;
  ai_description: string | null;
  scent_notes: string[] | null;
  top_notes: string[] | null;
  middle_notes: string[] | null;
  base_notes: string[] | null;
  ingredients: string[] | null;
  seasons: string[] | null;
  occasions: string[] | null;
}

interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  price: number;
  original_price: number | null;
  stock: number | null;
  sku: string | null;
  image: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export function useProducts(categorySlug?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        
        let query = supabase
          .from('products')
          .select(`
            *,
            categories (
              id,
              name,
              slug
            )
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (categorySlug) {
          const { data: category } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', categorySlug)
            .maybeSingle();
          
          if (category) {
            query = query.eq('category_id', category.id);
          }
        }

        const { data, error } = await query;

        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading products');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [categorySlug]);

  return { products, loading, error };
}

export function useProduct(slug: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select(`
            *,
            categories (
              id,
              name,
              slug
            )
          `)
          .eq('slug', slug)
          .maybeSingle();

        if (productError) throw productError;
        if (!productData) throw new Error('Product not found');

        setProduct(productData);

        const { data: variantData, error: variantError } = await supabase
          .from('product_variants')
          .select('*')
          .eq('product_id', productData.id)
          .order('price', { ascending: true });

        if (variantError) throw variantError;
        setVariants(variantData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading product');
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  return { product, variants, loading, error };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (error) throw error;
        setCategories(data || []);
      } catch (err) {
        console.error('Error loading categories:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return { categories, loading };
}
