import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { PremiumPageLayout } from '@/components/premium/PremiumPageLayout';
import { ArrowRight } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <PremiumPageLayout>
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-6">
          <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent">
            Fehler 404
          </span>
          <h1 className="font-display text-5xl lg:text-7xl text-foreground">
            Seite nicht gefunden
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Die Seite, die du suchst, existiert leider nicht. Entdecke stattdessen unsere Kollektion.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-3 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors"
          >
            Zurück zur Startseite
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </PremiumPageLayout>
  );
};

export default NotFound;
