import { Seo } from "@/components/Seo";
import { PageLayout } from "@/components/PageLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    q: "Welche Zahlungsmethoden werden akzeptiert?",
    a: "Du kannst mit Karte (Stripe) oder PayPal bezahlen.",
  },
  {
    q: "Wie hoch sind die Versandkosten?",
    a: "Versandkosten werden im Checkout angezeigt. Ab einem bestimmten Bestellwert ist der Versand kostenlos.",
  },
  {
    q: "Wie lange dauert der Versand?",
    a: "In der Regel 2–4 Werktage innerhalb Deutschlands (je nach Versandoption).",
  },
  {
    q: "Kann ich meine Bestellung zurücksenden?",
    a: "Ja, du hast ein Rückgaberecht. Details findest du in der Rückgabe-Seite.",
  },
];

export default function FAQPage() {
  return (
    <PageLayout>
      <Seo
        title="FAQ | ALDENAIR"
        description="Antworten auf häufige Fragen zu Versand, Zahlung, Rückgabe und Produkten bei ALDENAIR."
        canonicalPath="/faq"
      />

      <header className="mb-8">
        <h1 className="text-3xl font-bold">FAQ</h1>
        <p className="text-muted-foreground mt-2">
          Häufige Fragen rund um Bestellung, Versand, Zahlung und Rückgabe.
        </p>
      </header>

      <section aria-label="Häufige Fragen">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f) => (
            <AccordionItem key={f.q} value={f.q}>
              <AccordionTrigger>{f.q}</AccordionTrigger>
              <AccordionContent>{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </PageLayout>
  );
}
