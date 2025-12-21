import { Seo } from "@/components/Seo";
import { PageLayout } from "@/components/PageLayout";

export default function ReturnsPage() {
  return (
    <PageLayout>
      <Seo
        title="Rückgabe | ALDENAIR"
        description="Rückgabe- und Widerrufsinformationen von ALDENAIR."
        canonicalPath="/returns"
      />

      <header className="mb-8">
        <h1 className="text-3xl font-bold">Rückgabe</h1>
        <p className="text-muted-foreground mt-2">
          Informationen zu Rückgabe, Widerruf und Erstattung.
        </p>
      </header>

      <section className="prose prose-neutral dark:prose-invert max-w-none">
        <h2>Widerrufsrecht</h2>
        <p>… (bitte rechtlich korrekte Widerrufsbelehrung einfügen)</p>

        <h2>Rücksendeprozess</h2>
        <ol>
          <li>Kundenservice kontaktieren</li>
          <li>Rücksendeadresse erhalten</li>
          <li>Ware sicher verpacken und zurücksenden</li>
        </ol>

        <h2>Erstattung</h2>
        <p>…</p>
      </section>
    </PageLayout>
  );
}
