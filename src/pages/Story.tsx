import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Droplets, Leaf, Award, Heart } from 'lucide-react';
import { PremiumPageLayout } from '@/components/premium/PremiumPageLayout';
import { Seo } from '@/components/Seo';
import { useIntersectionReveal } from '@/hooks/useIntersectionReveal';
import storyOrigin from '@/assets/story-origin.jpg';
import storyCraft from '@/assets/story-craft.jpg';
import storyIngredients from '@/assets/story-ingredients.jpg';

/* ── Parallax hero image section ─────────────────────────────── */
function ParallaxHero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="relative h-[100vh] overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0">
        <img src={storyOrigin} alt="" className="w-full h-[130%] object-cover" />
        <div className="absolute inset-0 bg-foreground/60" />
      </motion.div>
      <motion.div style={{ opacity }} className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
        <span className="text-[10px] tracking-[0.4em] uppercase text-accent mb-6 block">
          Unsere Geschichte
        </span>
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-background max-w-3xl leading-[1.1] mb-6">
          Die Kunst des Duftes
        </h1>
        <p className="text-background/70 text-sm md:text-base max-w-lg">
          Eine Reise von der Inspiration bis zum fertigen Parfüm – erzählt durch Leidenschaft, Handwerk und die feinsten Rohstoffe.
        </p>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="mt-12 text-background/50 text-[10px] tracking-[0.3em] uppercase"
        >
          Scroll nach unten
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ── Animated stat counter ────────────────────────────────────── */
function StatCard({ value, label, icon: Icon }: { value: string; label: string; icon: React.ElementType }) {
  const ref = useIntersectionReveal<HTMLDivElement>();
  return (
    <div ref={ref} className="intersect-fade text-center p-6 lg:p-8">
      <Icon className="w-6 h-6 text-accent mx-auto mb-4" strokeWidth={1.5} />
      <div className="font-display text-3xl lg:text-4xl text-foreground mb-2">{value}</div>
      <div className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{label}</div>
    </div>
  );
}

