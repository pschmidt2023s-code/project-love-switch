import { Link } from 'react-router-dom';
import { PremiumPageLayout } from '@/components/premium/PremiumPageLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Seo } from '@/components/Seo';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

export default function Privacy() {
  return (
    <PremiumPageLayout>
      <Seo
        title="Datenschutzerklärung | ALDENAIR"
        description="Informationen zum Schutz Ihrer persönlichen Daten gemäß DSGVO bei ALDENAIR."
        canonicalPath="/privacy"
      />

      {/* Header */}
      <section className="border-b border-border">
        <div className="container-premium py-8 lg:py-12">
          <Breadcrumb className="mb-6" />
          <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-3">Rechtliches</span>
          <h1 className="font-display text-3xl lg:text-4xl text-foreground mb-4">
            Datenschutzerklärung
          </h1>
          <p className="text-muted-foreground max-w-xl text-sm lg:text-base leading-relaxed">
            Der Schutz Ihrer persönlichen Daten ist uns wichtig. Erfahren Sie,
            wie wir Ihre Daten gemäß DSGVO verarbeiten und schützen.
          </p>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="border-b border-border">
        <div className="container-premium py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Shield, label: 'DSGVO-konform' },
              { icon: Lock, label: 'SSL-verschlüsselt' },
              { icon: Eye, label: 'Transparente Nutzung' },
              { icon: FileText, label: 'Ihre Rechte' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <item.icon className="w-4 h-4 text-accent" strokeWidth={1.5} />
                <span className="text-sm text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section-spacing">
        <div className="container-premium">
          <div className="max-w-3xl space-y-16">

            <div className="space-y-6">
              <h2 className="font-display text-2xl text-foreground">1. Verantwortlicher</h2>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
                <p>Verantwortlicher im Sinne der DSGVO:</p>
                <p className="text-foreground">
                  Aldenair<br />Patric-Maurice Schmidt<br />BGM.-Scheller-Str. 14<br />96215 Lichtenfels<br />Deutschland
                </p>
                <p>E-Mail: support@aldenairperfumes.de</p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="font-display text-2xl text-foreground">2. Erhebung und Speicherung personenbezogener Daten</h2>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
                <p>Wir erheben und verwenden personenbezogene Daten nur, soweit dies zur Bereitstellung einer funktionsfähigen Website sowie unserer Inhalte und Leistungen erforderlich ist.</p>
                <p><strong className="text-foreground">Beim Besuch der Website</strong> werden automatisch folgende Informationen erfasst:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>IP-Adresse des anfragenden Rechners</li>
                  <li>Datum und Uhrzeit des Zugriffs</li>
                  <li>Name und URL der abgerufenen Datei</li>
                  <li>Website, von der aus der Zugriff erfolgt (Referrer-URL)</li>
                  <li>Verwendeter Browser und Betriebssystem</li>
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="font-display text-2xl text-foreground">3. Zwecke der Datenverarbeitung</h2>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
                <p>Ihre personenbezogenen Daten werden zu folgenden Zwecken verarbeitet:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Abwicklung von Bestellungen und Verträgen (Art. 6 Abs. 1 lit. b DSGVO)</li>
                  <li>Kundenservice und Kommunikation (Art. 6 Abs. 1 lit. b DSGVO)</li>
                  <li>Versand von Produkten (Art. 6 Abs. 1 lit. b DSGVO)</li>
                  <li>Zahlungsabwicklung (Art. 6 Abs. 1 lit. b DSGVO)</li>
                  <li>Erfüllung rechtlicher Verpflichtungen (Art. 6 Abs. 1 lit. c DSGVO)</li>
                  <li>Marketing und Newsletter bei Einwilligung (Art. 6 Abs. 1 lit. a DSGVO)</li>
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="font-display text-2xl text-foreground">4. Speicherdauer</h2>
              <div className="text-sm text-muted-foreground leading-relaxed">
                <div className="space-y-0">
                  {[
                    { label: 'Bestelldaten', value: '10 Jahre (§ 147 AO, § 257 HGB)' },
                    { label: 'Rechnungsdaten', value: '10 Jahre' },
                    { label: 'Kundenkonto-Daten', value: 'Bis zur Löschung des Kontos' },
                    { label: 'Newsletter-Daten', value: 'Bis zum Widerruf' },
                    { label: 'Server-Logfiles', value: '7 Tage' },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between py-3 border-b border-border">
                      <span>{item.label}</span>
                      <span>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="font-display text-2xl text-foreground">5. Weitergabe an Dritte</h2>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-6">
                <p>Eine Übermittlung Ihrer Daten an Dritte erfolgt nur zur Vertragserfüllung. Wir setzen folgende Dienstleister ein:</p>
                <div className="p-6 border border-border space-y-2">
                  <p className="text-foreground font-medium">Stripe, Inc.</p>
                  <p>354 Oyster Point Blvd, South San Francisco, CA 94080, USA</p>
                  <p>Zweck: Abwicklung von Kreditkartenzahlungen</p>
                  <a href="https://stripe.com/de/privacy" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Datenschutzerklärung →</a>
                </div>
                <div className="p-6 border border-border space-y-2">
                  <p className="text-foreground font-medium">PayPal (Europe) S.à r.l. et Cie, S.C.A.</p>
                  <p>22-24 Boulevard Royal, L-2449 Luxembourg</p>
                  <p>Zweck: Abwicklung von PayPal-Zahlungen</p>
                  <a href="https://www.paypal.com/de/webapps/mpp/ua/privacy-full" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Datenschutzerklärung →</a>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="font-display text-2xl text-foreground">6. Ihre Rechte</h2>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
                <p>Sie haben folgende Rechte:</p>
                <ul className="space-y-3">
                  {[
                    { right: 'Auskunft', desc: 'Art. 15 DSGVO – Auskunft über Ihre verarbeiteten Daten' },
                    { right: 'Berichtigung', desc: 'Art. 16 DSGVO – Berichtigung unrichtiger Daten' },
                    { right: 'Löschung', desc: 'Art. 17 DSGVO – Löschung Ihrer Daten' },
                    { right: 'Einschränkung', desc: 'Art. 18 DSGVO – Einschränkung der Verarbeitung' },
                    { right: 'Portabilität', desc: 'Art. 20 DSGVO – Datenübertragbarkeit' },
                    { right: 'Widerspruch', desc: 'Art. 21 DSGVO – Widerspruch gegen die Verarbeitung' },
                    { right: 'Widerruf', desc: 'Art. 7 Abs. 3 DSGVO – Widerruf einer Einwilligung' },
                    { right: 'Beschwerde', desc: 'Art. 77 DSGVO – Beschwerde bei der Aufsichtsbehörde' },
                  ].map(item => (
                    <li key={item.right} className="flex gap-3">
                      <span className="text-foreground font-medium w-32 shrink-0">{item.right}</span>
                      <span>{item.desc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="font-display text-2xl text-foreground">7. Cookies</h2>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
                <p>Unsere Website verwendet Cookies. Technisch notwendige Cookies sind für den Betrieb erforderlich (Art. 6 Abs. 1 lit. f DSGVO). Analyse- und Marketing-Cookies werden nur mit Ihrer Einwilligung gesetzt (§ 25 TDDDG, Art. 6 Abs. 1 lit. a DSGVO).</p>
                <p>Sie können Ihre Einwilligung jederzeit über die Cookie-Einstellungen im Footer widerrufen.</p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="font-display text-2xl text-foreground">8. SSL/TLS-Verschlüsselung</h2>
              <div className="text-sm text-muted-foreground leading-relaxed">
                <p>Diese Seite nutzt aus Sicherheitsgründen eine SSL/TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie an "https://" und dem Schloss-Symbol in Ihrer Browserzeile.</p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="font-display text-2xl text-foreground">9. Kontakt</h2>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
                <p>Bei Fragen zum Datenschutz:</p>
                <p className="text-foreground">E-Mail: support@aldenairperfumes.de<br />Post: ALDENAIR, BGM.-Scheller-Str. 14, 96215 Lichtenfels</p>
              </div>
            </div>

            <div className="pt-8 border-t border-border">
              <p className="text-xs text-muted-foreground">Stand: Dezember 2024</p>
            </div>
          </div>
        </div>
      </section>
    </PremiumPageLayout>
  );
}