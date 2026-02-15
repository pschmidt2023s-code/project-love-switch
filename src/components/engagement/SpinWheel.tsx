import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Sparkles, PartyPopper, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Prize {
  id: string;
  label: string;
  discount_value: number;
  discount_type: string;
  probability: number;
  color: string;
}

export function SpinWheel() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<Prize | null>(null);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [hasSpun, setHasSpun] = useState(() => {
    return localStorage.getItem('aldenair_spun') === 'true';
  });
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loaded, setLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const loadPrizes = useCallback(async () => {
    if (loaded) return;
    const { data } = await supabase
      .from('spin_prizes')
      .select('*')
      .eq('is_active', true);
    if (data && data.length > 0) {
      setPrizes(data as unknown as Prize[]);
    }
    setLoaded(true);
  }, [loaded]);

  const open = () => {
    if (hasSpun) return;
    loadPrizes();
    setIsOpen(true);
  };

  const pickPrize = (prizeList: Prize[]): Prize => {
    const total = prizeList.reduce((s, p) => s + p.probability, 0);
    let r = Math.random() * total;
    for (const p of prizeList) {
      r -= p.probability;
      if (r <= 0) return p;
    }
    return prizeList[prizeList.length - 1];
  };

  const spin = async () => {
    if (!email || spinning || prizes.length === 0) return;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Bitte gib eine gültige E-Mail ein');
      return;
    }

    setSpinning(true);
    const prize = pickPrize(prizes);
    const prizeIndex = prizes.indexOf(prize);
    const segmentAngle = 360 / prizes.length;
    const targetAngle = 360 - (prizeIndex * segmentAngle + segmentAngle / 2);
    const totalRotation = rotation + 1440 + targetAngle; // 4 full spins + target

    setRotation(totalRotation);

    // Wait for spin animation
    setTimeout(async () => {
      setWonPrize(prize);
      setSpinning(false);
      setHasSpun(true);
      localStorage.setItem('aldenair_spun', 'true');

      // Generate coupon code
      const code = prize.discount_type !== 'nothing'
        ? `SPIN-${prize.label.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 6)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
        : undefined;

      setCouponCode(code || null);

      // Auto-copy to clipboard
      if (code) {
        try {
          await navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        } catch { /* clipboard not available */ }
      }

      // Save to DB
      await supabase.from('spin_results').insert({
        email,
        prize_id: prize.id,
        prize_label: prize.label,
        coupon_code: code || null,
      });

      // Also subscribe to newsletter
      await supabase.from('newsletter_subscribers').upsert(
        { email, is_active: true },
        { onConflict: 'email' }
      );
    }, 4000);
  };

  const segmentAngle = prizes.length > 0 ? 360 / prizes.length : 60;

  // Hide trigger button if already spun (but keep modal open if showing result)
  if (hasSpun && !isOpen) return null;

  const wheelColors = ['hsl(43, 35%, 48%)', 'hsl(0, 0%, 10%)', 'hsl(43, 45%, 65%)', 'hsl(0, 0%, 20%)', 'hsl(35, 25%, 70%)', 'hsl(0, 0%, 30%)'];

  return (
    <>
      {/* Floating Trigger */}
      <motion.button
        onClick={open}
        className="fixed left-4 bottom-24 z-40 w-14 h-14 bg-accent text-accent-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 3, type: 'spring', stiffness: 200 }}
        aria-label="Glücksrad drehen"
      >
        <Gift className="w-6 h-6" />
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !spinning && setIsOpen(false)}
          >
            <motion.div
              className="relative bg-card border border-border max-w-md w-full p-6 text-center"
              initial={{ scale: 0.8, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 40 }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => !spinning && setIsOpen(false)}
                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>

              {!wonPrize ? (
                <>
                  <Sparkles className="w-8 h-8 text-accent mx-auto mb-3" />
                  <h2 className="font-display text-2xl text-foreground mb-1">
                    Dreh das Glücksrad!
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Gib deine E-Mail ein und gewinne exklusive Rabatte
                  </p>

                  {/* Wheel */}
                  <div className="relative w-64 h-64 mx-auto mb-6">
                    {/* Pointer */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[20px] border-l-transparent border-r-transparent border-t-accent" />
                    
                    <motion.div
                      className="w-full h-full"
                      animate={{ rotate: rotation }}
                      transition={{ duration: 4, ease: [0.17, 0.67, 0.12, 0.99] }}
                    >
                      <svg viewBox="0 0 200 200" className="w-full h-full">
                        {prizes.map((prize, i) => {
                          const startAngle = i * segmentAngle;
                          const endAngle = startAngle + segmentAngle;
                          const startRad = (startAngle - 90) * Math.PI / 180;
                          const endRad = (endAngle - 90) * Math.PI / 180;
                          const x1 = 100 + 95 * Math.cos(startRad);
                          const y1 = 100 + 95 * Math.sin(startRad);
                          const x2 = 100 + 95 * Math.cos(endRad);
                          const y2 = 100 + 95 * Math.sin(endRad);
                          const largeArc = segmentAngle > 180 ? 1 : 0;
                          const midAngle = ((startAngle + endAngle) / 2 - 90) * Math.PI / 180;
                          const textX = 100 + 60 * Math.cos(midAngle);
                          const textY = 100 + 60 * Math.sin(midAngle);
                          const textRotation = (startAngle + endAngle) / 2;

                          return (
                            <g key={prize.id}>
                              <path
                                d={`M100,100 L${x1},${y1} A95,95 0 ${largeArc},1 ${x2},${y2} Z`}
                                fill={wheelColors[i % wheelColors.length]}
                                stroke="hsl(0,0%,100%)"
                                strokeWidth="0.5"
                              />
                              <text
                                x={textX}
                                y={textY}
                                fill="white"
                                fontSize="7"
                                fontWeight="600"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                              >
                                {prize.label}
                              </text>
                            </g>
                          );
                        })}
                        <circle cx="100" cy="100" r="12" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1" />
                      </svg>
                    </motion.div>
                  </div>

                  {/* Email + Spin */}
                  <div className="space-y-3">
                    <Input
                      type="email"
                      placeholder="deine@email.de"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      disabled={spinning}
                      className="text-center"
                    />
                    <Button
                      onClick={spin}
                      disabled={spinning || !email}
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      {spinning ? 'Dreht...' : 'Jetzt drehen!'}
                    </Button>
                  </div>
                </>
              ) : (
                /* Prize Result */
                <div className="py-4">
                  <PartyPopper className="w-12 h-12 text-accent mx-auto mb-4" />
                  <h2 className="font-display text-2xl text-foreground mb-2">
                    {wonPrize.discount_type === 'nothing' ? 'Beim nächsten Mal!' : 'Glückwunsch! 🎉'}
                  </h2>
                  <p className="text-lg font-medium text-accent mb-4">
                    {wonPrize.label}
                  </p>
                  {couponCode && (
                    <div className="mb-4">
                      <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">
                        Dein Rabattcode {copied && '· Kopiert!'}
                      </p>
                      <button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(couponCode);
                            setCopied(true);
                            toast.success('Code kopiert!');
                            setTimeout(() => setCopied(false), 3000);
                          } catch {
                            toast.error('Kopieren fehlgeschlagen');
                          }
                        }}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-secondary border border-border text-foreground font-mono text-lg tracking-wider hover:bg-muted transition-colors"
                      >
                        {couponCode}
                        {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                      </button>
                      <p className="text-xs text-muted-foreground mt-2">
                        Klicke zum Kopieren · Auch per E-Mail zugesendet
                      </p>
                    </div>
                  )}
                  <Button
                    onClick={() => setIsOpen(false)}
                    className="mt-2"
                    variant="outline"
                  >
                    Weiter shoppen
                  </Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
