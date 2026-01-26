import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';

export function PremiumHero() {
  const { user } = useAuth();
  const { tierLabel, discount } = useUserRole();

  return (
    <section className="relative min-h-[80vh] lg:min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-ivory dark:bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--accent)/0.08)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--accent)/0.05)_0%,transparent_50%)]" />
      </div>

      <div className="container-premium relative z-10">
        <div className="grid-12">
          {/* Content */}
          <div className="col-span-12 lg:col-span-6 flex flex-col justify-center py-16 lg:py-24">
            {/* Eyebrow */}
            <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
              <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent font-medium">
                Premium Parfüm Kollektion
              </span>
            </div>

            {/* Headline */}
            <h1 
              className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl text-foreground leading-[1.1] mb-6 animate-fade-in-up"
              style={{ animationDelay: '0.2s', opacity: 0 }}
            >
              Luxusdüfte,
              <br />
              die{' '}
              <span className="italic text-accent">begeistern</span>
            </h1>

            {/* Subheadline */}
            <p 
              className="text-lg text-muted-foreground max-w-md mb-10 leading-relaxed animate-fade-in-up"
              style={{ animationDelay: '0.3s', opacity: 0 }}
            >
              Entdecke unsere exklusive Kollektion hochwertiger Parfüms — 
              inspiriert von weltbekannten Luxusmarken, zu fairen Preisen.
            </p>

            {/* CTAs */}
            <div 
              className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-in-up"
              style={{ animationDelay: '0.4s', opacity: 0 }}
            >
              <Link
                to="/products"
                className="group inline-flex items-center justify-center px-8 py-4 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-all duration-300"
              >
                Kollektion entdecken
                <ArrowRight className="ml-3 w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
              </Link>
              
              <Link
                to="/about"
                className="inline-flex items-center justify-center px-8 py-4 border border-foreground text-foreground text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground hover:text-background transition-all duration-300"
              >
                Mehr erfahren
              </Link>
            </div>

            {/* Trust Badges */}
            <div 
              className="flex flex-wrap gap-8 animate-fade-in-up"
              style={{ animationDelay: '0.5s', opacity: 0 }}
            >
              <TrustBadge icon={Truck} text="Kostenlos ab 50€" />
              <TrustBadge icon={Shield} text="14 Tage Rückgabe" />
              <TrustBadge icon={Clock} text="1-3 Tage Lieferung" />
            </div>
          </div>

          {/* Visual */}
          <div className="col-span-12 lg:col-span-6 flex items-center justify-center lg:justify-end py-8 lg:py-0">
            <div 
              className="relative w-full max-w-lg animate-fade-in-up"
              style={{ animationDelay: '0.3s', opacity: 0 }}
            >
              {/* Stats Card */}
              <div className="relative bg-card border border-border p-8 lg:p-10">
                {/* Gold accent line */}
                <div className="absolute top-0 left-0 w-24 h-px bg-accent" />
                <div className="absolute top-0 left-0 w-px h-24 bg-accent" />
                
                <div className="grid grid-cols-2 gap-6">
                  <StatItem value="500+" label="Düfte" />
                  <StatItem value="4.8" label="Bewertung" highlight />
                  <StatItem value="10k+" label="Kunden" />
                  <StatItem value="24h" label="Versand" />
                </div>

                {/* User Tier Card */}
                {user && discount > 0 && (
                  <div className="mt-8 pt-8 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">
                          Dein Status
                        </p>
                        <p className="font-display text-lg text-foreground">
                          {tierLabel}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-display text-accent">
                          {discount}%
                        </p>
                        <p className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground">
                          Rabatt
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom accent */}
                <div className="absolute bottom-0 right-0 w-24 h-px bg-accent" />
                <div className="absolute bottom-0 right-0 w-px h-24 bg-accent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustBadge({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-accent" strokeWidth={1.5} />
      <span className="text-xs text-muted-foreground">{text}</span>
    </div>
  );
}

function StatItem({ value, label, highlight = false }: { value: string; label: string; highlight?: boolean }) {
  return (
    <div className="text-center">
      <p className={`text-3xl lg:text-4xl font-display mb-1 ${highlight ? 'text-accent' : 'text-foreground'}`}>
        {value}
      </p>
      <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
