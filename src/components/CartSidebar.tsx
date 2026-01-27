import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Minus, Plus, Trash2, Truck, Zap } from 'lucide-react';

interface CartSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartSidebar({ open, onOpenChange }: CartSidebarProps) {
  const { items, updateQuantity, removeItem, total, itemCount } = useCart();
  const navigate = useNavigate();

  const FREE_SHIPPING_THRESHOLD = 50;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - total);
  const freeShippingProgress = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100);
  const hasFreeShipping = total >= FREE_SHIPPING_THRESHOLD;

  const handleCheckout = () => {
    onOpenChange(false);
    navigate('/checkout');
  };

  const handleExpressCheckout = () => {
    onOpenChange(false);
    navigate('/express-checkout');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Warenkorb ({itemCount})
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center py-8">
                <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Ihr Warenkorb ist leer</p>
              </div>
            </div>
          ) : (
            <>
              {/* Free Shipping Progress Bar */}
              <div className="py-4 border-b">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className={`w-4 h-4 ${hasFreeShipping ? 'text-green-500' : 'text-muted-foreground'}`} />
                  {hasFreeShipping ? (
                    <span className="text-sm font-medium text-green-600">
                      🎉 Du erhältst kostenlosen Versand!
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Noch <span className="font-bold text-foreground">{remainingForFreeShipping.toFixed(2)} €</span> bis zum kostenlosen Versand
                    </span>
                  )}
                </div>
                <Progress 
                  value={freeShippingProgress} 
                  className="h-2"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-muted-foreground">0 €</span>
                  <span className="text-xs text-muted-foreground">{FREE_SHIPPING_THRESHOLD} €</span>
                </div>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {items.map((item) => (
                  <div key={item.variantId} className="flex gap-3 p-3 border rounded-lg">
                    <img
                      src={item.image || '/placeholder.svg'}
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded"
                    />

                    <div className="flex-1 space-y-2">
                      <div>
                        <h3 className="font-semibold text-sm">{item.productName}</h3>
                        <p className="text-xs text-muted-foreground">{item.variantSize}</p>
                        <p className="font-bold">€{item.price.toFixed(2)}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>

                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive"
                          onClick={() => removeItem(item.variantId)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t pt-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Zwischensumme</span>
                    <span>€{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Versand</span>
                    <span className={hasFreeShipping ? 'text-green-600 font-medium' : ''}>
                      {hasFreeShipping ? 'Kostenlos' : '€4,95'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-lg pt-2 border-t">
                    <span>Gesamt</span>
                    <span>€{(total + (hasFreeShipping ? 0 : 4.95)).toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleCheckout}
                  >
                    Zur Kasse gehen
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={handleExpressCheckout}
                  >
                    <Zap className="w-4 h-4" />
                    Express Checkout
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}