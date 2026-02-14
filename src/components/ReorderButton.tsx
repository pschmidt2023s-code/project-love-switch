import { useState } from 'react';
import { RotateCcw, Loader2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

interface OrderItem {
  product_name: string;
  variant_size: string;
  unit_price: number;
  quantity: number;
  variant_id: string | null;
}

interface ReorderButtonProps {
  items: OrderItem[];
  className?: string;
}

export function ReorderButton({ items, className = '' }: ReorderButtonProps) {
  const { addItem } = useCart();
  const [loading, setLoading] = useState(false);

  const handleReorder = async () => {
    if (loading || items.length === 0) return;
    setLoading(true);

    try {
      for (const item of items) {
        if (!item.variant_id) continue;
        await addItem({
          variantId: item.variant_id,
          productId: item.variant_id,
          productName: item.product_name,
          variantSize: item.variant_size,
          price: Number(item.unit_price),
          quantity: item.quantity,
          image: '',
        });
      }
      toast.success('Artikel wurden zum Warenkorb hinzugefügt');
    } catch {
      toast.error('Fehler beim Nachbestellen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleReorder}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-5 py-3 border border-border text-foreground text-[10px] tracking-[0.1em] uppercase font-medium hover:bg-foreground hover:text-background transition-colors disabled:opacity-50 ${className}`}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.5} />
      ) : (
        <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
      )}
      Erneut bestellen
    </button>
  );
}
