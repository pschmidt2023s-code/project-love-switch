import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { PremiumPageLayout } from '@/components/premium/PremiumPageLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Seo } from '@/components/Seo';
import { AuthModal } from '@/components/AuthModal';
import { api } from '@/lib/api';
import {
  User, MapPin, ShoppingBag, Gift, Shield, ChevronRight, Star, Crown
} from 'lucide-react';

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
    if (section) setActiveSection(section);
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      api.profile.get().then(({ data }) => { setProfile(data); setLoading(false); }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <PremiumPageLayout>
        <Seo title="Profil | ALDENAIR" description="Verwalten Sie Ihr ALDENAIR Profil" canonicalPath="/profile" />
        <div className="container-premium py-24 text-center">
          <div className="w-20 h-20 mx-auto flex items-center justify-center border border-border mb-6">
            <User className="w-10 h-10 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-3xl text-foreground mb-4">Melde dich an</h1>
          <p className="text-muted-foreground text-sm mb-8 max-w-md mx-auto">
            Erstelle ein Konto oder melde dich an, um dein Profil zu verwalten.
          </p>
          <AuthModal>
            <button className="px-8 py-3 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors">
              Jetzt anmelden
            </button>
          </AuthModal>
        </div>
      </PremiumPageLayout>
    );
  }

  const tier = (profile?.tier as keyof typeof TIER_CONFIG) || 'bronze';
  const tierConfig = TIER_CONFIG[tier];
  const TierIcon = tierConfig.icon;

  const menuItems = [
    { id: 'profile', label: 'Persönliche Daten', icon: User, description: 'Name, E-Mail und Telefon' },
    { id: 'addresses', label: 'Adressen', icon: MapPin, description: 'Liefer- und Rechnungsadressen' },
    { id: 'orders', label: 'Bestellungen', icon: ShoppingBag, description: 'Bestellverlauf und Status' },
    { id: 'loyalty', label: 'Treueprogramm', icon: Gift, description: 'Punkte und Vorteile' },
    { id: 'security', label: 'Sicherheit', icon: Shield, description: 'Passwort und 2FA' },
  ];

  return (
    <PremiumPageLayout>
      <Seo title="Profil | ALDENAIR" description="Verwalten Sie Ihr ALDENAIR Profil" canonicalPath="/profile" />

      <section className="border-b border-border">
        <div className="container-premium py-8 lg:py-12">
          <Breadcrumb className="mb-6" />
          <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-3">Profil</span>
          <h1 className="font-display text-3xl lg:text-4xl text-foreground">Mein Profil</h1>
        </div>
      </section>

      <section className="section-spacing">
        <div className="container-premium">
          <div className="max-w-2xl mx-auto">
            {activeSection !== 'menu' && (
              <button onClick={() => setActiveSection('menu')} className="inline-flex items-center gap-2 mb-8 text-sm text-accent hover:underline">
                ← Zurück zum Menü
              </button>
            )}

            {activeSection === 'menu' && (
              <div className="space-y-6">
                {/* Profile Header Card */}
                <div className="p-6 border border-border flex items-center gap-4">
                  <div className="w-14 h-14 flex items-center justify-center bg-accent/10">
                    <User className="w-7 h-7 text-accent" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-display text-lg text-foreground">
                      {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : user.email}
                    </h2>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-flex items-center gap-1 text-[9px] tracking-[0.1em] uppercase px-2 py-1 text-white ${tierConfig.color}`}>
                        <TierIcon className="w-3 h-3" /> {tierConfig.name}
                      </span>
                      {profile?.payback_balance > 0 && (
                        <span className="text-[9px] tracking-[0.1em] uppercase px-2 py-1 border border-border text-muted-foreground">
                          {profile.payback_balance.toFixed(2)} € Guthaben
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="space-y-2">
                  {menuItems.map(item => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => item.id === 'orders' ? navigate('/orders') : item.id === 'addresses' ? navigate('/account') : setActiveSection(item.id as ProfileSection)}
                        className="w-full flex items-center gap-4 p-4 border border-border hover:border-accent/50 transition-colors text-left"
                      >
                        <div className="w-10 h-10 flex items-center justify-center bg-accent/10 flex-shrink-0">
                          <Icon className="w-5 h-5 text-accent" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-foreground">{item.label}</h3>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => { signOut(); navigate('/'); }}
                  className="w-full py-3 border border-border text-[11px] tracking-[0.15em] uppercase text-foreground hover:bg-muted transition-colors mt-4"
                >
                  Abmelden
                </button>
              </div>
            )}

            {activeSection === 'profile' && (
              <div className="border border-border p-6 space-y-4">
                <h2 className="text-[10px] tracking-[0.2em] uppercase text-accent mb-4">Persönliche Daten</h2>
                {[
                  { label: 'E-Mail', value: user.email },
                  { label: 'Vorname', value: profile?.first_name || '-' },
                  { label: 'Nachname', value: profile?.last_name || '-' },
                  { label: 'Telefon', value: profile?.phone || '-' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between py-3 border-b border-border last:border-0">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className="text-sm text-foreground font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'loyalty' && (
              <div className="border border-border p-6 space-y-6">
                <h2 className="text-[10px] tracking-[0.2em] uppercase text-accent">Treueprogramm</h2>
                <div className="flex items-center gap-4">
                  <span className={`inline-flex items-center gap-2 text-sm px-4 py-2 text-white ${tierConfig.color}`}>
                    <TierIcon className="w-5 h-5" /> {tierConfig.name}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border border-border text-center">
                    <p className="font-display text-2xl text-foreground">{(profile?.payback_balance || 0).toFixed(2)} €</p>
                    <p className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground mt-1">Guthaben</p>
                  </div>
                  <div className="p-4 border border-border text-center">
                    <p className="font-display text-2xl text-foreground">{(profile?.total_spent || 0).toFixed(2)} €</p>
                    <p className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground mt-1">Gesamtausgaben</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="border border-border p-6">
                <h2 className="text-[10px] tracking-[0.2em] uppercase text-accent mb-4">Sicherheit</h2>
                <p className="text-sm text-muted-foreground">Sicherheitseinstellungen werden in Kürze verfügbar sein.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </PremiumPageLayout>
  );
}