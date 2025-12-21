import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, TrendingUp, Wallet } from 'lucide-react';

interface PaybackEarning {
  id: string;
  user_id: string;
  amount: number;
  description: string | null;
  order_id: string | null;
  created_at: string | null;
}

interface PaybackPayout {
  id: string;
  user_id: string;
  amount: number;
  status: string | null;
  created_at: string | null;
  processed_at: string | null;
}

export default function PaybackManagement() {
  const { toast } = useToast();
  const [earnings, setEarnings] = useState<PaybackEarning[]>([]);
  const [payouts, setPayouts] = useState<PaybackPayout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [earningsRes, payoutsRes] = await Promise.all([
        supabase.from('payback_earnings').select('*').order('created_at', { ascending: false }),
        supabase.from('payback_payouts').select('*').order('created_at', { ascending: false }),
      ]);

      if (earningsRes.error) throw earningsRes.error;
      if (payoutsRes.error) throw payoutsRes.error;

      setEarnings(earningsRes.data || []);
      setPayouts(payoutsRes.data || []);
    } catch (error) {
      console.error('Error loading payback data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalEarnings = earnings.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalPayouts = payouts.reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingPayouts = payouts.filter(p => p.status === 'pending');

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Abgeschlossen</Badge>;
      case 'processing':
        return <Badge variant="default">In Bearbeitung</Badge>;
      case 'pending':
      default:
        return <Badge variant="secondary">Ausstehend</Badge>;
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8">Laden...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Payback System</h2>
        <p className="text-muted-foreground">Übersicht über alle Payback-Transaktionen</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">€{totalEarnings.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Gesamt verdient</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Wallet className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">€{totalPayouts.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Gesamt ausgezahlt</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <DollarSign className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{pendingPayouts.length}</p>
                <p className="text-sm text-muted-foreground">Ausstehende Auszahlungen</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">Letzte Einnahmen</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Betrag</TableHead>
                  <TableHead>Beschreibung</TableHead>
                  <TableHead>Datum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {earnings.slice(0, 10).map((earning) => (
                  <TableRow key={earning.id}>
                    <TableCell className="font-semibold text-green-500">
                      +€{earning.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {earning.description || 'Bestellbonus'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {earning.created_at 
                        ? new Date(earning.created_at).toLocaleDateString('de-DE')
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">Auszahlungen</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Betrag</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Datum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.slice(0, 10).map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell className="font-semibold">
                      €{payout.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>{getStatusBadge(payout.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {payout.created_at 
                        ? new Date(payout.created_at).toLocaleDateString('de-DE')
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
