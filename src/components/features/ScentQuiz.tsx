import { useState } from 'react';
import { ArrowRight, ArrowLeft, Sparkles, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';

interface QuizStep {
  id: string;
  question: string;
  options: {
    value: string;
    label: string;
    description: string;
    icon?: string;
  }[];
}

const quizSteps: QuizStep[] = [
  {
    id: 'gender',
    question: 'Für wen suchst du einen Duft?',
    options: [
      { value: 'herren', label: 'Für Ihn', description: 'Maskuline, kraftvolle Düfte' },
      { value: 'damen', label: 'Für Sie', description: 'Elegante, feminine Kreationen' },
      { value: 'unisex', label: 'Unisex', description: 'Zeitlose, vielseitige Düfte' },
    ],
  },
  {
    id: 'occasion',
    question: 'Wann möchtest du den Duft tragen?',
    options: [
      { value: 'alltag', label: 'Alltag', description: 'Für Büro und tägliche Aktivitäten' },
      { value: 'abend', label: 'Abend', description: 'Für besondere Anlässe und Dates' },
      { value: 'freizeit', label: 'Freizeit', description: 'Für entspannte Momente' },
      { value: 'sport', label: 'Sport', description: 'Frische, belebende Düfte' },
    ],
  },
  {
    id: 'intensity',
    question: 'Welche Intensität bevorzugst du?',
    options: [
      { value: 'leicht', label: 'Leicht', description: 'Dezent und zurückhaltend' },
      { value: 'mittel', label: 'Mittel', description: 'Ausgewogen und angenehm' },
      { value: 'intensiv', label: 'Intensiv', description: 'Kraftvoll und langanhaltend' },
    ],
  },
  {
    id: 'notes',
    question: 'Welche Duftfamilie spricht dich an?',
    options: [
      { value: 'frisch', label: 'Frisch & Zitrisch', description: 'Zitrus, Minze, grüne Noten' },
      { value: 'blumig', label: 'Blumig', description: 'Rose, Jasmin, Lilie' },
      { value: 'holzig', label: 'Holzig', description: 'Sandelholz, Zeder, Vetiver' },
      { value: 'orientalisch', label: 'Orientalisch', description: 'Vanille, Amber, Moschus' },
    ],
  },
  {
    id: 'season',
    question: 'In welcher Jahreszeit wirst du ihn hauptsächlich tragen?',
    options: [
      { value: 'fruehling', label: 'Frühling', description: 'Leichte, blumige Düfte' },
      { value: 'sommer', label: 'Sommer', description: 'Frische, aquatische Noten' },
      { value: 'herbst', label: 'Herbst', description: 'Warme, würzige Akzente' },
      { value: 'winter', label: 'Winter', description: 'Tiefe, reichhaltige Düfte' },
    ],
  },
];

export function ScentQuiz() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const { products } = useProducts();

  const currentQuestion = quizSteps[currentStep];
  const progress = ((currentStep + 1) / quizSteps.length) * 100;

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: value });
  };

  const handleNext = () => {
    if (currentStep < quizSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setAnswers({});
    setShowResults(false);
  };

  // Simple recommendation logic based on answers
  const getRecommendations = () => {
    const gender = answers.gender;
    
    return products
      .filter(p => {
        if (gender && p.gender) {
          return p.gender.toLowerCase() === gender || p.gender.toLowerCase() === 'unisex';
        }
        return true;
      })
      .slice(0, 3);
  };

  if (showResults) {
    const recommendations = getRecommendations();

    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-12 lg:py-16">
        <div className="container-premium max-w-3xl text-center">
          {/* Result Header */}
          <div className="mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 mb-6">
              <Sparkles className="w-8 h-8 text-accent" strokeWidth={1.5} />
            </div>
            <h2 className="font-display text-3xl lg:text-4xl text-foreground mb-4">
              Deine Duft-Empfehlungen
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Basierend auf deinen Präferenzen haben wir diese Düfte für dich ausgewählt.
            </p>
          </div>

          {/* Recommendations */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-10">
            {recommendations.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.slug}`}
                className="group bg-card border border-border p-5 text-left hover:border-accent transition-colors"
              >
                <div className="aspect-[3/4] bg-muted mb-4 overflow-hidden">
                  <img
                    src={product.image_url || '/placeholder.svg'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <p className="text-[10px] tracking-[0.15em] uppercase text-accent mb-1">
                  {product.inspired_by || 'ALDENAIR'}
                </p>
                <h3 className="font-display text-lg text-foreground mb-2">
                  {product.name}
                </h3>
                <p className="text-sm font-medium text-foreground">
                  ab €{(Number(product.base_price) * 0.25).toFixed(2)}
                </p>
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="inline-flex items-center justify-center px-8 py-4 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors"
            >
              Alle Produkte ansehen
              <ArrowRight className="ml-2 w-4 h-4" strokeWidth={1.5} />
            </Link>
            <button
              onClick={handleRestart}
              className="inline-flex items-center justify-center px-8 py-4 border border-foreground text-foreground text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground hover:text-background transition-colors"
            >
              Quiz wiederholen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col py-12 lg:py-16">
      <div className="container-premium max-w-2xl mx-auto flex-1 flex flex-col">
        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
              Schritt {currentStep + 1} von {quizSteps.length}
            </span>
            <span className="text-[10px] tracking-[0.15em] uppercase text-accent">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-px bg-border">
            <div 
              className="h-full bg-accent transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="flex-1 flex flex-col">
          <h2 className="font-display text-2xl lg:text-3xl text-foreground text-center mb-10">
            {currentQuestion.question}
          </h2>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
            {currentQuestion.options.map((option) => {
              const isSelected = answers[currentQuestion.id] === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className={`relative p-5 text-left border transition-all duration-300 ${
                    isSelected
                      ? 'bg-accent/5 border-accent'
                      : 'bg-card border-border hover:border-accent/50'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-accent flex items-center justify-center">
                      <Check className="w-3 h-3 text-accent-foreground" strokeWidth={2} />
                    </div>
                  )}
                  <h3 className="font-display text-lg text-foreground mb-1">
                    {option.label}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-auto pt-6 border-t border-border">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`inline-flex items-center px-6 py-3 text-[11px] tracking-[0.1em] uppercase font-medium transition-colors ${
                currentStep === 0
                  ? 'text-muted-foreground cursor-not-allowed'
                  : 'text-foreground hover:text-accent'
              }`}
            >
              <ArrowLeft className="mr-2 w-4 h-4" strokeWidth={1.5} />
              Zurück
            </button>

            <button
              onClick={handleNext}
              disabled={!answers[currentQuestion.id]}
              className={`inline-flex items-center px-8 py-3 text-[11px] tracking-[0.15em] uppercase font-medium transition-all ${
                answers[currentQuestion.id]
                  ? 'bg-foreground text-background hover:bg-foreground/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              {currentStep === quizSteps.length - 1 ? 'Ergebnisse anzeigen' : 'Weiter'}
              <ArrowRight className="ml-2 w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
