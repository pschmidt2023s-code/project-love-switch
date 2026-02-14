import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FlaskConical, BarChart3, Plus, Play, Pause } from 'lucide-react';
import { toast } from 'sonner';

interface ABExperiment {
  id: string;
  name: string;
  description: string | null;
  variant_a_label: string;
  variant_b_label: string;
  target_element: string | null;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

interface EventStats {
  experiment_id: string;
  variant: string;
  views: number;
  conversions: number;
}

export default function ABTestingManagement() {
  const [experiments, setExperiments] = useState<ABExperiment[]>([]);
  const [stats, setStats] = useState<EventStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', variant_a_label: 'Control', variant_b_label: 'Variant' });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [expRes, eventsRes] = await Promise.all([
      supabase.from('ab_experiments').select('*').order('created_at', { ascending: false }),
      supabase.from('ab_experiment_events').select('experiment_id, variant, event_type'),
    ]);
    setExperiments(expRes.data || []);
    
    // Compute stats
    const events = eventsRes.data || [];
    const statMap: Record<string, EventStats> = {};
    events.forEach(e => {
      const key = `${e.experiment_id}-${e.variant}`;
      if (!statMap[key]) statMap[key] = { experiment_id: e.experiment_id, variant: e.variant, views: 0, conversions: 0 };
      if (e.event_type === 'view') statMap[key].views++;
      if (e.event_type === 'conversion') statMap[key].conversions++;
    });
    setStats(Object.values(statMap));
    setLoading(false);
  }

  async function createExperiment() {
    if (!form.name.trim()) return;
    const { error } = await supabase.from('ab_experiments').insert(form);
    if (error) { toast.error('Fehler'); return; }
    toast.success('Experiment erstellt');
    setShowCreate(false);
    setForm({ name: '', description: '', variant_a_label: 'Control', variant_b_label: 'Variant' });
    fetchData();
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from('ab_experiments').update({ is_active: !current }).eq('id', id);
    setExperiments(prev => prev.map(e => e.id === id ? { ...e, is_active: !current } : e));
  }

  function getStatsFor(expId: string) {
    return stats.filter(s => s.experiment_id === expId);
  }

  if (loading) return <div className="p-12 text-center"><div className="w-6 h-6 border-2 border-accent border-t-transparent animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display text-foreground mb-1">A/B Testing</h1>
          <p className="text-xs text-muted-foreground">Experimente erstellen und auswerten</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium">
          <Plus className="w-4 h-4" /> Neues Experiment
        </button>
      </div>

      {showCreate && (
        <div className="bg-card border border-border p-4 space-y-4">
          <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Experiment-Name" className="w-full px-4 py-3 bg-transparent border border-border text-foreground text-sm focus:outline-none" />
          <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Beschreibung (optional)" className="w-full px-4 py-3 bg-transparent border border-border text-foreground text-sm focus:outline-none" />
          <div className="grid grid-cols-2 gap-3">
            <input value={form.variant_a_label} onChange={e => setForm(p => ({ ...p, variant_a_label: e.target.value }))} placeholder="Variante A" className="px-4 py-3 bg-transparent border border-border text-foreground text-sm focus:outline-none" />
            <input value={form.variant_b_label} onChange={e => setForm(p => ({ ...p, variant_b_label: e.target.value }))} placeholder="Variante B" className="px-4 py-3 bg-transparent border border-border text-foreground text-sm focus:outline-none" />
          </div>
          <div className="flex gap-3">
            <button onClick={createExperiment} className="px-4 py-2 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase">Erstellen</button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 border border-border text-[11px] tracking-[0.15em] uppercase">Abbrechen</button>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {experiments.length === 0 ? (
          <div className="bg-card border border-border p-12 text-center">
            <FlaskConical className="w-12 h-12 text-muted-foreground mx-auto mb-4" strokeWidth={1} />
            <h3 className="font-display text-lg text-foreground mb-2">Keine Experimente</h3>
            <p className="text-sm text-muted-foreground">Starte dein erstes A/B-Test Experiment</p>
          </div>
        ) : experiments.map(exp => {
          const expStats = getStatsFor(exp.id);
          const varA = expStats.find(s => s.variant === 'A') || { views: 0, conversions: 0 };
          const varB = expStats.find(s => s.variant === 'B') || { views: 0, conversions: 0 };
          const crA = varA.views > 0 ? (varA.conversions / varA.views * 100).toFixed(1) : '0';
          const crB = varB.views > 0 ? (varB.conversions / varB.views * 100).toFixed(1) : '0';

          return (
            <div key={exp.id} className="bg-card border border-border p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{exp.name}</p>
                  {exp.description && <p className="text-xs text-muted-foreground">{exp.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] tracking-[0.1em] uppercase px-2 py-1 ${exp.is_active ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                    {exp.is_active ? 'Aktiv' : 'Pausiert'}
                  </span>
                  <button onClick={() => toggleActive(exp.id, exp.is_active)} className="p-1.5 hover:bg-muted transition-colors">
                    {exp.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted/50">
                  <p className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground mb-1">{exp.variant_a_label}</p>
                  <p className="text-lg font-display text-foreground">{crA}%</p>
                  <p className="text-xs text-muted-foreground">{varA.conversions}/{varA.views} Conversions</p>
                </div>
                <div className="p-3 bg-muted/50">
                  <p className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground mb-1">{exp.variant_b_label}</p>
                  <p className="text-lg font-display text-foreground">{crB}%</p>
                  <p className="text-xs text-muted-foreground">{varB.conversions}/{varB.views} Conversions</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
