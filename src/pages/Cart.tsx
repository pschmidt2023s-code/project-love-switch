import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Zap, Shield, Truck } from 'lucide-react';

export default function CartPage() {
  const { items, itemCount, total, updateQuantity, removeItem, loading } = useCart();

  const shippingCost = total >= 50 ? 0 : 4.99;
  const grandTotal = total + shippingCost;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 lg:px-8 py-16 text-center">
          <div className="max-w-md mx-auto">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-foreground mb-4">Dein Warenkorb ist leer</h1>
            <p className="text-muted-foreground mb-8">
              Entdecke unsere exklusiven Düfte und füge deine Favoriten hinzu.
            </p>
            <Button asChild size="lg">
              <Link to="/products">
                Jetzt einkaufen
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <h1 className="text-3xl font-bold text-foreground mb-8">
          Warenkorb ({itemCount} {itemCount === 1 ? 'Artikel' : 'Artikel'})
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.variantId} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=200&h=200&fit=crop'}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {item.productName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Größe: {item.variantSize}
                      </p>
                      <p className="text-lg font-bold text-foreground mt-2">
                        {item.price.toFixed(2)} €
                      </p>
                    </div>

                    {/* Quantity & Remove */}
                    <div className="flex flex-col items-end justify-between">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(item.variantId)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24 overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 to-transparent p-4 border-b">
                <h2 className="text-lg font-semibold text-foreground">
                  Bestellübersicht
                </h2>
              </div>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Zwischensumme</span>
                    <span>{total.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Versand</span>
                    <span>
                      {shippingCost === 0 ? (
                        <span className="text-success font-medium">Kostenlos</span>
                      ) : (
                        `${shippingCost.toFixed(2)} €`
                      )}
                    </span>
                  </div>
                  {total < 50 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-primary/5 rounded-lg"
                    >
                      <p className="text-xs text-muted-foreground">
                        🚚 Noch <strong>{(50 - total).toFixed(2)} €</strong> bis zum kostenlosen Versand
                      </p>
                      <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${Math.min((total / 50) * 100, 100)}%` }}
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between font-bold text-lg mb-6">
                  <span>Gesamt</span>
                  <span className="text-primary">{grandTotal.toFixed(2)} €</span>
                </div>

                {/* Express Checkout Button */}
                <Button className="w-full gap-2 mb-3" size="lg" asChild>
                  <Link to="/express-checkout">
                    <Zap className="w-4 h-4" />
                    Express Checkout
                  </Link>
                </Button>

                {/* Standard Checkout Button */}
                <Button variant="outline" className="w-full" size="lg" asChild>
                  <Link to="/checkout">
                    Zur Kasse
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>

                {/* Trust Badges */}
                <div className="flex flex-wrap items-center justify-center gap-3 mt-4 pt-4 border-t">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Shield className="w-3 h-3" />
                    Sicher
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Truck className="w-3 h-3" />
                    Schnell
                  </div>
                </div>

                <p className="text-xs text-muted-foreground text-center mt-3">
                  inkl. MwSt., zzgl. Versand
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
