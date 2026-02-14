import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Download, FileText, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function GDPRExport() {
  const [email, setEmail] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exportData, setExportData] = useState<string | null>(null);

  async function handleExport() {
    if (!email.trim()) { toast.error('E-Mail eingeben'); return; }
    setExporting(true);
    setExportData(null);

    try {
      // Find user profile by email
      const { data: profiles } = await supabase.from('profiles').select('*').eq('email', email).limit(1);
      if (!profiles || profiles.length === 0) {
        toast.error('Kein Nutzer mit dieser E-Mail gefunden');
        setExporting(false);
        return;
      }

      const profile = profiles[0];
      const userId = profile.id;

      // Fetch all user data in parallel
      const [addressesRes, ordersRes, wishlistRes, returnsRes, ticketsRes, subscriptionsRes] = await Promise.all([
        supabase.from('addresses').select('*').eq('user_id', userId),
        supabase.from('orders').select('*, order_items(*)').eq('user_id', userId),
        supabase.from('wishlist').select('*').eq('user_id', userId),
        supabase.from('returns').select('*').eq('user_id', userId),
        supabase.from('tickets').select('*').eq('user_id', userId),
        supabase.from('subscriptions').select('*').eq('user_id', userId),
      ]);

      const exportObj = {
        exported_at: new Date().toISOString(),
        user_email: email,
        profile: profile,
        addresses: addressesRes.data || [],
        orders: ordersRes.data || [],
        wishlist: wishlistRes.data || [],
        returns: returnsRes.data || [],
        tickets: ticketsRes.data || [],
        subscriptions: subscriptionsRes.data || [],
      };

      const json = JSON.stringify(exportObj, null, 2);
      setExportData(json);
      toast.success('Daten exportiert');
    } catch (e) {
      console.error(e);
      toast.error('Fehler beim Export');
    } finally {
      setExporting(false);
    }
  }

  function downloadJSON() {
    if (!exportData) return;
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dsgvo-export-${email}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-display text-foreground mb-1">DSGVO Datenexport</h1>
        <p className="text-xs text-muted-foreground">Kundendaten als JSON exportieren (Art. 15 DSGVO)</p>
      </div>

      <div className="bg-card border border-border p-6 space-y-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-muted-foreground mt-0.5" strokeWidth={1.5} />
          <div>
            <p className="text-sm text-foreground font-medium">Datenschutz-konformer Export</p>
            <p className="text-xs text-muted-foreground mt-1">
              Exportiert alle personenbezogenen Daten eines Kunden: Profil, Adressen, Bestellungen, Wunschliste, Retouren, Tickets und Abonnements.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">Kunden E-Mail</label>
          <div className="flex gap-3">
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="kunde@beispiel.de"
              className="flex-1 px-4 py-3 bg-transparent border border-border text-foreground text-sm focus:outline-none focus:border-foreground/50"
              type="email"
            />
            <button
              onClick={handleExport}
              disabled={exporting}
              className="inline-flex items-center gap-2 px-5 py-3 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              Exportieren
            </button>
          </div>
        </div>
      </div>

      {exportData && (
        <div className="bg-card border border-border">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="text-base font-display text-foreground">Export-Ergebnis</h2>
            <button
              onClick={downloadJSON}
              className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors"
            >
              <Download className="w-4 h-4" /> JSON herunterladen
            </button>
          </div>
          <div className="p-4 max-h-96 overflow-auto">
            <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap">{exportData.slice(0, 2000)}...</pre>
          </div>
        </div>
      )}
    </div>
  );
}
