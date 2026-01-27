import { PremiumPageLayout } from '@/components/premium/PremiumPageLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Seo } from '@/components/Seo';

export default function Imprint() {
  return (
    <PremiumPageLayout>
      <Seo
        title="Impressum | ALDENAIR"
        description="Rechtliche Angaben und Impressum von ALDENAIR Perfumes."
        canonicalPath="/imprint"
      />

      {/* Header */}
      <section className="border-b border-border">
        <div className="container-premium py-8 lg:py-12">
          <Breadcrumb className="mb-6" />
          
          <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-3">
            Rechtliches
          </span>
          <h1 className="font-display text-3xl lg:text-4xl text-foreground mb-4">
            Impressum
          </h1>
          <p className="text-muted-foreground max-w-xl text-sm lg:text-base">
            Rechtliche Angaben gemäß § 5 DDG
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="section-spacing">
        <div className="container-premium">
          <div className="max-w-3xl mx-auto space-y-12">
            
            {/* Angaben gemäß § 5 DDG */}
            <div className="space-y-4">
              <h2 className="text-[10px] tracking-[0.2em] uppercase text-accent">
                Angaben gemäß § 5 DDG
              </h2>
              <div className="text-sm text-muted-foreground leading-relaxed">
                <p className="font-medium text-foreground mb-2">Aldenair</p>
                <p>Patric-Maurice Schmidt</p>
                <p>BGM.-Scheller-Str. 14</p>
                <p>96215 Lichtenfels</p>
                <p>Deutschland</p>
              </div>
            </div>

            {/* Kontakt */}
            <div className="space-y-4">
              <h2 className="text-[10px] tracking-[0.2em] uppercase text-accent">
                Kontakt
              </h2>
              <div className="text-sm text-muted-foreground leading-relaxed">
                <p>Telefon: Auf Anfrage per E-Mail</p>
                <p>E-Mail: support@aldenairperfumes.de</p>
                <p>Website: www.aldenairperfumes.de</p>
              </div>
            </div>

            {/* USt-ID */}
            <div className="space-y-4">
              <h2 className="text-[10px] tracking-[0.2em] uppercase text-accent">
                Umsatzsteuer-Identifikationsnummer
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:<br />
                <em>Wird bei der Finanzbehörde beantragt / nicht erforderlich (Kleinunternehmerregelung)</em>
              </p>
            </div>

            {/* Verantwortlich */}
            <div className="space-y-4">
              <h2 className="text-[10px] tracking-[0.2em] uppercase text-accent">
                Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
              </h2>
              <div className="text-sm text-muted-foreground leading-relaxed">
                <p>Patric-Maurice Schmidt</p>
                <p>BGM.-Scheller-Str. 14</p>
                <p>96215 Lichtenfels</p>
              </div>
            </div>

            {/* EU-Streitschlichtung */}
            <div className="space-y-4">
              <h2 className="text-[10px] tracking-[0.2em] uppercase text-accent">
                EU-Streitschlichtung
              </h2>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
                <p>
                  Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
                  <a
                    href="https://ec.europa.eu/consumers/odr/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    https://ec.europa.eu/consumers/odr/
                  </a>
                </p>
                <p>Unsere E-Mail-Adresse finden Sie oben im Impressum.</p>
                <p className="text-xs italic">
                  Hinweis: Die EU-Streitschlichtungsplattform (OS-Plattform) nimmt ab dem 20. März 2025 keine neuen Beschwerden mehr an und wird zum 20. Juli 2025 eingestellt.
                </p>
              </div>
            </div>

            {/* Verbraucherstreitbeilegung */}
            <div className="space-y-4">
              <h2 className="text-[10px] tracking-[0.2em] uppercase text-accent">
                Verbraucherstreitbeilegung
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </div>

            {/* Haftungsausschluss */}
            <div className="space-y-6">
              <h2 className="text-[10px] tracking-[0.2em] uppercase text-accent">
                Haftungsausschluss
              </h2>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground">Haftung für Inhalte</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground">Haftung für Links</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground">Urheberrecht</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
                </p>
              </div>
            </div>

            {/* Produktsicherheit */}
            <div className="space-y-4">
              <h2 className="text-[10px] tracking-[0.2em] uppercase text-accent">
                Hinweise zur Produktsicherheit (EU 2023/988)
              </h2>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
                <p>
                  Gemäß der EU-Produktsicherheitsverordnung (EU) 2023/988, gültig ab 13. Dezember 2024:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong className="text-foreground">Hersteller:</strong> ALDENAIR, Patric-Maurice Schmidt, BGM.-Scheller-Str. 14, 96215 Lichtenfels, Deutschland</li>
                  <li><strong className="text-foreground">Verantwortliche Person in der EU:</strong> Patric-Maurice Schmidt (Adresse wie oben)</li>
                  <li><strong className="text-foreground">Kontakt für Produktsicherheit:</strong> support@aldenairperfumes.de</li>
                </ul>
                <p>
                  Alle Produkte entsprechen den geltenden Sicherheitsvorschriften der Europäischen Union.
                </p>
              </div>
            </div>

            {/* Stand */}
            <div className="pt-8 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Stand: Dezember 2024
              </p>
            </div>

          </div>
        </div>
      </section>
    </PremiumPageLayout>
  );
}