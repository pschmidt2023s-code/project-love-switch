import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function PremiumNewsletter() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Bitte gib deine E-Mail-Adresse ein');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email });

      if (error) {
        if (error.code === '23505') {
          toast.error('Diese E-Mail ist bereits registriert');
        } else {
          throw error;
        }
      } else {
        toast.success('Erfolgreich angemeldet!');
        setEmail('');
      }
    } catch (error) {
      toast.error('Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-black text-white py-10 lg:py-16">
      <div className="container-premium">
        <div className="max-w-2xl mx-auto text-center">
          {/* Eyebrow */}
          <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-3">
            Newsletter
          </span>
          
          {/* Headline */}
          <h2 className="font-display text-2xl lg:text-3xl text-white mb-3">
            Bleibe auf dem Laufenden
          </h2>
          
          {/* Description */}
          <p className="text-sm text-white/70 mb-6 max-w-md mx-auto">
            Melde dich für unseren Newsletter an und erhalte exklusive Angebote 
            und Neuigkeiten direkt in dein Postfach.
          </p>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Deine E-Mail-Adresse"
              className="flex-1 px-5 py-4 bg-white/10 border border-white/20 text-white placeholder:text-white/50 text-sm focus:outline-none focus:border-white/50 transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !privacyAccepted}
              className="inline-flex items-center justify-center px-8 py-4 bg-accent text-accent-foreground text-[11px] tracking-[0.1em] uppercase font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {loading ? 'Wird gesendet...' : 'Anmelden'}
              {!loading && <ArrowRight className="ml-2 w-4 h-4" strokeWidth={1.5} />}
            </button>
          </form>
          
          {/* Privacy Consent */}
          <label className="flex items-start gap-3 cursor-pointer mt-4 max-w-lg mx-auto">
            <input
              type="checkbox"
              checked={privacyAccepted}
              onChange={(e) => setPrivacyAccepted(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-accent flex-shrink-0"
            />
            <span className="text-[11px] text-white/50 leading-relaxed text-left">
              Ich bin mit dem Erhalt des Newsletters einverstanden und habe die{' '}
              <Link to="/privacy" className="underline hover:text-white/70">
                Datenschutzerklärung
              </Link>{' '}gelesen. *
            </span>
          </label>
        </div>
      </div>
    </section>
  );
}