import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Search, Mail, Trash2, Download } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  is_active: boolean | null;
  created_at: string | null;
}

export default function NewsletterManagement() {
  const { toast } = useToast();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = async () => {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscribers(data || []);
    } catch (error) {
      console.error('Error loading subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Erfolg', description: 'Abonnent entfernt' });
      loadSubscribers();
    } catch (error) {
      toast({ title: 'Fehler', description: 'Abonnent konnte nicht entfernt werden', variant: 'destructive' });
    }
  };

  const toggleActive = async (id: string, isActive: boolean | null) => {
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .update({ is_active: !isActive })
        .eq('id', id);
      if (error) throw error;
      loadSubscribers();
    } catch (error) {
      toast({ title: 'Fehler', description: 'Status konnte nicht geändert werden', variant: 'destructive' });
    }
  };

  const exportCSV = () => {
    const activeSubscribers = subscribers.filter(s => s.is_active);
    const csv = ['Email,Registriert'];
    activeSubscribers.forEach(s => {
      csv.push(`${s.email},${new Date(s.created_at || '').toLocaleDateString('de-DE')}`);
    });
    
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'newsletter-subscribers.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredSubscribers = subscribers.filter(s =>
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center py-8">Laden...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Newsletter</h2>
          <p className="text-muted-foreground">
            {subscribers.filter(s => s.is_active).length} aktive Abonnenten
          </p>
        </div>
        <Button onClick={exportCSV}>
          <Download className="w-4 h-4 mr-2" />
          CSV Export
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Mail className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{subscribers.length}</p>
                <p className="text-sm text-muted-foreground">Gesamt Abonnenten</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Mail className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {subscribers.filter(s => s.is_active).length}
                </p>
                <p className="text-sm text-muted-foreground">Aktive Abonnenten</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="E-Mail suchen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>E-Mail</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registriert</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscribers.map((subscriber) => (
                <TableRow key={subscriber.id}>
                  <TableCell className="font-medium">{subscriber.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={subscriber.is_active ? 'default' : 'secondary'}
                      className="cursor-pointer"
                      onClick={() => toggleActive(subscriber.id, subscriber.is_active)}
                    >
                      {subscriber.is_active ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {subscriber.created_at 
                      ? new Date(subscriber.created_at).toLocaleDateString('de-DE')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(subscriber.id)}>
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
