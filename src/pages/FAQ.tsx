import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ArrowRight, Search } from 'lucide-react';
import { PremiumPageLayout } from '@/components/premium/PremiumPageLayout';
import { Seo } from '@/components/Seo';
import { FAQSchema, BreadcrumbSchema } from '@/components/seo';

const faqData = [
  {
    category: "Bestellung & Lieferung",
    questions: [
      { question: "Wie lange dauert die Lieferung?", answer: "Die Lieferzeit beträgt 3-5 Werktage innerhalb Deutschlands mit unserem Standardversand. Sie erhalten eine Versandbestätigung mit Tracking-Informationen per E-Mail." },
      { question: "Was kostet der Versand?", answer: "Der Standardversand kostet 4,99€ innerhalb Deutschlands. Ab einem Bestellwert von 50€ ist der Standardversand kostenlos!" },
      { question: "In welche Länder liefern Sie?", answer: "Wir liefern innerhalb Deutschlands und in alle EU-Länder. Für EU-Lieferungen berechnen wir 15,99€ Versandkosten." },
    ]
  },
  {
    category: "Produkte & Qualität",
    questions: [
      { question: "Sind Ihre Parfüms original?", answer: "Ja, alle unsere Parfüms sind Eigenproduktionen und werden nach höchsten Qualitätsstandards hergestellt. Wir garantieren für die Qualität und Echtheit aller Produkte." },
      { question: "Wie sollte ich Parfüm richtig lagern?", answer: "Lagern Sie Parfüm an einem kühlen, dunklen Ort, fern von direktem Sonnenlicht und Temperaturschwankungen. Das Badezimmer ist nicht ideal aufgrund der Feuchtigkeit." },
      { question: "Bieten Sie Proben an?", answer: "Ja! Wir bieten 2ml Proben unserer Parfüms an, damit Sie neue Düfte risikofrei testen können." },
    ]
  },
  {
    category: "Rückgabe & Umtausch",
    questions: [
      { question: "Kann ich meine Bestellung zurückgeben?", answer: "Ja, Sie haben 14 Tage Rückgaberecht ab Erhalt der Ware. Parfüms müssen ungeöffnet und in originalverpacktem Zustand sein." },
      { question: "Wann erhalte ich mein Geld zurück?", answer: "Nach Eingang und Prüfung Ihrer Retoure durch unser Team erstatten wir den Kaufpreis innerhalb von 5-7 Werktagen auf Ihr ursprüngliches Zahlungsmittel." },
    ]
  },
  {
    category: "Zahlung & Sicherheit",
    questions: [
      { question: "Welche Zahlungsmethoden akzeptieren Sie?", answer: "Wir bieten verschiedene Zahlungsmethoden: Kreditkarte, SEPA, Apple Pay und Google Pay über Stripe (empfohlen), PayPal, und klassische Banküberweisung." },
      { question: "Ist meine Zahlung sicher?", answer: "Ja, alle Zahlungen werden über SSL-Verschlüsselung und Stripe abgewickelt, einem der führenden Zahlungsanbieter weltweit." },
    ]
  },
  {
    category: "Konto & Service",
    questions: [
      { question: "Muss ich ein Konto erstellen?", answer: "Nein, Sie können auch als Gast bestellen. Mit einem Konto haben Sie jedoch Vorteile: 5% Cashback, Bestellhistorie, Adressverwaltung und Zugang zu exklusiven Angeboten." },
      { question: "Wie erreiche ich den Kundenservice?", answer: "Sie können uns über unser Kontaktformular oder per E-Mail erreichen. Wir antworten in der Regel innerhalb von 24 Stunden auf alle Anfragen." },
    ]
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-full py-5 text-left">
        <span className="text-sm lg:text-base font-medium text-foreground pr-4">{question}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} strokeWidth={1.5} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-5' : 'max-h-0'}`}>
        <p className="text-sm text-muted-foreground leading-relaxed pr-8">{answer}</p>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const allFaqs = useMemo(() => faqData.flatMap(cat => cat.questions), []);

  const filteredFaqs = useMemo(() => {
    if (!searchQuery) return null;
    return allFaqs.filter(faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allFaqs]);

  return (
    <PremiumPageLayout>
      <Seo title="FAQ | ALDENAIR" description="Häufig gestellte Fragen zu Bestellung, Lieferung, Rückgabe und mehr bei ALDENAIR." canonicalPath="/faq" />
      <FAQSchema faqs={allFaqs} />
      <BreadcrumbSchema items={[{ name: 'Startseite', url: 'https://aldenairperfumes.de' }, { name: 'FAQ', url: 'https://aldenairperfumes.de/faq' }]} />

      {/* Centered hero with search */}
      <section className="py-16 lg:py-24 text-center">
        <div className="container-premium">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-foreground mb-4">
            Wie können wir helfen?
          </h1>
          <p className="text-muted-foreground text-sm lg:text-base mb-10 max-w-md mx-auto">
            Durchsuchen Sie unsere FAQ oder wählen Sie eine Kategorie.
          </p>
          
          {/* Search */}
          <div className="max-w-lg mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Frage suchen..."
              className="w-full pl-12 pr-4 py-4 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>
      </section>

      {/* Category tabs + FAQ content */}
      <section className="pb-16 lg:pb-24">
        <div className="container-premium">
          {filteredFaqs ? (
            /* Search results */
            <div className="max-w-3xl mx-auto">
              <p className="text-sm text-muted-foreground mb-6">{filteredFaqs.length} Ergebnisse</p>
              <div className="border-t border-border">
                {filteredFaqs.map((faq, i) => (
                  <FAQItem key={i} question={faq.question} answer={faq.answer} />
                ))}
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-16">
              {/* Side nav */}
              <nav className="lg:col-span-3 lg:sticky lg:top-28 lg:self-start">
                <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0">
                  {faqData.map((cat, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveCategory(i)}
                      className={`whitespace-nowrap text-left px-4 py-3 text-sm font-medium transition-colors ${
                        activeCategory === i
                          ? 'bg-foreground text-background'
                          : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      {cat.category}
                    </button>
                  ))}
                </div>
              </nav>

              {/* FAQ Items */}
              <div className="lg:col-span-9">
                <h2 className="text-[10px] tracking-[0.2em] uppercase text-accent mb-6">
                  {faqData[activeCategory].category}
                </h2>
                <div className="border-t border-border">
                  {faqData[activeCategory].questions.map((faq, i) => (
                    <FAQItem key={i} question={faq.question} answer={faq.answer} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20 border-t border-border">
        <div className="container-premium text-center">
          <h2 className="font-display text-2xl lg:text-3xl text-foreground mb-4">
            Noch Fragen?
          </h2>
          <p className="text-muted-foreground text-sm mb-8">
            Unser Team hilft Ihnen gerne weiter.
          </p>
          <Link to="/contact" className="inline-flex items-center px-8 py-4 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors">
            Kontakt aufnehmen
            <ArrowRight className="ml-2 w-4 h-4" strokeWidth={1.5} />
          </Link>
        </div>
      </section>
    </PremiumPageLayout>
  );
}
