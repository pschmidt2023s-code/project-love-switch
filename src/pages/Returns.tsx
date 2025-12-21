import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';

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

    // Create email body for return request
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

    // Simulate processing time
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
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto py-16 px-4 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Anfrage gesendet</h2>
              <p className="text-muted-foreground mb-6">
                Ihre Retouren-Anfrage wurde erfolgreich eingereicht. Wir melden uns innerhalb von 24 Stunden bei Ihnen.
              </p>
              <div className="space-y-2">
                <Button onClick={() => setIsSubmitted(false)} className="w-full">
                  Weitere Retoure anmelden
                </Button>
                <Link to="/">
                  <Button variant="outline" className="w-full">
                    Zurück zum Shop
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-8">
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Zurück zur Startseite
              </Button>
            </Link>
          </div>

          <div className="text-center mb-8">
            <Package className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Retoure anmelden
            </h1>
            <p className="text-muted-foreground text-lg">
              Füllen Sie das Formular aus, um eine Retoure für Ihre Bestellung anzumelden.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Retouren-Formular</CardTitle>
              <CardDescription>
                Geben Sie Ihre Bestelldaten ein. Wir bearbeiten Ihre Anfrage innerhalb von 24 Stunden.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="orderNumber">Bestellnummer *</Label>
                  <Input
                    id="orderNumber"
                    name="orderNumber"
                    placeholder="z.B. ORD-20241221-00001"
                    value={formData.orderNumber}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Vorname *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="Max"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nachname *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Mustermann"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="max@beispiel.de"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="street">Straße und Hausnummer *</Label>
                  <Input
                    id="street"
                    name="street"
                    placeholder="Musterstraße 123"
                    value={formData.street}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">PLZ *</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      placeholder="12345"
                      value={formData.postalCode}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Stadt *</Label>
                    <Input
                      id="city"
                      name="city"
                      placeholder="Berlin"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="items">Zu retournierende Artikel *</Label>
                  <Textarea
                    id="items"
                    name="items"
                    placeholder="Bitte listen Sie die Artikel auf, die Sie zurückgeben möchten (z.B. 1x ALDENAIR 632 50ml)"
                    className="min-h-[80px]"
                    value={formData.items}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Grund für die Retoure *</Label>
                  <Textarea
                    id="reason"
                    name="reason"
                    placeholder="Bitte beschreiben Sie den Grund für die Retoure (z.B. Größe passt nicht, Qualitätsmangel, falscher Artikel, etc.)"
                    className="min-h-[100px]"
                    value={formData.reason}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground">
                  <p><strong>Hinweis:</strong> Nach Absenden des Formulars wird Ihr E-Mail-Programm geöffnet. Bitte senden Sie die E-Mail ab, um Ihre Retouren-Anfrage einzureichen.</p>
                </div>

                <Button
                  type="submit"
                  className="w-full"
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
            </CardContent>
          </Card>

          {/* Info Cards */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rückgabefrist</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Sie haben 14 Tage ab Erhalt der Ware Zeit, um eine Retoure anzumelden. Parfüms müssen ungeöffnet und in originalverpacktem Zustand sein.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ablauf</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Nach Prüfung Ihrer Anfrage erhalten Sie ein kostenloses Retourenlabel per E-Mail. Nach Eingang der Ware erstatten wir den Kaufpreis innerhalb von 5-7 Werktagen.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
