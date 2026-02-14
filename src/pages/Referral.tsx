import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PremiumPageLayout } from '@/components/premium/PremiumPageLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Seo } from '@/components/Seo';
import { Gift, Copy, Check, Users, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function Referral() {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [stats, setStats] = useState({ uses: 0, earned: 0 });
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    fetchOrCreateCode();
  }, [user]);

  async function fetchOrCreateCode() {
    if (!user) return;
    try {
      // Check for existing code
      const { data: existing } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('user_id', user.id)
        .limit(1);

      if (existing && existing.length > 0) {
        setReferralCode(existing[0].code);
        setStats({ uses: existing[0].current_uses, earned: existing[0].current_uses * existing[0].reward_value });
      } else {
        // Generate unique code
        const code = `ALDENAIR-${user.id.slice(0, 6).toUpperCase()}`;
        const { error } = await supabase.from('referral_codes').insert({
          user_id: user.id,
          code,
          reward_type: 'percentage',
          reward_value: 10,
          referee_reward_value: 10,
        });
        if (!error) setReferralCode(code);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function copyCode() {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast.success('Code kopiert!');
    setTimeout(() => setCopied(false), 2000);
  }

  function shareLink() {
    const url = `${window.location.origin}?ref=${referralCode}`;
    if (navigator.share) {
      navigator.share({ title: 'ALDENAIR Empfehlung', text: `Spare 10% mit meinem Code: ${referralCode}`, url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link kopiert!');
    }
  }

  return (
    <PremiumPageLayout>
      <Seo title="Freunde werben | ALDENAIR" description="Empfehle ALDENAIR weiter und erhalte Belohnungen" canonicalPath="/referral" />

      <section className="border-b border-border">
        <div className="container-premium py-8 lg:py-12">
          <Breadcrumb className="mb-6" />
          <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-3">Empfehlungsprogramm</span>
          <h1 className="font-display text-3xl lg:text-4xl text-foreground">Freunde werben, Rabatt kassieren</h1>
          <p className="text-muted-foreground text-sm mt-2 max-w-lg">
            Teile deinen persönlichen Code mit Freunden. Beide erhalten 10% Rabatt auf die nächste Bestellung.
          </p>
        </div>
      </section>

      <section className="section-spacing">
        <div className="container-premium">
          <div className="max-w-2xl mx-auto space-y-8">
            {/* How it works */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { step: '1', title: 'Code teilen', desc: 'Teile deinen persönlichen Code' },
                { step: '2', title: 'Freund bestellt', desc: 'Dein Freund spart 10%' },
                { step: '3', title: 'Du sparst auch', desc: 'Du erhältst 10% Rabatt' },
              ].map(item => (
                <div key={item.step} className="text-center p-4 border border-border">
                  <div className="w-8 h-8 mx-auto mb-3 flex items-center justify-center bg-foreground text-background text-sm font-display">{item.step}</div>
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Code display */}
            {loading ? (
              <div className="p-8 text-center"><div className="w-6 h-6 border-2 border-accent border-t-transparent animate-spin mx-auto" /></div>
            ) : !user ? (
              <div className="text-center p-8 border border-border">
                <Gift className="w-12 h-12 mx-auto mb-4 text-muted-foreground" strokeWidth={1} />
                <p className="text-foreground font-display text-lg mb-2">Melde dich an</p>
                <p className="text-sm text-muted-foreground">Du musst angemeldet sein, um deinen Empfehlungscode zu erhalten.</p>
              </div>
            ) : (
              <>
                <div className="bg-card border border-border p-6 text-center">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3">Dein persönlicher Code</p>
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <span className="font-mono text-2xl font-medium text-foreground tracking-wider">{referralCode}</span>
                    <button onClick={copyCode} className="p-2 hover:bg-muted transition-colors">
                      {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-muted-foreground" />}
                    </button>
                  </div>
                  <button onClick={shareLink} className="px-6 py-3 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors">
                    Link teilen
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card border border-border p-4 text-center">
                    <Users className="w-5 h-5 mx-auto mb-2 text-muted-foreground" strokeWidth={1.5} />
                    <p className="text-xl font-display text-foreground">{stats.uses}</p>
                    <p className="text-xs text-muted-foreground">Erfolgreiche Empfehlungen</p>
                  </div>
                  <div className="bg-card border border-border p-4 text-center">
                    <TrendingUp className="w-5 h-5 mx-auto mb-2 text-muted-foreground" strokeWidth={1.5} />
                    <p className="text-xl font-display text-foreground">€{stats.earned.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Verdiente Rabatte</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </PremiumPageLayout>
  );
}
