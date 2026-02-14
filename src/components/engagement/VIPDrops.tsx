import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Clock, Crown, ArrowRight, Lock, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Drop {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  drop_date: string;
  product_id: string | null;
}

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = Math.max(0, target - now);

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const units = [
    { label: 'Tage', value: timeLeft.days },
    { label: 'Std', value: timeLeft.hours },
    { label: 'Min', value: timeLeft.minutes },
    { label: 'Sek', value: timeLeft.seconds },
  ];

  return (
    <div className="flex gap-3">
      {units.map(u => (
        <div key={u.label} className="text-center">
          <div className="w-14 h-14 border border-accent/30 bg-card flex items-center justify-center">
            <span className="font-display text-xl text-foreground">{String(u.value).padStart(2, '0')}</span>
          </div>
          <span className="text-[9px] tracking-[0.15em] uppercase text-muted-foreground mt-1 block">{u.label}</span>
        </div>
      ))}
    </div>
  );
}

export function VIPDrops() {
  const { user } = useAuth();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Check VIP status
  const { data: vipStatus, isLoading: vipLoading } = useQuery({
    queryKey: ['vip-status', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('check-vip');
      if (error) throw error;
      return data as { is_vip: boolean; subscription_end: string | null };
    },
    enabled: !!user,
    refetchInterval: 60000, // Check every minute
  });

  const isVip = vipStatus?.is_vip ?? false;

  const { data: drops = [] } = useQuery({
    queryKey: ['vip-drops'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vip_drops')
        .select('*')
        .eq('is_active', true)
        .gte('drop_date', new Date().toISOString())
        .order('drop_date', { ascending: true })
        .limit(3);
      if (error) throw error;
      return data as Drop[];
    },
  });

  const handleSubscribe = async () => {
    if (!user) {
      toast.error('Bitte melde dich zuerst an, um ein VIP-Abo abzuschließen.');
      return;
    }

    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-vip-checkout');
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      toast.error('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Non-VIP teaser (no drops or not subscribed)
  if (!isVip) {
    return (
      <section className="section-padding border-t border-border">
        <div className="container-premium text-center">
          <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-4">
            <Crown className="w-4 h-4 inline-block mr-2 -mt-0.5" />
            VIP Early Access
          </span>
          <h2 className="font-display text-2xl lg:text-3xl text-foreground mb-4">
            Werde VIP-Mitglied
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-8">
            Sichere dir exklusiven Zugang zu limitierten Editionen, 
            VIP Drops und Early Access Angeboten — für nur 9,99€/Monat.
          </p>
          <button
            onClick={handleSubscribe}
            disabled={checkoutLoading || vipLoading}
            className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-accent-foreground text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {checkoutLoading ? (
              'Wird geladen...'
            ) : (
              <>
                <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                VIP-Abo abschließen — 9,99€/Monat
              </>
            )}
          </button>
          {!user && (
            <p className="text-[10px] text-muted-foreground mt-4">
              <Link to="/auth" className="underline hover:text-foreground">Anmelden</Link> um VIP-Mitglied zu werden
            </p>
          )}
        </div>
      </section>
    );
  }

  // VIP member view
  return (
    <section className="section-padding border-t border-border">
      <div className="container-premium">
        <div className="text-center mb-10">
          <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-4">
            <Crown className="w-4 h-4 inline-block mr-2 -mt-0.5" />
            VIP Early Access
          </span>
          <h2 className="font-display text-2xl lg:text-3xl text-foreground mb-4">
            Exklusive Drops
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Limitierte Editionen – nur für VIP-Mitglieder
          </p>
        </div>

        {drops.length === 0 ? (
          <div className="text-center py-12 border border-border">
            <Crown className="w-10 h-10 text-accent/30 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Aktuell keine Drops geplant. Wir benachrichtigen dich!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drops.map(drop => (
              <div key={drop.id} className="border border-border bg-card group">
                <div className="aspect-[4/3] bg-muted overflow-hidden relative">
                  {drop.image_url ? (
                    <img src={drop.image_url} alt={drop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Crown className="w-12 h-12 text-accent/20" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 px-3 py-1 bg-accent text-accent-foreground text-[9px] tracking-[0.15em] uppercase font-medium">
                    Limited Edition
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-display text-lg text-foreground mb-2">{drop.title}</h3>
                  {drop.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{drop.description}</p>
                  )}

                  <div className="mb-4">
                    <div className="flex items-center gap-1.5 text-[9px] tracking-[0.15em] uppercase text-accent mb-3">
                      <Clock className="w-3 h-3" />
                      Drop startet in
                    </div>
                    <CountdownTimer targetDate={drop.drop_date} />
                  </div>

                  {drop.product_id && (
                    <Link
                      to="/products"
                      className="inline-flex items-center text-[11px] tracking-[0.1em] uppercase text-foreground hover:text-accent transition-colors"
                    >
                      Produkt ansehen
                      <ArrowRight className="ml-2 w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
