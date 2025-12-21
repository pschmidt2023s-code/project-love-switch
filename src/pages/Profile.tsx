import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft, User, MapPin, ShoppingBag, Gift, Shield,
  ChevronRight, Star, Package, Crown, Loader2
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { api } from '@/lib/api';
import { AuthModal } from '@/components/AuthModal';

type ProfileSection = 'menu' | 'profile' | 'addresses' | 'orders' | 'loyalty' | 'security';

const TIER_CONFIG = {
  bronze: { name: 'Bronze', color: 'bg-orange-700', icon: Star },
  silver: { name: 'Silber', color: 'bg-gray-400', icon: Star },
  gold: { name: 'Gold', color: 'bg-yellow-500 text-black', icon: Crown },
  platinum: { name: 'Platin', color: 'bg-gradient-to-r from-gray-300 to-gray-500 text-black', icon: Crown },
};

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState<ProfileSection>('menu');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const section = searchParams.get('section') as ProfileSection;
    if (section) {
      setActiveSection(section);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data } = await api.profile.get();
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-background pb-20 md:pb-0">
          <div className="container mx-auto px-4 py-16 text-center">
            <User className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-4">Melde dich an</h1>
            <p className="text-muted-foreground mb-8">
              Erstelle ein Konto oder melde dich an, um dein Profil zu verwalten.
            </p>
            <AuthModal>
              <Button size="lg">Jetzt anmelden</Button>
            </AuthModal>
          </div>
        </div>
        <Footer />
        <MobileBottomNav />
      </>
    );
  }

  const menuItems = [
    { id: 'profile', label: 'Persönliche Daten', icon: User, description: 'Name, E-Mail und Telefon' },
    { id: 'addresses', label: 'Adressen', icon: MapPin, description: 'Liefer- und Rechnungsadressen' },
    { id: 'orders', label: 'Bestellungen', icon: ShoppingBag, description: 'Bestellverlauf und Status' },
    { id: 'loyalty', label: 'Treueprogramm', icon: Gift, description: 'Punkte und Vorteile' },
    { id: 'security', label: 'Sicherheit', icon: Shield, description: 'Passwort und 2FA' },
  ];

  const tier = (profile?.tier as keyof typeof TIER_CONFIG) || 'bronze';
  const tierConfig = TIER_CONFIG[tier];
  const TierIcon = tierConfig.icon;

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {activeSection !== 'menu' && (
              <Button
                onClick={() => setActiveSection('menu')}
                variant="outline"
                className="mb-8"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zurück zum Menü
              </Button>
            )}

            {activeSection === 'menu' && (
              <>
                {/* Profile Header */}
                <Card className="mb-8">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-8 h-8 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h1 className="text-xl font-bold">
                          {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : user.email}
                        </h1>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={tierConfig.color}>
                            <TierIcon className="w-3 h-3 mr-1" />
                            {tierConfig.name}
                          </Badge>
                          {profile?.payback_balance > 0 && (
                            <Badge variant="outline">
                              {profile.payback_balance.toFixed(2)} € Guthaben
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Menu Items */}
                <div className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Card
                        key={item.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setActiveSection(item.id as ProfileSection)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Icon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium">{item.label}</h3>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Logout Button */}
                <Button
                  variant="outline"
                  className="w-full mt-8"
                  onClick={() => {
                    signOut();
                    navigate('/');
                  }}
                >
                  Abmelden
                </Button>
              </>
            )}

            {activeSection === 'profile' && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-6">Persönliche Daten</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">E-Mail</label>
                      <p className="text-muted-foreground">{user.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Vorname</label>
                      <p className="text-muted-foreground">{profile?.first_name || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Nachname</label>
                      <p className="text-muted-foreground">{profile?.last_name || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Telefon</label>
                      <p className="text-muted-foreground">{profile?.phone || '-'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'addresses' && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-6">Adressen</h2>
                  <p className="text-muted-foreground">Adressverwaltung wird geladen...</p>
                </CardContent>
              </Card>
            )}

            {activeSection === 'orders' && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-6">Bestellungen</h2>
                  <p className="text-muted-foreground">Bestellverlauf wird geladen...</p>
                </CardContent>
              </Card>
            )}

            {activeSection === 'loyalty' && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-6">Treueprogramm</h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Badge className={`${tierConfig.color} text-lg px-4 py-2`}>
                        <TierIcon className="w-5 h-5 mr-2" />
                        {tierConfig.name}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Guthaben</label>
                      <p className="text-2xl font-bold text-primary">
                        {(profile?.payback_balance || 0).toFixed(2)} €
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Gesamtausgaben</label>
                      <p className="text-muted-foreground">
                        {(profile?.total_spent || 0).toFixed(2)} €
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'security' && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-6">Sicherheit</h2>
                  <p className="text-muted-foreground">Sicherheitseinstellungen werden geladen...</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      <Footer />
      <MobileBottomNav />
    </>
  );
}
