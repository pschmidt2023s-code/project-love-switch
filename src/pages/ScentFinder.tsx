import { PremiumPageLayout } from '@/components/premium/PremiumPageLayout';
import { ScentQuiz } from '@/components/features/ScentQuiz';
import { Seo } from '@/components/Seo';

export default function ScentFinder() {
  return (
    <PremiumPageLayout>
      <Seo 
        title="Duft-Finder | ALDENAIR" 
        description="Finde deinen perfekten Duft mit unserem interaktiven Quiz. Beantworte ein paar Fragen und erhalte personalisierte Empfehlungen."
        canonicalPath="/scent-finder"
      />

      {/* Header */}
      <section className="py-8 lg:py-12 border-b border-border">
        <div className="container-premium text-center">
          <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-4">
            Duft-Finder
          </span>
          <h1 className="font-display text-3xl lg:text-4xl text-foreground mb-4">
            Finde deinen perfekten Duft
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Beantworte ein paar Fragen und wir empfehlen dir den idealen Duft 
            basierend auf deinen Präferenzen.
          </p>
        </div>
      </section>

      {/* Quiz */}
      <ScentQuiz />
    </PremiumPageLayout>
  );
}
