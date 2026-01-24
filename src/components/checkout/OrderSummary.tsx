import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Truck, Gift } from 'lucide-react';

interface CartItem {
  id: string;
  productName: string;
  variantSize: string;
  price: number;
  quantity: number;
  image: string;
}

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  discount?: number;
  discountCode?: string;
}

export function OrderSummary({
  items,
  subtotal,
  shippingCost,
  discount = 0,
  discountCode,
}: OrderSummaryProps) {
  const total = subtotal + shippingCost - discount;
  const freeShippingThreshold = 50;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Bestellübersicht</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Free shipping progress */}
        {shippingCost > 0 && (
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 text-sm">
              <Truck className="w-4 h-4 text-primary" />
              <span>
                Noch <strong>{amountToFreeShipping.toFixed(2)} €</strong> bis zum kostenlosen Versand!
              </span>
            </div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {shippingCost === 0 && (
          <div className="p-3 bg-success/10 rounded-lg border border-success/20">
            <div className="flex items-center gap-2 text-sm text-success">
              <Gift className="w-4 h-4" />
              <span className="font-medium">Kostenloser Versand aktiviert!</span>
            </div>
          </div>
        )}

        {/* Cart items */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                <img
                  src={item.image || '/placeholder.svg'}
                  alt={item.productName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.productName}</p>
                <p className="text-xs text-muted-foreground">{item.variantSize}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">Menge: {item.quantity}</span>
                  <span className="font-medium text-sm">
                    {(item.price * item.quantity).toFixed(2)} €
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Pricing breakdown */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Zwischensumme</span>
            <span>{subtotal.toFixed(2)} €</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Versand</span>
            <span className={shippingCost === 0 ? 'text-success font-medium' : ''}>
              {shippingCost === 0 ? 'Kostenlos' : `${shippingCost.toFixed(2)} €`}
            </span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-success">
              <span className="flex items-center gap-1">
                Rabatt
                {discountCode && (
                  <Badge variant="secondary" className="text-xs">
                    {discountCode}
                  </Badge>
                )}
              </span>
              <span>-{discount.toFixed(2)} €</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold">Gesamt</span>
          <span className="text-xl font-bold text-primary">{total.toFixed(2)} €</span>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          inkl. MwSt., zzgl. eventueller Versandkosten
        </p>
      </CardContent>
    </Card>
  );
}
