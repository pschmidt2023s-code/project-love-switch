import { Seo } from "@/components/Seo";
import { PageLayout } from "@/components/PageLayout";

export default function TermsPage() {
  return (
    <PageLayout>
      <Seo
        title="AGB | ALDENAIR"
        description="Allgemeine Geschäftsbedingungen (AGB) von ALDENAIR."
        canonicalPath="/terms"
      />

      <header className="mb-8">
        <h1 className="text-3xl font-bold">AGB</h1>
        <p className="text-muted-foreground mt-2">
          Platzhalter – bitte füge hier deine vollständigen AGB ein.
        </p>
      </header>

      <section className="prose prose-neutral dark:prose-invert max-w-none">
        <h2>1. Geltungsbereich</h2>
        <p>…</p>

        <h2>2. Vertragsschluss</h2>
        <p>…</p>

        <h2>3. Preise & Zahlung</h2>
        <p>…</p>

        <h2>4. Lieferung</h2>
        <p>…</p>

        <h2>5. Widerruf & Rückgabe</h2>
        <p>…</p>

        <h2>Hinweis</h2>
        <p>
          Dies ist ein Platzhalter und keine Rechtsberatung. Bitte ersetze die Inhalte durch deine rechtlich geprüften AGB.
        </p>
      </section>
    </PageLayout>
  );
}
