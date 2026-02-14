import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PremiumPageLayout } from '@/components/premium/PremiumPageLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Seo } from '@/components/Seo';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  User, Package, MapPin, LogOut, Edit2, Plus, Trash2, ChevronRight, Award, Gift
} from 'lucide-react';
import { LoyaltyProgress } from '@/components/LoyaltyProgress';

interface Profile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  tier: string | null;
  total_spent: number | null;
  payback_balance: number | null;
}

interface Address {
  id: string;
  first_name: string;
  last_name: string;
  street: string;
  street2: string | null;
  city: string;
  postal_code: string;
  country: string;
  type: string;
  is_default: boolean;
}

interface Order {
  id: string;
  order_number: string;
  total: number;
  status: string;
  created_at: string;
}

export default function Account() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses' | 'loyalty' | 'referral'>('profile');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', phone: '' });

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/auth'); return; }
    loadAccountData();
  }, [user, authLoading, navigate]);

  async function loadAccountData() {
    if (!user) return;
    try {
      const [profileRes, addressesRes, ordersRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false }),
        supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
      ]);
      if (profileRes.data) {
        setProfile(profileRes.data);
        setEditForm({ first_name: profileRes.data.first_name || '', last_name: profileRes.data.last_name || '', phone: profileRes.data.phone || '' });
      }
      if (addressesRes.data) setAddresses(addressesRes.data);
      if (ordersRes.data) setOrders(ordersRes.data);
    } catch (error) {
      console.error('Error loading account data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    try {
      const { error } = await supabase.from('profiles').update(editForm).eq('id', user.id);
      if (error) throw error;
      setProfile(prev => prev ? { ...prev, ...editForm } : null);
      setIsEditing(false);
      toast.success('Profil aktualisiert');
    } catch { toast.error('Fehler beim Aktualisieren'); }
  }

  async function handleDeleteAddress(id: string) {
    try {
      const { error } = await supabase.from('addresses').delete().eq('id', id);
      if (error) throw error;
      setAddresses(prev => prev.filter(a => a.id !== id));
      toast.success('Adresse gelöscht');
    } catch { toast.error('Fehler beim Löschen'); }
  }

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      pending: 'Ausstehend', processing: 'In Bearbeitung', paid: 'Bezahlt',
      shipped: 'Versendet', delivered: 'Zugestellt', cancelled: 'Storniert', completed: 'Abgeschlossen',
    };
    return map[status] || status;
  };

  const tabs = [
    { id: 'profile' as const, label: 'Profil', icon: User },
    { id: 'loyalty' as const, label: 'Treueprogramm', icon: Award },
    { id: 'orders' as const, label: 'Bestellungen', icon: Package },
    { id: 'addresses' as const, label: 'Adressen', icon: MapPin },
    { id: 'referral' as const, label: 'Freunde werben', icon: Gift },
  ];

  if (loading || authLoading) {
    return (
      <PremiumPageLayout>
        <div className="container-premium py-16">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-muted" />
            <div className="h-64 bg-muted" />
          </div>
        </div>
      </PremiumPageLayout>
    );
  }

  return (
    <PremiumPageLayout>
      <Seo title="Mein Konto | ALDENAIR" description="Verwalten Sie Ihr ALDENAIR Konto" canonicalPath="/account" />

      {/* Header */}
      <section className="border-b border-border">
        <div className="container-premium py-8 lg:py-12">
          <Breadcrumb className="mb-6" />
          <div className="flex items-center justify-between">
            <div>
              <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-3">Konto</span>
              <h1 className="font-display text-3xl lg:text-4xl text-foreground">
                Willkommen, {profile?.first_name || 'Kunde'}
              </h1>
              <p className="text-muted-foreground text-sm mt-2">{user?.email}</p>
            </div>
            <button
              onClick={async () => { await signOut(); navigate('/'); toast.success('Erfolgreich abgemeldet'); }}
              className="inline-flex items-center gap-2 px-4 py-2 border border-border text-[11px] tracking-[0.15em] uppercase text-foreground hover:bg-muted transition-colors"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.5} />
              Abmelden
            </button>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="border-b border-border">
        <div className="container-premium">
          <div className="flex gap-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-[11px] tracking-[0.15em] uppercase font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="w-4 h-4" strokeWidth={1.5} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section-spacing">
        <div className="container-premium">
          <div className="max-w-3xl">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-[10px] tracking-[0.2em] uppercase text-accent">Persönliche Daten</h2>
                  {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="inline-flex items-center gap-2 text-sm text-accent hover:underline">
                      <Edit2 className="w-4 h-4" strokeWidth={1.5} /> Bearbeiten
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] tracking-[0.15em] uppercase">Vorname</Label>
                        <Input value={editForm.first_name} onChange={e => setEditForm(p => ({ ...p, first_name: e.target.value }))} className="h-12" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] tracking-[0.15em] uppercase">Nachname</Label>
                        <Input value={editForm.last_name} onChange={e => setEditForm(p => ({ ...p, last_name: e.target.value }))} className="h-12" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] tracking-[0.15em] uppercase">E-Mail</Label>
                      <Input value={profile?.email || ''} disabled className="h-12 bg-muted" />
                      <p className="text-xs text-muted-foreground">E-Mail kann nicht geändert werden</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] tracking-[0.15em] uppercase">Telefon</Label>
                      <Input value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} placeholder="+49 123 456789" className="h-12" />
                    </div>
                    <div className="flex gap-4">
                      <button type="submit" className="px-6 py-3 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors">
                        Speichern
                      </button>
                      <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 border border-border text-foreground text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-muted transition-colors">
                        Abbrechen
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    {[
                      { label: 'Name', value: `${profile?.first_name || '-'} ${profile?.last_name || ''}`.trim() },
                      { label: 'E-Mail', value: profile?.email || '-' },
                      { label: 'Telefon', value: profile?.phone || '-' },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between py-3 border-b border-border">
                        <span className="text-sm text-muted-foreground">{item.label}</span>
                        <span className="text-sm text-foreground font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Loyalty Tab */}
            {activeTab === 'loyalty' && (
              <div className="space-y-8">
                <h2 className="text-[10px] tracking-[0.2em] uppercase text-accent">Treueprogramm</h2>
                <LoyaltyProgress
                  tier={profile?.tier || 'bronze'}
                  totalSpent={Number(profile?.total_spent) || 0}
                  paybackBalance={Number(profile?.payback_balance) || 0}
                />
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h2 className="text-[10px] tracking-[0.2em] uppercase text-accent">Bestellungen</h2>
                {orders.length === 0 ? (
                  <div className="text-center py-16 border border-border">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" strokeWidth={1} />
                    <h3 className="font-display text-xl text-foreground mb-2">Noch keine Bestellungen</h3>
                    <p className="text-sm text-muted-foreground mb-6">Starten Sie Ihre Duftreise</p>
                    <Link to="/products" className="inline-flex items-center px-6 py-3 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors">
                      Jetzt einkaufen
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map(order => (
                      <Link key={order.id} to={`/orders/${order.id}`} className="flex items-center justify-between p-5 border border-border hover:border-accent/50 transition-colors group">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">{order.order_number}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] tracking-[0.1em] uppercase px-3 py-1 bg-muted text-muted-foreground">
                            {getStatusLabel(order.status)}
                          </span>
                          <span className="text-sm font-medium text-foreground">{Number(order.total).toFixed(2)} €</span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" strokeWidth={1.5} />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-[10px] tracking-[0.2em] uppercase text-accent">Adressen</h2>
                  <button className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors">
                    <Plus className="w-4 h-4" strokeWidth={1.5} />
                    Neue Adresse
                  </button>
                </div>
                {addresses.length === 0 ? (
                  <div className="text-center py-16 border border-border">
                    <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" strokeWidth={1} />
                    <h3 className="font-display text-xl text-foreground mb-2">Keine Adressen</h3>
                    <p className="text-sm text-muted-foreground">Fügen Sie eine Lieferadresse hinzu</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {addresses.map(address => (
                      <div key={address.id} className="p-5 border border-border relative">
                        {address.is_default && (
                          <span className="absolute top-3 right-3 text-[9px] tracking-[0.1em] uppercase px-2 py-1 bg-accent/10 text-accent">
                            Standard
                          </span>
                        )}
                        <p className="font-medium text-foreground text-sm">
                          {address.first_name} {address.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">{address.street}</p>
                        <p className="text-sm text-muted-foreground">{address.postal_code} {address.city}</p>
                        <p className="text-sm text-muted-foreground">{address.country}</p>
                        <div className="flex gap-3 mt-4 pt-4 border-t border-border">
                          <button className="text-xs text-accent hover:underline flex items-center gap-1">
                            <Edit2 className="w-3 h-3" /> Bearbeiten
                          </button>
                          <button onClick={() => handleDeleteAddress(address.id)} className="text-xs text-destructive hover:underline flex items-center gap-1">
                            <Trash2 className="w-3 h-3" /> Löschen
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Referral Tab */}
            {activeTab === 'referral' && (
              <div className="space-y-6">
                <h2 className="text-[10px] tracking-[0.2em] uppercase text-accent">Freunde werben</h2>
                <div className="text-center py-12 border border-border space-y-4">
                  <Gift className="w-12 h-12 text-muted-foreground mx-auto" strokeWidth={1} />
                  <div>
                    <h3 className="font-display text-xl text-foreground mb-2">Empfehle ALDENAIR weiter</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Teile deinen persönlichen Empfehlungscode mit Freunden. Ihr beide erhaltet 10% Rabatt auf eure nächste Bestellung.
                    </p>
                  </div>
                  <Link
                    to="/referral"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors"
                  >
                    Zum Empfehlungsprogramm
                    <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </PremiumPageLayout>
  );
}