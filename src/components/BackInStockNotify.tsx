import { useState } from 'react';
import { Bell, Loader2, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface BackInStockNotifyProps {
  productId: string;
  variantId?: string;
  productName: string;
}

export function BackInStockNotify({ productId, variantId, productName }: BackInStockNotifyProps) {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async () => {
    if (!email || loading) return;
    setLoading(true);

    try {
      const { error } = await supabase.from('stock_notifications' as any).insert({
        email,
        product_id: productId,
        variant_id: variantId || null,
        user_id: user?.id || null,
      });

      if (error) throw error;
      setSubscribed(true);
      toast.success('Sie werden benachrichtigt, sobald der Artikel verfügbar ist.');
    } catch {
      toast.error('Fehler beim Abonnieren');
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-accent/5 border border-accent/15">
        <Check className="w-4 h-4 text-accent" strokeWidth={1.5} />
        <p className="text-sm text-foreground">
          Wir benachrichtigen Sie, wenn <span className="font-medium">{productName}</span> verfügbar ist.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Bell className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
        <p className="text-sm text-muted-foreground">
          Benachrichtigung bei Verfügbarkeit
        </p>
      </div>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Ihre E-Mail-Adresse"
          className="flex-1 px-3 py-2.5 text-sm bg-background border border-border focus:outline-none focus:border-accent"
        />
        <button
          onClick={handleSubscribe}
          disabled={!email || loading}
          className="px-4 py-2.5 bg-foreground text-background text-[10px] tracking-[0.1em] uppercase font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            'Benachrichtigen'
          )}
        </button>
      </div>
    </div>
  );
}
