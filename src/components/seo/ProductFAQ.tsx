import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQSchema } from './FAQSchema';

interface ProductFAQProps {
  productName: string;
  inspiredBy?: string | null;
}

export function ProductFAQ({ productName, inspiredBy }: ProductFAQProps) {
  const faqs = [
    {
      question: `Wie lange hält ${productName}?`,
      answer: `${productName} von ALDENAIR hält in der Regel 8+ Stunden auf der Haut. Die Haltbarkeit kann je nach Hauttyp, Temperatur und Auftragstechnik variieren. Für beste Ergebnisse auf Pulspunkte auftragen.`,
    },
    {
      question: `Ist ${productName} ein Originalparfüm?`,
      answer: `${productName} ist ein eigenständig entwickeltes Premium Eau de Parfum von ALDENAIR${inspiredBy ? `, inspiriert von ${inspiredBy}` : ''}. Wir verwenden hochwertige Inhaltsstoffe und garantieren erstklassige Qualität.`,
    },
    {
      question: `Für wen ist ${productName} geeignet?`,
      answer: `${productName} eignet sich hervorragend für den täglichen Gebrauch sowie besondere Anlässe. Die Duftkomposition ist vielseitig und zeitlos – perfekt für selbstbewusste Persönlichkeiten.`,
    },
    {
      question: `Kann ich ${productName} zurückgeben?`,
      answer: `Ja, Sie haben bei ALDENAIR ein 14-tägiges Rückgaberecht. Ungeöffnete Produkte können in der Originalverpackung zurückgesendet werden. Kontaktieren Sie unseren Kundenservice für eine unkomplizierte Abwicklung.`,
    },
    {
      question: `Wie wird ${productName} am besten gelagert?`,
      answer: `Lagern Sie ${productName} an einem kühlen, trockenen Ort, geschützt vor direktem Sonnenlicht und Temperaturschwankungen. Vermeiden Sie die Aufbewahrung im Badezimmer aufgrund der hohen Luftfeuchtigkeit.`,
    },
  ];

  return (
    <section className="py-10 lg:py-16 border-t border-border">
      <FAQSchema faqs={faqs} />
      <div className="container-premium">
        <div className="text-center mb-8">
          <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-2">
            FAQ
          </span>
          <h2 className="font-display text-2xl lg:text-3xl text-foreground mb-2">
            Häufige Fragen zu {productName}
          </h2>
        </div>

        <div className="max-w-2xl mx-auto">
          {faqs.map((faq, i) => (
            <FAQItem key={i} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-5 text-left"
      >
        <span className="text-sm font-medium text-foreground pr-4">{question}</span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          strokeWidth={1.5}
        />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-5' : 'max-h-0'}`}>
        <p className="text-sm text-muted-foreground leading-relaxed pr-8">{answer}</p>
      </div>
    </div>
  );
}