/* ── Story chapter with parallax image ────────────────────────── */
function StoryChapter({
  image, tag, title, body, reverse = false,
}: { image: string; tag: string; title: string; body: string; reverse?: boolean }) {
  const imgRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: imgRef, offset: ['start end', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const textRef = useIntersectionReveal<HTMLDivElement>();

  return (
    <section className="py-16 lg:py-24 border-t border-border">
      <div className={`container-premium grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center ${reverse ? 'lg:[direction:rtl]' : ''}`}>
        {/* Image */}
        <div ref={imgRef} className="overflow-hidden aspect-[4/3] lg:[direction:ltr]">
          <motion.img
            style={{ y: imgY }}
            src={image}
            alt={title}
            className="w-full h-[115%] object-cover"
            loading="lazy"
          />
        </div>

        {/* Text */}
        <div ref={textRef} className="intersect-fade lg:[direction:ltr]">
          <span className="text-[10px] tracking-[0.3em] uppercase text-accent mb-4 block">{tag}</span>
          <h2 className="font-display text-2xl lg:text-4xl text-foreground mb-6 leading-tight">{title}</h2>
          <p className="text-sm lg:text-base text-muted-foreground leading-relaxed whitespace-pre-line">{body}</p>
        </div>
      </div>
    </section>
  );
}

/* ── Values ribbon ────────────────────────────────────────────── */
function ValuesRibbon() {
  const ref = useIntersectionReveal<HTMLDivElement>();
  const values = [
    { icon: Droplets, title: 'Reinste Essenzen', desc: 'Nur die hochwertigsten Duftöle aus zertifizierten Quellen.' },
    { icon: Leaf, title: 'Nachhaltig', desc: 'Umweltfreundliche Verpackungen und verantwortungsvolle Beschaffung.' },
    { icon: Award, title: 'Premium Qualität', desc: 'Jede Charge wird sorgfältig geprüft und getestet.' },
    { icon: Heart, title: 'Made with Love', desc: 'Handgefertigte Kompositionen in kleinen Auflagen.' },
  ];

  return (
    <section className="py-16 lg:py-24 bg-secondary border-t border-border">
      <div ref={ref} className="container-premium intersect-fade">
        <div className="text-center mb-12">
          <span className="text-[10px] tracking-[0.3em] uppercase text-accent mb-4 block">Unsere Werte</span>
          <h2 className="font-display text-2xl lg:text-3xl text-foreground">Wofür wir stehen</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map(v => (
            <div key={v.title} className="text-center">
              <v.icon className="w-8 h-8 text-accent mx-auto mb-4" strokeWidth={1} />
              <h3 className="font-display text-base text-foreground mb-2">{v.title}</h3>
              <p className="text-xs text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA section ──────────────────────────────────────────────── */
function StoryCTA() {
  const ref = useIntersectionReveal<HTMLDivElement>();
  return (
    <section className="py-20 lg:py-32 border-t border-border">
      <div ref={ref} className="container-premium text-center intersect-fade">
        <span className="text-[10px] tracking-[0.3em] uppercase text-accent mb-4 block">Erlebe ALDENAIR</span>
        <h2 className="font-display text-3xl lg:text-5xl text-foreground mb-6 max-w-xl mx-auto leading-tight">
          Finde deinen Signature-Duft
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-10">
          Entdecke unsere Kollektion und finde den Duft, der deine Geschichte erzählt.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/products"
            className="inline-flex items-center justify-center px-8 py-4 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-accent transition-colors duration-300"
          >
            Kollektion entdecken
            <ArrowRight className="ml-3 w-4 h-4" strokeWidth={1.5} />
          </Link>
          <Link
            to="/scent-finder"
            className="inline-flex items-center justify-center px-8 py-4 border border-foreground text-foreground text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground hover:text-background transition-all duration-300"
          >
            Duft-Quiz starten
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Main page ────────────────────────────────────────────────── */
export default function Story() {
  return (
    <PremiumPageLayout>
      <Seo
        title="Die ALDENAIR Geschichte | Vom Handwerk zum Premium Parfüm"
        description="Erfahre wie ALDENAIR entsteht – von den feinsten Rohstoffen bis zum fertigen Premium-Parfüm. Eine Geschichte voller Leidenschaft und Handwerk."
        canonicalPath="/story"
        ogImage="/images/aldenair-prestige.png"
      />

      <ParallaxHero />

      {/* Stats */}
      <section className="py-12 lg:py-16 border-t border-border">
        <div className="container-premium grid grid-cols-2 lg:grid-cols-4">
          <StatCard value="6+" icon={Droplets} label="Signature Düfte" />
          <StatCard value="100%" icon={Leaf} label="Premium Qualität" />
          <StatCard value="50€" icon={Award} label="Free Shipping ab" />
          <StatCard value="4.9★" icon={Heart} label="Kundenbewertung" />
        </div>
      </section>

      {/* Chapter 1: Origin */}
      <StoryChapter
        image={storyOrigin}
        tag="Kapitel I"
        title="Der Ursprung"
        body={`Alles begann mit einer einfachen Überzeugung: Luxusdüfte sollten für jeden zugänglich sein – ohne Kompromisse bei der Qualität.\n\nALDENAIR wurde gegründet, um die Welt der Parfümerie zu demokratisieren. Inspiriert von den ikonischsten Düften der Welt, kreieren wir eigene Kompositionen, die das Original ehren und gleichzeitig eine eigenständige Identität besitzen.`}
      />

      {/* Chapter 2: Craft */}
      <StoryChapter
        image={storyCraft}
        tag="Kapitel II"
        title="Das Handwerk"
        body={`Unsere Parfümeure arbeiten mit den gleichen hochwertigen Rohstoffen, die auch die großen Häuser verwenden. Jede Komposition durchläuft dutzende Iterationen, bis sie unseren strengen Standards entspricht.\n\nVon der ersten Idee bis zum fertigen Flakon vergehen oft Monate – denn Perfektion braucht Zeit.`}
        reverse
      />

      {/* Chapter 3: Ingredients */}
      <StoryChapter
        image={storyIngredients}
        tag="Kapitel III"
        title="Die Rohstoffe"
        body={`Wir beziehen unsere Essenzen direkt von ausgewählten Produzenten weltweit. Bergamotte aus Kalabrien, Oud aus dem Orient, Vanille aus Madagaskar – jeder Rohstoff erzählt seine eigene Geschichte.\n\nTransparenz ist uns wichtig: Alle Inhaltsstoffe sind auf jeder Produktseite vollständig aufgelistet.`}
      />

      <ValuesRibbon />
      <StoryCTA />
    </PremiumPageLayout>
  );
}
