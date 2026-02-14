import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export function ScentQuizTeaser() {
  return (
    <section className="section-padding border-t border-border bg-secondary/30">
      <div className="container-premium">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left: Visual */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="aspect-square bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/10 flex items-center justify-center relative overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute w-48 h-48 border border-accent/10 rounded-full" />
              <div className="absolute w-72 h-72 border border-accent/5 rounded-full" />
              <div className="absolute w-96 h-96 border border-accent/5 rounded-full" />
              
              <div className="relative text-center z-10 p-8">
                <Sparkles className="w-12 h-12 text-accent mx-auto mb-4" strokeWidth={1} />
                <p className="font-display text-4xl lg:text-5xl text-foreground mb-2">5</p>
                <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                  Fragen zu deinem perfekten Duft
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-4">
              Interaktives Quiz
            </span>
            <h2 className="font-display text-3xl lg:text-4xl text-foreground mb-4">
              Finde deinen Signature-Duft
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Beantworte 5 kurze Fragen zu deinen Vorlieben und erhalte personalisierte 
              Duft-Empfehlungen – maßgeschneidert auf deinen Stil und Anlass.
            </p>
            
            <div className="space-y-3 mb-8">
              {['Persönliche Empfehlungen basierend auf deinem Stil', 
                'Dauert nur 60 Sekunden',
                'Über 20 verschiedene Düfte zur Auswahl'].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-1 h-1 bg-accent flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>

            <Link
              to="/scent-finder"
              className="inline-flex items-center px-8 py-4 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors"
            >
              Quiz starten
              <ArrowRight className="ml-3 w-4 h-4" strokeWidth={1.5} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
