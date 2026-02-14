import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PremiumPageLayout } from '@/components/premium/PremiumPageLayout';
import { PremiumHero } from '@/components/premium/PremiumHero';
import { PremiumFeatures } from '@/components/premium/PremiumFeatures';
import { PremiumSparsets } from '@/components/premium/PremiumSparsets';
import { PremiumProductGrid } from '@/components/premium/PremiumProductGrid';
import { PremiumNewsletter } from '@/components/premium/PremiumNewsletter';
import { OrganizationSchema, WebsiteSchema } from '@/components/StructuredData';
import { LocalBusinessSchema } from '@/components/seo';
import { Seo } from '@/components/Seo';
import { ProductComparison } from '@/components/ProductComparison';
import { ProductRecommendations } from '@/components/ai/ProductRecommendations';
import { RecentlyViewed } from '@/components/RecentlyViewed';
import { PromoBanner } from '@/components/PromoBanner';

export default function Index() {
  return (
    <PremiumPageLayout>
      <Seo 
        title="ALDENAIR | Premium Parfüms & Exklusive Düfte"
        description="Entdecken Sie ALDENAIR - Premium Parfüms inspiriert von weltbekannten Marken. Hochwertige Düfte zu fairen Preisen. Kostenloser Versand ab 50€."
        canonicalPath="/"
      />
      <OrganizationSchema />
      <WebsiteSchema />
      <LocalBusinessSchema />

      {/* Hero Section */}
      <PremiumHero />

      {/* Features Section */}
      <PremiumFeatures />

      {/* Sparsets Section */}
      <PremiumSparsets />

      {/* Products Section */}
      <section className="py-8 lg:py-12">
        <div className="container-premium">
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

          <PremiumProductGrid />

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

      {/* Recently Viewed */}
      <RecentlyViewed />

      {/* AI Recommendations Section */}
      <section className="py-8 lg:py-12 border-t border-border">
        <div className="container-premium">
          <ProductRecommendations />
        </div>
      </section>

      {/* Newsletter Section */}
      <PremiumNewsletter />

      <ProductComparison />
    </PremiumPageLayout>
  );
}
