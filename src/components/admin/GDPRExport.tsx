import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Download, FileText, Shield, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { executeRightToDelete } from '@/lib/gdpr';

export default function GDPRExport() {
  const [email, setEmail] = useState('');
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exportData, setExportData] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [foundUserId, setFoundUserId] = useState<string | null>(null);

  async function handleExport() {
    if (!email.trim()) { toast.error('E-Mail eingeben'); return; }
    setExporting(true);
    setExportData(null);

    try {
      const { data: profiles } = await supabase.from('profiles').select('*').eq('email', email).limit(1);
      if (!profiles || profiles.length === 0) {
        toast.error('Kein Nutzer mit dieser E-Mail gefunden');
        setExporting(false);
        return;
      }

      const profile = profiles[0];
      const userId = profile.id;
      setFoundUserId(userId);

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

  async function handleDelete() {
    if (!foundUserId || deleteConfirm !== 'LÖSCHEN') {
      toast.error('Bitte "LÖSCHEN" eingeben zur Bestätigung');
      return;
    }

    setDeleting(true);
    try {
      const result = await executeRightToDelete(foundUserId);

      if (result.success) {
        toast.success(`Alle Daten für ${email} wurden gelöscht (${result.results.reduce((s, r) => s + r.deleted, 0)} Einträge)`);
      } else {
        toast.warning(`Teilweise gelöscht. Fehler: ${result.errors.join(', ')}`);
      }

      setShowDeleteDialog(false);
      setDeleteConfirm('');
      setExportData(null);
      setFoundUserId(null);
    } catch (e) {
      toast.error('Fehler beim Löschen');
      console.error(e);
    } finally {
      setDeleting(false);
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
        <h1 className="text-xl font-display text-foreground mb-1">DSGVO Datenmanagement</h1>
        <p className="text-xs text-muted-foreground">Export (Art. 15) & Löschung (Art. 17 DSGVO)</p>
      </div>

      <div className="bg-card border border-border p-6 space-y-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-muted-foreground mt-0.5" strokeWidth={1.5} />
          <div>
            <p className="text-sm text-foreground font-medium">Datenschutz-konformer Export & Löschung</p>
            <p className="text-xs text-muted-foreground mt-1">
              Exportiert oder löscht alle personenbezogenen Daten eines Kunden gemäß DSGVO.
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
            <div className="flex gap-2">
              <button
                onClick={downloadJSON}
                className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors"
              >
                <Download className="w-4 h-4" /> JSON
              </button>
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-destructive/90 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Daten löschen
              </button>
            </div>
          </div>
          <div className="p-4 max-h-96 overflow-auto">
            <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap">{exportData.slice(0, 2000)}...</pre>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="bg-card border-2 border-destructive p-6 space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">Unwiderrufliche Datenlöschung</p>
              <p className="text-xs text-muted-foreground mt-1">
                Alle personenbezogenen Daten von <strong>{email}</strong> werden gelöscht. 
                Bestellhistorie wird anonymisiert. Diese Aktion kann nicht rückgängig gemacht werden.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
              Tippe "LÖSCHEN" zur Bestätigung
            </label>
            <input
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              placeholder="LÖSCHEN"
              className="w-full px-4 py-3 bg-transparent border border-destructive/50 text-foreground text-sm focus:outline-none focus:border-destructive"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setShowDeleteDialog(false); setDeleteConfirm(''); }}
              className="px-4 py-2 border border-border text-foreground text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-muted transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting || deleteConfirm !== 'LÖSCHEN'}
              className="inline-flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Endgültig löschen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
