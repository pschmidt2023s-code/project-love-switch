import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Crown, Users } from 'lucide-react';

interface VIPSubscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: string;
  current_period_end: string | null;
  created_at: string;
}

export default function VIPManagement() {
  const [subscriptions, setSubscriptions] = useState<VIPSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Record<string, { email: string | null; first_name: string | null; last_name: string | null }>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data, error } = await supabase
        .from('vip_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);

      // Load profile info for each user
      if (data && data.length > 0) {
        const userIds = data.map(s => s.user_id);
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, email, first_name, last_name')
          .in('id', userIds);

        if (profileData) {
          const map: Record<string, { email: string | null; first_name: string | null; last_name: string | null }> = {};
          profileData.forEach(p => {
            map[p.id] = { email: p.email, first_name: p.first_name, last_name: p.last_name };
          });
          setProfiles(map);
        }
      }
    } catch (error) {
      console.error('Error loading VIP subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeCount = subscriptions.filter(s => s.status === 'active').length;

  if (loading) {
    return <div className="flex justify-center py-8">Laden...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">VIP-Abonnements</h2>
        <p className="text-muted-foreground">Verwaltung der VIP-Mitgliedschaften (9,99€/Monat)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Crown className="w-8 h-8 text-accent" />
              <div>
                <p className="text-2xl font-bold">{activeCount}</p>
                <p className="text-sm text-muted-foreground">Aktive VIP-Mitglieder</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Users className="w-8 h-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{subscriptions.length}</p>
                <p className="text-sm text-muted-foreground">Gesamt Abonnements</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kunde</TableHead>
                <TableHead>E-Mail</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Gültig bis</TableHead>
                <TableHead>Mitglied seit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Noch keine VIP-Abonnements vorhanden
                  </TableCell>
                </TableRow>
              ) : (
                subscriptions.map((sub) => {
                  const profile = profiles[sub.user_id];
                  return (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">
                        {profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || '–' : '–'}
                      </TableCell>
                      <TableCell>{profile?.email || '–'}</TableCell>
                      <TableCell>
                        <Badge variant={sub.status === 'active' ? 'default' : 'secondary'}>
                          {sub.status === 'active' ? 'Aktiv' : sub.status === 'canceled' ? 'Gekündigt' : sub.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {sub.current_period_end
                          ? new Date(sub.current_period_end).toLocaleDateString('de-DE')
                          : '–'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(sub.created_at).toLocaleDateString('de-DE')}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
