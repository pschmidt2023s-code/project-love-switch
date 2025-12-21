import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Cookie, Settings, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

const COOKIE_CONSENT_KEY = 'aldenair_cookie_consent';
const COOKIE_PREFERENCES_KEY = 'aldenair_cookie_preferences';

export function useCookieConsent() {
  const openCookieSettings = () => {
    window.dispatchEvent(new CustomEvent('openCookieSettings'));
  };

  const getPreferences = (): CookiePreferences => {
    const saved = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (saved) return JSON.parse(saved);
    return { essential: true, analytics: false, marketing: false };
  };

  return { openCookieSettings, getPreferences };
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (!consent) {
      timer = setTimeout(() => setShowBanner(true), 1000);
    } else {
      const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences));
      }
    }

    const handleOpenSettings = () => {
      setShowSettings(true);
      setShowBanner(true);
    };

    window.addEventListener('openCookieSettings', handleOpenSettings);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('openCookieSettings', handleOpenSettings);
    };
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = { essential: true, analytics: true, marketing: true };
    setPreferences(allAccepted);
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(allAccepted));
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleAcceptEssential = () => {
    const essentialOnly = { essential: true, analytics: false, marketing: false };
    setPreferences(essentialOnly);
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(essentialOnly));
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences));
    setShowBanner(false);
    setShowSettings(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6">
      <Card className="max-w-4xl mx-auto shadow-2xl border-2">
        <CardContent className="p-6">
          {!showSettings ? (
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Cookie className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Cookie-Einstellungen</h3>
                  <p className="text-sm text-muted-foreground">
                    Wir verwenden Cookies, um Ihnen die bestmögliche Erfahrung zu bieten.{' '}
                    <Link to="/privacy" className="text-primary hover:underline">
                      Mehr erfahren
                    </Link>
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
                  <Settings className="w-4 h-4 mr-2" />
                  Anpassen
                </Button>
                <Button variant="outline" size="sm" onClick={handleAcceptEssential}>
                  Nur Notwendige
                </Button>
                <Button size="sm" onClick={handleAcceptAll}>
                  Alle akzeptieren
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary" />
                <h3 className="font-semibold text-foreground">Cookie-Einstellungen verwalten</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Label className="font-medium">Notwendige Cookies</Label>
                    <p className="text-sm text-muted-foreground">
                      Diese Cookies sind für die Grundfunktionen erforderlich.
                    </p>
                  </div>
                  <Switch checked disabled />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Label className="font-medium">Analyse-Cookies</Label>
                    <p className="text-sm text-muted-foreground">
                      Helfen uns zu verstehen, wie Sie unsere Website nutzen.
                    </p>
                  </div>
                  <Switch
                    checked={preferences.analytics}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, analytics: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Label className="font-medium">Marketing-Cookies</Label>
                    <p className="text-sm text-muted-foreground">
                      Werden verwendet, um Ihnen relevante Werbung anzuzeigen.
                    </p>
                  </div>
                  <Switch
                    checked={preferences.marketing}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, marketing: checked })
                    }
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setShowSettings(false)}>
                  Zurück
                </Button>
                <Button size="sm" onClick={handleSavePreferences}>
                  Einstellungen speichern
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
