import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { PremiumPageLayout } from '@/components/premium/PremiumPageLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Seo } from '@/components/Seo';
import { FAQSchema, BreadcrumbSchema } from '@/components/seo';

const faqData = [
  {
    category: "Bestellung & Lieferung",
    questions: [
      {
        question: "Wie lange dauert die Lieferung?",
        answer: "Die Lieferzeit beträgt 3-5 Werktage innerhalb Deutschlands mit unserem Standardversand. Sie erhalten eine Versandbestätigung mit Tracking-Informationen per E-Mail."
      },
      {
        question: "Was kostet der Versand?",
        answer: "Der Standardversand kostet 4,99€ innerhalb Deutschlands. Ab einem Bestellwert von 50€ ist der Standardversand kostenlos!"
      },
      {
        question: "In welche Länder liefern Sie?",
        answer: "Wir liefern innerhalb Deutschlands und in alle EU-Länder. Für EU-Lieferungen berechnen wir 15,99€ Versandkosten."
      },
    ]
  },
  {
    category: "Produkte & Qualität",
    questions: [
      {
        question: "Sind Ihre Parfüms original?",
        answer: "Ja, alle unsere Parfüms sind Eigenproduktionen und werden nach höchsten Qualitätsstandards hergestellt. Wir garantieren für die Qualität und Echtheit aller Produkte."
      },
      {
        question: "Wie sollte ich Parfüm richtig lagern?",
        answer: "Lagern Sie Parfüm an einem kühlen, dunklen Ort, fern von direktem Sonnenlicht und Temperaturschwankungen. Das Badezimmer ist nicht ideal aufgrund der Feuchtigkeit."
      },
      {
        question: "Bieten Sie Proben an?",
        answer: "Ja! Wir bieten 2ml Proben unserer Parfüms an, damit Sie neue Düfte risikofrei testen können. Perfekt, um Ihren neuen Lieblingsduft zu finden."
      },
    ]
  },
  {
    category: "Rückgabe & Umtausch",
    questions: [
      {
        question: "Kann ich meine Bestellung zurückgeben?",
        answer: "Ja, Sie haben 14 Tage Rückgaberecht ab Erhalt der Ware. Parfüms müssen ungeöffnet und in originalverpacktem Zustand sein."
      },
      {
        question: "Wann erhalte ich mein Geld zurück?",
        answer: "Nach Eingang und Prüfung Ihrer Retoure durch unser Team erstatten wir den Kaufpreis innerhalb von 5-7 Werktagen auf Ihr ursprüngliches Zahlungsmittel."
      },
    ]
  },
  {
    category: "Zahlung & Sicherheit",
    questions: [
      {
        question: "Welche Zahlungsmethoden akzeptieren Sie?",
        answer: "Wir bieten verschiedene Zahlungsmethoden: Kreditkarte, SEPA, Apple Pay und Google Pay über Stripe (empfohlen), PayPal, und klassische Banküberweisung."
      },
      {
        question: "Ist meine Zahlung sicher?",
        answer: "Ja, alle Zahlungen werden über SSL-Verschlüsselung und Stripe abgewickelt, einem der führenden Zahlungsanbieter weltweit."
      },
    ]
  },
  {
    category: "Konto & Service",
    questions: [
      {
        question: "Muss ich ein Konto erstellen?",
        answer: "Nein, Sie können auch als Gast bestellen. Mit einem Konto haben Sie jedoch Vorteile: 5% Cashback, Bestellhistorie, Adressverwaltung und Zugang zu exklusiven Angeboten."
      },
      {
        question: "Wie erreiche ich den Kundenservice?",
        answer: "Sie können uns über unser Kontaktformular oder per E-Mail erreichen. Wir antworten in der Regel innerhalb von 24 Stunden auf alle Anfragen."
      },
    ]
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-5 text-left"
      >
        <span className="text-sm lg:text-base font-medium text-foreground pr-4">
          {question}
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-muted-foreground transition-transform duration-300 flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`} 
          strokeWidth={1.5} 
        />
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96 pb-5' : 'max-h-0'
        }`}
      >
        <p className="text-sm text-muted-foreground leading-relaxed pr-8">
          {answer}
        </p>
      </div>
    </div>
  );
}

export default function FAQ() {
  // Flatten all FAQs for schema
  const allFaqs = useMemo(() => 
    faqData.flatMap(cat => cat.questions),
    []
  );

  return (
    <PremiumPageLayout>
      <Seo
        title="FAQ | ALDENAIR"
        description="Häufig gestellte Fragen zu Bestellung, Lieferung, Rückgabe und mehr bei ALDENAIR."
        canonicalPath="/faq"
      />
      <FAQSchema faqs={allFaqs} />
      <BreadcrumbSchema 
        items={[
          { name: 'Startseite', url: 'https://aldenairperfumes.de' },
          { name: 'FAQ', url: 'https://aldenairperfumes.de/faq' }
        ]} 
      />

      {/* Header */}
      <section className="border-b border-border">
        <div className="container-premium py-8 lg:py-12">
          <Breadcrumb className="mb-6" />
          
          <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-3">
            Hilfe
          </span>
          <h1 className="font-display text-3xl lg:text-4xl text-foreground mb-4">
            Häufig gestellte Fragen
          </h1>
          <p className="text-muted-foreground max-w-xl text-sm lg:text-base">
            Hier finden Sie Antworten auf die häufigsten Fragen zu unserem Service.
          </p>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="section-spacing">
        <div className="container-premium">
          <div className="max-w-3xl mx-auto space-y-10 lg:space-y-12">
            {faqData.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h2 className="text-[10px] tracking-[0.2em] uppercase text-accent mb-4 lg:mb-6">
                  {category.category}
                </h2>
                <div className="border-t border-border">
                  {category.questions.map((faq, faqIndex) => (
                    <FAQItem 
                      key={faqIndex} 
                      question={faq.question} 
                      answer={faq.answer} 
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="section-spacing bg-secondary/30">
        <div className="container-premium">
          <div className="max-w-xl mx-auto text-center">
            <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-3">
              Weitere Fragen?
            </span>
            <h2 className="font-display text-2xl lg:text-3xl text-foreground mb-4">
              Wir helfen gerne weiter
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Konnten wir Ihre Frage nicht beantworten? Kontaktieren Sie uns direkt.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center px-6 py-3 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors"
            >
              Kontakt aufnehmen
              <ArrowRight className="ml-2 w-4 h-4" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </section>
    </PremiumPageLayout>
  );
}
