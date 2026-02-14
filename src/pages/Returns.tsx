import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, CheckCircle, Loader2, RotateCcw, Clock, FileText, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { PremiumPageLayout } from '@/components/premium/PremiumPageLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Seo } from '@/components/Seo';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ReturnResult {
  autoApproved: boolean;
  daysSinceOrder: number;
  message: string;
  returnId: string;
}

export default function Returns() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ReturnResult | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    orderNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    postalCode: '',
    city: '',
    reason: '',
    items: '',
  });

  // Auto-fill for logged-in users
  useEffect(() => {
    if (!user) return;

    const prefill = async () => {
      const [profileRes, addressRes] = await Promise.all([
        supabase.from('profiles').select('first_name, last_name, email').eq('id', user.id).single(),
        supabase.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false }).limit(1).maybeSingle(),
      ]);

      setFormData(prev => ({
        ...prev,
        firstName: profileRes.data?.first_name || prev.firstName,
        lastName: profileRes.data?.last_name || prev.lastName,
        email: profileRes.data?.email || user.email || prev.email,
        street: addressRes.data?.street || prev.street,
        postalCode: addressRes.data?.postal_code || prev.postalCode,
        city: addressRes.data?.city || prev.city,
      }));
    };

    prefill();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      const { data, error } = await supabase.functions.invoke('process-return', {
        body: {
          orderNumber: formData.orderNumber,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          street: formData.street,
          postalCode: formData.postalCode,
          city: formData.city,
          items: formData.items,
          reason: formData.reason,
        },
      });

      if (error) {
        throw new Error(error.message || 'Fehler beim Einreichen der Retoure');
      }

      if (data?.error) {
        setFormError(data.error);
        toast({
          title: 'Fehler',
          description: data.error,
          variant: 'destructive',
        });
        return;
      }

      setResult({
        autoApproved: data.autoApproved,
        daysSinceOrder: data.daysSinceOrder,
        message: data.message,
        returnId: data.returnId,
      });

      toast({
        title: data.autoApproved ? 'Retoure genehmigt ✅' : 'Retoure eingereicht 📋',
        description: data.message,
      });
    } catch (err: any) {
      console.error('Return submission error:', err);
      const msg = 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
      setFormError(msg);
      toast({
        title: 'Fehler',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (result) {
    return (
      <PremiumPageLayout>
        <Seo title="Retoure bestätigt | ALDENAIR" description="Ihre Retouren-Anfrage wurde erfolgreich eingereicht." canonicalPath="/returns" />
        <div className="container-premium py-24 lg:py-32 flex items-center justify-center min-h-[60vh]">
          <div className="max-w-md w-full text-center space-y-8">
            <div className="w-20 h-20 mx-auto flex items-center justify-center border border-border">
              {result.autoApproved ? (
                <CheckCircle className="w-10 h-10 text-green-500" strokeWidth={1.5} />
              ) : (
                <Clock className="w-10 h-10 text-amber-500" strokeWidth={1.5} />
              )}
            </div>
            <div className="space-y-4">
              <h2 className="font-display text-3xl text-foreground">
                {result.autoApproved ? 'Retoure genehmigt' : 'Retoure in Prüfung'}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {result.message}
              </p>
              {result.autoApproved && (
                <div className="p-4 bg-green-500/10 border border-green-500/20">
                  <p className="text-sm text-green-700 dark:text-green-400">
                    📧 Ihr kostenloser Retourenschein wird Ihnen innerhalb von 24 Stunden per E-Mail zugesendet.
                  </p>
                </div>
              )}
              {!result.autoApproved && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20">
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    ⏳ Ihre Anfrage liegt außerhalb der 14-Tage-Frist ({result.daysSinceOrder} Tage). Unser Team prüft Ihre Anfrage und meldet sich innerhalb von 24 Stunden.
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-3 pt-4">
              <Button
                onClick={() => { setResult(null); setFormData({ orderNumber: '', firstName: '', lastName: '', email: '', street: '', postalCode: '', city: '', reason: '', items: '' }); }}
                className="w-full h-12"
              >
                Weitere Retoure anmelden
              </Button>
              <Link to="/">
                <Button variant="outline" className="w-full h-12">
                  Zurück zum Shop
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </PremiumPageLayout>
    );
  }

  return (
    <PremiumPageLayout>
      <Seo
        title="Retoure & Widerruf | ALDENAIR"
        description="Retournieren Sie ungeöffnete Produkte innerhalb von 14 Tagen. Kostenloser Rückversand und schnelle Erstattung."
        canonicalPath="/returns"
      />

      {/* Header */}
      <section className="border-b border-border">
        <div className="container-premium py-8 lg:py-12">
          <Breadcrumb className="mb-6" />
          
          <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-3">
            Kundenservice
          </span>
          <h1 className="font-display text-3xl lg:text-4xl text-foreground mb-4">
            Retoure & Widerruf
          </h1>
          <p className="text-muted-foreground max-w-xl text-sm lg:text-base leading-relaxed">
            Unkompliziert und kundenfreundlich. Erfahren Sie, wie Sie Ihre Bestellung
            zurückgeben können.
          </p>
        </div>
      </section>

      {/* Info Cards */}
      <section className="section-spacing border-b border-border">
        <div className="container-premium">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <div className="p-6 lg:p-8 border border-border bg-card hover:border-accent/50 transition-colors">
              <div className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center bg-accent/10 mb-4">
                <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-accent" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-lg text-foreground mb-2">
                14 Tage Widerrufsrecht
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Innerhalb von 14 Tagen wird Ihre Retoure automatisch genehmigt. Danach erfolgt eine manuelle Prüfung.
              </p>
            </div>

            <div className="p-6 lg:p-8 border border-border bg-card hover:border-accent/50 transition-colors">
              <div className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center bg-accent/10 mb-4">
                <RotateCcw className="w-5 h-5 lg:w-6 lg:h-6 text-accent" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-lg text-foreground mb-2">
                Kostenloser Rückversand
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Nach Genehmigung erhalten Sie innerhalb von 24 Stunden einen kostenlosen Retourenschein per E-Mail.
              </p>
            </div>

            <div className="p-6 lg:p-8 border border-border bg-card hover:border-accent/50 transition-colors">
              <div className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center bg-accent/10 mb-4">
                <FileText className="w-5 h-5 lg:w-6 lg:h-6 text-accent" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-lg text-foreground mb-2">
                Schnelle Erstattung
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Nach Eingang der Ware erstatten wir innerhalb von 5-7 Werktagen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Important Notice */}
      <section className="section-spacing border-b border-border">
        <div className="container-premium">
          <div className="max-w-3xl">
            <span className="inline-block text-[10px] tracking-[0.2em] uppercase text-accent mb-4">
              Hinweise
            </span>
            <h2 className="font-display text-2xl lg:text-3xl text-foreground mb-8">
              Wichtige Hinweise
            </h2>
            <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">Originalverpackung:</strong> Parfüms müssen
                ungeöffnet und in originalverpacktem Zustand sein. Das Widerrufsrecht erlischt
                bei entsiegelten Hygieneprodukten gemäß § 312g Abs. 2 Nr. 3 BGB.
              </p>
              <p>
                <strong className="text-foreground">Widerrufsfrist:</strong> Innerhalb von 14 Tagen
                wird Ihre Retoure automatisch genehmigt. Nach Ablauf der Frist prüfen wir Ihre Anfrage
                individuell.
              </p>
              <p>
                <strong className="text-foreground">Widerrufsfolgen:</strong> Wenn Sie von
                diesem Widerrufsrecht Gebrauch machen, erstatten wir alle von Ihnen erhaltenen
                Zahlungen einschließlich der Lieferkosten unverzüglich.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Return Form */}
      <section className="section-spacing">
        <div className="container-premium">
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-12">
              <div className="w-12 h-12 flex items-center justify-center bg-accent/10">
                <Package className="w-5 h-5 text-accent" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="font-display text-2xl lg:text-3xl text-foreground">
                  Retoure anmelden
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Bestellnummer eingeben — wir prüfen automatisch die 14-Tage-Frist.
                </p>
              </div>
            </div>

            {formError && (
              <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-sm text-destructive">{formError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <Label htmlFor="orderNumber" className="text-[10px] tracking-[0.15em] uppercase">
                  Bestellnummer *
                </Label>
                <Input
                  id="orderNumber"
                  name="orderNumber"
                  placeholder="z.B. ORD-20241221-00001"
                  value={formData.orderNumber}
                  onChange={handleChange}
                  className="h-12 border-border"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Die Bestellnummer finden Sie in Ihrer Bestellbestätigung.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-[10px] tracking-[0.15em] uppercase">
                    Vorname *
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="Max"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="h-12 border-border"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-[10px] tracking-[0.15em] uppercase">
                    Nachname *
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Mustermann"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="h-12 border-border"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] tracking-[0.15em] uppercase">
                  E-Mail *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="max@beispiel.de"
                  value={formData.email}
                  onChange={handleChange}
                  className="h-12 border-border"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="street" className="text-[10px] tracking-[0.15em] uppercase">
                  Straße und Hausnummer *
                </Label>
                <Input
                  id="street"
                  name="street"
                  placeholder="Musterstraße 123"
                  value={formData.street}
                  onChange={handleChange}
                  className="h-12 border-border"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="postalCode" className="text-[10px] tracking-[0.15em] uppercase">
                    PLZ *
                  </Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    placeholder="12345"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="h-12 border-border"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-[10px] tracking-[0.15em] uppercase">
                    Stadt *
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="Berlin"
                    value={formData.city}
                    onChange={handleChange}
                    className="h-12 border-border"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="items" className="text-[10px] tracking-[0.15em] uppercase">
                  Zu retournierende Artikel *
                </Label>
                <Textarea
                  id="items"
                  name="items"
                  placeholder="z.B. 1x ALDENAIR 632 50ml"
                  className="min-h-[100px] border-border resize-none"
                  value={formData.items}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason" className="text-[10px] tracking-[0.15em] uppercase">
                  Grund für die Retoure *
                </Label>
                <Textarea
                  id="reason"
                  name="reason"
                  placeholder="Bitte beschreiben Sie den Grund"
                  className="min-h-[120px] border-border resize-none"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="p-6 bg-secondary/30 border border-border text-sm text-muted-foreground space-y-2">
                <p>
                  <strong className="text-foreground">Automatische Prüfung:</strong> Wir prüfen
                  Ihre Bestellnummer und ob die 14-Tage-Frist eingehalten wurde.
                </p>
                <p>
                  ✅ <strong>Innerhalb 14 Tage:</strong> Sofortige Genehmigung + Retourenschein per E-Mail innerhalb 24h
                </p>
                <p>
                  ⏳ <strong>Nach 14 Tagen:</strong> Manuelle Prüfung — Rückmeldung innerhalb 24h
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-14 text-sm tracking-wider"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Wird geprüft...
                  </>
                ) : (
                  'Retoure einreichen'
                )}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </PremiumPageLayout>
  );
}