import { Package, CreditCard, Truck, CheckCircle2, Clock } from 'lucide-react';

interface OrderStatusTrackerProps {
  status: string;
}

const steps = [
  { key: 'pending', label: 'Bestellt', icon: Clock },
  { key: 'paid', label: 'Bezahlt', icon: CreditCard },
  { key: 'processing', label: 'In Bearbeitung', icon: Package },
  { key: 'shipped', label: 'Versendet', icon: Truck },
  { key: 'delivered', label: 'Zugestellt', icon: CheckCircle2 },
];

export function OrderStatusTracker({ status }: OrderStatusTrackerProps) {
  const statusOrder = ['pending', 'paid', 'processing', 'shipped', 'delivered'];
  const currentIndex = statusOrder.indexOf(status);

  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 px-4 py-3 border border-destructive/30 text-destructive">
        <span className="text-[11px] tracking-[0.1em] uppercase font-medium">Storniert</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-[10px] tracking-[0.2em] uppercase text-accent">Bestellstatus</h3>
      <div className="flex items-center w-full">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isCompleted = index <= currentIndex;
          const isActive = index === currentIndex;

          return (
            <div key={step.key} className="flex-1 flex flex-col items-center relative">
              {/* Connector line */}
              {index > 0 && (
                <div
                  className={`absolute top-4 -left-1/2 w-full h-px ${
                    index <= currentIndex ? 'bg-accent' : 'bg-border'
                  }`}
                />
              )}

              {/* Icon */}
              <div
                className={`relative z-10 w-8 h-8 flex items-center justify-center border transition-colors ${
                  isActive
                    ? 'border-accent bg-accent/10 text-accent'
                    : isCompleted
                    ? 'border-accent bg-accent text-background'
                    : 'border-border bg-background text-muted-foreground'
                }`}
              >
                <StepIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
              </div>

              {/* Label */}
              <span
                className={`mt-2 text-[9px] tracking-[0.05em] uppercase text-center ${
                  isCompleted ? 'text-foreground font-medium' : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
