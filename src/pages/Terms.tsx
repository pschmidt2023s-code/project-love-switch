import { Link } from 'react-router-dom';
import { PremiumPageLayout } from '@/components/premium/PremiumPageLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Seo } from '@/components/Seo';

export default function Terms() {
  return (
    <PremiumPageLayout>
      <Seo
        title="AGB | ALDENAIR"
        description="Allgemeine Geschäftsbedingungen für den Einkauf bei ALDENAIR. Rechtssichere Konditionen für Ihr Einkaufserlebnis."
        canonicalPath="/terms"
      />

      <div className="container mx-auto px-4 lg:px-8">
        <Breadcrumb />
        
        {/* Hero Section */}
        <header className="py-16 lg:py-24 border-b border-border">
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4">
            Rechtliches
          </p>
          <h1 className="font-display text-4xl lg:text-5xl text-foreground mb-6">
            Allgemeine Geschäftsbedingungen
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Transparente und faire Konditionen für Ihr Einkaufserlebnis bei ALDENAIR.
          </p>
        </header>

        {/* Content */}
        <section className="py-16 lg:py-24">
          <div className="max-w-3xl space-y-16">
            
            {/* § 1 */}
            <div className="space-y-6">
              <h2 className="font-display text-2xl text-foreground">
                § 1 Geltungsbereich
              </h2>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
                <p>
                  (1) Diese AGB gelten für alle Bestellungen zwischen ALDENAIR 
                  (Inhaber: Patric-Maurice Schmidt, BGM.-Scheller-Str. 14, 96215 Lichtenfels) 
                  – nachfolgend "Verkäufer" – und dem Kunden über den Online-Shop 
                  www.aldenairperfumes.de.
                </p>
                <p>
                  (2) Abweichende Bedingungen des Käufers werden nicht anerkannt, 
                  es sei denn, der Verkäufer hat ausdrücklich schriftlich zugestimmt.
                </p>
                <p>
                  (3) Es gilt die zum Zeitpunkt der Bestellung gültige Fassung der AGB.
                </p>
              </div>
            </div>

            {/* § 2 */}
            <div className="space-y-6">
              <h2 className="font-display text-2xl text-foreground">
                § 2 Vertragsschluss
              </h2>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
                <p>
                  (1) Die Darstellung der Produkte im Online-Shop stellt kein rechtlich 
                  bindendes Angebot, sondern eine Aufforderung zur Bestellung dar.
                </p>
                <p>
                  (2) Mit Klick auf "Kostenpflichtig bestellen" gibt der Käufer ein 
                  verbindliches Kaufangebot ab (§ 312j Abs. 3 BGB).
                </p>
                <p>
                  (3) Die Eingangsbestätigung stellt noch keine Annahme dar.
                </p>
                <p>
                  (4) Der Vertrag kommt durch Auftragsbestätigung oder Lieferung zustande.
                </p>
              </div>
            </div>

            {/* § 3 */}
            <div className="space-y-6">
              <h2 className="font-display text-2xl text-foreground">
                § 3 Preise und Versandkosten
              </h2>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
                <p>
                  (1) Alle Preise sind Endpreise inkl. 19% MwSt.
                </p>
                <p>
                  (2) Versandkosten:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Versandkostenfrei ab 50 € (Deutschland)</li>
                  <li>Unter 50 €: 4,90 € Versandkosten</li>
                  <li>EU-Ausland: Kosten werden im Warenkorb angezeigt</li>
                </ul>
                <p>
                  (3) Alle Preise sind transparent vor Bestellabschluss ersichtlich.
                </p>
              </div>
            </div>

            {/* § 4 */}
            <div className="space-y-6">
              <h2 className="font-display text-2xl text-foreground">
                § 4 Lieferung
              </h2>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
                <p>
                  (1) Lieferung an die angegebene Lieferadresse.
                </p>
                <p>
                  (2) Lieferzeit: 3-7 Werktage (Deutschland), international länger.
                </p>
                <p>
                  (3) Bei Nichtverfügbarkeit wird der Käufer informiert und 
                  Zahlungen erstattet.
                </p>
                <p>
                  (4) Teillieferungen sind zulässig, soweit zumutbar.
                </p>
              </div>
            </div>

            {/* § 5 */}
            <div className="space-y-6">
              <h2 className="font-display text-2xl text-foreground">
                § 5 Zahlung
              </h2>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
                <p>
                  (1) Zahlungsmöglichkeiten:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Kreditkarte (Visa, Mastercard, American Express)</li>
                  <li>PayPal</li>
                  <li>SEPA-Lastschrift</li>
                  <li>Sofortüberweisung (Klarna)</li>
                </ul>
                <p>
                  (2) Zahlung erfolgt vor Lieferung, mit Bestellabschluss fällig.
                </p>
                <p>
                  (3) Sichere, verschlüsselte Zahlungsabwicklung über Stripe/PayPal.
                </p>
              </div>
            </div>

            {/* § 6 */}
            <div className="space-y-6">
              <h2 className="font-display text-2xl text-foreground">
                § 6 Widerrufsrecht
              </h2>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
                <p>
                  (1) Verbraucher haben ein 14-tägiges Widerrufsrecht (§§ 312g, 355 BGB). 
                  Details unter{' '}
                  <Link to="/returns" className="text-accent hover:underline">
                    Widerrufsbelehrung
                  </Link>.
                </p>
                <p>
                  (2) <strong className="text-foreground">Ausschluss:</strong> Das 
                  Widerrufsrecht besteht nicht bei entsiegelten Parfümflakons 
                  (§ 312g Abs. 2 Nr. 3 BGB – Hygieneprodukte).
                </p>
                <p>
                  (3) Rücksendekosten trägt der Käufer bei korrekter Lieferung.
                </p>
              </div>
            </div>

            {/* § 7 */}
            <div className="space-y-6">
              <h2 className="font-display text-2xl text-foreground">
                § 7 Eigentumsvorbehalt
              </h2>
              <div className="text-sm text-muted-foreground leading-relaxed">
                <p>
                  Die Ware bleibt bis zur vollständigen Bezahlung Eigentum des Verkäufers.
                </p>
              </div>
            </div>

            {/* § 8 */}
            <div className="space-y-6">
              <h2 className="font-display text-2xl text-foreground">
                § 8 Gewährleistung
              </h2>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
                <p>
                  (1) Gesetzliche Gewährleistungsrechte (§§ 434 ff. BGB).
                </p>
                <p>
                  (2) Gewährleistungsfrist: 2 Jahre ab Lieferung.
                </p>
                <p>
                  (3) Mängel sind unverzüglich, spätestens innerhalb von 14 Tagen 
                  nach Entdeckung, anzuzeigen.
                </p>
              </div>
            </div>

            {/* § 9 */}
            <div className="space-y-6">
              <h2 className="font-display text-2xl text-foreground">
                § 9 Haftung
              </h2>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
                <p>
                  (1) Unbeschränkte Haftung bei Schäden an Leben, Körper oder Gesundheit 
                  durch vorsätzliche oder fahrlässige Pflichtverletzung.
                </p>
                <p>
                  (2) Für sonstige Schäden: Haftung nur bei Vorsatz, grober Fahrlässigkeit 
                  oder Verletzung wesentlicher Vertragspflichten.
                </p>
                <p>
                  (3) Produkthaftungsgesetz bleibt unberührt.
                </p>
              </div>
            </div>

            {/* § 10 */}
            <div className="space-y-6">
              <h2 className="font-display text-2xl text-foreground">
                § 10 Datenschutz
              </h2>
              <div className="text-sm text-muted-foreground leading-relaxed">
                <p>
                  Informationen zur Datenverarbeitung in unserer{' '}
                  <Link to="/privacy" className="text-accent hover:underline">
                    Datenschutzerklärung
                  </Link>.
                </p>
              </div>
            </div>

            {/* § 11 */}
            <div className="space-y-6">
              <h2 className="font-display text-2xl text-foreground">
                § 11 Online-Streitbeilegung
              </h2>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
                <p>
                  EU-Plattform zur Online-Streitbeilegung:{' '}
                  <a 
                    href="https://ec.europa.eu/consumers/odr/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-accent hover:underline"
                  >
                    https://ec.europa.eu/consumers/odr/
                  </a>
                </p>
                <p>E-Mail: support@aldenairperfumes.de</p>
                <p className="text-xs italic">
                  Hinweis: Die EU-OS-Plattform nimmt ab 20.03.2025 keine neuen 
                  Beschwerden mehr an.
                </p>
                <p>
                  Wir sind nicht verpflichtet, an Streitbeilegungsverfahren vor 
                  einer Verbraucherschlichtungsstelle teilzunehmen.
                </p>
              </div>
            </div>

            {/* § 12 */}
            <div className="space-y-6">
              <h2 className="font-display text-2xl text-foreground">
                § 12 Schlussbestimmungen
              </h2>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
                <p>
                  (1) Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts.
                </p>
                <p>
                  (2) Erfüllungsort ist der Sitz des Verkäufers.
                </p>
                <p>
                  (3) Gerichtsstand ist, soweit zulässig, der Sitz des Verkäufers.
                </p>
                <p>
                  (4) Salvatorische Klausel: Unwirksame Bestimmungen werden durch 
                  gesetzliche Regelungen ersetzt.
                </p>
              </div>
            </div>

            {/* Abonnements */}
            <div className="pt-8 border-t border-border space-y-12">
              <h2 className="font-display text-2xl text-foreground">
                Besondere Bedingungen: Duft-Abonnements
              </h2>
              
              <div className="space-y-6">
                <h3 className="font-medium text-lg text-foreground">
                  § A1 Gegenstand des Abonnements
                </h3>
                <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
                  <p>
                    (1) Regelmäßige Lieferung des gewählten Produkts (monatlich, 
                    alle zwei Monate oder vierteljährlich).
                  </p>
                  <p>
                    (2) Abonnenten erhalten 15% Rabatt und kostenlosen Versand.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="font-medium text-lg text-foreground">
                  § A2 Laufzeit und Kündigung
                </h3>
                <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
                  <p>
                    (1) Keine Mindestlaufzeit.
                  </p>
                  <p>
                    (2) Jederzeit kündbar über das Kundenkonto.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="font-medium text-lg text-foreground">
                  § A3 Zahlung
                </h3>
                <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
                  <p>
                    (1) Automatische Abbuchung zum Lieferzeitpunkt.
                  </p>
                  <p>
                    (2) E-Mail-Benachrichtigung vor jeder Abbuchung.
                  </p>
                </div>
              </div>
            </div>

            {/* Gewinnspiele */}
            <div className="pt-8 border-t border-border space-y-12">
              <h2 className="font-display text-2xl text-foreground">
                Besondere Bedingungen: Gewinnspiele
              </h2>
              
              <div className="space-y-6">
                <h3 className="font-medium text-lg text-foreground">
                  Teilnahmeberechtigung
                </h3>
                <div className="text-sm text-muted-foreground leading-relaxed">
                  <p>
                    Natürliche Personen ab 18 Jahren mit Wohnsitz in Deutschland. 
                    Eine Teilnahme pro Person. Mitarbeiter und Angehörige ausgeschlossen.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="font-medium text-lg text-foreground">
                  Gewinnermittlung
                </h3>
                <div className="text-sm text-muted-foreground leading-relaxed">
                  <p>
                    Zufallsverfahren nach Ende des Gewinnspiels. Benachrichtigung per E-Mail. 
                    Keine Barauszahlung. Der Rechtsweg ist ausgeschlossen.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact & Date */}
            <div className="pt-8 border-t border-border space-y-6">
              <h2 className="font-display text-2xl text-foreground">
                Kontakt
              </h2>
              <p className="text-sm text-muted-foreground">
                Bei Fragen: support@aldenairperfumes.de
              </p>
              <p className="text-xs text-muted-foreground">Stand: Dezember 2024</p>
            </div>

          </div>
        </section>
      </div>
    </PremiumPageLayout>
  );
}
