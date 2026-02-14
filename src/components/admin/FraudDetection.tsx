import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ShieldAlert, AlertTriangle, CheckCircle, Eye } from 'lucide-react';

interface FraudScore {
  id: string;
  order_id: string | null;
  user_id: string | null;
  score: number;
  risk_level: string;
  factors: unknown;
  flagged: boolean;
  reviewed: boolean;
  created_at: string;
}

export default function FraudDetection() {
  const [scores, setScores] = useState<FraudScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScores();
  }, []);

  async function fetchScores() {
    const { data } = await supabase.from('fraud_scores').select('*').order('created_at', { ascending: false }).limit(50);
    setScores(data || []);
    setLoading(false);
  }

  async function markReviewed(id: string) {
    await supabase.from('fraud_scores').update({ reviewed: true, reviewed_at: new Date().toISOString() }).eq('id', id);
    setScores(prev => prev.map(s => s.id === id ? { ...s, reviewed: true } : s));
  }

  const flagged = scores.filter(s => s.flagged && !s.reviewed);
  const highRisk = scores.filter(s => s.risk_level === 'high');

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-destructive/10 text-destructive';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600';
      default: return 'bg-green-500/10 text-green-600';
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'high': return 'Hoch';
      case 'medium': return 'Mittel';
      default: return 'Niedrig';
    }
  };

  if (loading) return <div className="p-12 text-center"><div className="w-6 h-6 border-2 border-accent border-t-transparent animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-display text-foreground mb-1">Betrugs-Erkennung</h1>
        <p className="text-xs text-muted-foreground">Verdächtige Bestellungen überwachen</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] tracking-[0.1em] uppercase text-muted-foreground">Markiert</span>
            <AlertTriangle className="w-4 h-4 text-yellow-500" strokeWidth={1.5} />
          </div>
          <p className="text-xl font-display text-foreground">{flagged.length}</p>
        </div>
        <div className="bg-card border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] tracking-[0.1em] uppercase text-muted-foreground">Hohes Risiko</span>
            <ShieldAlert className="w-4 h-4 text-destructive" strokeWidth={1.5} />
          </div>
          <p className="text-xl font-display text-foreground">{highRisk.length}</p>
        </div>
        <div className="bg-card border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] tracking-[0.1em] uppercase text-muted-foreground">Gesamt geprüft</span>
            <CheckCircle className="w-4 h-4 text-green-500" strokeWidth={1.5} />
          </div>
          <p className="text-xl font-display text-foreground">{scores.filter(s => s.reviewed).length}</p>
        </div>
      </div>

      <div className="bg-card border border-border">
        <div className="p-4 border-b border-border">
          <h2 className="text-base font-display text-foreground">Aktuelle Bewertungen</h2>
        </div>
        <div className="divide-y divide-border">
          {scores.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Keine Fraud-Bewertungen vorhanden</div>
          ) : scores.map(score => (
            <div key={score.id} className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Score: {Number(score.score).toFixed(0)}/100</p>
                <p className="text-xs text-muted-foreground">{new Date(score.created_at).toLocaleDateString('de-DE')}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] tracking-[0.1em] uppercase px-2 py-1 ${getRiskColor(score.risk_level)}`}>
                  {getRiskLabel(score.risk_level)}
                </span>
                {!score.reviewed && (
                  <button onClick={() => markReviewed(score.id)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Als geprüft markieren">
                    <Eye className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                )}
                {score.reviewed && <CheckCircle className="w-4 h-4 text-green-500" strokeWidth={1.5} />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
