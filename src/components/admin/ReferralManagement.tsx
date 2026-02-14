import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users, Gift, TrendingUp, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ReferralCode {
  id: string;
  user_id: string;
  code: string;
  reward_type: string;
  reward_value: number;
  referee_reward_value: number;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  created_at: string;
}

interface ReferralReward {
  id: string;
  referral_code_id: string;
  referrer_id: string;
  referee_id: string;
  referee_email: string | null;
  referrer_reward: number;
  referee_reward: number;
  status: string;
  created_at: string;
}

export default function ReferralManagement() {
  const [codes, setCodes] = useState<ReferralCode[]>([]);
  const [rewards, setRewards] = useState<ReferralReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [codesRes, rewardsRes] = await Promise.all([
        supabase.from('referral_codes').select('*').order('created_at', { ascending: false }),
        supabase.from('referral_rewards').select('*').order('created_at', { ascending: false }).limit(50),
      ]);
      setCodes(codesRes.data || []);
      setRewards(rewardsRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function copyCode(code: string, id: string) {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success('Code kopiert');
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from('referral_codes').update({ is_active: !current }).eq('id', id);
    setCodes(prev => prev.map(c => c.id === id ? { ...c, is_active: !current } : c));
  }

  const totalReferrals = rewards.length;
  const completedReferrals = rewards.filter(r => r.status === 'completed').length;
  const totalRewardsPaid = rewards.reduce((s, r) => s + Number(r.referrer_reward) + Number(r.referee_reward), 0);

  const kpis = [
    { label: 'Referral Codes', value: codes.length, icon: Gift },
    { label: 'Empfehlungen', value: totalReferrals, icon: Users },
    { label: 'Abgeschlossen', value: completedReferrals, icon: TrendingUp },
    { label: 'Belohnungen (€)', value: totalRewardsPaid.toFixed(2), icon: Gift },
  ];

  if (loading) return <div className="p-12 text-center"><div className="w-6 h-6 border-2 border-accent border-t-transparent animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-display text-foreground mb-1">Empfehlungsprogramm</h1>
        <p className="text-xs text-muted-foreground">Kunden werben Kunden – Verwaltung</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map(kpi => (
          <div key={kpi.label} className="bg-card border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] tracking-[0.1em] uppercase text-muted-foreground">{kpi.label}</span>
              <kpi.icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <p className="text-xl font-display text-foreground">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Referral Codes */}
      <div className="bg-card border border-border">
        <div className="p-4 border-b border-border">
          <h2 className="text-base font-display text-foreground">Aktive Codes</h2>
        </div>
        <div className="divide-y divide-border">
          {codes.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Keine Referral Codes vorhanden</div>
          ) : codes.map(code => (
            <div key={code.id} className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium text-foreground">{code.code}</span>
                  <button onClick={() => copyCode(code.code, code.id)} className="text-muted-foreground hover:text-foreground">
                    {copiedId === code.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {code.reward_value}% Rabatt · {code.current_uses}{code.max_uses ? `/${code.max_uses}` : ''} Nutzungen
                </p>
              </div>
              <button
                onClick={() => toggleActive(code.id, code.is_active)}
                className={`text-[10px] tracking-[0.1em] uppercase px-3 py-1 ${code.is_active ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'}`}
              >
                {code.is_active ? 'Aktiv' : 'Inaktiv'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Rewards */}
      <div className="bg-card border border-border">
        <div className="p-4 border-b border-border">
          <h2 className="text-base font-display text-foreground">Letzte Empfehlungen</h2>
        </div>
        <div className="divide-y divide-border">
          {rewards.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Noch keine Empfehlungen</div>
          ) : rewards.slice(0, 10).map(reward => (
            <div key={reward.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">{reward.referee_email || 'Unbekannt'}</p>
                <p className="text-xs text-muted-foreground">{new Date(reward.created_at).toLocaleDateString('de-DE')}</p>
              </div>
              <div className="text-right">
                <span className={`text-[10px] tracking-[0.1em] uppercase px-2 py-1 ${
                  reward.status === 'completed' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'
                }`}>
                  {reward.status === 'completed' ? 'Abgeschlossen' : 'Ausstehend'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
