import { useExternalProducts } from '@/hooks/useExternalProducts';
import { PremiumProductCard } from './PremiumProductCard';

export function ExternalProductsSection() {
  const { products, loading } = useExternalProducts();

  if (loading) {
    return (
      <section className="py-8 lg:py-12">
        <div className="container-premium">
          <div className="text-center mb-6 lg:mb-10">
            <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-2 lg:mb-4">
              Neu
            </span>
            <h2 className="font-display text-2xl lg:text-3xl text-foreground mb-2 lg:mb-4">
              Neue Produkte
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[3/4] bg-muted animate-pulse" />
                <div className="space-y-2">
                  <div className="h-3 w-16 bg-muted animate-pulse" />
                  <div className="h-4 w-3/4 bg-muted animate-pulse" />
                  <div className="h-3 w-1/2 bg-muted animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!products.length) return null;

  return (
    <section className="py-8 lg:py-12">
      <div className="container-premium">
        <div className="text-center mb-6 lg:mb-10">
          <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-2 lg:mb-4">
            Neu
          </span>
          <h2 className="font-display text-2xl lg:text-3xl text-foreground mb-2 lg:mb-4">
            Neue Produkte
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Frisch hinzugefügte Düfte aus unserem Sortiment
          </p>
        </div>

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
      </div>
    </section>
  );
}
