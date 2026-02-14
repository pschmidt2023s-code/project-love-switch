import { Seo } from "@/components/Seo";
import { PremiumPageLayout } from "@/components/premium/PremiumPageLayout";
import { Truck, Clock, Package, Globe, CreditCard, Shield, Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const steps = [
  { icon: Package, title: 'Bestellung', text: 'Sicher bestellen über unseren Shop.' },
  { icon: Clock, title: 'Verarbeitung', text: 'Bis 14:00 Uhr am selben Tag versendet.' },
  { icon: Truck, title: 'Versand', text: 'Diskret und sicher via DHL.' },
  { icon: Check, title: 'Zustellung', text: '2–4 Werktage in Deutschland.' },
];

export default function ShippingPage() {
  return (
    <PremiumPageLayout>
      <Seo
        title="Versand | ALDENAIR"
        description="Versandinformationen von ALDENAIR: Lieferzeiten, Versandkosten und Versandoptionen."
        canonicalPath="/shipping"
      />

      {/* Hero - Minimal with large number accent */}
      <section className="py-20 lg:py-32">
        <div className="container-premium">
          <div className="grid lg:grid-cols-2 gap-16 items-end">
            <div>
              <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-6">Versand & Lieferung</span>
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-foreground leading-[0.95] mb-6">
                Von uns
                <br />
                zu Ihnen.
              </h1>
              <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
                Sorgfältig verpackt, diskret geliefert — mit Tracking-Nummer und voller Transparenz.
              </p>
            </div>
            <div className="flex items-end justify-end">
              <div className="text-right">
                <span className="font-display text-8xl lg:text-[10rem] text-accent/10 leading-none block">2–4</span>
                <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Werktage Lieferzeit</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Steps - Horizontal timeline */}
      <section className="py-16 lg:py-24 border-t border-border">
        <div className="container-premium">
          <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-10">Der Weg zu Ihnen</span>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {steps.map((step, i) => (
              <div key={step.title} className="relative">
                {/* Step number */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-display text-3xl text-accent/20">{String(i + 1).padStart(2, '0')}</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="w-10 h-10 flex items-center justify-center border border-border mb-4">
                  <step.icon className="w-4 h-4 text-accent" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-lg text-foreground mb-2">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shipping Costs & Delivery Times - Side by side cards */}
      <section className="py-16 lg:py-24 border-t border-border">
        <div className="container-premium">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Costs */}
            <div className="p-8 lg:p-12 border border-border">
              <div className="flex items-center gap-3 mb-8">
                <CreditCard className="w-5 h-5 text-accent" strokeWidth={1.5} />
                <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Versandkosten</span>
              </div>
              <h2 className="font-display text-2xl lg:text-3xl text-foreground mb-2">
                Transparente Preise
              </h2>
              <p className="text-sm text-muted-foreground mb-8">
                Ab 50 € Bestellwert liefern wir innerhalb Deutschlands kostenlos.
              </p>
              <div className="space-y-0">
                {[
                  { country: 'Deutschland', condition: 'Unter 50 €', price: '4,90 €' },
                  { country: 'Deutschland', condition: 'Ab 50 €', price: 'Kostenlos', highlight: true },
                  { country: 'Österreich', condition: 'Alle Bestellungen', price: '6,90 €' },
                  { country: 'Schweiz', condition: 'Alle Bestellungen', price: '12,90 €' },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center justify-between py-4 ${i > 0 ? 'border-t border-border' : ''}`}>
                    <div>
                      <span className="text-sm text-foreground">{item.country}</span>
                      <span className="text-xs text-muted-foreground ml-3">{item.condition}</span>
                    </div>
                    <span className={`text-sm font-medium ${item.highlight ? 'text-accent' : 'text-foreground'}`}>
                      {item.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Times */}
            <div className="p-8 lg:p-12 border border-border">
              <div className="flex items-center gap-3 mb-8">
                <Globe className="w-5 h-5 text-accent" strokeWidth={1.5} />
                <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Lieferzeiten</span>
              </div>
              <h2 className="font-display text-2xl lg:text-3xl text-foreground mb-2">
                Schnelle Zustellung
              </h2>
              <p className="text-sm text-muted-foreground mb-8">
                Bestellungen bis 14:00 Uhr werden noch am selben Werktag bearbeitet.
              </p>
              <div className="space-y-0">
                {[
                  { country: 'Deutschland', time: '2–4 Werktage' },
                  { country: 'Österreich', time: '3–5 Werktage' },
                  { country: 'Schweiz', time: '5–7 Werktage' },
                  { country: 'EU-Ausland', time: '5–10 Werktage' },
                ].map((item, i) => (
                  <div key={item.country} className={`flex justify-between py-4 ${i > 0 ? 'border-t border-border' : ''}`}>
                    <span className="text-sm text-foreground">{item.country}</span>
                    <span className="text-sm text-muted-foreground">{item.time}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mt-6 pt-4 border-t border-border">
                Sie erhalten eine Tracking-Nummer per E-Mail sobald Ihre Bestellung versendet wurde.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 lg:py-24 border-t border-border">
        <div className="container-premium">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Truck, title: 'Kostenloser Versand', text: 'Ab 50 € Bestellwert innerhalb Deutschlands.' },
              { icon: Shield, title: 'Käuferschutz', text: 'SSL-verschlüsselt. 14 Tage Rückgaberecht inklusive.' },
              { icon: CreditCard, title: 'Sichere Zahlung', text: 'Kreditkarte, PayPal, Klarna oder SEPA.' },
            ].map((item) => (
              <div key={item.title} className="p-6 lg:p-8 border border-border text-center">
                <item.icon className="w-6 h-6 text-accent mx-auto mb-4" strokeWidth={1.5} />
                <h3 className="font-display text-base text-foreground mb-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24 border-t border-border">
        <div className="container-premium text-center">
          <h2 className="font-display text-2xl lg:text-3xl text-foreground mb-4">Noch Fragen?</h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
            Unser Kundenservice hilft Ihnen gerne bei allen Fragen rund um Versand und Lieferung.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors"
          >
            Kontakt aufnehmen
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </Link>
        </div>
      </section>
    </PremiumPageLayout>
  );
}
