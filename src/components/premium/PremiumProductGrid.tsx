import { useExternalProducts } from '@/hooks/useExternalProducts';
import { PremiumProductCard } from './PremiumProductCard';
import { ProductGridSkeleton } from '@/components/skeletons/ProductSkeletons';

export function PremiumProductGrid() {
  const { products, loading } = useExternalProducts();

  if (loading) {
    return <ProductGridSkeleton count={4} />;
  }

  if (!products.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">Noch keine Produkte verfügbar.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-6">
      {products.map((product) => (
        <PremiumProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          category={product.category || 'Parfüm'}
          price={product.price}
          image={product.image_url || 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=500&fit=crop'}
          inStock={product.stock > 0}
          inspiredBy={product.similar_to || undefined}
        />
      ))}
    </div>
  );
}
