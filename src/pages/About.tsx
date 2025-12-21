import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Users, Heart, Award } from 'lucide-react';

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
  { value: '500+', label: 'Düfte im Sortiment' },
  { value: '10.000+', label: 'Zufriedene Kunden' },
  { value: '4.8 / 5', label: 'Kundenbewertung' },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main>
        {/* Hero Section */}
        <section className="py-16 lg:py-24 text-center">
          <div className="max-w-4xl mx-auto px-4 lg:px-8">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Über ALDENAIR
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Wir sind Ihr Partner für exklusive Düfte - mit Leidenschaft für Qualität und dem Ziel,
              Luxusparfüms für jeden zugänglich zu machen.
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="pb-16 lg:pb-24">
          <div className="max-w-6xl mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => (
                <Card key={feature.title} className="text-center border-border/50">
                  <CardContent className="pt-8 pb-6 px-6">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <feature.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="pb-16 lg:pb-24">
          <div className="max-w-6xl mx-auto px-4 lg:px-8">
            <Card className="border-border/50">
              <CardContent className="p-8 lg:p-12">
                <div className="grid lg:grid-cols-2 gap-10 items-center">
                  {/* Text */}
                  <div className="space-y-6">
                    <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
                      Unsere Geschichte
                    </h2>
                    <div className="space-y-4 text-muted-foreground leading-relaxed">
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

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    {stats.map((stat) => (
                      <div
                        key={stat.label}
                        className="p-6 rounded-xl bg-muted/30 border border-border/50 text-right"
                      >
                        <div className="text-sm text-muted-foreground mb-1">{stat.label}</div>
                        <div className="text-2xl lg:text-3xl font-bold text-foreground">{stat.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
