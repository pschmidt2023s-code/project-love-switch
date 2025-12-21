import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Mail, Gift, Bell, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function Newsletter() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie eine E-Mail-Adresse ein.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Bereits angemeldet",
            description: "Diese E-Mail-Adresse ist bereits für den Newsletter registriert.",
          });
        } else {
          throw error;
        }
      } else {
        setSuccess(true);
        toast({
          title: "Erfolgreich angemeldet!",
          description: "Vielen Dank für Ihre Anmeldung zum Newsletter.",
        });
      }
    } catch (error) {
      console.error('Newsletter error:', error);
      toast({
        title: "Fehler",
        description: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="mb-8"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>

            <div className="mb-12 text-center">
              <h1 className="text-4xl font-bold mb-4 text-foreground">Newsletter</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Bleiben Sie über neue Düfte, exklusive Angebote und Parfüm-Tipps auf dem Laufenden.
                Melden Sie sich für unseren Newsletter an und erhalten Sie als Dankeschön 10% Rabatt auf Ihre erste Bestellung.
              </p>
            </div>

            {success ? (
              <Card className="max-w-md mx-auto">
                <CardContent className="p-8 text-center">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                  <h2 className="text-2xl font-bold mb-2">Vielen Dank!</h2>
                  <p className="text-muted-foreground">
                    Sie wurden erfolgreich für unseren Newsletter angemeldet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="max-w-md mx-auto">
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">E-Mail-Adresse</label>
                      <Input
                        type="email"
                        placeholder="ihre@email.de"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Wird angemeldet...' : 'Jetzt anmelden'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Gift className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold">Exklusive Angebote</h3>
                <p className="text-sm text-muted-foreground">
                  Erhalten Sie Zugang zu exklusiven Rabatten und Angeboten nur für Abonnenten.
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Bell className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold">Neuheiten zuerst</h3>
                <p className="text-sm text-muted-foreground">
                  Seien Sie der Erste, der von neuen Düften und Kollektionen erfährt.
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold">Parfüm-Tipps</h3>
                <p className="text-sm text-muted-foreground">
                  Erhalten Sie Expertentipps zur Auswahl und Anwendung von Parfüms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <MobileBottomNav />
    </>
  );
}
