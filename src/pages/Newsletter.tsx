import { useState } from 'react';
import { Mail, Gift, Bell, CheckCircle, ArrowRight } from 'lucide-react';
import { PremiumPageLayout } from '@/components/premium/PremiumPageLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Seo } from '@/components/Seo';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function Newsletter() {
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
    <PremiumPageLayout>
      <Seo
        title="Newsletter | ALDENAIR"
        description="Melden Sie sich für den ALDENAIR Newsletter an und erhalten Sie exklusive Angebote und Parfüm-Tipps."
        canonicalPath="/newsletter"
      />

      {/* Header */}
      <section className="border-b border-border">
        <div className="container-premium py-8 lg:py-12">
          <Breadcrumb className="mb-6" />
          
          <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-3">
            Exklusiv
          </span>
          <h1 className="font-display text-3xl lg:text-4xl text-foreground mb-4">
            Newsletter
          </h1>
          <p className="text-muted-foreground max-w-xl text-sm lg:text-base leading-relaxed">
            Bleiben Sie über neue Düfte, exklusive Angebote und Parfüm-Tipps auf dem Laufenden.
            Erhalten Sie als Dankeschön 10% Rabatt auf Ihre erste Bestellung.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="section-spacing">
        <div className="container-premium">
          <div className="max-w-lg mx-auto">
            {success ? (
              <div className="text-center space-y-6 py-8">
                <div className="w-20 h-20 mx-auto flex items-center justify-center bg-green-500/10">
                  <CheckCircle className="w-10 h-10 text-green-500" strokeWidth={1.5} />
                </div>
                <h2 className="font-display text-2xl text-foreground">Vielen Dank!</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Sie wurden erfolgreich für unseren Newsletter angemeldet.
                  Prüfen Sie Ihr Postfach für Ihren 10% Rabattcode.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
                    E-Mail-Adresse
                  </label>
                  <input
                    type="email"
                    placeholder="ihre@email.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex h-12 w-full bg-transparent text-foreground border border-border px-4 py-3 text-base placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors md:text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 inline-flex items-center justify-center gap-2 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Wird angemeldet...' : 'Jetzt anmelden'}
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section-spacing bg-secondary/30">
        <div className="container-premium">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <div className="p-6 lg:p-8 bg-background border border-border">
              <div className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center bg-accent/10 mb-4">
                <Gift className="w-5 h-5 lg:w-6 lg:h-6 text-accent" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-lg text-foreground mb-2">
                Exklusive Angebote
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Erhalten Sie Zugang zu exklusiven Rabatten und Angeboten nur für Abonnenten.
              </p>
            </div>
            <div className="p-6 lg:p-8 bg-background border border-border">
              <div className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center bg-accent/10 mb-4">
                <Bell className="w-5 h-5 lg:w-6 lg:h-6 text-accent" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-lg text-foreground mb-2">
                Neuheiten zuerst
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Seien Sie der Erste, der von neuen Düften und Kollektionen erfährt.
              </p>
            </div>
            <div className="p-6 lg:p-8 bg-background border border-border">
              <div className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center bg-accent/10 mb-4">
                <Mail className="w-5 h-5 lg:w-6 lg:h-6 text-accent" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-lg text-foreground mb-2">
                Parfüm-Tipps
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Erhalten Sie Expertentipps zur Auswahl und Anwendung von Parfüms.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PremiumPageLayout>
  );
}