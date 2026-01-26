import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Clock } from 'lucide-react';

export function PremiumHero() {
  return (
    <section className="relative py-16 lg:py-24 bg-background">
      {/* Subtle accent gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--accent)/0.05)_0%,transparent_50%)]" />
      
      <div className="container-premium relative z-10">
        <div className="grid grid-cols-12 gap-8 items-center">
          {/* Content */}
          <div className="col-span-12 lg:col-span-7">
            <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent font-medium mb-6">
              Premium Parfüm Kollektion
            </span>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-foreground leading-[1.1] mb-6">
              Luxusdüfte,
              <br />
              die <span className="italic text-accent">begeistern</span>
            </h1>

            <p className="text-base lg:text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed">
              Entdecke unsere exklusive Kollektion hochwertiger Parfüms — 
              inspiriert von weltbekannten Luxusmarken, zu fairen Preisen.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
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
            <div className="flex flex-wrap gap-6 lg:gap-8">
              <TrustBadge icon={Truck} text="Kostenlos ab 50€" />
              <TrustBadge icon={Shield} text="14 Tage Rückgabe" />
              <TrustBadge icon={Clock} text="1-3 Tage Lieferung" />
            </div>
          </div>

          {/* Stats Card */}
          <div className="col-span-12 lg:col-span-5">
            <div className="relative bg-card border border-border p-8">
              {/* Gold accent lines */}
              <div className="absolute top-0 left-0 w-16 h-px bg-accent" />
              <div className="absolute top-0 left-0 w-px h-16 bg-accent" />
              
              <div className="grid grid-cols-2 gap-6">
                <StatItem value="500+" label="Düfte" />
                <StatItem value="4.8" label="Bewertung" highlight />
                <StatItem value="10k+" label="Kunden" />
                <StatItem value="24h" label="Versand" />
              </div>

              {/* Bottom accent */}
              <div className="absolute bottom-0 right-0 w-16 h-px bg-accent" />
              <div className="absolute bottom-0 right-0 w-px h-16 bg-accent" />
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
      <p className={`text-2xl lg:text-3xl font-display mb-1 ${highlight ? 'text-accent' : 'text-foreground'}`}>
        {value}
      </p>
      <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
