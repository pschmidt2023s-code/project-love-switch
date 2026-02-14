import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Track } from '@/contexts/MusicPlayerContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Calendar, Clock, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const DAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

interface ScheduleEntry {
  id: string;
  track_id: string;
  day_of_week: number | null;
  start_time: string;
  end_time: string;
  priority: number;
  is_active: boolean;
}

export function RadioScheduleManager() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    track_id: '',
    day_of_week: 'all',
    start_time: '08:00',
    end_time: '12:00',
    priority: '0',
  });

  // Fetch tracks
  const { data: tracks = [] } = useQuery({
    queryKey: ['tracks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as Track[];
    },
  });

  // Fetch schedule entries
  const { data: schedule = [] } = useQuery({
    queryKey: ['radio-schedule'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('radio_schedule')
        .select('*')
        .order('start_time', { ascending: true });
      if (error) throw error;
      return data as ScheduleEntry[];
    },
  });

  // Add schedule entry
  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('radio_schedule').insert({
        track_id: form.track_id,
        day_of_week: form.day_of_week === 'all' ? null : parseInt(form.day_of_week),
        start_time: form.start_time,
        end_time: form.end_time,
        priority: parseInt(form.priority) || 0,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['radio-schedule'] });
      setShowAdd(false);
      toast.success('Zeitslot hinzugefügt!');
    },
    onError: (e) => toast.error(e.message),
  });

  // Delete schedule entry
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('radio_schedule').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['radio-schedule'] });
      toast.success('Zeitslot entfernt');
    },
  });

  // Toggle active
  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('radio_schedule').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['radio-schedule'] }),
  });

  const getTrackTitle = (id: string) => tracks.find(t => t.id === id)?.title || '?';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold flex items-center gap-2">
          <Calendar className="h-4 w-4" /> Sendeplan
        </h4>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1">
              <Plus className="h-3 w-3" /> Zeitslot
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Neuen Zeitslot erstellen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Track *</Label>
                <Select value={form.track_id} onValueChange={v => setForm(f => ({ ...f, track_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Track wählen..." /></SelectTrigger>
                  <SelectContent>
                    {tracks.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.title} – {t.artist}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Wochentag</Label>
                <Select value={form.day_of_week} onValueChange={v => setForm(f => ({ ...f, day_of_week: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Jeden Tag</SelectItem>
                    {DAYS.map((d, i) => (
                      <SelectItem key={i} value={String(i)}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Von</Label>
                  <Input type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
                </div>
                <div>
                  <Label>Bis</Label>
                  <Input type="time" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} />
                </div>
              </div>

              <div>
                <Label>Priorität (höher = überschreibt Rotation)</Label>
                <Input type="number" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} />
              </div>

              <Button className="w-full" onClick={() => addMutation.mutate()} disabled={!form.track_id || addMutation.isPending}>
                {addMutation.isPending ? 'Speichern...' : 'Zeitslot speichern'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {schedule.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          Noch keine Zeitslots. Füge Slots hinzu, um Tracks zu bestimmten Uhrzeiten zu spielen.
        </p>
      ) : (
        <div className="space-y-2">
          {schedule.map(entry => (
            <div key={entry.id} className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg border",
              entry.is_active ? "border-border bg-card" : "border-border/50 bg-muted/30 opacity-60"
            )}>
              <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{getTrackTitle(entry.track_id)}</p>
                <p className="text-xs text-muted-foreground">
                  {entry.day_of_week !== null ? DAYS[entry.day_of_week] : 'Jeden Tag'} · {entry.start_time.slice(0, 5)} – {entry.end_time.slice(0, 5)}
                  {entry.priority > 0 && <span className="ml-1 text-accent">★ P{entry.priority}</span>}
                </p>
              </div>
              <Switch
                checked={entry.is_active}
                onCheckedChange={v => toggleMutation.mutate({ id: entry.id, is_active: v })}
              />
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteMutation.mutate(entry.id)}>
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
