import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Search, User, Mail, Phone, Crown, Eye, ShoppingBag, Award } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  tier: string | null;
  total_spent: number | null;
  payback_balance: number | null;
  created_at: string;
}

interface Order {
  id: string;
  order_number: string;
  total: number;
  status: string;
  created_at: string;
}

export default function CustomerManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserOrders = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserOrders(data || []);
    } catch (error) {
      console.error('Error loading user orders:', error);
    }
  };

  const openUserDetails = async (user: UserProfile) => {
    setSelectedUser(user);
    await loadUserOrders(user.id);
    setDetailsOpen(true);
  };

  const updateUserTier = async (userId: string, tier: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ tier })
        .eq('id', userId);

      if (error) throw error;
      toast({ title: 'Erfolg', description: 'Kundenstatus aktualisiert' });
      loadUsers();
    } catch (error) {
      toast({ title: 'Fehler', description: 'Status konnte nicht geändert werden', variant: 'destructive' });
    }
  };

  const getTierBadge = (tier: string | null) => {
    const tierConfig: Record<string, { color: string; label: string }> = {
      platinum: { color: 'bg-gradient-to-r from-gray-300 to-gray-500 text-white', label: 'Platinum' },
      gold: { color: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white', label: 'Gold' },
      silver: { color: 'bg-gradient-to-r from-gray-300 to-gray-400 text-white', label: 'Silber' },
      bronze: { color: 'bg-gradient-to-r from-amber-600 to-amber-700 text-white', label: 'Bronze' },
    };

    const config = tierConfig[tier || 'bronze'] || tierConfig.bronze;

    return (
      <Badge className={config.color}>
        <Crown className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      user.email?.toLowerCase().includes(searchLower) ||
      user.first_name?.toLowerCase().includes(searchLower) ||
      user.last_name?.toLowerCase().includes(searchLower) ||
      user.phone?.includes(search);
    const matchesTier = tierFilter === 'all' || user.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const customerStats = {
    total: users.length,
    platinum: users.filter((u) => u.tier === 'platinum').length,
    gold: users.filter((u) => u.tier === 'gold').length,
    silver: users.filter((u) => u.tier === 'silver').length,
    bronze: users.filter((u) => u.tier === 'bronze' || !u.tier).length,
  };

  if (loading) {
    return <div className="flex justify-center py-8">Laden...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Kunden</h2>
        <p className="text-muted-foreground">{users.length} registrierte Kunden</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Gesamt', value: customerStats.total, color: 'text-foreground' },
          { label: 'Platinum', value: customerStats.platinum, color: 'text-gray-500' },
          { label: 'Gold', value: customerStats.gold, color: 'text-yellow-500' },
          { label: 'Silber', value: customerStats.silver, color: 'text-gray-400' },
          { label: 'Bronze', value: customerStats.bronze, color: 'text-amber-600' },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="pt-4 pb-4">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Suche nach Name, E-Mail, Telefon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={tierFilter} onValueChange={setTierFilter}>
          <SelectTrigger className="w-[180px]">
            <Crown className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Tier filtern" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Tiers</SelectItem>
            <SelectItem value="platinum">Platinum</SelectItem>
            <SelectItem value="gold">Gold</SelectItem>
            <SelectItem value="silver">Silber</SelectItem>
            <SelectItem value="bronze">Bronze</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kunde</TableHead>
                <TableHead>E-Mail</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Ausgaben</TableHead>
                <TableHead>Payback</TableHead>
                <TableHead>Registriert</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium">
                        {user.first_name || user.last_name
                          ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                          : 'Kein Name'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      {user.email || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      {user.phone || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.tier || 'bronze'}
                      onValueChange={(value) => updateUserTier(user.id, value)}
                    >
                      <SelectTrigger className="w-[130px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bronze">Bronze</SelectItem>
                        <SelectItem value="silver">Silber</SelectItem>
                        <SelectItem value="gold">Gold</SelectItem>
                        <SelectItem value="platinum">Platinum</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="font-semibold">
                    €{(user.total_spent || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      <Award className="w-3 h-3 mr-1" />
                      €{(user.payback_balance || 0).toFixed(2)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString('de-DE')}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openUserDetails(user)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Kundendetails</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedUser.first_name || selectedUser.last_name
                      ? `${selectedUser.first_name || ''} ${selectedUser.last_name || ''}`.trim()
                      : 'Kein Name'}
                  </h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                </div>
                <div className="ml-auto">
                  {getTierBadge(selectedUser.tier)}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">€{(selectedUser.total_spent || 0).toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Gesamtausgaben</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{userOrders.length}</p>
                  <p className="text-sm text-muted-foreground">Bestellungen</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">€{(selectedUser.payback_balance || 0).toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Payback Guthaben</p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  Bestellhistorie
                </h4>
                {userOrders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    Keine Bestellungen vorhanden
                  </p>
                ) : (
                  <div className="space-y-2">
                    {userOrders.slice(0, 5).map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium font-mono">{order.order_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString('de-DE')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">€{Number(order.total).toFixed(2)}</p>
                          <Badge variant="outline" className="text-xs">
                            {order.status || 'pending'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
