import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Award, ShoppingBag, Star, Heart, Zap, Gift, Crown, Trophy, Target, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Badge {
  id: string;
  badge_type: string;
  badge_name: string;
  earned_at: string;
}

const BADGE_DEFINITIONS = [
  { type: 'first_purchase', name: 'Erste Bestellung', icon: ShoppingBag, description: 'Deine erste Bestellung aufgegeben' },
  { type: 'five_orders', name: 'Stammkunde', icon: Star, description: '5 Bestellungen abgeschlossen' },
  { type: 'ten_orders', name: 'VIP Shopper', icon: Crown, description: '10 Bestellungen abgeschlossen' },
  { type: 'reviewer', name: 'Kritiker', icon: Award, description: 'Erste Bewertung geschrieben' },
  { type: 'collector', name: 'Sammler', icon: Heart, description: '3 verschiedene Düfte bestellt' },
  { type: 'early_bird', name: 'Early Bird', icon: Zap, description: 'Innerhalb 24h nach Launch bestellt' },
  { type: 'referrer', name: 'Botschafter', icon: Gift, description: 'Einen Freund geworben' },
  { type: 'big_spender', name: 'Big Spender', icon: Trophy, description: 'Über 200€ ausgegeben' },
  { type: 'quiz_master', name: 'Duft-Kenner', icon: Target, description: 'Duft-Quiz abgeschlossen' },
  { type: 'streak', name: 'Treue Seele', icon: Flame, description: '3 Monate in Folge bestellt' },
];

export function GamificationBadges() {
  const { user } = useAuth();

  const { data: earnedBadges = [] } = useQuery({
    queryKey: ['user-badges', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data as Badge[];
    },
    enabled: !!user,
  });

  const earnedTypes = new Set(earnedBadges.map(b => b.badge_type));
  const progress = (earnedBadges.length / BADGE_DEFINITIONS.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
            Badges freigeschaltet
          </p>
          <p className="text-sm font-medium text-foreground">
            {earnedBadges.length} / {BADGE_DEFINITIONS.length}
          </p>
        </div>
        <div className="h-1.5 bg-muted w-full">
          <div
            className="h-full bg-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-5 gap-3">
        {BADGE_DEFINITIONS.map(badge => {
          const isEarned = earnedTypes.has(badge.type);
          const Icon = badge.icon;

          return (
            <div
              key={badge.type}
              className={cn(
                "flex flex-col items-center text-center py-3 px-1 border transition-all",
                isEarned
                  ? "border-accent/30 bg-accent/5"
                  : "border-border opacity-40 grayscale"
              )}
              title={badge.description}
            >
              <div className={cn(
                "w-10 h-10 flex items-center justify-center mb-2",
                isEarned ? "text-accent" : "text-muted-foreground"
              )}>
                <Icon className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <span className="text-[8px] tracking-[0.1em] uppercase text-foreground leading-tight">
                {badge.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Next badge hint */}
      {earnedBadges.length < BADGE_DEFINITIONS.length && (
        <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border border-border">
          <Target className="w-4 h-4 text-accent flex-shrink-0" strokeWidth={1.5} />
          <p className="text-xs text-muted-foreground">
            <span className="text-foreground font-medium">Nächstes Badge:</span>{' '}
            {BADGE_DEFINITIONS.find(b => !earnedTypes.has(b.type))?.description}
          </p>
        </div>
      )}
    </div>
  );
}
