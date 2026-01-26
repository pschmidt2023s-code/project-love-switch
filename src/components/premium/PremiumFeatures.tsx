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
    <section className="py-8 lg:py-12 border-y border-border">
      <div className="container-premium">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
          {features.map((feature) => (
            <div 
              key={feature.title}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 mb-2 lg:mb-4">
                <feature.icon className="w-5 h-5 lg:w-6 lg:h-6 text-accent" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-sm lg:text-lg text-foreground mb-1 lg:mb-2">
                {feature.title}
              </h3>
              <p className="text-xs lg:text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
