import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Clock, Play } from 'lucide-react';
import { useEffect, useState } from 'react';
import { VideoModal } from './VideoModal';
import heroBg from '@/assets/hero-bg.jpg';

export function PremiumHero() {
  const [isVisible, setIsVisible] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Dark Luxury Hero - NO Parallax */}
      <section 
        data-header-dark
        className="relative min-h-[85vh] lg:min-h-[90vh] bg-black overflow-hidden flex items-center"
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={heroBg} 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover opacity-40"
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(180,140,70,0.12)_0%,transparent_50%)]" />
        </div>
        
        {/* Static accent lines */}
        <div className="absolute top-20 left-10 w-px h-32 bg-gradient-to-b from-transparent via-amber-600/30 to-transparent" />
        <div className="absolute bottom-20 right-10 w-px h-32 bg-gradient-to-b from-transparent via-amber-600/30 to-transparent" />
        <div className="absolute top-1/3 right-20 w-32 h-px bg-gradient-to-r from-transparent via-amber-600/20 to-transparent" />
        
        <div className="container-premium relative z-10">
          <div className="grid grid-cols-12 gap-6 lg:gap-12 items-center">
            {/* Content */}
            <div className={`col-span-12 lg:col-span-7 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <span className="inline-block text-[10px] tracking-[0.4em] uppercase text-amber-500 font-medium mb-4 lg:mb-6">
                Premium Parfüm Kollektion
              </span>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-white leading-[1.05] mb-6 lg:mb-8">
                Luxusdüfte,
                <br />
                <span className="relative">
                  die{' '}
                  <span className="italic bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent">
                    begeistern
                  </span>
                  <span className="absolute -bottom-2 left-0 w-full h-px bg-gradient-to-r from-amber-500/50 via-amber-500 to-amber-500/50" />
                </span>
              </h1>

              <p className="text-base lg:text-lg text-white/70 max-w-xl mb-8 lg:mb-10 leading-relaxed">
                Entdecke unsere exklusive Kollektion hochwertiger Parfüms — 
                inspiriert von weltbekannten Luxusmarken, zu fairen Preisen.
              </p>

              {/* CTAs */}
              <div className={`flex flex-col sm:flex-row gap-4 mb-10 lg:mb-14 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <Link
                  to="/products"
                  className="group inline-flex items-center justify-center px-8 py-4 lg:px-10 lg:py-5 bg-white text-black text-[11px] lg:text-[12px] tracking-[0.15em] uppercase font-semibold hover:bg-amber-500 hover:text-black transition-all duration-500 hover:shadow-[0_0_30px_rgba(180,140,70,0.4)]"
                >
                  Kollektion entdecken
                  <ArrowRight className="ml-3 w-4 h-4 transition-transform group-hover:translate-x-2" strokeWidth={2} />
                </Link>
                
                <button
                  onClick={() => setShowVideo(true)}
                  className="group inline-flex items-center justify-center px-8 py-4 lg:px-10 lg:py-5 border border-white/30 text-white text-[11px] lg:text-[12px] tracking-[0.15em] uppercase font-medium hover:border-amber-500/50 hover:text-amber-400 transition-all duration-500"
                >
                  <Play className="mr-3 w-4 h-4" strokeWidth={2} />
                  Video ansehen
                </button>
              </div>

              {/* Trust Badges */}
              <div className={`flex flex-wrap gap-8 lg:gap-10 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <TrustBadge icon={Truck} text="Kostenlos ab 50€" />
                <TrustBadge icon={Shield} text="14 Tage Rückgabe" />
                <TrustBadge icon={Clock} text="1-3 Tage Lieferung" />
              </div>
            </div>

            {/* Stats Card with Glass Effect */}
            <div className={`col-span-12 lg:col-span-5 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 lg:p-10">
                <div className="absolute top-0 left-0 w-20 h-px bg-gradient-to-r from-amber-500 to-transparent" />
                <div className="absolute top-0 left-0 w-px h-20 bg-gradient-to-b from-amber-500 to-transparent" />
                <div className="absolute bottom-0 right-0 w-20 h-px bg-gradient-to-l from-amber-500 to-transparent" />
                <div className="absolute bottom-0 right-0 w-px h-20 bg-gradient-to-t from-amber-500 to-transparent" />
                
                <div className="grid grid-cols-2 gap-8">
                  <StatItem value="500+" label="Düfte" />
                  <StatItem value="4.8" label="Bewertung" highlight />
                  <StatItem value="10k+" label="Kunden" />
                  <StatItem value="24h" label="Versand" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-[10px] tracking-[0.3em] uppercase text-white/40">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </section>

      {/* Light section below for contrast */}
      <section data-header-light className="py-16 lg:py-24 bg-background">
        <div className="container-premium">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent font-medium mb-4">
              Entdecke mehr
            </span>
            <h2 className="font-display text-3xl lg:text-4xl text-foreground mb-4">
              Unsere beliebtesten Düfte
            </h2>
            <p className="text-muted-foreground">
              Handverlesene Kreationen, die Eleganz und Stil vereinen.
            </p>
          </div>
        </div>
      </section>

      <VideoModal isOpen={showVideo} onClose={() => setShowVideo(false)} />
    </>
  );
}

function TrustBadge({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 border border-white/10 bg-white/5">
        <Icon className="w-4 h-4 text-amber-500" strokeWidth={1.5} />
      </div>
      <span className="text-[11px] lg:text-xs text-white/60 tracking-wide">{text}</span>
    </div>
  );
}

function StatItem({ value, label, highlight = false }: { value: string; label: string; highlight?: boolean }) {
  return (
    <div className="text-center py-4">
      <p className={`text-3xl lg:text-4xl font-display mb-2 ${highlight ? 'text-amber-500' : 'text-white'}`}>
        {value}
      </p>
      <p className="text-[10px] lg:text-[11px] tracking-[0.2em] uppercase text-white/50">
        {label}
      </p>
    </div>
  );
}
