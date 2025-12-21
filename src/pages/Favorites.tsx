import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts } from '@/hooks/useProducts';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { AuthModal } from '@/components/AuthModal';

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
  };

  if (!user) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-background pb-20 md:pb-0">
          <div className="container mx-auto px-4 py-16 text-center">
            <Heart className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-4">Melde dich an, um Favoriten zu speichern</h1>
            <p className="text-muted-foreground mb-8">
              Erstelle ein Konto oder melde dich an, um deine Lieblingsdüfte zu speichern.
            </p>
            <AuthModal>
              <Button size="lg">Jetzt anmelden</Button>
            </AuthModal>
          </div>
        </div>
        <Footer />
        <MobileBottomNav />
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="mb-8"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>

            <div className="flex items-center gap-4 mb-8">
              <Heart className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">Meine Favoriten</h1>
                <p className="text-muted-foreground">
                  {favoritesWithDetails.length} Düfte gespeichert
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner size="lg" />
              </div>
            ) : favoritesWithDetails.length === 0 ? (
              <Card className="text-center py-16">
                <CardContent>
                  <Heart className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
                  <h2 className="text-xl font-semibold mb-2">Noch keine Favoriten</h2>
                  <p className="text-muted-foreground mb-6">
                    Entdecke unsere Düfte und speichere deine Lieblinge.
                  </p>
                  <Button asChild>
                    <Link to="/products">Düfte entdecken</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoritesWithDetails.map((favorite) => (
                  <Card key={favorite.id} className="overflow-hidden group">
                    <div className="aspect-square relative bg-muted">
                      <img
                        src={favorite.productImage}
                        alt={favorite.productName}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeFromFavorites(favorite.product_id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-1">{favorite.productName}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">
                          {favorite.productPrice.toFixed(2)} €
                        </span>
                        <Badge variant="secondary">Auf Lager</Badge>
                      </div>
                      <Button
                        className="w-full mt-4"
                        onClick={() => handleAddToCart(favorite)}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        In den Warenkorb
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
      <MobileBottomNav />
    </>
  );
}
