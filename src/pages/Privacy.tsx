import { Seo } from "@/components/Seo";
import { PageLayout } from "@/components/PageLayout";

export default function PrivacyPage() {
  return (
    <PageLayout>
      <Seo
        title="Datenschutz | ALDENAIR"
        description="Datenschutzerklärung von ALDENAIR. Informationen zur Verarbeitung personenbezogener Daten."
        canonicalPath="/privacy"
      />

      <header className="mb-8">
        <h1 className="text-3xl font-bold">Datenschutzerklärung</h1>
        <p className="text-muted-foreground mt-2">
          Platzhalter – bitte füge hier deine vollständige Datenschutzerklärung ein.
        </p>
      </header>

      <section className="prose prose-neutral dark:prose-invert max-w-none">
        <h2>1. Verantwortlicher</h2>
        <p>ALDENAIR, Straße Hausnummer, PLZ Ort, Deutschland</p>

        <h2>2. Welche Daten wir verarbeiten</h2>
        <ul>
          <li>Kontaktdaten (z.B. E-Mail) bei Registrierung/Bestellung</li>
          <li>Bestelldaten (z.B. Produkte, Zahlungsart)</li>
          <li>Technische Daten (z.B. IP-Adresse, Browserdaten) für Sicherheit/Fehleranalyse</li>
        </ul>

        <h2>3. Zwecke</h2>
        <ul>
          <li>Bestellabwicklung</li>
          <li>Kundenservice</li>
          <li>Rechtskonforme Dokumentation</li>
        </ul>

        <h2>Hinweis</h2>
        <p>
          Dies ist ein Platzhalter und keine Rechtsberatung. Bitte ersetze die Inhalte durch deine rechtlich geprüfte Datenschutzerklärung.
        </p>
      </section>
    </PageLayout>
  );
}
