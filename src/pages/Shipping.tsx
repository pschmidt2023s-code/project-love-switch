import { Seo } from "@/components/Seo";
import { PremiumPageLayout } from "@/components/premium/PremiumPageLayout";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Truck, Clock, Package, Globe, CreditCard, Shield } from "lucide-react";

export default function ShippingPage() {
  return (
    <PremiumPageLayout>
      <Seo
        title="Versand | ALDENAIR"
        description="Versandinformationen von ALDENAIR: Lieferzeiten, Versandkosten und Versandoptionen."
        canonicalPath="/shipping"
      />

      {/* Header */}
      <section className="border-b border-border">
        <div className="container-premium py-8 lg:py-12">
          <Breadcrumb className="mb-6" />
          <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-3">Service</span>
          <h1 className="font-display text-3xl lg:text-4xl text-foreground mb-4">
            Versand & Lieferung
          </h1>
          <p className="text-muted-foreground max-w-xl text-sm lg:text-base leading-relaxed">
            Sorgfältig verpackt, diskret geliefert. Erfahren Sie alles über unsere
            Versandoptionen und Lieferzeiten.
          </p>
        </div>
      </section>

      {/* Key Info Cards */}
      <section className="section-spacing border-b border-border">
        <div className="container-premium">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              { icon: Truck, title: 'Kostenloser Versand', desc: 'Ab einem Bestellwert von 50 € liefern wir versandkostenfrei innerhalb Deutschlands.' },
              { icon: Clock, title: 'Schnelle Lieferung', desc: 'Bestellungen bis 14:00 Uhr werden noch am selben Tag versendet. Lieferzeit: 2-4 Werktage.' },
              { icon: Package, title: 'Diskrete Verpackung', desc: 'Alle Bestellungen werden neutral und sicher verpackt, ohne sichtbare Produkthinweise.' },
            ].map(item => (
              <div key={item.title} className="p-6 lg:p-8 border border-border bg-card hover:border-accent/50 transition-colors">
                <div className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center bg-accent/10 mb-4">
                  <item.icon className="w-5 h-5 lg:w-6 lg:h-6 text-accent" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-lg text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shipping Costs */}
      <section className="section-spacing border-b border-border">
        <div className="container-premium">
          <span className="inline-block text-[10px] tracking-[0.2em] uppercase text-accent mb-4">Kosten</span>
          <h2 className="font-display text-2xl lg:text-3xl text-foreground mb-8">Versandkosten</h2>

          <div className="space-y-3 max-w-2xl">
            {[
              { country: 'Deutschland', condition: 'Unter 50 €', price: '4,90 €', highlight: false },
              { country: 'Deutschland', condition: 'Ab 50 €', price: 'Kostenlos', highlight: true },
              { country: 'Österreich', condition: 'Alle Bestellungen', price: '6,90 €', highlight: false },
              { country: 'Schweiz', condition: 'Alle Bestellungen', price: '12,90 €', highlight: false },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-border">
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                  <span className="text-sm text-foreground">{item.country}</span>
                </div>
                <span className="text-sm text-muted-foreground">{item.condition}</span>
                <span className={`text-sm font-medium ${item.highlight ? 'text-accent' : 'text-foreground'}`}>
                  {item.price}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery Times */}
      <section className="section-spacing border-b border-border">
        <div className="container-premium">
          <span className="inline-block text-[10px] tracking-[0.2em] uppercase text-accent mb-4">Lieferzeiten</span>
          <h2 className="font-display text-2xl lg:text-3xl text-foreground mb-8">Lieferzeiten</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <div className="space-y-0 max-w-md">
              {[
                { country: 'Deutschland', time: '2-4 Werktage' },
                { country: 'Österreich', time: '3-5 Werktage' },
                { country: 'Schweiz', time: '5-7 Werktage' },
                { country: 'EU-Ausland', time: '5-10 Werktage' },
              ].map(item => (
                <div key={item.country} className="flex justify-between py-4 border-b border-border">
                  <span className="text-sm text-foreground">{item.country}</span>
                  <span className="text-sm text-muted-foreground">{item.time}</span>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Bestellungen, die bis 14:00 Uhr eingehen, werden noch am selben
                Werktag bearbeitet und versendet. Die angegebenen Lieferzeiten
                beginnen ab dem Versanddatum.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Sie erhalten nach dem Versand eine Bestätigungs-E-Mail mit
                Tracking-Link, über den Sie Ihre Sendung jederzeit verfolgen können.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Payment & Security */}
      <section className="section-spacing">
        <div className="container-premium">
          <span className="inline-block text-[10px] tracking-[0.2em] uppercase text-accent mb-4">Sicherheit</span>
          <h2 className="font-display text-2xl lg:text-3xl text-foreground mb-8">Zahlung & Sicherheit</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
            <div className="p-6 lg:p-8 border border-border">
              <div className="w-10 h-10 flex items-center justify-center bg-accent/10 mb-4">
                <CreditCard className="w-5 h-5 text-accent" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-lg text-foreground mb-2">Sichere Zahlungsmethoden</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Bezahlen Sie sicher mit Kreditkarte, PayPal, Klarna oder SEPA-Lastschrift.
                Alle Transaktionen sind SSL-verschlüsselt.
              </p>
            </div>
            <div className="p-6 lg:p-8 border border-border">
              <div className="w-10 h-10 flex items-center justify-center bg-accent/10 mb-4">
                <Shield className="w-5 h-5 text-accent" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-lg text-foreground mb-2">Käuferschutz</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ihre Bestellung ist durch unseren Käuferschutz abgesichert.
                Bei Fragen steht Ihnen unser Kundenservice jederzeit zur Verfügung.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PremiumPageLayout>
  );
}