import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Settings, Bell, Mail, Shield, Database, Globe } from 'lucide-react';

export default function SettingsManagement() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    orderAlerts: true,
    lowStockAlerts: true,
    maintenanceMode: false,
    allowGuestCheckout: true,
    freeShippingThreshold: '50',
    expressShippingCost: '2.99',
    standardShippingCost: '4.99',
  });

  const handleSave = () => {
    toast({ title: 'Erfolg', description: 'Einstellungen gespeichert' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Einstellungen</h2>
        <p className="text-muted-foreground">Verwalten Sie die Shop-Einstellungen</p>
      </div>

      <div className="grid gap-6">
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
                checked={settings.emailNotifications}
                onCheckedChange={(v) => setSettings({ ...settings, emailNotifications: v })}
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
                checked={settings.orderAlerts}
                onCheckedChange={(v) => setSettings({ ...settings, orderAlerts: v })}
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
                checked={settings.lowStockAlerts}
                onCheckedChange={(v) => setSettings({ ...settings, lowStockAlerts: v })}
              />
            </div>
          </CardContent>
        </Card>

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
                  value={settings.freeShippingThreshold}
                  onChange={(e) => setSettings({ ...settings, freeShippingThreshold: e.target.value })}
                />
              </div>
              <div>
                <Label>Standardversand (€)</Label>
                <Input
                  type="number"
                  value={settings.standardShippingCost}
                  onChange={(e) => setSettings({ ...settings, standardShippingCost: e.target.value })}
                />
              </div>
              <div>
                <Label>Expressversand (€)</Label>
                <Input
                  type="number"
                  value={settings.expressShippingCost}
                  onChange={(e) => setSettings({ ...settings, expressShippingCost: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

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
                checked={settings.allowGuestCheckout}
                onCheckedChange={(v) => setSettings({ ...settings, allowGuestCheckout: v })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-destructive">Wartungsmodus</Label>
                <p className="text-sm text-muted-foreground">
                  Shop für Besucher sperren
                </p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(v) => setSettings({ ...settings, maintenanceMode: v })}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Einstellungen speichern</Button>
      </div>
    </div>
  );
}
