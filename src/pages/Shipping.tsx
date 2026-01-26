import { Seo } from "@/components/Seo";
import { PremiumPageLayout } from "@/components/premium/PremiumPageLayout";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Truck, Clock, Package, Globe, CreditCard, Shield } from "lucide-react";

export default function ShippingPage() {
  return (
    <PremiumPageLayout>
      <Seo
        title="Versand | ALDENAIR"
        description="Versandinformationen von ALDENAIR: Lieferzeiten, Versandkosten und Versandoptionen für Deutschland, Österreich und die Schweiz."
        canonicalPath="/shipping"
      />

      <div className="container mx-auto px-4 lg:px-8">
        <Breadcrumb />
        
        {/* Hero Section */}
        <header className="py-16 lg:py-24 border-b border-border">
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4">
            Service
          </p>
          <h1 className="font-display text-4xl lg:text-5xl text-foreground mb-6">
            Versand & Lieferung
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Sorgfältig verpackt, diskret geliefert. Erfahren Sie alles über unsere 
            Versandoptionen und Lieferzeiten.
          </p>
        </header>

        {/* Key Info Cards */}
        <section className="py-16 lg:py-24 border-b border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-12 h-12 flex items-center justify-center border border-border">
                <Truck className="w-5 h-5 text-foreground" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-xl text-foreground">
                Kostenloser Versand
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ab einem Bestellwert von 50 € liefern wir versandkostenfrei 
                innerhalb Deutschlands.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 flex items-center justify-center border border-border">
                <Clock className="w-5 h-5 text-foreground" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-xl text-foreground">
                Schnelle Lieferung
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Bestellungen bis 14:00 Uhr werden noch am selben Tag versendet. 
                Lieferzeit: 2-4 Werktage.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 flex items-center justify-center border border-border">
                <Package className="w-5 h-5 text-foreground" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-xl text-foreground">
                Diskrete Verpackung
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Alle Bestellungen werden neutral und sicher verpackt, 
                ohne sichtbare Produkthinweise.
              </p>
            </div>
          </div>
        </section>

        {/* Shipping Costs */}
        <section className="py-16 lg:py-24 border-b border-border">
          <h2 className="font-display text-2xl lg:text-3xl text-foreground mb-12">
            Versandkosten
          </h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-muted/30 border border-border">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                <span className="text-sm text-foreground">Deutschland</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Bestellwert unter 50 €
              </div>
              <div className="text-sm font-medium text-foreground text-right">
                4,90 €
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 border border-border">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                <span className="text-sm text-foreground">Deutschland</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Bestellwert ab 50 €
              </div>
              <div className="text-sm font-medium text-accent text-right">
                Kostenlos
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 border border-border">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                <span className="text-sm text-foreground">Österreich</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Alle Bestellungen
              </div>
              <div className="text-sm font-medium text-foreground text-right">
                6,90 €
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 border border-border">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                <span className="text-sm text-foreground">Schweiz</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Alle Bestellungen
              </div>
              <div className="text-sm font-medium text-foreground text-right">
                12,90 €
              </div>
            </div>
          </div>
        </section>

        {/* Delivery Times */}
        <section className="py-16 lg:py-24 border-b border-border">
          <h2 className="font-display text-2xl lg:text-3xl text-foreground mb-12">
            Lieferzeiten
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-6">
              <div className="flex justify-between py-4 border-b border-border">
                <span className="text-sm text-foreground">Deutschland</span>
                <span className="text-sm text-muted-foreground">2-4 Werktage</span>
              </div>
              <div className="flex justify-between py-4 border-b border-border">
                <span className="text-sm text-foreground">Österreich</span>
                <span className="text-sm text-muted-foreground">3-5 Werktage</span>
              </div>
              <div className="flex justify-between py-4 border-b border-border">
                <span className="text-sm text-foreground">Schweiz</span>
                <span className="text-sm text-muted-foreground">5-7 Werktage</span>
              </div>
              <div className="flex justify-between py-4 border-b border-border">
                <span className="text-sm text-foreground">EU-Ausland</span>
                <span className="text-sm text-muted-foreground">5-10 Werktage</span>
              </div>
            </div>

            <div className="space-y-6">
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
        </section>

        {/* Payment & Security */}
        <section className="py-16 lg:py-24">
          <h2 className="font-display text-2xl lg:text-3xl text-foreground mb-12">
            Zahlung & Sicherheit
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 border border-border space-y-4">
              <CreditCard className="w-6 h-6 text-foreground" strokeWidth={1.5} />
              <h3 className="font-display text-lg text-foreground">
                Sichere Zahlungsmethoden
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Bezahlen Sie sicher mit Kreditkarte (Visa, Mastercard, American Express), 
                PayPal, Klarna oder SEPA-Lastschrift. Alle Transaktionen sind 
                SSL-verschlüsselt.
              </p>
            </div>

            <div className="p-8 border border-border space-y-4">
              <Shield className="w-6 h-6 text-foreground" strokeWidth={1.5} />
              <h3 className="font-display text-lg text-foreground">
                Käuferschutz
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ihre Bestellung ist durch unseren Käuferschutz abgesichert. 
                Bei Fragen oder Problemen steht Ihnen unser Kundenservice 
                jederzeit zur Verfügung.
              </p>
            </div>
          </div>
        </section>
      </div>
    </PremiumPageLayout>
  );
}
