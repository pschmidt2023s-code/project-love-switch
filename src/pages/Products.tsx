import { useProducts, useCategories } from '@/hooks/useProducts';
import { ProductCard } from '@/components/ProductCard';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'react-router-dom';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categorySlug = searchParams.get('category') || undefined;
  const { products, loading } = useProducts(categorySlug);
  const { categories } = useCategories();

  const handleCategoryFilter = (slug: string | null) => {
    if (slug) {
      setSearchParams({ category: slug });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Unsere Kollektion
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Entdecke unsere exklusiven Premium-Düfte, inspiriert von weltbekannten Luxusmarken.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          <Button
            variant={!categorySlug ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleCategoryFilter(null)}
          >
            Alle
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={categorySlug === category.slug ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryFilter(category.slug)}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Keine Produkte gefunden.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.slug}
                name={product.name}
                category={(product as any).categories?.name || 'Parfüm'}
                price={Number(product.base_price)}
                originalPrice={product.original_price ? Number(product.original_price) : undefined}
                image={product.image_url || 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop'}
                rating={product.rating ? Number(product.rating) : undefined}
                reviewCount={product.review_count || undefined}
                inStock={true}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
