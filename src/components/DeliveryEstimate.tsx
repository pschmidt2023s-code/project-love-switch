import { useMemo } from 'react';
import { Truck, Clock, Package, CheckCircle2 } from 'lucide-react';

interface DeliveryEstimateProps {
  inStock: boolean;
}

export function DeliveryEstimate({ inStock }: DeliveryEstimateProps) {
  const estimate = useMemo(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay(); // 0=Sun, 6=Sat

    // Cutoff: 14:00 on workdays
    const cutoffHour = 14;
    let orderByDate = new Date(now);
    let shipsDate = new Date(now);

    const isWorkday = (d: Date) => {
      const day = d.getDay();
      return day !== 0 && day !== 6;
    };

    const addWorkdays = (date: Date, days: number) => {
      const result = new Date(date);
      let added = 0;
      while (added < days) {
        result.setDate(result.getDate() + 1);
        if (isWorkday(result)) added++;
      }
      return result;
    };

    // Determine if order can still ship today
    const canShipToday = isWorkday(now) && currentHour < cutoffHour;

    if (canShipToday) {
      // Order by today 14:00, ships today
      orderByDate = new Date(now);
      orderByDate.setHours(cutoffHour, 0, 0, 0);
      shipsDate = new Date(now);
    } else {
      // Next workday
      shipsDate = addWorkdays(now, 1);
      orderByDate = new Date(shipsDate);
      orderByDate.setHours(cutoffHour, 0, 0, 0);
    }

    // Delivery: 1-2 workdays after shipping (Germany)
    const deliveryMin = addWorkdays(shipsDate, 1);
    const deliveryMax = addWorkdays(shipsDate, 2);

    // Calculate remaining time until cutoff
    const cutoffTime = new Date(now);
    if (canShipToday) {
      cutoffTime.setHours(cutoffHour, 0, 0, 0);
    } else {
      cutoffTime.setTime(addWorkdays(now, 1).getTime());
      cutoffTime.setHours(cutoffHour, 0, 0, 0);
    }
    const remainingMs = cutoffTime.getTime() - now.getTime();
    const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
    const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

    const formatDate = (d: Date) =>
      d.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' });

    const formatDateLong = (d: Date) =>
      d.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long' });

    return {
      canShipToday,
      orderBy: formatDate(orderByDate),
      shipsOn: formatDate(shipsDate),
      deliveryRange: deliveryMin.getTime() === deliveryMax.getTime()
        ? formatDateLong(deliveryMin)
        : `${formatDate(deliveryMin)} – ${formatDate(deliveryMax)}`,
      remainingHours,
      remainingMinutes,
      shipsToday: canShipToday,
    };
  }, []);

  if (!inStock) return null;

  return (
    <div className="border border-accent/20 bg-accent/[0.03]">
      {/* Countdown header */}
      <div className="px-4 py-3 border-b border-accent/10 flex items-center gap-2.5">
        <div className="w-2 h-2 bg-green-500 animate-pulse" />
        <span className="text-[11px] font-medium text-foreground">
          {estimate.shipsToday ? (
            <>
              Noch <span className="text-accent font-semibold">
                {estimate.remainingHours > 0 ? `${estimate.remainingHours} Std ${estimate.remainingMinutes} Min` : `${estimate.remainingMinutes} Min`}
              </span> — Versand heute
            </>
          ) : (
            <>Nächster Versand: <span className="text-accent font-semibold">{estimate.shipsOn}</span></>
          )}
        </span>
      </div>

      {/* Timeline */}
      <div className="px-4 py-4 space-y-3">
        {[
          {
            icon: Clock,
            label: 'Bestellung bis',
            value: estimate.shipsToday ? 'Heute, 14:00 Uhr' : estimate.orderBy,
            active: true,
          },
          {
            icon: Package,
            label: 'Versand am',
            value: estimate.shipsToday ? 'Heute' : estimate.shipsOn,
            active: false,
          },
          {
            icon: Truck,
            label: 'Zustellung',
            value: estimate.deliveryRange,
            active: false,
          },
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-7 h-7 flex items-center justify-center border ${
              step.active ? 'border-accent bg-accent/10 text-accent' : 'border-border text-muted-foreground'
            }`}>
              <step.icon className="w-3.5 h-3.5" strokeWidth={1.5} />
            </div>
            <div className="flex-1 flex items-baseline justify-between">
              <span className="text-[10px] tracking-[0.05em] uppercase text-muted-foreground">{step.label}</span>
              <span className="text-xs font-medium text-foreground">{step.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-accent/10 flex items-center gap-2">
        <CheckCircle2 className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
        <span className="text-[10px] text-muted-foreground">Kostenloser Versand ab 50€ · DHL Standardversand</span>
      </div>
    </div>
  );
}
