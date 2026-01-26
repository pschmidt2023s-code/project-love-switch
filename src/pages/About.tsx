import { Sparkles, Users, Heart, Award } from 'lucide-react';
import { PremiumPageLayout } from '@/components/premium/PremiumPageLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Seo } from '@/components/Seo';

const features = [
  {
    icon: Sparkles,
    title: 'Qualität',
    description: 'Nur die besten Inhaltsstoffe für langanhaltende, hochwertige Düfte.',
  },
  {
    icon: Users,
    title: 'Kundennähe',
    description: 'Persönlicher Service und Beratung für den perfekten Duft.',
  },
  {
    icon: Heart,
    title: 'Leidenschaft',
    description: 'Jeder Duft wird mit Liebe zum Detail kreiert.',
  },
  {
    icon: Award,
    title: 'Erfahrung',
    description: 'Jahrelange Expertise in der Welt der Premium-Düfte.',
  },
];

const stats = [
  { value: '2020', label: 'Gegründet' },
  { value: '500+', label: 'Düfte' },
  { value: '10.000+', label: 'Kunden' },
  { value: '4.8', label: 'Bewertung' },
];

export default function About() {
  return (
    <PremiumPageLayout>
      <Seo
        title="Über Uns | ALDENAIR"
        description="Erfahren Sie mehr über ALDENAIR - Ihre Premium-Destination für exquisite Parfüms. Qualität, Leidenschaft und Erfahrung seit 2020."
        canonicalPath="/about"
      />

      {/* Hero Section */}
      <section className="border-b border-border">
        <div className="container-premium py-8 lg:py-12">
          <Breadcrumb className="mb-6" />
          
          <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-3">
            Über Uns
          </span>
          <h1 className="font-display text-3xl lg:text-4xl text-foreground mb-4">
            Die ALDENAIR Geschichte
          </h1>
          <p className="text-muted-foreground max-w-xl text-sm lg:text-base leading-relaxed">
            Wir sind Ihr Partner für exklusive Düfte - mit Leidenschaft für Qualität 
            und dem Ziel, Luxusparfüms für jeden zugänglich zu machen.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="section-spacing">
        <div className="container-premium">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {features.map((feature) => (
              <div 
                key={feature.title} 
                className="p-6 lg:p-8 border border-border bg-card hover:border-accent/50 transition-colors"
              >
                <div className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center bg-accent/10 mb-4">
                  <feature.icon className="w-5 h-5 lg:w-6 lg:h-6 text-accent" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-lg text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="section-spacing bg-secondary/30">
        <div className="container-premium">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Text */}
            <div className="space-y-6">
              <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent">
                Unsere Geschichte
              </span>
              <h2 className="font-display text-2xl lg:text-3xl text-foreground">
                Luxusdüfte für Jeden
              </h2>
              <div className="space-y-4 text-muted-foreground text-sm lg:text-base leading-relaxed">
                <p>
                  ALDENAIR wurde aus der Überzeugung geboren, dass jeder Mensch
                  Zugang zu hochwertigen Düften haben sollte - ohne dafür ein Vermögen
                  ausgeben zu müssen.
                </p>
                <p>
                  Wir haben es uns zur Aufgabe gemacht, Düfte zu kreieren, die von den
                  bekanntesten Luxusmarken der Welt inspiriert sind. Dabei setzen wir auf
                  <span className="text-foreground font-medium"> hochwertige Inhaltsstoffe</span> und{' '}
                  <span className="text-foreground font-medium">faire Preise</span>.
                </p>
                <p>
                  Mit über 500 verschiedenen Düften und mehr als 10.000 zufriedenen
                  Kunden sind wir stolz darauf, Ihr Vertrauen verdient zu haben.
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="p-6 lg:p-8 bg-background border border-border text-center"
                >
                  <div className="font-display text-3xl lg:text-4xl text-foreground mb-2">
                    {stat.value}
                  </div>
                  <div className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-spacing">
        <div className="container-premium">
          <div className="max-w-2xl mx-auto text-center">
            <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-3">
              Unsere Werte
            </span>
            <h2 className="font-display text-2xl lg:text-3xl text-foreground mb-6">
              Was uns antreibt
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Bei ALDENAIR verbinden wir traditionelle Parfümkunst mit modernem Design. 
              Jeder Duft erzählt eine Geschichte - und wir möchten, dass Sie Ihre eigene 
              Geschichte mit unseren Kreationen schreiben.
            </p>
          </div>
        </div>
      </section>
    </PremiumPageLayout>
  );
}
