import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  User,
  Package,
  MapPin,
  CreditCard,
  Settings,
  LogOut,
  Edit2,
  Plus,
  Trash2,
  Eye,
  ChevronRight
} from 'lucide-react';

interface Profile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
}

interface Address {
  id: string;
  first_name: string;
  last_name: string;
  street: string;
  street2: string | null;
  city: string;
  postal_code: string;
  state: string | null;
  country: string;
  type: string;
  is_default: boolean;
}

interface Order {
  id: string;
  order_number: string;
  total: number;
  status: string;
  payment_status: string | null;
  created_at: string;
}

export default function Account() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
  });

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/auth');
      return;
    }

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
        setEditForm({
          first_name: profileRes.data.first_name || '',
          last_name: profileRes.data.last_name || '',
          phone: profileRes.data.phone || '',
        });
      }

      if (addressesRes.data) {
        setAddresses(addressesRes.data);
      }

      if (ordersRes.data) {
        setOrders(ordersRes.data);
      }
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
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          phone: editForm.phone,
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...editForm } : null);
      setIsEditing(false);
      toast.success('Profil aktualisiert');
    } catch (error) {
      toast.error('Fehler beim Aktualisieren');
    }
  }

  async function handleDeleteAddress(addressId: string) {
    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId);

      if (error) throw error;

      setAddresses(prev => prev.filter(a => a.id !== addressId));
      toast.success('Adresse gelöscht');
    } catch (error) {
      toast.error('Fehler beim Löschen');
    }
  }

  async function handleLogout() {
    await signOut();
    navigate('/');
    toast.success('Erfolgreich abgemeldet');
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: 'Ausstehend', variant: 'secondary' },
      processing: { label: 'In Bearbeitung', variant: 'outline' },
      paid: { label: 'Bezahlt', variant: 'default' },
      shipped: { label: 'Versendet', variant: 'default' },
      delivered: { label: 'Zugestellt', variant: 'default' },
      cancelled: { label: 'Storniert', variant: 'destructive' },
    };
    const config = statusMap[status] || statusMap.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Mein Konto</h1>
            <p className="text-muted-foreground mt-1">
              Willkommen zurück, {profile?.first_name || 'Kunde'}!
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Abmelden
          </Button>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profil</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Bestellungen</span>
            </TabsTrigger>
            <TabsTrigger value="addresses" className="gap-2">
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">Adressen</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Persönliche Daten</CardTitle>
                    <CardDescription>Verwalten Sie Ihre Kontoinformationen</CardDescription>
                  </div>
                  {!isEditing && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Bearbeiten
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first_name">Vorname</Label>
                        <Input
                          id="first_name"
                          value={editForm.first_name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, first_name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last_name">Nachname</Label>
                        <Input
                          id="last_name"
                          value={editForm.last_name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, last_name: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-Mail</Label>
                      <Input id="email" value={profile?.email || ''} disabled className="bg-muted" />
                      <p className="text-xs text-muted-foreground">E-Mail kann nicht geändert werden</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon</Label>
                      <Input
                        id="phone"
                        value={editForm.phone}
                        onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+49 123 456789"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">Speichern</Button>
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                        Abbrechen
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Vorname</p>
                        <p className="font-medium">{profile?.first_name || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Nachname</p>
                        <p className="font-medium">{profile?.last_name || '-'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">E-Mail</p>
                      <p className="font-medium">{profile?.email || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Telefon</p>
                      <p className="font-medium">{profile?.phone || '-'}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Meine Bestellungen</CardTitle>
                <CardDescription>Übersicht Ihrer letzten Bestellungen</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">Noch keine Bestellungen</p>
                    <Button asChild>
                      <Link to="/products">Jetzt einkaufen</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="space-y-1">
                          <p className="font-medium">{order.order_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString('de-DE', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          {getStatusBadge(order.status)}
                          <p className="font-semibold">{Number(order.total).toFixed(2)} €</p>
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/orders/${order.id}`}>
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Meine Adressen</CardTitle>
                    <CardDescription>Verwalten Sie Ihre Lieferadressen</CardDescription>
                  </div>
                  <Button size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Neue Adresse
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Keine Adressen gespeichert</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className="p-4 border rounded-lg relative"
                      >
                        {address.is_default && (
                          <Badge className="absolute top-2 right-2" variant="secondary">
                            Standard
                          </Badge>
                        )}
                        <p className="font-medium">
                          {address.first_name} {address.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {address.street}
                          {address.street2 && <>, {address.street2}</>}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {address.postal_code} {address.city}
                        </p>
                        <p className="text-sm text-muted-foreground">{address.country}</p>
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm">
                            <Edit2 className="w-3 h-3 mr-1" />
                            Bearbeiten
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAddress(address.id)}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Löschen
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
