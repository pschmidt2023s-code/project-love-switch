import { useProducts } from '@/hooks/useProducts';
import { PremiumProductCard } from './PremiumProductCard';

export function PremiumProductGrid() {
  const { products, loading } = useProducts();

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="aspect-[3/4] bg-muted animate-pulse" />
            <div className="space-y-2">
              <div className="h-3 w-16 bg-muted animate-pulse" />
              <div className="h-5 w-3/4 bg-muted animate-pulse" />
              <div className="h-4 w-1/2 bg-muted animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Take only first 6 products for the homepage grid
  const displayProducts = products.slice(0, 6);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
      {displayProducts.map((product) => (
        <PremiumProductCard
          key={product.id}
          id={product.slug}
          name={product.name}
          category={(product as any).categories?.name || 'Parfüm'}
          price={Number(product.base_price) * 0.25}
          originalPrice={product.original_price ? Number(product.original_price) * 0.25 : undefined}
          image={product.image_url || 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=500&fit=crop'}
          rating={product.rating ? Number(product.rating) : undefined}
          reviewCount={product.review_count || undefined}
          inStock={true}
          inspiredBy={product.inspired_by || undefined}
        />
      ))}
    </div>
  );
}
