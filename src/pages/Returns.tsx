import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, CheckCircle, Loader2, RotateCcw, Clock, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { PremiumPageLayout } from '@/components/premium/PremiumPageLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Seo } from '@/components/Seo';

export default function Returns() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const emailBody = `
Retouren-Anfrage

Bestellnummer: ${formData.orderNumber}
Name: ${formData.firstName} ${formData.lastName}
E-Mail: ${formData.email}

Adresse:
${formData.street}
${formData.postalCode} ${formData.city}

Zu retournierende Artikel:
${formData.items}

Grund für die Retoure:
${formData.reason}
    `;

    const mailtoLink = `mailto:support@aldenairperfumes.de?subject=Retouren-Anfrage - Bestellung ${formData.orderNumber}&body=${encodeURIComponent(emailBody)}`;

    setTimeout(() => {
      window.location.href = mailtoLink;
      setIsSubmitted(true);
      setIsSubmitting(false);

      toast({
        title: 'Retouren-Anfrage eingereicht',
        description: 'Ihre E-Mail wird geöffnet. Wir bearbeiten Ihre Anfrage innerhalb von 24 Stunden.',
      });
    }, 1000);
  };

  if (isSubmitted) {
    return (
      <PremiumPageLayout>
        <Seo title="Retoure bestätigt | ALDENAIR" description="Ihre Retouren-Anfrage wurde erfolgreich eingereicht." canonicalPath="/returns" />
        <div className="container mx-auto px-4 lg:px-8 py-24 lg:py-32 flex items-center justify-center min-h-[60vh]">
          <div className="max-w-md w-full text-center space-y-8">
            <div className="w-20 h-20 mx-auto flex items-center justify-center border border-border">
              <CheckCircle className="w-10 h-10 text-accent" strokeWidth={1.5} />
            </div>
            <div className="space-y-4">
              <h2 className="font-display text-3xl text-foreground">Anfrage gesendet</h2>
              <p className="text-muted-foreground leading-relaxed">
                Ihre Retouren-Anfrage wurde erfolgreich eingereicht. 
                Wir melden uns innerhalb von 24 Stunden bei Ihnen.
              </p>
            </div>
            <div className="space-y-3 pt-4">
              <Button 
                onClick={() => setIsSubmitted(false)} 
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

      <div className="container mx-auto px-4 lg:px-8">
        <Breadcrumb />
        
        {/* Hero Section */}
        <header className="py-16 lg:py-24 border-b border-border">
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4">
            Kundenservice
          </p>
          <h1 className="font-display text-4xl lg:text-5xl text-foreground mb-6">
            Retoure & Widerruf
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Unkompliziert und kundenfreundlich. Erfahren Sie, wie Sie Ihre Bestellung 
            zurückgeben können.
          </p>
        </header>

        {/* Info Cards */}
        <section className="py-16 lg:py-24 border-b border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-12 h-12 flex items-center justify-center border border-border">
                <Clock className="w-5 h-5 text-foreground" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-xl text-foreground">
                14 Tage Widerrufsrecht
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Sie haben 14 Tage ab Erhalt der Ware Zeit, um eine Retoure anzumelden.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 flex items-center justify-center border border-border">
                <RotateCcw className="w-5 h-5 text-foreground" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-xl text-foreground">
                Kostenloser Rückversand
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Wir senden Ihnen ein kostenloses Retourenlabel per E-Mail.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 flex items-center justify-center border border-border">
                <FileText className="w-5 h-5 text-foreground" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-xl text-foreground">
                Schnelle Erstattung
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Nach Eingang der Ware erstatten wir innerhalb von 5-7 Werktagen.
              </p>
            </div>
          </div>
        </section>

        {/* Important Notice */}
        <section className="py-16 lg:py-24 border-b border-border">
          <div className="max-w-3xl">
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
                <strong className="text-foreground">Widerrufsfrist:</strong> Die Frist beginnt 
                mit dem Tag, an dem Sie oder ein von Ihnen benannter Dritter die Ware in 
                Besitz genommen haben.
              </p>
              <p>
                <strong className="text-foreground">Widerrufsfolgen:</strong> Wenn Sie von 
                diesem Widerrufsrecht Gebrauch machen, erstatten wir alle von Ihnen erhaltenen 
                Zahlungen einschließlich der Lieferkosten unverzüglich.
              </p>
            </div>
          </div>
        </section>

        {/* Return Form */}
        <section className="py-16 lg:py-24">
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-12">
              <div className="w-12 h-12 flex items-center justify-center border border-border">
                <Package className="w-5 h-5 text-foreground" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="font-display text-2xl lg:text-3xl text-foreground">
                  Retoure anmelden
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Wir bearbeiten Ihre Anfrage innerhalb von 24 Stunden.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <Label htmlFor="orderNumber" className="text-xs tracking-wider uppercase">
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
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-xs tracking-wider uppercase">
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
                  <Label htmlFor="lastName" className="text-xs tracking-wider uppercase">
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
                <Label htmlFor="email" className="text-xs tracking-wider uppercase">
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
                <Label htmlFor="street" className="text-xs tracking-wider uppercase">
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
                  <Label htmlFor="postalCode" className="text-xs tracking-wider uppercase">
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
                  <Label htmlFor="city" className="text-xs tracking-wider uppercase">
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
                <Label htmlFor="items" className="text-xs tracking-wider uppercase">
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
                <Label htmlFor="reason" className="text-xs tracking-wider uppercase">
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

              <div className="p-6 bg-muted/30 border border-border text-sm text-muted-foreground">
                <strong className="text-foreground">Hinweis:</strong> Nach Absenden wird Ihr 
                E-Mail-Programm geöffnet. Bitte senden Sie die E-Mail ab, um Ihre 
                Retouren-Anfrage einzureichen.
              </div>

              <Button
                type="submit"
                className="w-full h-14 text-sm tracking-wider"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Wird gesendet...
                  </>
                ) : (
                  'Retoure einreichen'
                )}
              </Button>
            </form>
          </div>
        </section>
      </div>
    </PremiumPageLayout>
  );
}
