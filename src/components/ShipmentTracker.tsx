import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Truck, Package, MapPin, CheckCircle2, Clock, ExternalLink } from 'lucide-react';
import type { Json } from '@/integrations/supabase/types';

interface TrackingEvent {
  timestamp: string;
  status: string;
  location?: string;
  description: string;
}

interface Shipment {
  id: string;
  carrier: string;
  tracking_number: string;
  tracking_url: string | null;
  status: string | null;
  estimated_delivery: string | null;
  events: Json;
}

interface ShipmentTrackerProps {
  orderId: string;
}

const statusConfig: Record<string, { icon: typeof Clock; label: string }> = {
  label_created: { icon: Package, label: 'Label erstellt' },
  picked_up: { icon: Package, label: 'Abgeholt' },
  in_transit: { icon: Truck, label: 'Unterwegs' },
  out_for_delivery: { icon: MapPin, label: 'In Zustellung' },
  delivered: { icon: CheckCircle2, label: 'Zugestellt' },
};

export function ShipmentTracker({ orderId }: ShipmentTrackerProps) {
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('shipment_tracking')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      setShipment(data);
      setLoading(false);
    })();
  }, [orderId]);

  if (loading) {
    return <div className="h-32 bg-muted animate-pulse" />;
  }

  if (!shipment) return null;

  const events = (Array.isArray(shipment.events) ? shipment.events : []) as unknown as TrackingEvent[];
  const currentStatus = statusConfig[shipment.status || 'label_created'] || statusConfig.label_created;
  const CurrentIcon = currentStatus.icon;

  return (
    <div className="space-y-6">
      <h2 className="text-[10px] tracking-[0.2em] uppercase text-accent">Sendungsverfolgung</h2>

      {/* Carrier & tracking number */}
      <div className="p-5 border border-border space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CurrentIcon className="w-5 h-5 text-accent" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-medium text-foreground">{currentStatus.label}</p>
              <p className="text-xs text-muted-foreground">{shipment.carrier} · {shipment.tracking_number}</p>
            </div>
          </div>
          {shipment.tracking_url && (
            <a
              href={shipment.tracking_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-border text-[11px] tracking-[0.1em] uppercase text-foreground hover:bg-muted transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
              Tracking öffnen
            </a>
          )}
        </div>

        {shipment.estimated_delivery && (
          <p className="text-xs text-muted-foreground">
            Voraussichtliche Zustellung: {new Date(shipment.estimated_delivery).toLocaleDateString('de-DE', {
              weekday: 'long', day: '2-digit', month: 'long',
            })}
          </p>
        )}
      </div>

      {/* Events timeline */}
      {events.length > 0 && (
        <div className="relative pl-6 space-y-4">
          <div className="absolute left-2 top-1 bottom-1 w-px bg-border" />
          {events.map((event, i) => (
            <div key={i} className="relative">
              <div className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 ${
                i === 0 ? 'border-accent bg-accent/20' : 'border-border bg-background'
              }`} />
              <div>
                <p className="text-sm text-foreground">{event.description}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">
                    {new Date(event.timestamp).toLocaleString('de-DE', {
                      day: '2-digit', month: '2-digit', year: '2-digit',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                  {event.location && (
                    <span className="text-xs text-muted-foreground">· {event.location}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
