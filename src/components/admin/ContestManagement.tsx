import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Users, Gift, Star } from 'lucide-react';

interface ContestEntry {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  message: string | null;
  is_winner: boolean | null;
  winner_position: number | null;
  created_at: string | null;
}

export function ContestManagement() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<ContestEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('contest_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const setWinner = async (id: string, position: number) => {
    try {
      // Reset previous winner at this position
      await supabase
        .from('contest_entries')
        .update({ is_winner: false, winner_position: null })
        .eq('winner_position', position);

      // Set new winner
      const { error } = await supabase
        .from('contest_entries')
        .update({ is_winner: true, winner_position: position })
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Erfolg', description: `Platz ${position} vergeben` });
      loadEntries();
    } catch (error) {
      toast({ title: 'Fehler', description: 'Gewinner konnte nicht gesetzt werden', variant: 'destructive' });
    }
  };

  const winners = entries.filter(e => e.is_winner).sort((a, b) => (a.winner_position || 0) - (b.winner_position || 0));

  if (loading) {
    return <div className="flex justify-center py-8">Laden...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gewinnspiel</h2>
        <p className="text-muted-foreground">{entries.length} Teilnehmer</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{entries.length}</p>
                <p className="text-sm text-muted-foreground">Teilnahmen</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{winners.length}</p>
                <p className="text-sm text-muted-foreground">Gewinner</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Gift className="w-8 h-8 text-pink-500" />
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-muted-foreground">Preise</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {winners.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Gewinner
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {winners.map((winner) => (
                <div key={winner.id} className="p-4 rounded-lg bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="font-bold">Platz {winner.winner_position}</span>
                  </div>
                  <p className="font-medium">{winner.first_name} {winner.last_name}</p>
                  <p className="text-sm text-muted-foreground">{winner.email}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>E-Mail</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">
                    {entry.first_name} {entry.last_name}
                  </TableCell>
                  <TableCell>{entry.email}</TableCell>
                  <TableCell>{entry.phone || '-'}</TableCell>
                  <TableCell>
                    {entry.is_winner ? (
                      <Badge className="bg-yellow-500">
                        Platz {entry.winner_position}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Teilnehmer</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {entry.created_at 
                      ? new Date(entry.created_at).toLocaleDateString('de-DE')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {[1, 2, 3].map((pos) => (
                        <Button
                          key={pos}
                          size="sm"
                          variant={entry.winner_position === pos ? 'default' : 'outline'}
                          onClick={() => setWinner(entry.id, pos)}
                        >
                          {pos}
                        </Button>
                      ))}
                    </div>
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
