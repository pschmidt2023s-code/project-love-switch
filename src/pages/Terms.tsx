import { Link } from 'react-router-dom';
import { PremiumPageLayout } from '@/components/premium/PremiumPageLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Seo } from '@/components/Seo';

export default function Terms() {
  return (
    <PremiumPageLayout>
      <Seo
        title="AGB | ALDENAIR"
        description="Allgemeine Geschäftsbedingungen für den Einkauf bei ALDENAIR."
        canonicalPath="/terms"
      />

      {/* Header */}
      <section className="border-b border-border">
        <div className="container-premium py-8 lg:py-12">
          <Breadcrumb className="mb-6" />
          <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-3">Rechtliches</span>
          <h1 className="font-display text-3xl lg:text-4xl text-foreground mb-4">
            Allgemeine Geschäftsbedingungen
          </h1>
          <p className="text-muted-foreground max-w-xl text-sm lg:text-base leading-relaxed">
            Transparente und faire Konditionen für Ihr Einkaufserlebnis bei ALDENAIR.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="section-spacing">
        <div className="container-premium">
          <div className="max-w-3xl space-y-16">

            <div className="space-y-6">
              <h2 className="font-display text-2xl text-foreground">§ 1 Geltungsbereich</h2>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
                <p>(1) Diese AGB gelten für alle Bestellungen zwischen ALDENAIR (Inhaber: Patric-Maurice Schmidt, BGM.-Scheller-Str. 14, 96215 Lichtenfels) – nachfolgend "Verkäufer" – und dem Kunden über den Online-Shop www.aldenairperfumes.de.</p>
                <p>(2) Abweichende Bedingungen des Käufers werden nicht anerkannt, es sei denn, der Verkäufer hat ausdrücklich schriftlich zugestimmt.</p>
                <p>(3) Es gilt die zum Zeitpunkt der Bestellung gültige Fassung der AGB.</p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="font-display text-2xl text-foreground">§ 2 Vertragsschluss</h2>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
                <p>(1) Die Darstellung der Produkte im Online-Shop stellt kein rechtlich bindendes Angebot, sondern eine Aufforderung zur Bestellung dar.</p>
                <p>(2) Mit Klick auf "Kostenpflichtig bestellen" gibt der Käufer ein verbindliches Kaufangebot ab (§ 312j Abs. 3 BGB).</p>
                <p>(3) Die Eingangsbestätigung stellt noch keine Annahme dar.</p>
                <p>(4) Der Vertrag kommt durch Auftragsbestätigung oder Lieferung zustande.</p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="font-display text-2xl text-foreground">§ 3 Preise und Versandkosten</h2>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
                <p>(1) Alle Preise sind Endpreise. Gemäß § 19 UStG wird keine Umsatzsteuer erhoben (Kleinunternehmerregelung). Die Preise enthalten daher keine Umsatzsteuer.</p>
                <p>(2) Versandkosten:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Versandkostenfrei ab 50 € (Deutschland)</li>
                  <li>Unter 50 €: 4,90 € Versandkosten</li>
                  <li>EU-Ausland: Kosten werden im Warenkorb angezeigt</li>
                </ul>
                <p>(3) Alle Preise sind transparent vor Bestellabschluss ersichtlich.</p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="font-display text-2xl text-foreground">§ 4 Lieferung</h2>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
                <p>(1) Lieferung an die angegebene Lieferadresse.</p>
                <p>(2) Lieferzeit: 3-7 Werktage (Deutschland), international länger.</p>
                <p>(3) Bei Nichtverfügbarkeit wird der Käufer informiert und Zahlungen erstattet.</p>
                <p>(4) Teillieferungen sind zulässig, soweit zumutbar.</p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="font-display text-2xl text-foreground">§ 5 Zahlung</h2>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
                <p>(1) Zahlungsmöglichkeiten:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Kreditkarte (Visa, Mastercard, American Express)</li>
                  <li>PayPal</li>
                  <li>SEPA-Lastschrift</li>
                  <li>Sofortüberweisung (Klarna)</li>
                </ul>
                <p>(2) Zahlung erfolgt vor Lieferung, mit Bestellabschluss fällig.</p>
                <p>(3) Sichere, verschlüsselte Zahlungsabwicklung über Stripe/PayPal.</p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="font-display text-2xl text-foreground">§ 6 Widerrufsrecht</h2>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
                <p>(1) Verbraucher haben ein 14-tägiges Widerrufsrecht (§§ 312g, 355 BGB). Details unter{' '}<Link to="/returns" className="text-accent hover:underline">Widerrufsbelehrung</Link>.</p>
                <p>(2) <strong className="text-foreground">Ausschluss:</strong> Das Widerrufsrecht besteht nicht bei entsiegelten Parfümflakons (§ 312g Abs. 2 Nr. 3 BGB – Hygieneprodukte).</p>
                <p>(3) Rücksendekosten trägt der Käufer bei korrekter Lieferung.</p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="font-display text-2xl text-foreground">§ 7 Eigentumsvorbehalt</h2>
              <div className="text-sm text-muted-foreground leading-relaxed">
                <p>Die Ware bleibt bis zur vollständigen Bezahlung Eigentum des Verkäufers.</p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="font-display text-2xl text-foreground">§ 8 Gewährleistung</h2>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
                <p>(1) Gesetzliche Gewährleistungsrechte (§§ 434 ff. BGB).</p>
                <p>(2) Gewährleistungsfrist: 2 Jahre ab Lieferung.</p>
                <p>(3) Mängel sind unverzüglich, spätestens innerhalb von 14 Tagen nach Entdeckung, anzuzeigen.</p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="font-display text-2xl text-foreground">§ 9 Haftung</h2>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
                <p>(1) Unbeschränkte Haftung bei Schäden an Leben, Körper oder Gesundheit durch vorsätzliche oder fahrlässige Pflichtverletzung.</p>
                <p>(2) Für sonstige Schäden: Haftung nur bei Vorsatz, grober Fahrlässigkeit oder Verletzung wesentlicher Vertragspflichten.</p>
                <p>(3) Produkthaftungsgesetz bleibt unberührt.</p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="font-display text-2xl text-foreground">§ 10 Datenschutz</h2>
              <div className="text-sm text-muted-foreground leading-relaxed">
                <p>Informationen zur Datenverarbeitung in unserer{' '}<Link to="/privacy" className="text-accent hover:underline">Datenschutzerklärung</Link>.</p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="font-display text-2xl text-foreground">§ 11 Online-Streitbeilegung</h2>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
                <p>Die EU-Plattform zur Online-Streitbeilegung (OS-Plattform) wurde zum 20. Juli 2025 eingestellt und steht nicht mehr zur Verfügung.</p>
                <p>E-Mail: support@aldenairperfumes.de</p>
                <p>Wir sind nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="font-display text-2xl text-foreground">§ 12 Schlussbestimmungen</h2>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
                <p>(1) Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts.</p>
                <p>(2) Erfüllungsort ist der Sitz des Verkäufers.</p>
                <p>(3) Gerichtsstand ist, soweit zulässig, der Sitz des Verkäufers.</p>
                <p>(4) Salvatorische Klausel: Unwirksame Bestimmungen werden durch gesetzliche Regelungen ersetzt.</p>
              </div>
            </div>

            {/* Abonnements */}
            <div className="pt-8 border-t border-border space-y-12">
              <h2 className="font-display text-2xl text-foreground">Besondere Bedingungen: Duft-Abonnements</h2>
              <div className="space-y-6">
                <h3 className="font-medium text-lg text-foreground">§ A1 Gegenstand des Abonnements</h3>
                <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
                  <p>(1) Regelmäßige Lieferung des gewählten Produkts (monatlich, alle zwei Monate oder vierteljährlich).</p>
                  <p>(2) Abonnenten erhalten 15% Rabatt und kostenlosen Versand.</p>
                </div>
              </div>
              <div className="space-y-6">
                <h3 className="font-medium text-lg text-foreground">§ A2 Laufzeit und Kündigung</h3>
                <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
                  <p>(1) Keine Mindestlaufzeit.</p>
                  <p>(2) Jederzeit kündbar über das Kundenkonto.</p>
                </div>
              </div>
              <div className="space-y-6">
                <h3 className="font-medium text-lg text-foreground">§ A3 Zahlung</h3>
                <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
                  <p>(1) Automatische Abbuchung zum Lieferzeitpunkt.</p>
                  <p>(2) E-Mail-Benachrichtigung vor jeder Abbuchung.</p>
                </div>
              </div>
            </div>

            {/* Gewinnspiele */}
            <div className="pt-8 border-t border-border space-y-12">
              <h2 className="font-display text-2xl text-foreground">Besondere Bedingungen: Gewinnspiele</h2>
              <div className="space-y-6">
                <h3 className="font-medium text-lg text-foreground">Teilnahmeberechtigung</h3>
                <div className="text-sm text-muted-foreground leading-relaxed">
                  <p>Natürliche Personen ab 18 Jahren mit Wohnsitz in Deutschland. Eine Teilnahme pro Person. Mitarbeiter und Angehörige ausgeschlossen.</p>
                </div>
              </div>
              <div className="space-y-6">
                <h3 className="font-medium text-lg text-foreground">Gewinnermittlung</h3>
                <div className="text-sm text-muted-foreground leading-relaxed">
                  <p>Zufallsverfahren nach Ende des Gewinnspiels. Benachrichtigung per E-Mail. Keine Barauszahlung. Der Rechtsweg ist ausgeschlossen.</p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-border space-y-6">
              <h2 className="font-display text-2xl text-foreground">Kontakt</h2>
              <p className="text-sm text-muted-foreground">Bei Fragen: support@aldenairperfumes.de</p>
              <p className="text-xs text-muted-foreground">Stand: Februar 2026</p>
            </div>
          </div>
        </div>
      </section>
    </PremiumPageLayout>
  );
}