import { Sparkles, Users, Heart, Award, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PremiumPageLayout } from '@/components/premium/PremiumPageLayout';
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

const timeline = [
  { year: '2020', title: 'Die Gründung', text: 'ALDENAIR wurde mit einer Vision geboren: Luxusdüfte für jeden zugänglich zu machen.' },
  { year: '2021', title: 'Erster Meilenstein', text: 'Über 1.000 zufriedene Kunden und stetig wachsendes Sortiment.' },
  { year: '2023', title: 'Premium-Expansion', text: 'Einführung des Sparkits-Systems und personalisierter Duftberatung.' },
  { year: '2025', title: 'Die Zukunft', text: 'KI-gestützte Duftempfehlungen und internationaler Versand.' },
];

export default function About() {
  return (
    <PremiumPageLayout>
      <Seo
        title="Über ALDENAIR | Premium Parfüm Manufaktur seit 2020"
        description="Lernen Sie ALDENAIR kennen – Ihre Premium-Destination für exquisite Parfüms. Seit 2020 kreieren wir hochwertige Düfte mit Leidenschaft und Qualität."
        canonicalPath="/about"
        ogImage="/images/aldenair-prestige.png"
      />

      {/* Dramatic Hero - full width, large typography */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent" />
        <div className="container-premium relative">
          <div className="max-w-3xl">
            <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-6">
              Seit 2020
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl text-foreground leading-[0.95] mb-8">
              Die Kunst
              <br />
              des Duftes
            </h1>
            <p className="text-muted-foreground text-base lg:text-lg leading-relaxed max-w-xl">
              Wir sind Ihr Partner für exklusive Düfte — mit Leidenschaft für Qualität 
              und dem Ziel, Luxusparfüms für jeden zugänglich zu machen.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border">
        <div className="container-premium">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`py-8 lg:py-12 text-center ${i > 0 ? 'border-l border-border' : ''}`}
              >
                <div className="font-display text-3xl lg:text-4xl text-foreground mb-1">{stat.value}</div>
                <div className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Grid - asymmetric */}
      <section className="py-16 lg:py-24">
        <div className="container-premium">
          <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className={`p-8 lg:p-10 border border-border hover:border-accent/50 transition-colors ${
                  i === 0 ? 'lg:col-span-7' : i === 1 ? 'lg:col-span-5' : i === 2 ? 'lg:col-span-5' : 'lg:col-span-7'
                }`}
              >
                <feature.icon className="w-6 h-6 text-accent mb-6" strokeWidth={1.5} />
                <h3 className="font-display text-xl lg:text-2xl text-foreground mb-3">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline - editorial */}
      <section className="py-16 lg:py-24 border-t border-border">
        <div className="container-premium">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-4">
              <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-4">
                Unsere Reise
              </span>
              <h2 className="font-display text-3xl lg:text-4xl text-foreground mb-4">
                Von der Vision
                <br />
                zur Realität
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Jedes Jahr bringt neue Meilensteine — und wir haben noch viel vor.
              </p>
            </div>
            <div className="lg:col-span-8">
              <div className="space-y-0">
                {timeline.map((item, i) => (
                  <div key={item.year} className={`flex gap-6 lg:gap-10 py-6 ${i > 0 ? 'border-t border-border' : ''}`}>
                    <span className="font-display text-2xl lg:text-3xl text-accent/40 w-20 flex-shrink-0">
                      {item.year}
                    </span>
                    <div>
                      <h3 className="font-display text-lg text-foreground mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - dramatic, full-width */}
      <section className="py-20 lg:py-28">
        <div className="container-premium text-center">
          <h2 className="font-display text-3xl lg:text-5xl text-foreground mb-6">
            Bereit für Ihren Duft?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Entdecken Sie unsere Kollektion und finden Sie Ihren perfekten Begleiter.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center px-8 py-4 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors"
          >
            Kollektion entdecken
            <ArrowRight className="ml-3 w-4 h-4" strokeWidth={1.5} />
          </Link>
        </div>
      </section>
    </PremiumPageLayout>
  );
}
