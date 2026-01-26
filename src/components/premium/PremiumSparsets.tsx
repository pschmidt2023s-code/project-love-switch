import { Link } from 'react-router-dom';
import { ArrowRight, Gift, Sparkles } from 'lucide-react';

export function PremiumSparsets() {
  return (
    <section className="py-8 lg:py-12 bg-secondary dark:bg-muted/30">
      <div className="container-premium">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          {/* 50ml Sparset */}
          <Link 
            to="/sparkits" 
            className="group relative bg-card border border-border p-5 lg:p-8 transition-all duration-300 hover:border-accent"
          >
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-8 lg:w-12 h-px bg-accent transition-all duration-300 group-hover:w-16 lg:group-hover:w-24" />
            <div className="absolute top-0 left-0 w-px h-8 lg:h-12 bg-accent transition-all duration-300 group-hover:h-16 lg:group-hover:h-24" />
            
            <div className="flex items-start gap-3 lg:gap-4 mb-3 lg:mb-6">
              <div className="p-2 lg:p-3 bg-accent/10">
                <Gift className="w-4 h-4 lg:w-5 lg:h-5 text-accent" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-display text-base lg:text-xl text-foreground mb-0.5 lg:mb-1">
                  50ml Sparset
                </h3>
                <p className="text-xs lg:text-sm text-muted-foreground">
                  3 oder 5 Flaschen nach Wahl
                </p>
              </div>
            </div>
            
            <p className="text-xs lg:text-sm text-muted-foreground mb-3 lg:mb-6">
              Stelle dein individuelles Set aus 50ml Flaschen zusammen und spare bis zu 20%
            </p>
            
            <div className="flex items-center text-[10px] lg:text-[11px] tracking-[0.1em] uppercase font-medium text-foreground group-hover:text-accent transition-colors">
              Set zusammenstellen
              <ArrowRight className="ml-2 w-3 h-3 lg:w-4 lg:h-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
            </div>

            {/* Bottom accents */}
            <div className="absolute bottom-0 right-0 w-8 lg:w-12 h-px bg-accent transition-all duration-300 group-hover:w-16 lg:group-hover:w-24" />
            <div className="absolute bottom-0 right-0 w-px h-8 lg:h-12 bg-accent transition-all duration-300 group-hover:h-16 lg:group-hover:h-24" />
          </Link>

          {/* Probenset */}
          <Link 
            to="/sparkits?type=samples" 
            className="group relative bg-card border border-border p-5 lg:p-8 transition-all duration-300 hover:border-accent"
          >
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-8 lg:w-12 h-px bg-accent transition-all duration-300 group-hover:w-16 lg:group-hover:w-24" />
            <div className="absolute top-0 left-0 w-px h-8 lg:h-12 bg-accent transition-all duration-300 group-hover:h-16 lg:group-hover:h-24" />
            
            <div className="flex items-start gap-3 lg:gap-4 mb-3 lg:mb-6">
              <div className="p-2 lg:p-3 bg-accent/10">
                <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 text-accent" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-display text-base lg:text-xl text-foreground mb-0.5 lg:mb-1">
                  Probenset
                </h3>
                <p className="text-xs lg:text-sm text-muted-foreground">
                  5 Proben nach Wahl
                </p>
              </div>
            </div>
            
            <p className="text-xs lg:text-sm text-muted-foreground mb-3 lg:mb-6">
              Wähle 5 Duftproben aus und entdecke deine neuen Lieblingsdüfte
            </p>
            
            <div className="flex items-center text-[10px] lg:text-[11px] tracking-[0.1em] uppercase font-medium text-foreground group-hover:text-accent transition-colors">
              Proben auswählen
              <ArrowRight className="ml-2 w-3 h-3 lg:w-4 lg:h-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
            </div>

            {/* Bottom accents */}
            <div className="absolute bottom-0 right-0 w-8 lg:w-12 h-px bg-accent transition-all duration-300 group-hover:w-16 lg:group-hover:w-24" />
            <div className="absolute bottom-0 right-0 w-px h-8 lg:h-12 bg-accent transition-all duration-300 group-hover:h-16 lg:group-hover:h-24" />
          </Link>
        </div>
      </div>
    </section>
  );
}
