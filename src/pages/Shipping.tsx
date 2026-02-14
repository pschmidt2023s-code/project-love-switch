import { Seo } from "@/components/Seo";
import { PremiumPageLayout } from "@/components/premium/PremiumPageLayout";
import { Truck, Clock, Package, Globe, CreditCard, Shield, Check } from "lucide-react";

const steps = [
  { icon: Package, title: 'Bestellung aufgeben', text: 'Sicher bestellen über unseren Shop.' },
  { icon: Clock, title: 'Verarbeitung', text: 'Bestellungen bis 14:00 Uhr werden am selben Tag versendet.' },
  { icon: Truck, title: 'Versand', text: 'Diskrete und sichere Verpackung via DHL.' },
  { icon: Check, title: 'Zustellung', text: '2–4 Werktage innerhalb Deutschlands.' },
];

export default function ShippingPage() {
  return (
    <PremiumPageLayout>
      <Seo
        title="Versand | ALDENAIR"
        description="Versandinformationen von ALDENAIR: Lieferzeiten, Versandkosten und Versandoptionen."
        canonicalPath="/shipping"
      />

      {/* Hero with visual step indicator */}
      <section className="py-16 lg:py-24">
        <div className="container-premium">
          <div className="text-center mb-16">
            <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-4">Versand</span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-foreground mb-4">
              Von uns zu Ihnen
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Sorgfältig verpackt, diskret geliefert. So kommt Ihr Duft zu Ihnen.
            </p>
          </div>

          {/* Visual Steps */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 border border-border">
            {steps.map((step, i) => (
              <div key={step.title} className={`p-6 lg:p-8 text-center ${i > 0 ? 'border-l border-border' : ''} ${i >= 2 ? 'border-t lg:border-t-0 border-border' : ''}`}>
                <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-accent/10">
                  <step.icon className="w-5 h-5 text-accent" strokeWidth={1.5} />
                </div>
                <div className="text-[10px] tracking-[0.1em] uppercase text-accent mb-2">Schritt {i + 1}</div>
                <h3 className="font-display text-base lg:text-lg text-foreground mb-2">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shipping Costs - Table style */}
      <section className="py-16 lg:py-24 bg-foreground text-background">
        <div className="container-premium">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            <div>
              <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-background/50 mb-4">
                Versandkosten
              </span>
              <h2 className="font-display text-3xl lg:text-4xl mb-6">
                Transparente Preise
              </h2>
              <p className="text-background/60 text-sm leading-relaxed mb-8">
                Ab 50 € Bestellwert liefern wir innerhalb Deutschlands kostenlos.
                Alle Preise inklusive Verpackung und Versicherung.
              </p>

              <div className="space-y-0">
                {[
                  { country: 'Deutschland', condition: 'Unter 50 €', price: '4,90 €' },
                  { country: 'Deutschland', condition: 'Ab 50 €', price: 'Kostenlos', highlight: true },
                  { country: 'Österreich', condition: 'Alle Bestellungen', price: '6,90 €' },
                  { country: 'Schweiz', condition: 'Alle Bestellungen', price: '12,90 €' },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center justify-between py-4 ${i > 0 ? 'border-t border-background/10' : ''}`}>
                    <div>
                      <span className="text-sm">{item.country}</span>
                      <span className="text-xs text-background/40 ml-3">{item.condition}</span>
                    </div>
                    <span className={`text-sm font-medium ${item.highlight ? 'text-accent' : ''}`}>
                      {item.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-background/50 mb-4">
                Lieferzeiten
              </span>
              <h2 className="font-display text-3xl lg:text-4xl mb-6">
                Schnelle Zustellung
              </h2>
              
              <div className="space-y-0 mb-8">
                {[
                  { country: 'Deutschland', time: '2–4 Werktage' },
                  { country: 'Österreich', time: '3–5 Werktage' },
                  { country: 'Schweiz', time: '5–7 Werktage' },
                  { country: 'EU-Ausland', time: '5–10 Werktage' },
                ].map((item, i) => (
                  <div key={item.country} className={`flex justify-between py-4 ${i > 0 ? 'border-t border-background/10' : ''}`}>
                    <span className="text-sm">{item.country}</span>
                    <span className="text-sm text-background/60">{item.time}</span>
                  </div>
                ))}
              </div>
              
              <p className="text-xs text-background/40 leading-relaxed">
                Bestellungen bis 14:00 Uhr werden noch am selben Werktag bearbeitet.
                Sie erhalten eine Tracking-Nummer per E-Mail.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 lg:py-24">
        <div className="container-premium">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="p-8 lg:p-10 border border-border">
              <CreditCard className="w-6 h-6 text-accent mb-5" strokeWidth={1.5} />
              <h3 className="font-display text-lg text-foreground mb-2">Sichere Zahlung</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Kreditkarte, PayPal, Klarna oder SEPA-Lastschrift.
                Alle Transaktionen sind SSL-verschlüsselt.
              </p>
            </div>
            <div className="p-8 lg:p-10 border border-border">
              <Shield className="w-6 h-6 text-accent mb-5" strokeWidth={1.5} />
              <h3 className="font-display text-lg text-foreground mb-2">Käuferschutz</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Jede Bestellung ist durch unseren Käuferschutz abgesichert.
                14 Tage Rückgaberecht inklusive.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PremiumPageLayout>
  );
}
