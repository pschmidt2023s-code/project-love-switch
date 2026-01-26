import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PremiumNavigation } from '@/components/premium/PremiumNavigation';
import { PremiumHero } from '@/components/premium/PremiumHero';
import { PremiumFeatures } from '@/components/premium/PremiumFeatures';
import { PremiumSparsets } from '@/components/premium/PremiumSparsets';
import { PremiumProductGrid } from '@/components/premium/PremiumProductGrid';
import { PremiumNewsletter } from '@/components/premium/PremiumNewsletter';
import { PremiumFooter } from '@/components/premium/PremiumFooter';
import { OrganizationSchema, WebsiteSchema } from '@/components/StructuredData';
import { ProductComparison } from '@/components/ProductComparison';
import { MobileBottomNav } from '@/components/MobileBottomNav';

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <OrganizationSchema />
      <WebsiteSchema />
      
      <PremiumNavigation />

      <main id="main-content" role="main" aria-label="Hauptinhalt">
        {/* Hero Section */}
        <PremiumHero />

        {/* Features Section */}
        <PremiumFeatures />

        {/* Sparsets Section */}
        <PremiumSparsets />

        {/* Products Section */}
        <section className="section-spacing">
          <div className="container-premium">
            {/* Section Header */}
            <div className="text-center mb-12 lg:mb-16">
              <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-4">
                Kollektion
              </span>
              <h2 className="font-display text-3xl lg:text-4xl text-foreground mb-4">
                Unsere Bestseller
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Premium-Düfte inspiriert von weltbekannten Marken
              </p>
            </div>

            {/* Product Grid */}
            <PremiumProductGrid />

            {/* View All CTA */}
            <div className="text-center mt-12 lg:mt-16">
              <Link
                to="/products"
                className="inline-flex items-center px-8 py-4 border border-foreground text-foreground text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground hover:text-background transition-all duration-300"
              >
                Alle Produkte ansehen
                <ArrowRight className="ml-3 w-4 h-4" strokeWidth={1.5} />
              </Link>
            </div>
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
