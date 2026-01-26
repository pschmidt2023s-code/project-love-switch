import { useState } from 'react';
import { Mail, Clock, ArrowRight } from 'lucide-react';
import { PremiumPageLayout } from '@/components/premium/PremiumPageLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
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

const contactInfo = [
  { icon: Mail, label: 'E-Mail', value: 'support@aldenairperfumes.de' },
  { icon: Clock, label: 'Erreichbarkeit', value: 'Mo-Fr 9-18 Uhr' },
];

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
      // Create ticket in database
      const { data, error } = await supabase.from('tickets').insert({
        user_id: user?.id || null,
        customer_name: formData.name,
        customer_email: formData.email,
        subject: formData.subject,
        message: formData.message,
        category: 'contact',
        priority: 'medium',
        status: 'open',
      }).select().single();

      if (error) throw error;

      // Send email notification
      try {
        await supabase.functions.invoke('send-ticket-notification', {
          body: {
            type: 'new_ticket',
            ticketId: data.id,
            customerEmail: formData.email,
            customerName: formData.name,
            subject: formData.subject,
          }
        });
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
      }

      toast({
        title: 'Nachricht gesendet',
        description: 'Wir werden uns so schnell wie möglich bei Ihnen melden.',
      });
      
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast({
        title: 'Fehler',
        description: 'Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut.',
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

      {/* Header */}
      <section className="border-b border-border">
        <div className="container-premium py-8 lg:py-12">
          <Breadcrumb className="mb-6" />
          
          <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-3">
            Kontakt
          </span>
          <h1 className="font-display text-3xl lg:text-4xl text-foreground mb-4">
            Schreiben Sie uns
          </h1>
          <p className="text-muted-foreground max-w-xl text-sm lg:text-base">
            Haben Sie Fragen zu unseren Produkten oder Ihrer Bestellung? 
            Wir sind gerne für Sie da.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="section-spacing">
        <div className="container-premium">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-8">
              <div>
                <h2 className="text-[10px] tracking-[0.2em] uppercase text-accent mb-4">
                  Kontaktdaten
                </h2>
                <div className="space-y-4">
                  {contactInfo.map((item) => (
                    <div key={item.label} className="flex items-start gap-4">
                      <div className="w-10 h-10 flex items-center justify-center bg-accent/10 flex-shrink-0">
                        <item.icon className="w-4 h-4 text-accent" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground mb-1">
                          {item.label}
                        </p>
                        <p className="text-sm text-foreground font-medium">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-secondary/30 border border-border">
                <h3 className="font-display text-lg text-foreground mb-2">
                  Schnelle Antwort
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Wir antworten in der Regel innerhalb von 24 Stunden auf alle Anfragen.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
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
                
                <button 
                  type="submit" 
                  disabled={loading}
                  className="inline-flex items-center px-8 py-4 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Senden...' : 'Nachricht senden'}
                  <ArrowRight className="ml-2 w-4 h-4" strokeWidth={1.5} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </PremiumPageLayout>
  );
}
