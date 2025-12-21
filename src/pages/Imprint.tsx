import { Seo } from "@/components/Seo";
import { PageLayout } from "@/components/PageLayout";

export default function ImprintPage() {
  return (
    <PageLayout>
      <Seo
        title="Impressum | ALDENAIR"
        description="Impressum von ALDENAIR. Anbieterkennzeichnung und Kontaktinformationen."
        canonicalPath="/imprint"
      />

      <header className="mb-8">
        <h1 className="text-3xl font-bold">Impressum</h1>
        <p className="text-muted-foreground mt-2">
          Bitte trage hier deine offiziellen Impressumsdaten ein.
        </p>
      </header>

      <section className="prose prose-neutral dark:prose-invert max-w-none">
        <h2>Anbieter</h2>
        <p>
          <strong>ALDENAIR</strong>
          <br />
          Straße Hausnummer
          <br />
          PLZ Ort
          <br />
          Deutschland
        </p>

        <h2>Kontakt</h2>
        <p>
          E-Mail: <em>info@aldenair.de</em>
          <br />
          Telefon: <em>+49 ...</em>
        </p>

        <h2>Umsatzsteuer</h2>
        <p>
          Umsatzsteuer-ID: <em>DE...</em>
        </p>

        <h2>Hinweis</h2>
        <p>
          Dies ist ein Platzhalter. Bitte ersetze die Inhalte durch deine rechtlich korrekten Angaben.
        </p>
      </section>
    </PageLayout>
  );
}
