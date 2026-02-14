import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tag, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CouponResult {
  code: string;
  discount_type: string;
  discount_value: number;
  discountAmount: number;
}

interface CouponInputProps {
  subtotal: number;
  onApply: (result: CouponResult | null) => void;
  appliedCoupon: CouponResult | null;
}

export function CouponInput({ subtotal, onApply, appliedCoupon }: CouponInputProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.trim().toUpperCase())
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast.error('Ungültiger Gutscheincode');
        setLoading(false);
        return;
      }

      // Check expiry
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        toast.error('Dieser Gutschein ist abgelaufen');
        setLoading(false);
        return;
      }

      // Check max uses
      if (data.max_uses && (data.current_uses ?? 0) >= data.max_uses) {
        toast.error('Dieser Gutschein wurde bereits zu oft eingelöst');
        setLoading(false);
        return;
      }

      // Check min order amount
      if (data.min_order_amount && subtotal < data.min_order_amount) {
        toast.error(`Mindestbestellwert: ${Number(data.min_order_amount).toFixed(2)} €`);
        setLoading(false);
        return;
      }

      const discountAmount = data.discount_type === 'percentage'
        ? subtotal * (Number(data.discount_value) / 100)
        : Number(data.discount_value);

      onApply({
        code: data.code,
        discount_type: data.discount_type,
        discount_value: Number(data.discount_value),
        discountAmount: Math.min(discountAmount, subtotal),
      });
      toast.success(`Gutschein "${data.code}" angewendet!`);
    } catch {
      toast.error('Fehler beim Prüfen des Gutscheins');
    } finally {
      setLoading(false);
    }
  };

  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between p-3 border border-primary/30 bg-primary/5 rounded-lg">
        <div className="flex items-center gap-2 text-sm">
          <Tag className="w-4 h-4 text-primary" />
          <span className="font-medium">{appliedCoupon.code}</span>
          <span className="text-muted-foreground">
            ({appliedCoupon.discount_type === 'percentage'
              ? `${appliedCoupon.discount_value}%`
              : `${appliedCoupon.discount_value.toFixed(2)} €`} Rabatt)
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => { onApply(null); setCode(''); }}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Gutscheincode eingeben"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        onKeyDown={(e) => e.key === 'Enter' && handleApply()}
        className="flex-1"
      />
      <Button
        variant="outline"
        onClick={handleApply}
        disabled={loading || !code.trim()}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Einlösen'}
      </Button>
    </div>
  );
}
