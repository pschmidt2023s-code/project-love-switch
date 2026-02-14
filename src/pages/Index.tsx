import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PremiumNavigation } from '@/components/premium/PremiumNavigation';
import { PremiumHero } from '@/components/premium/PremiumHero';
import { PremiumFeatures } from '@/components/premium/PremiumFeatures';
import { PremiumSparsets } from '@/components/premium/PremiumSparsets';
import { PremiumProductGrid } from '@/components/premium/PremiumProductGrid';
// ExternalProductsSection removed - Bestseller now uses external API directly
import { PremiumNewsletter } from '@/components/premium/PremiumNewsletter';
import { PremiumFooter } from '@/components/premium/PremiumFooter';
import { OrganizationSchema, WebsiteSchema } from '@/components/StructuredData';
import { LocalBusinessSchema } from '@/components/seo';
import { Seo } from '@/components/Seo';
import { ProductComparison } from '@/components/ProductComparison';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { ProductRecommendations } from '@/components/ai/ProductRecommendations';

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Seo 
        title="ALDENAIR | Premium Parfüms & Exklusive Düfte"
        description="Entdecken Sie ALDENAIR - Premium Parfüms inspiriert von weltbekannten Marken. Hochwertige Düfte zu fairen Preisen. Kostenloser Versand ab 50€."
        canonicalPath="/"
      />
      <OrganizationSchema />
      <WebsiteSchema />
      <LocalBusinessSchema />
      
      <PremiumNavigation />

      <main id="main-content" role="main" aria-label="Hauptinhalt">
        {/* Hero Section */}
        <PremiumHero />

        {/* Features Section */}
        <PremiumFeatures />

        {/* Sparsets Section */}
        <PremiumSparsets />

        {/* Products Section */}
        <section className="py-8 lg:py-12">
          <div className="container-premium">
            {/* Section Header */}
            <div className="text-center mb-6 lg:mb-10">
              <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-2 lg:mb-4">
                Kollektion
              </span>
              <h2 className="font-display text-2xl lg:text-3xl text-foreground mb-2 lg:mb-4">
                Unsere Bestseller
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Premium-Düfte inspiriert von weltbekannten Marken
              </p>
            </div>

            {/* Product Grid */}
            <PremiumProductGrid />

            {/* View All CTA */}
            <div className="text-center mt-8 lg:mt-12">
              <Link
                to="/products"
                className="inline-flex items-center px-6 py-3 lg:px-8 lg:py-4 border border-foreground text-foreground text-[10px] lg:text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground hover:text-background transition-all duration-300"
              >
                Alle Produkte ansehen
                <ArrowRight className="ml-2 lg:ml-3 w-4 h-4" strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </section>

        {/* Removed duplicate external products section - Bestseller already shows them */}

        {/* AI Recommendations Section */}
        <section className="py-8 lg:py-12 bg-secondary/30">
          <div className="container-premium">
            <ProductRecommendations />
          </div>
        </section>

        {/* Newsletter Section */}
        <PremiumNewsletter />
      </main>

      <PremiumFooter />
      <MobileBottomNav />
      <ProductComparison />
    </div>
  );
}
