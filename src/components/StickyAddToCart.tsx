import { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface StickyAddToCartProps {
  productName: string;
  price: number;
  inStock: boolean;
  onAddToCart: () => void;
}

export function StickyAddToCart({ productName, price, inStock, onAddToCart }: StickyAddToCartProps) {
  const isMobile = useIsMobile();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past 500px (past the main add-to-cart button)
      setVisible(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isMobile || !visible) return null;

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 bg-background border-t border-border px-4 py-3 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{productName}</p>
          <p className="text-sm text-accent">{price.toFixed(2).replace('.', ',')} €</p>
        </div>
        <button
          onClick={onAddToCart}
          disabled={!inStock}
          className="flex items-center gap-2 px-5 py-3 bg-foreground text-background text-[10px] tracking-[0.1em] uppercase font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 flex-shrink-0"
        >
          <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
          {inStock ? 'Hinzufügen' : 'Ausverkauft'}
        </button>
      </div>
    </div>
  );
}
