import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { PremiumPageLayout } from '@/components/premium/PremiumPageLayout';
import { supabase } from '@/integrations/supabase/client';
import {
  Package, Calendar, Pause, Play, XCircle, ArrowLeft, Mail,
  CheckCircle2, RefreshCw, AlertTriangle, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface SubscriptionData {
  id: string;
  status: string;
  frequency: string;
  next_delivery: string | null;
  guest_name: string | null;
  guest_email: string | null;
  discount_percent: number | null;
  delivery_count: number;
  product: string;
  variant: string | null;
  price: number | null;
  image: string | null;
}

export default function ManageSubscription() {
  const [searchParams] = useSearchParams();
  const subscriptionId = searchParams.get('id');
  const token = searchParams.get('token');

  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [linkRequested, setLinkRequested] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    if (subscriptionId && token) {
      validateAndFetch();
    } else {
      setLoading(false);
    }
  }, [subscriptionId, token]);

  const validateAndFetch = async () => {
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('manage-subscription', {
        body: { action: 'validate', subscriptionId, token }
      });
      if (invokeError) throw invokeError;
      if (data.error) { setError(data.error); } else { setSubscription(data.subscription); }
    } catch {
      setError('Ungültiger oder abgelaufener Link');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'pause' | 'resume' | 'cancel') => {
    setActionLoading(true);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('manage-subscription', {
        body: { action, subscriptionId, token }
      });
      if (invokeError) throw invokeError;
      if (data.error) { toast.error(data.error); } else {
        const messages = { pause: 'Abo wurde pausiert', resume: 'Abo wurde fortgesetzt', cancel: 'Abo wurde gekündigt' };
        toast.success(messages[action]);
        setSubscription(prev => prev ? { ...prev, status: data.newStatus, next_delivery: data.nextDelivery || prev.next_delivery } : null);
        setConfirmCancel(false);
      }
    } catch {
      toast.error('Aktion konnte nicht ausgeführt werden');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setRequestLoading(true);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('manage-subscription', {
        body: { action: 'generate_link', email: email.trim() }
      });
      if (invokeError) throw invokeError;
      if (data.error) { toast.error(data.error); } else { setLinkRequested(true); toast.success('Verwaltungslink wurde an deine E-Mail gesendet'); }
    } catch {
      toast.error('Link konnte nicht gesendet werden');
    } finally {
      setRequestLoading(false);
    }
  };

  const frequencyLabels: Record<string, string> = {
    monthly: 'Monatlich', bimonthly: 'Alle 2 Monate', quarterly: 'Alle 3 Monate',
  };

  const statusConfig: Record<string, { label: string; style: string }> = {
    active: { label: 'Aktiv', style: 'bg-accent/10 text-accent' },
    paused: { label: 'Pausiert', style: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' },
    cancelled: { label: 'Gekündigt', style: 'bg-destructive/10 text-destructive' },
  };

  // Request link / error state
  if (!subscriptionId || !token || error) {
    return (
      <PremiumPageLayout>
        <section className="py-24 lg:py-32">
          <div className="container-premium flex items-center justify-center">
            <div className="w-full max-w-md space-y-8">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-6 flex items-center justify-center border border-border">
                  <Package className="w-6 h-6 text-accent" strokeWidth={1.5} />
                </div>
                <h1 className="font-display text-2xl text-foreground mb-2">Abo-Verwaltung</h1>
                <p className="text-sm text-muted-foreground">
                  {error || 'Gib deine E-Mail-Adresse ein, um einen Verwaltungslink zu erhalten'}
                </p>
              </div>

              {linkRequested ? (
                <div className="text-center space-y-6 p-8 border border-border">
                  <CheckCircle2 className="w-10 h-10 text-accent mx-auto" strokeWidth={1.5} />
                  <p className="text-sm text-muted-foreground">
                    Wir haben dir einen Verwaltungslink per E-Mail geschickt. Bitte überprüfe deinen Posteingang.
                  </p>
                  <button onClick={() => setLinkRequested(false)} className="px-6 py-3 border border-border text-foreground text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-muted transition-colors">
                    Erneut senden
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRequestLink} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">E-Mail-Adresse</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                      <input
                        type="email"
                        placeholder="deine@email.de"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-11 pr-4 py-4 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={requestLoading}
                    className="w-full py-4 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {requestLoading ? (
                      <><RefreshCw className="w-4 h-4 animate-spin" /> Wird gesendet...</>
                    ) : (
                      <>Verwaltungslink anfordern <ArrowRight className="w-4 h-4" strokeWidth={1.5} /></>
                    )}
                  </button>
                </form>
              )}

              <div className="text-center pt-4 border-t border-border">
                <Link to="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                  Zurück zum Shop
                </Link>
              </div>
            </div>
          </div>
        </section>
      </PremiumPageLayout>
    );
  }

  if (loading) {
    return (
      <PremiumPageLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent animate-spin" />
        </div>
      </PremiumPageLayout>
    );
  }

  if (!subscription) {
    return (
      <PremiumPageLayout>
        <section className="py-24 lg:py-32">
          <div className="container-premium text-center max-w-md mx-auto space-y-6">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" strokeWidth={1.5} />
            <h1 className="font-display text-2xl text-foreground">Abo nicht gefunden</h1>
            <p className="text-sm text-muted-foreground">Das angeforderte Abo konnte nicht gefunden werden.</p>
            <Link to="/" className="inline-flex items-center px-6 py-3 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors">
              Zurück zum Shop
            </Link>
          </div>
        </section>
      </PremiumPageLayout>
    );
  }

  const status = statusConfig[subscription.status] || { label: subscription.status, style: 'bg-muted text-muted-foreground' };

  return (
    <PremiumPageLayout>
      {/* Header */}
      <section className="border-b border-border">
        <div className="container-premium py-8 lg:py-12">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            Zurück zum Shop
          </Link>
          <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-3">Abonnement</span>
          <h1 className="font-display text-3xl lg:text-4xl text-foreground">Mein Abo verwalten</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Hallo {subscription.guest_name}, hier kannst du dein Parfüm-Abo verwalten.
          </p>
        </div>
      </section>

      <section className="section-spacing">
        <div className="container-premium max-w-2xl">
          {/* Subscription overview */}
          <div className="border border-border p-6 lg:p-8 mb-6">
            <div className="flex items-start gap-5">
              {subscription.image ? (
                <img src={subscription.image} alt={subscription.product} className="w-20 h-20 object-cover bg-muted flex-shrink-0" />
              ) : (
                <div className="w-20 h-20 bg-muted flex items-center justify-center flex-shrink-0">
                  <Package className="w-8 h-8 text-muted-foreground" strokeWidth={1} />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-display text-lg text-foreground">{subscription.product}</h2>
                    {subscription.variant && <p className="text-xs text-muted-foreground mt-0.5">{subscription.variant}</p>}
                  </div>
                  <span className={`px-3 py-1 text-[10px] tracking-[0.1em] uppercase font-medium ${status.style}`}>
                    {status.label}
                  </span>
                </div>
                {subscription.price && (
                  <p className="text-lg font-display text-foreground mt-3">
                    {subscription.price.toFixed(2)} €
                    {subscription.discount_percent && (
                      <span className="text-xs text-accent ml-2">-{subscription.discount_percent}%</span>
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
              <div>
                <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1">Intervall</p>
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-accent" strokeWidth={1.5} />
                  {frequencyLabels[subscription.frequency] || subscription.frequency}
                </p>
              </div>
              <div>
                <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1">Lieferungen</p>
                <p className="text-sm font-medium text-foreground">{subscription.delivery_count}</p>
              </div>
              {subscription.next_delivery && subscription.status === 'active' && (
                <div className="col-span-2">
                  <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1">Nächste Lieferung</p>
                  <p className="text-sm font-medium text-foreground">
                    {format(new Date(subscription.next_delivery), 'dd. MMMM yyyy', { locale: de })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="border border-border p-6 lg:p-8 space-y-4">
            <h3 className="text-[10px] tracking-[0.2em] uppercase text-accent mb-2">Aktionen</h3>

            {subscription.status === 'active' && (
              <>
                <button
                  onClick={() => handleAction('pause')}
                  disabled={actionLoading}
                  className="w-full flex items-center gap-3 px-5 py-4 border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                >
                  <Pause className="w-4 h-4 text-accent" strokeWidth={1.5} />
                  <span className="text-sm">Abo pausieren</span>
                </button>

                {!confirmCancel ? (
                  <button
                    onClick={() => setConfirmCancel(true)}
                    className="w-full flex items-center gap-3 px-5 py-4 border border-border text-destructive hover:bg-destructive/5 transition-colors"
                  >
                    <XCircle className="w-4 h-4" strokeWidth={1.5} />
                    <span className="text-sm">Abo kündigen</span>
                  </button>
                ) : (
                  <div className="p-5 border border-destructive/30 bg-destructive/5 space-y-4">
                    <p className="text-sm text-foreground font-medium">Abo wirklich kündigen?</p>
                    <p className="text-xs text-muted-foreground">
                      Du erhältst keine weiteren Lieferungen mehr und verlierst deinen Abo-Rabatt. Diese Aktion kann nicht rückgängig gemacht werden.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setConfirmCancel(false)}
                        className="px-5 py-3 border border-border text-foreground text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-muted transition-colors"
                      >
                        Abbrechen
                      </button>
                      <button
                        onClick={() => handleAction('cancel')}
                        disabled={actionLoading}
                        className="px-5 py-3 bg-destructive text-destructive-foreground text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50"
                      >
                        Ja, kündigen
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {subscription.status === 'paused' && (
              <>
                <button
                  onClick={() => handleAction('resume')}
                  disabled={actionLoading}
                  className="w-full py-4 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" strokeWidth={1.5} />
                  Abo fortsetzen
                </button>

                {!confirmCancel ? (
                  <button
                    onClick={() => setConfirmCancel(true)}
                    className="w-full flex items-center gap-3 px-5 py-4 border border-border text-destructive hover:bg-destructive/5 transition-colors"
                  >
                    <XCircle className="w-4 h-4" strokeWidth={1.5} />
                    <span className="text-sm">Abo kündigen</span>
                  </button>
                ) : (
                  <div className="p-5 border border-destructive/30 bg-destructive/5 space-y-4">
                    <p className="text-sm text-foreground font-medium">Abo wirklich kündigen?</p>
                    <p className="text-xs text-muted-foreground">Diese Aktion kann nicht rückgängig gemacht werden.</p>
                    <div className="flex gap-3">
                      <button onClick={() => setConfirmCancel(false)} className="px-5 py-3 border border-border text-foreground text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-muted transition-colors">
                        Abbrechen
                      </button>
                      <button onClick={() => handleAction('cancel')} disabled={actionLoading} className="px-5 py-3 bg-destructive text-destructive-foreground text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50">
                        Ja, kündigen
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {subscription.status === 'cancelled' && (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">
                  Dieses Abo wurde gekündigt.{' '}
                  <Link to="/products" className="text-accent hover:underline">Neues Abo starten</Link>
                </p>
              </div>
            )}
          </div>

          {/* Help */}
          <div className="mt-6 p-5 border border-border">
            <p className="text-sm text-muted-foreground">
              Fragen zu deinem Abo? Kontaktiere uns unter{' '}
              <a href="mailto:support@aldenairperfumes.de" className="text-accent hover:underline">
                support@aldenairperfumes.de
              </a>
            </p>
          </div>
        </div>
      </section>
    </PremiumPageLayout>
  );
}