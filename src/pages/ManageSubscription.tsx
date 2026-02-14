import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { PremiumPageLayout } from '@/components/premium/PremiumPageLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Package, 
  Calendar, 
  Pause, 
  Play, 
  XCircle, 
  ArrowLeft, 
  Mail,
  CheckCircle2,
  RefreshCw,
  AlertTriangle
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
  
  // For requesting a new magic link
  const [email, setEmail] = useState('');
  const [linkRequested, setLinkRequested] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);

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

      if (data.error) {
        setError(data.error);
      } else {
        setSubscription(data.subscription);
      }
    } catch (err) {
      console.error('Error validating subscription:', err);
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

      if (data.error) {
        toast.error(data.error);
      } else {
        const messages = {
          pause: 'Abo wurde pausiert',
          resume: 'Abo wurde fortgesetzt',
          cancel: 'Abo wurde gekündigt'
        };
        toast.success(messages[action]);
        
        // Update local state
        setSubscription(prev => prev ? { 
          ...prev, 
          status: data.newStatus,
          next_delivery: data.nextDelivery || prev.next_delivery
        } : null);
      }
    } catch (err) {
      console.error('Error performing action:', err);
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

      if (data.error) {
        toast.error(data.error);
      } else {
        setLinkRequested(true);
        toast.success('Verwaltungslink wurde an deine E-Mail gesendet');
      }
    } catch (err) {
      console.error('Error requesting link:', err);
      toast.error('Link konnte nicht gesendet werden');
    } finally {
      setRequestLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' | 'outline' }> = {
      active: { label: 'Aktiv', variant: 'success' },
      paused: { label: 'Pausiert', variant: 'warning' },
      cancelled: { label: 'Gekündigt', variant: 'destructive' },
    };
    const { label, variant } = config[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const frequencyLabels: Record<string, string> = {
    monthly: 'Monatlich',
    bimonthly: 'Alle 2 Monate',
    quarterly: 'Alle 3 Monate',
  };

  // Show request form if no valid subscription
  if (!subscriptionId || !token || error) {
    return (
      <PremiumPageLayout>
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-muted mx-auto mb-4 flex items-center justify-center">
              <Package className="w-6 h-6 text-foreground" strokeWidth={1.5} />
            </div>
            <CardTitle className="font-display text-2xl">Abo-Verwaltung</CardTitle>
            <CardDescription>
              {error ? error : 'Gib deine E-Mail-Adresse ein, um einen Verwaltungslink zu erhalten'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {linkRequested ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-success/10 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-success" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Wir haben dir einen Verwaltungslink per E-Mail geschickt. 
                  Bitte überprüfe deinen Posteingang.
                </p>
                <Button variant="outline" onClick={() => setLinkRequested(false)}>
                  Erneut senden
                </Button>
              </div>
            ) : (
              <form onSubmit={handleRequestLink} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail-Adresse</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="deine@email.de"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={requestLoading}>
                  {requestLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Wird gesendet...
                    </>
                  ) : (
                    'Verwaltungslink anfordern'
                  )}
                </Button>
              </form>
            )}
            <div className="mt-6 pt-4 border-t border-border text-center">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Zurück zum Shop
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      </PremiumPageLayout>
    );
  }

  if (loading) {
    return (
      <PremiumPageLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Lade Abo-Details...</p>
          </div>
        </div>
      </PremiumPageLayout>
    );
  }

  if (!subscription) {
    return (
      <PremiumPageLayout>
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-8">
              <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
              <h2 className="text-xl font-medium mb-2">Abo nicht gefunden</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Das angeforderte Abo konnte nicht gefunden werden.
              </p>
              <Link to="/">
                <Button>Zurück zum Shop</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </PremiumPageLayout>
    );
  }

  return (
    <PremiumPageLayout>
    <div className="container-premium py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Zurück zum Shop
          </Link>
          <h1 className="text-3xl font-display tracking-tight">Mein Abo verwalten</h1>
          <p className="text-muted-foreground mt-1">
            Hallo {subscription.guest_name}, hier kannst du dein Parfüm-Abo verwalten.
          </p>
        </div>

        {/* Subscription Card */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-start gap-4">
            {subscription.image ? (
              <img 
                src={subscription.image} 
                alt={subscription.product} 
                className="w-20 h-20 object-cover bg-muted"
              />
            ) : (
              <div className="w-20 h-20 bg-muted flex items-center justify-center">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{subscription.product}</CardTitle>
                  {subscription.variant && (
                    <CardDescription>{subscription.variant}</CardDescription>
                  )}
                </div>
                {getStatusBadge(subscription.status)}
              </div>
              {subscription.price && (
                <p className="text-lg font-medium mt-2">
                  {subscription.price.toFixed(2)} €
                  {subscription.discount_percent && (
                    <span className="text-sm text-success ml-2">-{subscription.discount_percent}%</span>
                  )}
                </p>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 py-4 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Intervall</p>
                <p className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {frequencyLabels[subscription.frequency] || subscription.frequency}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Lieferungen</p>
                <p className="text-sm font-medium">{subscription.delivery_count}</p>
              </div>
              {subscription.next_delivery && subscription.status === 'active' && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Nächste Lieferung</p>
                  <p className="text-sm font-medium">
                    {format(new Date(subscription.next_delivery), 'dd. MMMM yyyy', { locale: de })}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-border space-y-3">
              {subscription.status === 'active' && (
                <>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleAction('pause')}
                    disabled={actionLoading}
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Abo pausieren
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
                        <XCircle className="w-4 h-4 mr-2" />
                        Abo kündigen
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Abo wirklich kündigen?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Diese Aktion kann nicht rückgängig gemacht werden. Du erhältst keine weiteren 
                          Lieferungen mehr und verlierst deinen Abo-Rabatt.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleAction('cancel')}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Ja, kündigen
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}

              {subscription.status === 'paused' && (
                <>
                  <Button 
                    className="w-full justify-start"
                    onClick={() => handleAction('resume')}
                    disabled={actionLoading}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Abo fortsetzen
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
                        <XCircle className="w-4 h-4 mr-2" />
                        Abo kündigen
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Abo wirklich kündigen?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Diese Aktion kann nicht rückgängig gemacht werden.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleAction('cancel')}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Ja, kündigen
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}

              {subscription.status === 'cancelled' && (
                <div className="text-center py-4">
                  <p className="text-muted-foreground text-sm">
                    Dieses Abo wurde gekündigt. 
                    <Link to="/products" className="text-foreground underline ml-1">
                      Neues Abo starten
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Fragen zu deinem Abo? Kontaktiere uns unter{' '}
              <a href="mailto:support@aldenairperfumes.de" className="text-foreground underline">
                support@aldenairperfumes.de
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
    </PremiumPageLayout>
  );
}
