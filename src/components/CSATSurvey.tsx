import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Star, X } from 'lucide-react';
import { toast } from 'sonner';

interface CSATSurveyProps {
  orderId?: string;
  onClose: () => void;
}

export function CSATSurvey({ orderId, onClose }: CSATSurveyProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (rating === 0) { toast.error('Bitte eine Bewertung auswählen'); return; }

    try {
      const { error } = await supabase.from('csat_surveys').insert({
        user_id: user?.id || null,
        order_id: orderId || null,
        rating,
        feedback: feedback.trim() || null,
        category: 'order',
      });

      if (error) throw error;
      setSubmitted(true);
      toast.success('Danke für dein Feedback!');
      setTimeout(onClose, 2000);
    } catch {
      toast.error('Fehler beim Senden');
    }
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="bg-card border border-border p-8 max-w-sm w-full mx-4 text-center">
          <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-green-500/10">
            <Star className="w-6 h-6 text-green-500 fill-green-500" />
          </div>
          <h3 className="font-display text-lg text-foreground mb-2">Vielen Dank!</h3>
          <p className="text-sm text-muted-foreground">Dein Feedback hilft uns, besser zu werden.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border p-6 max-w-sm w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg text-foreground">Wie war dein Erlebnis?</h3>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">Bewerte deine Erfahrung mit ALDENAIR</p>

        {/* Stars */}
        <div className="flex items-center gap-2 justify-center mb-6">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  star <= (hoveredRating || rating)
                    ? 'text-yellow-500 fill-yellow-500'
                    : 'text-muted'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Feedback */}
        <textarea
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          placeholder="Optionales Feedback..."
          className="w-full px-4 py-3 bg-transparent border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/50 resize-none h-20 mb-4"
        />

        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors"
        >
          Bewertung abschicken
        </button>
      </div>
    </div>
  );
}
