import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Bell, Mail, Shield, Database, Globe, Megaphone, AlertTriangle, Loader2 } from 'lucide-react';

interface ShopSettings {
  id: string;
  maintenance_mode: boolean;
  maintenance_message: string;
  announce_bar_enabled: boolean;
  announce_bar_message: string;
  announce_bar_link: string;
  free_shipping_threshold: number;
  standard_shipping_cost: number;
  express_shipping_cost: number;
  allow_guest_checkout: boolean;
  email_notifications: boolean;
  order_alerts: boolean;
  low_stock_alerts: boolean;
  low_stock_threshold: number;
}

const defaultSettings: ShopSettings = {
  id: 'shop_settings',
  maintenance_mode: false,
  maintenance_message: 'Der Shop ist derzeit in Wartung. Bitte versuchen Sie es später erneut.',
  announce_bar_enabled: false,
  announce_bar_message: '',
  announce_bar_link: '',
  free_shipping_threshold: 50,
  standard_shipping_cost: 4.99,
  express_shipping_cost: 2.99,
  allow_guest_checkout: true,
  email_notifications: true,
  order_alerts: true,
  low_stock_alerts: true,
  low_stock_threshold: 5,
};

export default function SettingsManagement() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<ShopSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 'shop_settings')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setSettings({
          id: data.id,
          maintenance_mode: data.maintenance_mode ?? false,
          maintenance_message: data.maintenance_message ?? defaultSettings.maintenance_message,
          announce_bar_enabled: data.announce_bar_enabled ?? false,
          announce_bar_message: data.announce_bar_message ?? '',
          announce_bar_link: data.announce_bar_link ?? '',
          free_shipping_threshold: Number(data.free_shipping_threshold) || 50,
          standard_shipping_cost: Number(data.standard_shipping_cost) || 4.99,
          express_shipping_cost: Number(data.express_shipping_cost) || 2.99,
          allow_guest_checkout: data.allow_guest_checkout ?? true,
          email_notifications: data.email_notifications ?? true,
          order_alerts: data.order_alerts ?? true,
          low_stock_alerts: data.low_stock_alerts ?? true,
          low_stock_threshold: data.low_stock_threshold ?? 5,
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          id: 'shop_settings',
          maintenance_mode: settings.maintenance_mode,
          maintenance_message: settings.maintenance_message,
          announce_bar_enabled: settings.announce_bar_enabled,
          announce_bar_message: settings.announce_bar_message,
          announce_bar_link: settings.announce_bar_link,
          free_shipping_threshold: settings.free_shipping_threshold,
          standard_shipping_cost: settings.standard_shipping_cost,
          express_shipping_cost: settings.express_shipping_cost,
          allow_guest_checkout: settings.allow_guest_checkout,
          email_notifications: settings.email_notifications,
          order_alerts: settings.order_alerts,
          low_stock_alerts: settings.low_stock_alerts,
          low_stock_threshold: settings.low_stock_threshold,
        });

      if (error) throw error;
      toast({ title: 'Erfolg', description: 'Einstellungen gespeichert' });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({ title: 'Fehler', description: 'Einstellungen konnten nicht gespeichert werden', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Einstellungen</h2>
        <p className="text-muted-foreground">Verwalten Sie die Shop-Einstellungen</p>
      </div>

      <div className="grid gap-6">
        {/* Announcement Bar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="w-5 h-5" />
              Ankündigungsleiste
            </CardTitle>
            <CardDescription>
              Banner-Nachricht oben auf der Website anzeigen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Ankündigungsleiste aktivieren</Label>
                <p className="text-sm text-muted-foreground">
                  Banner oben auf allen Seiten anzeigen
                </p>
              </div>
              <Switch
                checked={settings.announce_bar_enabled}
                onCheckedChange={(v) => setSettings({ ...settings, announce_bar_enabled: v })}
              />
            </div>
            <div>
              <Label>Nachricht</Label>
              <Input
                value={settings.announce_bar_message}
                onChange={(e) => setSettings({ ...settings, announce_bar_message: e.target.value })}
                placeholder="z.B. 🎉 20% Rabatt auf alle Produkte!"
              />
            </div>
            <div>
              <Label>Link (optional)</Label>
              <Input
                value={settings.announce_bar_link}
                onChange={(e) => setSettings({ ...settings, announce_bar_link: e.target.value })}
                placeholder="/products oder https://..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Benachrichtigungen
            </CardTitle>
            <CardDescription>
              Konfigurieren Sie E-Mail- und Push-Benachrichtigungen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>E-Mail Benachrichtigungen</Label>
                <p className="text-sm text-muted-foreground">
                  Erhalten Sie E-Mails bei neuen Bestellungen
                </p>
              </div>
              <Switch
                checked={settings.email_notifications}
                onCheckedChange={(v) => setSettings({ ...settings, email_notifications: v })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Bestellbenachrichtigungen</Label>
                <p className="text-sm text-muted-foreground">
                  Sofortige Alerts bei neuen Bestellungen
                </p>
              </div>
              <Switch
                checked={settings.order_alerts}
                onCheckedChange={(v) => setSettings({ ...settings, order_alerts: v })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Niedriger Bestand</Label>
                <p className="text-sm text-muted-foreground">
                  Benachrichtigung bei niedrigem Lagerbestand
                </p>
              </div>
              <Switch
                checked={settings.low_stock_alerts}
                onCheckedChange={(v) => setSettings({ ...settings, low_stock_alerts: v })}
              />
            </div>
            {settings.low_stock_alerts && (
              <div className="pl-4 border-l-2 border-muted">
                <Label>Schwellenwert</Label>
                <Input
                  type="number"
                  value={settings.low_stock_threshold}
                  onChange={(e) => setSettings({ ...settings, low_stock_threshold: parseInt(e.target.value) || 5 })}
                  className="w-24 mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">Benachrichtigung wenn Bestand unter diesem Wert</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shipping */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Versand
            </CardTitle>
            <CardDescription>
              Konfigurieren Sie Versandoptionen und Kosten
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Kostenloser Versand ab (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={settings.free_shipping_threshold}
                  onChange={(e) => setSettings({ ...settings, free_shipping_threshold: parseFloat(e.target.value) || 50 })}
                />
              </div>
              <div>
                <Label>Standardversand (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={settings.standard_shipping_cost}
                  onChange={(e) => setSettings({ ...settings, standard_shipping_cost: parseFloat(e.target.value) || 4.99 })}
                />
              </div>
              <div>
                <Label>Expressversand (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={settings.express_shipping_cost}
                  onChange={(e) => setSettings({ ...settings, express_shipping_cost: parseFloat(e.target.value) || 2.99 })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shop Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Shop-Einstellungen
            </CardTitle>
            <CardDescription>
              Allgemeine Shop-Konfiguration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Gast-Checkout erlauben</Label>
                <p className="text-sm text-muted-foreground">
                  Kunden können ohne Konto bestellen
                </p>
              </div>
              <Switch
                checked={settings.allow_guest_checkout}
                onCheckedChange={(v) => setSettings({ ...settings, allow_guest_checkout: v })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div>
                <Label className="text-destructive flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Wartungsmodus
                </Label>
                <p className="text-sm text-muted-foreground">
                  Shop für Besucher sperren (Admins haben weiterhin Zugriff)
                </p>
              </div>
              <Switch
                checked={settings.maintenance_mode}
                onCheckedChange={(v) => setSettings({ ...settings, maintenance_mode: v })}
              />
            </div>
            {settings.maintenance_mode && (
              <div className="pl-4 border-l-2 border-destructive">
                <Label>Wartungsmeldung</Label>
                <Textarea
                  value={settings.maintenance_message}
                  onChange={(e) => setSettings({ ...settings, maintenance_message: e.target.value })}
                  placeholder="Nachricht für Besucher während der Wartung..."
                  rows={2}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Einstellungen speichern
        </Button>
      </div>
    </div>
  );
}
