import { Award, TrendingUp, Gift, Crown } from 'lucide-react';

interface LoyaltyProgressProps {
  tier: string;
  totalSpent: number;
  paybackBalance: number;
}

const tiers = [
  { name: 'Bronze', min: 0, max: 100, color: 'text-amber-700', bgColor: 'bg-amber-700' },
  { name: 'Silber', min: 100, max: 300, color: 'text-gray-400', bgColor: 'bg-gray-400' },
  { name: 'Gold', min: 300, max: 750, color: 'text-yellow-500', bgColor: 'bg-yellow-500' },
  { name: 'Platin', min: 750, max: Infinity, color: 'text-purple-400', bgColor: 'bg-purple-400' },
];

export function LoyaltyProgress({ tier, totalSpent, paybackBalance }: LoyaltyProgressProps) {
  const currentTierIndex = tiers.findIndex(t => t.name.toLowerCase() === (tier || 'bronze').toLowerCase());
  const currentTier = tiers[Math.max(0, currentTierIndex)];
  const nextTier = tiers[Math.min(currentTierIndex + 1, tiers.length - 1)];
  const isMaxTier = currentTierIndex >= tiers.length - 1;

  const progressToNext = isMaxTier
    ? 100
    : Math.min(100, ((totalSpent - currentTier.min) / (nextTier.min - currentTier.min)) * 100);

  const amountToNext = isMaxTier ? 0 : Math.max(0, nextTier.min - totalSpent);

  return (
    <div className="space-y-6">
      {/* Current Tier Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 flex items-center justify-center border border-border ${currentTier.color}`}>
            <Crown className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">Ihr Status</p>
            <p className={`text-lg font-display ${currentTier.color}`}>{currentTier.name}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">Guthaben</p>
          <p className="text-lg font-display text-accent">{paybackBalance.toFixed(2)} €</p>
        </div>
      </div>

      {/* Progress Bar */}
      {!isMaxTier && (
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] tracking-[0.1em] uppercase text-muted-foreground">
            <span>{currentTier.name}</span>
            <span>{nextTier.name}</span>
          </div>
          <div className="h-1.5 bg-muted w-full">
            <div
              className={`h-full ${nextTier.bgColor} transition-all duration-500`}
              style={{ width: `${progressToNext}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Noch <span className="font-medium text-foreground">{amountToNext.toFixed(2)} €</span> bis zum {nextTier.name}-Status
          </p>
        </div>
      )}

      {isMaxTier && (
        <div className="flex items-center gap-2 px-4 py-3 bg-accent/5 border border-accent/15">
          <Award className="w-4 h-4 text-accent" strokeWidth={1.5} />
          <p className="text-sm text-foreground">Sie haben den höchsten Status erreicht!</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center py-3 border border-border">
          <TrendingUp className="w-4 h-4 text-accent mx-auto mb-1" strokeWidth={1.5} />
          <p className="text-sm font-medium text-foreground">{totalSpent.toFixed(0)} €</p>
          <p className="text-[9px] text-muted-foreground">Gesamtausgaben</p>
        </div>
        <div className="text-center py-3 border border-border">
          <Gift className="w-4 h-4 text-accent mx-auto mb-1" strokeWidth={1.5} />
          <p className="text-sm font-medium text-foreground">{paybackBalance.toFixed(2)} €</p>
          <p className="text-[9px] text-muted-foreground">Guthaben</p>
        </div>
        <div className="text-center py-3 border border-border">
          <Crown className="w-4 h-4 text-accent mx-auto mb-1" strokeWidth={1.5} />
          <p className="text-sm font-medium text-foreground">{currentTier.name}</p>
          <p className="text-[9px] text-muted-foreground">Stufe</p>
        </div>
      </div>

      {/* Tier Benefits */}
      <div className="space-y-2">
        <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">Ihre Vorteile</p>
        <div className="space-y-1.5">
          {currentTierIndex >= 0 && (
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <span className="w-1 h-1 bg-accent flex-shrink-0" /> Kostenloser Versand ab 50€
            </p>
          )}
          {currentTierIndex >= 1 && (
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <span className="w-1 h-1 bg-accent flex-shrink-0" /> 5% Cashback auf alle Bestellungen
            </p>
          )}
          {currentTierIndex >= 2 && (
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <span className="w-1 h-1 bg-accent flex-shrink-0" /> Exklusive Vorab-Zugänge zu neuen Düften
            </p>
          )}
          {currentTierIndex >= 3 && (
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <span className="w-1 h-1 bg-accent flex-shrink-0" /> Persönliche Duftberatung & VIP-Events
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
