import { useState } from 'react';
import { Mail, Clock, Send, ArrowRight, MapPin } from 'lucide-react';
import { PremiumPageLayout } from '@/components/premium/PremiumPageLayout';
import { Seo } from '@/components/Seo';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { EnhancedInput, EnhancedTextarea } from '@/components/forms/EnhancedInput';

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name muss mindestens 2 Zeichen haben').max(100),
  email: z.string().trim().email('Ungültige E-Mail-Adresse').max(255),
  subject: z.string().trim().min(3, 'Betreff muss mindestens 3 Zeichen haben').max(200),
  message: z.string().trim().min(10, 'Nachricht muss mindestens 10 Zeichen haben').max(2000),
});

export default function Contact() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('submit-contact-ticket', {
        body: {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          userId: user?.id || null,
        }
      });

      if (error) throw new Error(error.message || 'Fehler beim Senden der Nachricht');
      if (data?.error) throw new Error(data.error);

      toast({
        title: 'Nachricht gesendet',
        description: 'Wir werden uns so schnell wie möglich bei Ihnen melden.',
      });
      
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error?.message || 'Nachricht konnte nicht gesendet werden.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PremiumPageLayout>
      <Seo
        title="Kontakt | ALDENAIR"
        description="Kontaktieren Sie ALDENAIR für Fragen zu Produkten, Bestellungen oder allgemeine Anfragen."
        canonicalPath="/contact"
      />

      {/* Hero - Full width editorial */}
      <section className="py-20 lg:py-32 border-b border-border">
        <div className="container-premium">
          <div className="max-w-3xl">
            <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-6">
              Kontakt
            </span>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-foreground leading-[0.95] mb-8">
              Wir sind
              <br />
              für Sie da.
            </h1>
            <p className="text-muted-foreground max-w-lg text-sm leading-relaxed">
              Haben Sie Fragen zu unseren Düften, Ihrer Bestellung oder möchten eine persönliche Beratung? 
              Wir freuen uns auf Ihre Nachricht.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Tiles */}
      <section className="py-12 lg:py-16 border-b border-border">
        <div className="container-premium">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 lg:p-8 border border-border">
              <Mail className="w-5 h-5 text-accent mb-4" strokeWidth={1.5} />
              <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1">E-Mail</p>
              <p className="text-sm text-foreground">support@aldenairperfumes.de</p>
            </div>
            <div className="p-6 lg:p-8 border border-border">
              <Clock className="w-5 h-5 text-accent mb-4" strokeWidth={1.5} />
              <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1">Erreichbarkeit</p>
              <p className="text-sm text-foreground">Mo–Fr, 9:00–18:00 Uhr</p>
            </div>
            <div className="p-6 lg:p-8 border border-border">
              <Send className="w-5 h-5 text-accent mb-4" strokeWidth={1.5} />
              <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1">Antwortzeit</p>
              <p className="text-sm text-foreground">Innerhalb von 24 Stunden</p>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section - Full width, clean */}
      <section className="py-16 lg:py-24">
        <div className="container-premium">
          <div className="max-w-2xl mx-auto">
            <div className="mb-10">
              <span className="inline-block text-[10px] tracking-[0.2em] uppercase text-accent mb-3">Nachricht senden</span>
              <h2 className="font-display text-2xl lg:text-3xl text-foreground">
                Schreiben Sie uns
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <EnhancedInput
                  label="Name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ihr Name"
                  error={errors.name}
                  required
                  autoComplete="name"
                  autoCapitalize="words"
                />
                <EnhancedInput
                  label="E-Mail"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ihre@email.de"
                  error={errors.email}
                  required
                  autoComplete="email"
                  inputMode="email"
                />
              </div>
              
              <EnhancedInput
                label="Betreff"
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Worum geht es?"
                error={errors.subject}
                required
              />
              
              <EnhancedTextarea
                label="Nachricht"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Ihre Nachricht..."
                rows={6}
                error={errors.message}
                required
              />
              
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-accent flex-shrink-0"
                  required
                />
                <span className="text-xs text-muted-foreground leading-relaxed">
                  Ich habe die <a href="/privacy" className="text-accent underline" target="_blank" rel="noopener noreferrer">Datenschutzerklärung</a> gelesen und bin mit der Verarbeitung meiner Daten zur Bearbeitung meiner Anfrage einverstanden. *
                </span>
              </label>

              <button 
                type="submit" 
                disabled={loading || !privacyAccepted}
                className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-4 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Wird gesendet...' : 'Absenden'}
                <ArrowRight className="ml-2 w-4 h-4" strokeWidth={1.5} />
              </button>
            </form>
          </div>
        </div>
      </section>
    </PremiumPageLayout>
  );
}
