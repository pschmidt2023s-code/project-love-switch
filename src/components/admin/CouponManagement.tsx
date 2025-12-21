import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trash2, Tag, Percent, DollarSign } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number | null;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export default function CouponManagement() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_amount: '',
    max_uses: '',
    expires_at: '',
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error('Error loading coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const { error } = await supabase.from('coupons').insert({
        code: formData.code.toUpperCase(),
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value) || 0,
        min_order_amount: formData.min_order_amount ? parseFloat(formData.min_order_amount) : null,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        expires_at: formData.expires_at || null,
      });

      if (error) throw error;

      toast({ title: 'Erfolg', description: 'Rabattcode erstellt' });
      setDialogOpen(false);
      setFormData({ code: '', discount_type: 'percentage', discount_value: '', min_order_amount: '', max_uses: '', expires_at: '' });
      loadCoupons();
    } catch (error) {
      toast({ title: 'Fehler', description: 'Rabattcode konnte nicht erstellt werden', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Erfolg', description: 'Rabattcode gelöscht' });
      loadCoupons();
    } catch (error) {
      toast({ title: 'Fehler', description: 'Rabattcode konnte nicht gelöscht werden', variant: 'destructive' });
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase.from('coupons').update({ is_active: !isActive }).eq('id', id);
      if (error) throw error;
      loadCoupons();
    } catch (error) {
      toast({ title: 'Fehler', description: 'Status konnte nicht geändert werden', variant: 'destructive' });
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8">Laden...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Rabattcodes</h2>
          <p className="text-muted-foreground">{coupons.length} Codes insgesamt</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Neuer Rabattcode
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neuen Rabattcode erstellen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Code</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="SUMMER20"
                />
              </div>
              <div>
                <Label>Rabatttyp</Label>
                <Select value={formData.discount_type} onValueChange={(v) => setFormData({ ...formData, discount_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Prozent</SelectItem>
                    <SelectItem value="fixed">Festbetrag (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Rabattwert</Label>
                <Input
                  type="number"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                  placeholder={formData.discount_type === 'percentage' ? '20' : '10'}
                />
              </div>
              <div>
                <Label>Mindestbestellwert (€)</Label>
                <Input
                  type="number"
                  value={formData.min_order_amount}
                  onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                  placeholder="50"
                />
              </div>
              <div>
                <Label>Max. Verwendungen</Label>
                <Input
                  type="number"
                  value={formData.max_uses}
                  onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                  placeholder="100"
                />
              </div>
              <div>
                <Label>Gültig bis</Label>
                <Input
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                />
              </div>
              <Button onClick={handleCreate} className="w-full">Erstellen</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Rabatt</TableHead>
                <TableHead>Nutzungen</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Gültig bis</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-mono font-bold">{coupon.code}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {coupon.discount_type === 'percentage' ? (
                        <>
                          <Percent className="w-4 h-4" />
                          {coupon.discount_value}%
                        </>
                      ) : (
                        <>
                          <DollarSign className="w-4 h-4" />
                          {coupon.discount_value}€
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {coupon.current_uses} / {coupon.max_uses || '∞'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={coupon.is_active ? 'default' : 'secondary'}
                      className="cursor-pointer"
                      onClick={() => toggleActive(coupon.id, coupon.is_active)}
                    >
                      {coupon.is_active ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString('de-DE') : 'Unbegrenzt'}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(coupon.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
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
