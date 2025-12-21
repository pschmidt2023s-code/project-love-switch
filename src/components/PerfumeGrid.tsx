import { useProducts } from '@/hooks/useProducts';
import { ProductCard } from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';

export function PerfumeGrid() {
  const { products, loading } = useProducts();

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  // Take only first 6 products for the homepage grid
  const displayProducts = products.slice(0, 6);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayProducts.map((product) => (
        <ProductCard
          key={product.id}
          id={product.slug}
          name={product.name}
          category={(product as any).categories?.name || 'Parfüm'}
          price={Number(product.base_price) * 0.25} // Show 5ml price as starting price
          originalPrice={product.original_price ? Number(product.original_price) * 0.25 : undefined}
          image={product.image_url || 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop'}
          rating={product.rating ? Number(product.rating) : undefined}
          reviewCount={product.review_count || undefined}
          inStock={true}
        />
      ))}
    </div>
  );
}
