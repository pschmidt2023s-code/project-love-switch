import { Star, Truck, Shield, Gift } from 'lucide-react';

export function PremiumFeatures() {
  const features = [
    {
      icon: Star,
      title: 'Premium Qualität',
      description: 'Nur die besten Inhaltsstoffe für langanhaltende Düfte',
    },
    {
      icon: Gift,
      title: 'Gratis Proben',
      description: 'Bei jeder Bestellung kostenlose Duftproben',
    },
    {
      icon: Truck,
      title: 'Schneller Versand',
      description: 'Lieferung innerhalb von 1-3 Werktagen',
    },
    {
      icon: Shield,
      title: '14 Tage Rückgabe',
      description: 'Kostenlose Rücksendung bei Nichtgefallen',
    },
  ];

  return (
    <section className="section-spacing border-y border-border">
      <div className="container-premium">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="text-center animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s`, opacity: 0 }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 mb-4">
                <feature.icon className="w-6 h-6 text-accent" strokeWidth={1.5} />
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
  );
}
