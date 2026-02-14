import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PremiumPageLayout } from '@/components/premium/PremiumPageLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Seo } from '@/components/Seo';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Users, Euro, Copy, Check, TrendingUp, Share2, ArrowRight } from 'lucide-react';
import { AuthModal } from '@/components/AuthModal';

interface Partner {
  id: string;
  partner_code: string;
  status: string;
  commission_rate: number;
  total_sales: number;
  total_commission: number;
  total_paid_out: number;
}

export default function Partner() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [applicationData, setApplicationData] = useState({
    first_name: '',
    last_name: '',
    motivation: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      loadPartnerData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadPartnerData = async () => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      setPartner(data);
    } catch (error) {
      console.error('Error loading partner data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (partner?.partner_code) {
      navigator.clipboard.writeText(partner.partner_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Code kopiert!", description: "Dein Partner-Code wurde in die Zwischenablage kopiert." });
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      const partnerCode = `ALD${Date.now().toString(36).toUpperCase()}`;
      const { error } = await supabase
        .from('partners')
        .insert({
          user_id: user.id,
          partner_code: partnerCode,
          status: 'pending',
          application_data: applicationData
        });

      if (error) throw error;
      toast({ title: "Bewerbung eingereicht!", description: "Wir werden deine Bewerbung prüfen und uns bei dir melden." });
      loadPartnerData();
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({ title: "Fehler", description: "Ein Fehler ist aufgetreten.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <PremiumPageLayout>
        <Seo title="Partner-Programm | ALDENAIR" description="Werde ALDENAIR Partner und verdiene bis zu 10% Provision." canonicalPath="/partner" />
        <section className="section-spacing">
          <div className="container-premium text-center max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-accent/10">
              <Users className="w-7 h-7 text-accent" strokeWidth={1.5} />
            </div>
            <h1 className="font-display text-2xl text-foreground mb-3">Partner-Programm</h1>
            <p className="text-sm text-muted-foreground mb-8">
              Melde dich an, um Partner zu werden und bis zu 10% Provision zu verdienen.
            </p>
            <AuthModal>
              <button className="inline-flex items-center px-8 py-4 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors">
                Jetzt anmelden
                <ArrowRight className="ml-2 w-4 h-4" strokeWidth={1.5} />
              </button>
            </AuthModal>
          </div>
        </section>
      </PremiumPageLayout>
    );
  }

  return (
    <PremiumPageLayout>
      <Seo title="Partner-Programm | ALDENAIR" description="Dein ALDENAIR Partner Dashboard." canonicalPath="/partner" />

      {/* Header */}
      <section className="border-b border-border">
        <div className="container-premium py-8 lg:py-12">
          <Breadcrumb className="mb-6" />
          <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-3">Partner</span>
          <h1 className="font-display text-3xl lg:text-4xl text-foreground">Partner-Programm</h1>
        </div>
      </section>

      <section className="section-spacing">
        <div className="container-premium max-w-3xl mx-auto">
          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent animate-spin mx-auto" />
            </div>
          ) : partner ? (
            <div className="space-y-6">
              {/* Status */}
              <div className="p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-display text-xl text-foreground">Partner-Status</h2>
                    <p className="text-sm text-muted-foreground">Code: {partner.partner_code}</p>
                  </div>
                  <span className={`px-3 py-1 text-[10px] tracking-[0.1em] uppercase font-medium ${
                    partner.status === 'approved' ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'
                  }`}>
                    {partner.status === 'approved' ? 'Aktiv' : partner.status === 'pending' ? 'Ausstehend' : partner.status}
                  </span>
                </div>
                {partner.status === 'approved' && (
                  <button onClick={handleCopyCode} className="flex items-center gap-2 px-4 py-2 border border-border text-sm text-foreground hover:bg-muted transition-colors">
                    {copied ? <Check className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Kopiert!' : 'Code kopieren'}
                  </button>
                )}
              </div>

              {/* Stats */}
              {partner.status === 'approved' && (
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { icon: TrendingUp, label: 'Umsatz', value: `${partner.total_sales?.toFixed(2) || '0.00'} €` },
                    { icon: Euro, label: 'Verdient', value: `${partner.total_commission?.toFixed(2) || '0.00'} €` },
                    { icon: Share2, label: 'Provision', value: `${partner.commission_rate || 5}%` },
                  ].map((stat) => (
                    <div key={stat.label} className="p-6 border border-border text-center">
                      <div className="w-10 h-10 mx-auto mb-3 flex items-center justify-center bg-accent/10">
                        <stat.icon className="w-5 h-5 text-accent" strokeWidth={1.5} />
                      </div>
                      <p className="font-display text-2xl text-foreground mb-1">{stat.value}</p>
                      <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Application Form */
            <div className="border border-border p-6 lg:p-8">
              <h2 className="font-display text-xl text-foreground mb-2">Partner werden</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Verdiene bis zu 10% Provision auf alle Verkäufe, die über deinen Partner-Link getätigt werden.
              </p>
              <form onSubmit={handleApply} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] tracking-[0.1em] uppercase text-muted-foreground mb-2">Vorname</label>
                    <input
                      value={applicationData.first_name}
                      onChange={(e) => setApplicationData({ ...applicationData, first_name: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-background border border-border text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-[0.1em] uppercase text-muted-foreground mb-2">Nachname</label>
                    <input
                      value={applicationData.last_name}
                      onChange={(e) => setApplicationData({ ...applicationData, last_name: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-background border border-border text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.1em] uppercase text-muted-foreground mb-2">Warum möchtest du Partner werden?</label>
                  <textarea
                    value={applicationData.motivation}
                    onChange={(e) => setApplicationData({ ...applicationData, motivation: e.target.value })}
                    placeholder="Erzähle uns etwas über dich..."
                    rows={4}
                    required
                    className="w-full px-4 py-3 bg-background border border-border text-sm focus:outline-none focus:border-accent resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Wird eingereicht...' : 'Bewerbung einreichen'}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
    </PremiumPageLayout>
  );
}