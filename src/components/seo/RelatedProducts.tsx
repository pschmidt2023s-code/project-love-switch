import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  base_price: number;
  inspired_by: string | null;
  gender: string | null;
}

interface RelatedProductsProps {
  currentProductId: string;
  gender?: string | null;
  className?: string;
}

export function RelatedProducts({ currentProductId, gender, className = '' }: RelatedProductsProps) {
  const [products, setProducts] = useState<RelatedProduct[]>([]);

  useEffect(() => {
    async function fetchRelated() {
      let query = supabase
        .from('products')
        .select('id, name, slug, image_url, base_price, inspired_by, gender')
        .eq('is_active', true)
        .neq('id', currentProductId)
        .limit(4);

      if (gender) {
        query = query.eq('gender', gender);
      }

      const { data } = await query;
      if (data && data.length > 0) {
        setProducts(data);
      } else if (gender) {
        // Fallback: fetch without gender filter
        const { data: fallback } = await supabase
          .from('products')
          .select('id, name, slug, image_url, base_price, inspired_by, gender')
          .eq('is_active', true)
          .neq('id', currentProductId)
          .limit(4);
        setProducts(fallback || []);
      }
    }

    if (currentProductId) fetchRelated();
  }, [currentProductId, gender]);

  if (products.length === 0) return null;

  return (
    <section className={`py-10 lg:py-16 border-t border-border ${className}`}>
      <div className="container-premium">
        <div className="text-center mb-8">
          <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-2">
            Entdecken
          </span>
          <h2 className="font-display text-2xl lg:text-3xl text-foreground mb-2">
            Ähnliche Düfte
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Weitere Parfüms, die Ihnen gefallen könnten
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/products/${product.slug}`}
              className="group block"
            >
              <div className="aspect-[3/4] bg-muted overflow-hidden mb-3">
                <img
                  src={product.image_url || 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=500&fit=crop'}
                  alt={`${product.name} – ALDENAIR Premium Parfüm`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <h3 className="font-display text-sm text-foreground group-hover:text-accent transition-colors line-clamp-1">
                {product.name}
              </h3>
              {product.inspired_by && (
                <p className="text-[11px] text-muted-foreground italic mt-0.5">
                  Inspiriert von {product.inspired_by}
                </p>
              )}
              <p className="text-sm font-medium text-foreground mt-1">
                ab €{product.base_price.toFixed(2)}
              </p>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            to="/products"
            className="inline-flex items-center px-6 py-3 border border-foreground text-foreground text-[10px] tracking-[0.15em] uppercase font-medium hover:bg-foreground hover:text-background transition-all duration-300"
          >
            Alle Parfüms ansehen
          </Link>
        </div>
      </div>
    </section>
  );
}
