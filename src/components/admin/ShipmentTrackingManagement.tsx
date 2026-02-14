import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Truck, Package, MapPin, ExternalLink } from 'lucide-react';

interface Shipment {
  id: string;
  order_id: string;
  carrier: string;
  tracking_number: string;
  tracking_url: string | null;
  status: string;
  estimated_delivery: string | null;
  created_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  label_created: 'Label erstellt',
  picked_up: 'Abgeholt',
  in_transit: 'Unterwegs',
  out_for_delivery: 'In Zustellung',
  delivered: 'Zugestellt',
  returned: 'Retour',
};

export default function ShipmentTrackingManagement() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShipments();
  }, []);

  async function fetchShipments() {
    const { data } = await supabase.from('shipment_tracking').select('*').order('created_at', { ascending: false }).limit(50);
    setShipments(data || []);
    setLoading(false);
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-500/10 text-green-600';
      case 'in_transit': case 'out_for_delivery': return 'bg-blue-500/10 text-blue-600';
      case 'returned': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const inTransit = shipments.filter(s => ['in_transit', 'out_for_delivery'].includes(s.status)).length;
  const delivered = shipments.filter(s => s.status === 'delivered').length;

  if (loading) return <div className="p-12 text-center"><div className="w-6 h-6 border-2 border-accent border-t-transparent animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-display text-foreground mb-1">Versand-Tracking</h1>
        <p className="text-xs text-muted-foreground">DHL/DPD Sendungsverfolgung</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] tracking-[0.1em] uppercase text-muted-foreground">Gesamt</span>
            <Package className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <p className="text-xl font-display text-foreground">{shipments.length}</p>
        </div>
        <div className="bg-card border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] tracking-[0.1em] uppercase text-muted-foreground">Unterwegs</span>
            <Truck className="w-4 h-4 text-blue-500" strokeWidth={1.5} />
          </div>
          <p className="text-xl font-display text-foreground">{inTransit}</p>
        </div>
        <div className="bg-card border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] tracking-[0.1em] uppercase text-muted-foreground">Zugestellt</span>
            <MapPin className="w-4 h-4 text-green-500" strokeWidth={1.5} />
          </div>
          <p className="text-xl font-display text-foreground">{delivered}</p>
        </div>
      </div>

      <div className="bg-card border border-border">
        <div className="p-4 border-b border-border">
          <h2 className="text-base font-display text-foreground">Sendungen</h2>
        </div>
        <div className="divide-y divide-border">
          {shipments.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Keine Sendungen vorhanden</div>
          ) : shipments.map(shipment => (
            <div key={shipment.id} className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{shipment.tracking_number}</span>
                  <span className="text-xs text-muted-foreground">{shipment.carrier}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(shipment.created_at).toLocaleDateString('de-DE')}
                  {shipment.estimated_delivery && ` · Zustellung: ${new Date(shipment.estimated_delivery).toLocaleDateString('de-DE')}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] tracking-[0.1em] uppercase px-2 py-1 ${getStatusColor(shipment.status)}`}>
                  {STATUS_LABELS[shipment.status] || shipment.status}
                </span>
                {shipment.tracking_url && (
                  <a href={shipment.tracking_url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-muted-foreground hover:text-foreground">
                    <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
