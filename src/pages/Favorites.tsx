import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts } from '@/hooks/useProducts';
import { PremiumPageLayout } from '@/components/premium/PremiumPageLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Seo } from '@/components/Seo';
import { AuthModal } from '@/components/AuthModal';
import { toast } from 'sonner';

interface FavoriteWithProduct {
  id: string;
  product_id: string;
  productName: string;
  productImage: string;
  productPrice: number;
  created_at: string;
}

export default function Favorites() {
  const { favorites, isLoading, removeFromFavorites } = useFavorites();
  const { addItem } = useCart();
  const { user } = useAuth();
  const { products } = useProducts();
  const [favoritesWithDetails, setFavoritesWithDetails] = useState<FavoriteWithProduct[]>([]);

  useEffect(() => {
    if (products.length === 0) return;
    
    const detailed: FavoriteWithProduct[] = favorites
      .map(favorite => {
        const product = products.find(p => p.id === favorite.product_id);
        if (!product) return null;
        return {
          id: favorite.id,
          product_id: favorite.product_id,
          productName: product.name,
          productImage: product.image_url || '/placeholder.svg',
          productPrice: product.base_price,
          created_at: favorite.created_at
        };
      })
      .filter((item): item is FavoriteWithProduct => item !== null);

    setFavoritesWithDetails(detailed);
  }, [favorites, products]);

  const handleAddToCart = async (favorite: FavoriteWithProduct) => {
    const product = products.find(p => p.id === favorite.product_id);
    if (!product) return;
    
    await addItem({
      variantId: favorite.product_id,
      productId: favorite.product_id,
      productName: favorite.productName,
      variantSize: product.size || 'Standard',
      price: favorite.productPrice,
      quantity: 1,
      image: favorite.productImage,
    });
    toast.success('Zum Warenkorb hinzugefügt');
  };

  if (!user) {
    return (
      <PremiumPageLayout>
        <section className="section-spacing">
          <div className="container-premium text-center max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-accent/10">
              <Heart className="w-7 h-7 text-accent" strokeWidth={1.5} />
            </div>
            <h1 className="font-display text-2xl text-foreground mb-3">
              Favoriten speichern
            </h1>
            <p className="text-sm text-muted-foreground mb-8">
              Melde dich an, um deine Lieblingsdüfte zu speichern und jederzeit wiederzufinden.
            </p>
            <AuthModal>
              <button className="inline-flex items-center px-8 py-4 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors">
                Jetzt anmelden
                <ArrowRight className="ml-2 w-4 h-4" strokeWidth={1.5} />
              </button>
            </AuthModal>
          </div>
        </section>
      </PremiumPageLayout>
    );
  }

  return (
    <PremiumPageLayout>
      <Seo title="Favoriten | ALDENAIR" description="Deine gespeicherten Lieblingsdüfte bei ALDENAIR." canonicalPath="/favorites" />

      {/* Header */}
      <section className="border-b border-border">
        <div className="container-premium py-8 lg:py-12">
          <Breadcrumb className="mb-6" />
          <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-3">Meine Auswahl</span>
          <h1 className="font-display text-3xl lg:text-4xl text-foreground mb-3">Favoriten</h1>
          <p className="text-muted-foreground text-sm">
            {favoritesWithDetails.length} {favoritesWithDetails.length === 1 ? 'Duft' : 'Düfte'} gespeichert
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="section-spacing">
        <div className="container-premium">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-[3/4] bg-muted animate-pulse" />
                  <div className="h-4 w-3/4 bg-muted animate-pulse" />
                  <div className="h-4 w-1/2 bg-muted animate-pulse" />
                </div>
              ))}
            </div>
          ) : favoritesWithDetails.length === 0 ? (
            <div className="text-center py-16 max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-muted">
                <Heart className="w-7 h-7 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <h2 className="font-display text-xl text-foreground mb-3">Noch keine Favoriten</h2>
              <p className="text-sm text-muted-foreground mb-8">
                Entdecke unsere Düfte und speichere deine Lieblinge.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center px-6 py-3 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors"
              >
                Düfte entdecken
                <ArrowRight className="ml-2 w-4 h-4" strokeWidth={1.5} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
              {favoritesWithDetails.map((favorite) => (
                <article key={favorite.id} className="group relative">
                  <Link to={`/products/${favorite.product_id}`} className="block relative aspect-[3/4] overflow-hidden bg-muted mb-4">
                    <img
                      src={favorite.productImage}
                      alt={favorite.productName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeFromFavorites(favorite.product_id);
                      }}
                      className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center bg-background/90 backdrop-blur-sm text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Aus Favoriten entfernen"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </Link>

                  <div className="space-y-2">
                    <Link to={`/products/${favorite.product_id}`}>
                      <h3 className="font-display text-lg text-foreground hover:text-accent transition-colors line-clamp-1">
                        {favorite.productName}
                      </h3>
                    </Link>
                    <p className="text-lg font-medium text-foreground">
                      {favorite.productPrice.toFixed(2).replace('.', ',')} €
                    </p>
                    <button
                      onClick={() => handleAddToCart(favorite)}
                      className="w-full flex items-center justify-center gap-2 py-3 border border-border text-[10px] tracking-[0.1em] uppercase font-medium text-foreground hover:bg-foreground hover:text-background transition-colors"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" strokeWidth={1.5} />
                      In den Warenkorb
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </PremiumPageLayout>
  );
}