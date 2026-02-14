import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Star, TrendingUp, MessageSquare, BarChart3 } from 'lucide-react';

interface CSATSurvey {
  id: string;
  user_id: string | null;
  order_id: string | null;
  rating: number;
  feedback: string | null;
  category: string;
  created_at: string;
}

export default function CSATManagement() {
  const [surveys, setSurveys] = useState<CSATSurvey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSurveys();
  }, []);

  async function fetchSurveys() {
    const { data } = await supabase.from('csat_surveys').select('*').order('created_at', { ascending: false }).limit(100);
    setSurveys(data || []);
    setLoading(false);
  }

  const avgRating = surveys.length > 0 ? surveys.reduce((s, r) => s + r.rating, 0) / surveys.length : 0;
  const satisfiedCount = surveys.filter(s => s.rating >= 4).length;
  const satisfactionRate = surveys.length > 0 ? (satisfiedCount / surveys.length * 100).toFixed(1) : '0';
  const withFeedback = surveys.filter(s => s.feedback).length;

  const ratingDistribution = [1, 2, 3, 4, 5].map(r => ({
    rating: r,
    count: surveys.filter(s => s.rating === r).length,
    percentage: surveys.length > 0 ? (surveys.filter(s => s.rating === r).length / surveys.length * 100).toFixed(1) : '0',
  }));

  if (loading) return <div className="p-12 text-center"><div className="w-6 h-6 border-2 border-accent border-t-transparent animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-display text-foreground mb-1">Kundenzufriedenheit (CSAT)</h1>
        <p className="text-xs text-muted-foreground">Bewertungen und Feedback auswerten</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Ø Bewertung', value: avgRating.toFixed(1), icon: Star },
          { label: 'Zufriedenheitsrate', value: `${satisfactionRate}%`, icon: TrendingUp },
          { label: 'Bewertungen', value: surveys.length, icon: BarChart3 },
          { label: 'Mit Feedback', value: withFeedback, icon: MessageSquare },
        ].map(kpi => (
          <div key={kpi.label} className="bg-card border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] tracking-[0.1em] uppercase text-muted-foreground">{kpi.label}</span>
              <kpi.icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <p className="text-xl font-display text-foreground">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Rating Distribution */}
      <div className="bg-card border border-border p-4">
        <h2 className="text-base font-display text-foreground mb-4">Bewertungsverteilung</h2>
        <div className="space-y-3">
          {ratingDistribution.reverse().map(d => (
            <div key={d.rating} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-16">
                {Array.from({ length: d.rating }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <div className="flex-1 h-2 bg-muted overflow-hidden">
                <div className="h-full bg-foreground transition-all" style={{ width: `${d.percentage}%` }} />
              </div>
              <span className="text-xs text-muted-foreground w-12 text-right">{d.count} ({d.percentage}%)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Feedback */}
      <div className="bg-card border border-border">
        <div className="p-4 border-b border-border">
          <h2 className="text-base font-display text-foreground">Neuestes Feedback</h2>
        </div>
        <div className="divide-y divide-border">
          {surveys.filter(s => s.feedback).length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Kein Feedback vorhanden</div>
          ) : surveys.filter(s => s.feedback).slice(0, 10).map(survey => (
            <div key={survey.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < survey.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted'}`} />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">{new Date(survey.created_at).toLocaleDateString('de-DE')}</span>
              </div>
              <p className="text-sm text-foreground">{survey.feedback}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
