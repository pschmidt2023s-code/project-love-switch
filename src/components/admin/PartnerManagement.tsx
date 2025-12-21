import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Check, X, UserCheck, DollarSign } from 'lucide-react';

interface Partner {
  id: string;
  user_id: string;
  partner_code: string;
  status: string | null;
  commission_rate: number | null;
  total_sales: number | null;
  total_commission: number | null;
  total_paid_out: number | null;
  created_at: string | null;
  approved_at: string | null;
}

export default function PartnerManagement() {
  const { toast } = useToast();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPartners(data || []);
    } catch (error) {
      console.error('Error loading partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const updateData: { status: string; approved_at?: string } = { status };
      if (status === 'approved') {
        updateData.approved_at = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('partners')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Erfolg', description: 'Partnerstatus aktualisiert' });
      loadPartners();
    } catch (error) {
      toast({ title: 'Fehler', description: 'Status konnte nicht geändert werden', variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Genehmigt</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Abgelehnt</Badge>;
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
        <h2 className="text-2xl font-bold">Partner</h2>
        <p className="text-muted-foreground">{partners.length} Partner insgesamt</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <UserCheck className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {partners.filter(p => p.status === 'approved').length}
                </p>
                <p className="text-sm text-muted-foreground">Aktive Partner</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <DollarSign className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">
                  €{partners.reduce((sum, p) => sum + (p.total_sales || 0), 0).toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">Gesamtumsatz</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <DollarSign className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">
                  €{partners.reduce((sum, p) => sum + (p.total_commission || 0), 0).toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">Ausstehende Provisionen</p>
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
                <TableHead>Partner Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Provision</TableHead>
                <TableHead>Umsatz</TableHead>
                <TableHead>Verdient</TableHead>
                <TableHead>Ausgezahlt</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partners.map((partner) => (
                <TableRow key={partner.id}>
                  <TableCell className="font-mono font-bold">{partner.partner_code}</TableCell>
                  <TableCell>{getStatusBadge(partner.status)}</TableCell>
                  <TableCell>{partner.commission_rate}%</TableCell>
                  <TableCell>€{(partner.total_sales || 0).toFixed(2)}</TableCell>
                  <TableCell>€{(partner.total_commission || 0).toFixed(2)}</TableCell>
                  <TableCell>€{(partner.total_paid_out || 0).toFixed(2)}</TableCell>
                  <TableCell>
                    {partner.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => updateStatus(partner.id, 'approved')}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => updateStatus(partner.id, 'rejected')}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
