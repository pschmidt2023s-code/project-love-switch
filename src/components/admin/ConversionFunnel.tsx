import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TrendingDown, ArrowDown } from 'lucide-react';

const FUNNEL_STEPS = [
  { key: 'page_view', label: 'Seitenaufruf' },
  { key: 'product_view', label: 'Produktansicht' },
  { key: 'add_to_cart', label: 'In den Warenkorb' },
  { key: 'checkout_start', label: 'Checkout gestartet' },
  { key: 'payment_complete', label: 'Zahlung abgeschlossen' },
];

export default function ConversionFunnel() {
  const [funnelData, setFunnelData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFunnelData();
  }, []);

  async function fetchFunnelData() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from('funnel_events')
      .select('step, session_id')
      .gte('created_at', thirtyDaysAgo);

    const counts: Record<string, Set<string>> = {};
    (data || []).forEach(event => {
      if (!counts[event.step]) counts[event.step] = new Set();
      counts[event.step].add(event.session_id);
    });

    const result: Record<string, number> = {};
    Object.entries(counts).forEach(([step, sessions]) => {
      result[step] = sessions.size;
    });
    setFunnelData(result);
    setLoading(false);
  }

  if (loading) return <div className="p-12 text-center"><div className="w-6 h-6 border-2 border-accent border-t-transparent animate-spin mx-auto" /></div>;

  const maxCount = Math.max(...FUNNEL_STEPS.map(s => funnelData[s.key] || 0), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-display text-foreground mb-1">Conversion Funnel</h1>
        <p className="text-xs text-muted-foreground">Letzte 30 Tage – Wo springen Kunden ab?</p>
      </div>

      <div className="bg-card border border-border p-6">
        <div className="space-y-2">
          {FUNNEL_STEPS.map((step, i) => {
            const count = funnelData[step.key] || 0;
            const prevCount = i > 0 ? (funnelData[FUNNEL_STEPS[i - 1].key] || 0) : count;
            const dropOff = i > 0 && prevCount > 0 ? ((1 - count / prevCount) * 100).toFixed(1) : null;
            const widthPct = maxCount > 0 ? Math.max((count / maxCount) * 100, 8) : 8;

            return (
              <div key={step.key}>
                {i > 0 && dropOff && (
                  <div className="flex items-center gap-2 py-1 pl-4">
                    <ArrowDown className="w-3 h-3 text-muted-foreground" strokeWidth={1.5} />
                    <span className="text-[10px] text-destructive">-{dropOff}% Abbruch</span>
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground w-40 text-right shrink-0">{step.label}</span>
                  <div className="flex-1 relative">
                    <div
                      className="h-10 bg-foreground/10 flex items-center px-4 transition-all"
                      style={{ width: `${widthPct}%` }}
                    >
                      <span className="text-sm font-medium text-foreground">{count.toLocaleString('de-DE')}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Overall CR */}
        <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Gesamte Conversion Rate</span>
          <span className="text-xl font-display text-foreground">
            {maxCount > 0 && (funnelData['payment_complete'] || 0) > 0
              ? ((funnelData['payment_complete'] || 0) / (funnelData['page_view'] || 1) * 100).toFixed(2)
              : '0'}%
          </span>
        </div>
      </div>
    </div>
  );
}
