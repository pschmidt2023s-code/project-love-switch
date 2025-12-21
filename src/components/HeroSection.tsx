import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Truck, Shield, Clock, Star } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] [background-size:32px_32px]" />
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-10 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-gradient-to-tr from-primary/15 to-transparent rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-6 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/15 to-primary/5 border border-primary/20 animate-fade-in">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Premium Qualität</span>
            </div>

            {/* Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-tight tracking-tight">
                Luxusdüfte, die
                <span className="block bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent mt-2 pb-4" style={{ lineHeight: '1.3' }}>
                  begeistern
                </span>
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Entdecke unsere exklusive Kollektion hochwertiger Parfüms -
                inspiriert von weltbekannten Luxusmarken, zu fairen Preisen.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="text-base px-8 py-6 font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                asChild
              >
                <Link to="/products">
                  Jetzt entdecken
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 py-6"
                asChild
              >
                <Link to="/about">
                  Mehr erfahren
                </Link>
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-6 justify-center lg:justify-start pt-2">
              <TrustBadge icon={Truck} text="Gratis ab 50 EUR" />
              <TrustBadge icon={Shield} text="14 Tage Rückgabe" />
              <TrustBadge icon={Clock} text="1-3 Tage Lieferung" />
            </div>
          </div>

          {/* Right Content - Stats Card */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/25 via-primary/10 to-transparent rounded-3xl blur-2xl animate-pulse" style={{ animationDuration: '3s' }} />

              <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-2xl">
                <div className="grid grid-cols-2 gap-4">
                  <StatCard value="500+" label="Düfte" icon={<Sparkles className="w-5 h-5" />} />
                  <StatCard value="4.8" label="Bewertung" icon={<Star className="w-5 h-5 fill-primary" />} highlight />
                  <StatCard value="10k+" label="Zufriedene Kunden" />
                  <StatCard value="24h" label="Schneller Versand" icon={<Truck className="w-5 h-5" />} />
                </div>

                <div className="mt-6 pt-6 border-t border-border text-center">
                  <p className="text-sm text-muted-foreground">
                    Vertrauen Sie auf jahrelange Erfahrung
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Stats */}
        <div className="lg:hidden mt-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MobileStatCard value="500+" label="Düfte" />
            <MobileStatCard value="4.8" label="Bewertung" highlight />
            <MobileStatCard value="10k+" label="Kunden" />
            <MobileStatCard value="24h" label="Versand" />
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustBadge({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon className="w-5 h-5 text-primary" />
      <span className="text-sm">{text}</span>
    </div>
  );
}

function StatCard({ value, label, highlight = false, icon }: { value: string; label: string; highlight?: boolean; icon?: React.ReactNode }) {
  return (
    <div className={`p-5 rounded-xl text-center transition-all duration-300 hover:scale-[1.02] ${
      highlight
        ? 'bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20'
        : 'bg-muted/30 border border-border/50'
    }`}>
      {icon && <div className="flex justify-center mb-2 text-primary">{icon}</div>}
      <div className={`text-2xl font-bold ${highlight ? 'text-primary' : 'text-foreground'}`}>
        {value}
      </div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function MobileStatCard({ value, label, highlight = false }: { value: string; label: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-4 text-center ${
      highlight
        ? 'bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20'
        : 'bg-card border border-border'
    }`}>
      <div className={`text-xl font-bold ${highlight ? 'text-primary' : 'text-foreground'}`}>{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
