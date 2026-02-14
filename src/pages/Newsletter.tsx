import { useState } from 'react';
import { Mail, Gift, Bell, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { PremiumPageLayout } from '@/components/premium/PremiumPageLayout';
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

      {/* Full-height hero with inverted theme */}
      <section className="bg-foreground text-background py-20 lg:py-32">
        <div className="container-premium">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Content */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <Sparkles className="w-5 h-5 text-accent" strokeWidth={1.5} />
                <span className="text-[10px] tracking-[0.3em] uppercase text-background/60">
                  10% Willkommensrabatt
                </span>
              </div>
              
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[0.95] mb-6">
                Exklusive
                <br />
                Düfte.
                <br />
                <span className="text-background/40">Direkt in</span>
                <br />
                <span className="text-background/40">Ihr Postfach.</span>
              </h1>
              
              <p className="text-background/60 text-sm lg:text-base leading-relaxed max-w-md">
                Erfahren Sie als Erster von neuen Düften, 
                erhalten Sie exklusive Angebote und Parfüm-Expertise.
              </p>
            </div>

            {/* Right: Form */}
            <div>
              {success ? (
                <div className="text-center space-y-6 py-12 px-8 border border-background/10">
                  <CheckCircle className="w-12 h-12 text-accent mx-auto" strokeWidth={1.5} />
                  <h2 className="font-display text-2xl">Vielen Dank!</h2>
                  <p className="text-background/60 text-sm leading-relaxed">
                    Sie wurden erfolgreich angemeldet.
                    Prüfen Sie Ihr Postfach für Ihren 10% Rabattcode.
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] tracking-[0.15em] uppercase text-background/50">
                        E-Mail-Adresse
                      </label>
                      <input
                        type="email"
                        placeholder="ihre@email.de"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="flex h-14 w-full bg-transparent border border-background/20 px-4 py-3 text-base text-background placeholder:text-background/30 focus:outline-none focus:border-background/60 transition-colors"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-14 inline-flex items-center justify-center gap-2 bg-background text-foreground text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-background/90 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Wird angemeldet...' : 'Jetzt anmelden'}
                      <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </form>
                  <p className="text-[10px] text-background/30 leading-relaxed">
                    Kein Spam. Maximal 2 E-Mails pro Monat. Jederzeit abbestellbar.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits - light background, contrasting */}
      <section className="py-16 lg:py-24">
        <div className="container-premium">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-border">
            {[
              { icon: Gift, title: 'Exklusive Angebote', text: 'Zugang zu Rabatten und Angeboten nur für Abonnenten.' },
              { icon: Bell, title: 'Neuheiten zuerst', text: 'Seien Sie der Erste bei neuen Düften und Kollektionen.' },
              { icon: Mail, title: 'Parfüm-Expertise', text: 'Expertentipps zur Auswahl und Anwendung von Parfüms.' },
            ].map((item, i) => (
              <div
                key={item.title}
                className={`p-8 lg:p-10 ${i > 0 ? 'border-t md:border-t-0 md:border-l border-border' : ''}`}
              >
                <item.icon className="w-6 h-6 text-accent mb-5" strokeWidth={1.5} />
                <h3 className="font-display text-lg text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PremiumPageLayout>
  );
}
