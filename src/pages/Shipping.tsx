import { Seo } from "@/components/Seo";
import { PageLayout } from "@/components/PageLayout";

export default function ShippingPage() {
  return (
    <PageLayout>
      <Seo
        title="Versand | ALDENAIR"
        description="Versandinformationen von ALDENAIR: Lieferzeiten, Versandkosten und Versandoptionen."
        canonicalPath="/shipping"
      />

      <header className="mb-8">
        <h1 className="text-3xl font-bold">Versand</h1>
        <p className="text-muted-foreground mt-2">
          Informationen zu Lieferzeiten, Versandkosten und Optionen.
        </p>
      </header>

      <section className="prose prose-neutral dark:prose-invert max-w-none">
        <h2>Liefergebiet</h2>
        <p>Deutschland, Österreich, Schweiz (Beispiel – bitte anpassen)</p>

        <h2>Lieferzeiten</h2>
        <p>In der Regel 2–4 Werktage (Beispiel – bitte anpassen)</p>

        <h2>Versandkosten</h2>
        <p>Werden im Checkout angezeigt (bitte genaue Werte ergänzen).</p>
      </section>
    </PageLayout>
  );
}
