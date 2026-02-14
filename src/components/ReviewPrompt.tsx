import { useState, useEffect } from 'react';
import { Star, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function ReviewPrompt() {
  const { user } = useAuth();
  const [pendingReview, setPendingReview] = useState<{
    orderId: string;
    productId: string;
    productName: string;
  } | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user) return;
    checkForReviewableOrders();
  }, [user]);

  async function checkForReviewableOrders() {
    if (!user) return;

    // Find delivered orders from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: orders } = await supabase
      .from('orders')
      .select('id, created_at')
      .eq('user_id', user.id)
      .eq('status', 'delivered')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(5);

    if (!orders || orders.length === 0) return;

    // Get order items
    for (const order of orders) {
      const { data: items } = await supabase
        .from('order_items')
        .select('product_name, variant_id')
        .eq('order_id', order.id)
        .limit(1);

      if (!items || items.length === 0) continue;
      const item = items[0];
      if (!item.variant_id) continue;

      // Check if already reviewed (use variant_id as product_id proxy)
      const dismissedKey = `review_dismissed_${order.id}`;
      if (localStorage.getItem(dismissedKey)) continue;

      // Check existing review
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', item.variant_id)
        .limit(1);

      if (existingReview && existingReview.length > 0) continue;

      setPendingReview({
        orderId: order.id,
        productId: item.variant_id,
        productName: item.product_name,
      });
      return;
    }
  }

  const handleSubmit = async () => {
    if (!user || !pendingReview || rating === 0) return;
    setSubmitting(true);

    try {
      const { error } = await supabase.from('reviews').insert({
        user_id: user.id,
        product_id: pendingReview.productId,
        rating,
        content: content || null,
        author_name: user.email?.split('@')[0] || 'Kunde',
      });

      if (error) throw error;
      toast.success('Vielen Dank für Ihre Bewertung!');
      localStorage.setItem(`review_dismissed_${pendingReview.orderId}`, 'true');
      setPendingReview(null);
    } catch {
      toast.error('Fehler beim Speichern der Bewertung');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDismiss = () => {
    if (pendingReview) {
      localStorage.setItem(`review_dismissed_${pendingReview.orderId}`, 'true');
    }
    setDismissed(true);
    setPendingReview(null);
  };

  if (!pendingReview || dismissed) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 w-80 bg-background border border-border shadow-lg p-5 animate-fade-in">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
      >
        <X className="w-4 h-4" strokeWidth={1.5} />
      </button>

      <div className="space-y-4">
        <div>
          <span className="text-[10px] tracking-[0.2em] uppercase text-accent block mb-1">
            Bewertung
          </span>
          <p className="text-sm text-foreground font-medium">
            Wie gefällt Ihnen <span className="text-accent">{pendingReview.productName}</span>?
          </p>
        </div>

        {/* Stars */}
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5"
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  star <= (hoverRating || rating)
                    ? 'fill-accent text-accent'
                    : 'text-border'
                }`}
                strokeWidth={1.5}
              />
            </button>
          ))}
        </div>

        {/* Comment */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Erzählen Sie uns mehr (optional)..."
          className="w-full h-20 px-3 py-2 text-sm bg-background border border-border focus:outline-none focus:border-accent resize-none"
        />

        <button
          onClick={handleSubmit}
          disabled={rating === 0 || submitting}
          className="w-full py-3 bg-foreground text-background text-[10px] tracking-[0.1em] uppercase font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50"
        >
          {submitting ? 'Wird gespeichert...' : 'Bewertung abschicken'}
        </button>
      </div>
    </div>
  );
}
