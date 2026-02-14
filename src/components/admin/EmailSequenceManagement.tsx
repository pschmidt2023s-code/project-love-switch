import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Play, Pause, Plus, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface EmailSequence {
  id: string;
  name: string;
  trigger_type: string;
  is_active: boolean;
  steps: unknown;
  created_at: string;
}

const TRIGGER_LABELS: Record<string, string> = {
  welcome: 'Willkommens-Serie',
  post_purchase: 'Nach dem Kauf',
  abandoned_cart: 'Warenkorbabbrecher',
  win_back: 'Win-Back Kampagne',
  birthday: 'Geburtstags-E-Mail',
};

export default function EmailSequenceManagement() {
  const [sequences, setSequences] = useState<EmailSequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTrigger, setNewTrigger] = useState('welcome');

  useEffect(() => {
    fetchSequences();
  }, []);

  async function fetchSequences() {
    const { data } = await supabase.from('email_sequences').select('*').order('created_at', { ascending: false });
    setSequences(data || []);
    setLoading(false);
  }

  async function createSequence() {
    if (!newName.trim()) return;
    const defaultSteps = [
      { delay_hours: 0, subject: 'Willkommen!', template: 'welcome_1' },
      { delay_hours: 72, subject: 'Entdecke unsere Bestseller', template: 'welcome_2' },
    ];
    const { error } = await supabase.from('email_sequences').insert({
      name: newName, trigger_type: newTrigger, steps: defaultSteps,
    });
    if (error) { toast.error('Fehler beim Erstellen'); return; }
    toast.success('Sequenz erstellt');
    setShowCreate(false);
    setNewName('');
    fetchSequences();
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from('email_sequences').update({ is_active: !current }).eq('id', id);
    setSequences(prev => prev.map(s => s.id === id ? { ...s, is_active: !current } : s));
    toast.success(!current ? 'Sequenz aktiviert' : 'Sequenz pausiert');
  }

  if (loading) return <div className="p-12 text-center"><div className="w-6 h-6 border-2 border-accent border-t-transparent animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display text-foreground mb-1">E-Mail Automationen</h1>
          <p className="text-xs text-muted-foreground">Automatische E-Mail-Flows verwalten</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors">
          <Plus className="w-4 h-4" strokeWidth={1.5} /> Neue Sequenz
        </button>
      </div>

      {showCreate && (
        <div className="bg-card border border-border p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">Name</label>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="z.B. Willkommens-Serie" className="w-full px-4 py-3 bg-transparent border border-border text-foreground text-sm focus:outline-none focus:border-foreground/50" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">Trigger</label>
            <select value={newTrigger} onChange={e => setNewTrigger(e.target.value)} className="w-full px-4 py-3 bg-transparent border border-border text-foreground text-sm focus:outline-none">
              {Object.entries(TRIGGER_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <button onClick={createSequence} className="px-4 py-2 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase">Erstellen</button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 border border-border text-foreground text-[11px] tracking-[0.15em] uppercase">Abbrechen</button>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {sequences.length === 0 ? (
          <div className="bg-card border border-border p-12 text-center">
            <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" strokeWidth={1} />
            <h3 className="font-display text-lg text-foreground mb-2">Keine E-Mail-Sequenzen</h3>
            <p className="text-sm text-muted-foreground">Erstelle deine erste automatische E-Mail-Serie</p>
          </div>
        ) : sequences.map(seq => (
          <div key={seq.id} className="bg-card border border-border p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 flex items-center justify-center ${seq.is_active ? 'bg-green-500/10' : 'bg-muted'}`}>
                <Zap className={`w-5 h-5 ${seq.is_active ? 'text-green-500' : 'text-muted-foreground'}`} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{seq.name}</p>
                <p className="text-xs text-muted-foreground">
                  {TRIGGER_LABELS[seq.trigger_type] || seq.trigger_type} · {Array.isArray(seq.steps) ? (seq.steps as unknown[]).length : 0} Schritte
                </p>
              </div>
            </div>
            <button onClick={() => toggleActive(seq.id, seq.is_active)} className="p-2 hover:bg-muted transition-colors" title={seq.is_active ? 'Pausieren' : 'Aktivieren'}>
              {seq.is_active ? <Pause className="w-4 h-4 text-foreground" /> : <Play className="w-4 h-4 text-muted-foreground" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
