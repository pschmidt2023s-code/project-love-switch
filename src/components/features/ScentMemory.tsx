import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Heart, Plus, Calendar, MapPin, BookOpen, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ScentMemoryEntry {
  id: string;
  perfumeName: string;
  memory: string;
  date: string;
  location?: string;
  mood?: string;
  createdAt: string;
}

const moodOptions = [
  { id: 'happy', label: 'Glücklich', emoji: '😊' },
  { id: 'romantic', label: 'Romantisch', emoji: '💕' },
  { id: 'nostalgic', label: 'Nostalgisch', emoji: '🌅' },
  { id: 'peaceful', label: 'Friedlich', emoji: '☮️' },
  { id: 'excited', label: 'Aufgeregt', emoji: '🎉' },
];

export function ScentMemory() {
  const { user } = useAuth();
  const [memories, setMemories] = useState<ScentMemoryEntry[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMemory, setNewMemory] = useState({
    perfumeName: '',
    memory: '',
    location: '',
    mood: '',
  });

  useEffect(() => {
    const stored = localStorage.getItem('scentMemories');
    if (stored) {
      setMemories(JSON.parse(stored));
    }
  }, []);

  const saveMemory = () => {
    if (!newMemory.perfumeName || !newMemory.memory) return;

    const entry: ScentMemoryEntry = {
      id: Date.now().toString(),
      perfumeName: newMemory.perfumeName,
      memory: newMemory.memory,
      date: new Date().toISOString().split('T')[0],
      location: newMemory.location || undefined,
      mood: newMemory.mood || undefined,
      createdAt: new Date().toISOString(),
    };

    const updated = [entry, ...memories].slice(0, 10);
    setMemories(updated);
    localStorage.setItem('scentMemories', JSON.stringify(updated));
    
    setNewMemory({ perfumeName: '', memory: '', location: '', mood: '' });
    setIsDialogOpen(false);
  };

  const deleteMemory = (id: string) => {
    const updated = memories.filter(m => m.id !== id);
    setMemories(updated);
    localStorage.setItem('scentMemories', JSON.stringify(updated));
  };

  return (
    <Card className="overflow-hidden border-primary/20">
      <CardHeader className="bg-gradient-to-br from-primary/10 to-transparent pb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-lg bg-primary/20">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <Badge variant="secondary" className="text-xs">Persönlich</Badge>
        </div>
        <CardTitle className="text-xl">Duft-Tagebuch</CardTitle>
        <p className="text-sm text-muted-foreground">
          Speichere besondere Momente mit deinen Lieblingsdüften
        </p>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {memories.length > 0 ? (
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {memories.slice(0, 3).map((memory) => (
              <div key={memory.id} className="p-3 rounded-lg bg-muted/50 group relative">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{memory.perfumeName}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{memory.memory}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={() => deleteMemory(memory.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>{memory.date}</span>
                  {memory.location && (
                    <>
                      <MapPin className="w-3 h-3 ml-2" />
                      <span>{memory.location}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Heart className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Noch keine Erinnerungen gespeichert</p>
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Erinnerung hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neue Duft-Erinnerung</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Input
                  placeholder="Duftname"
                  value={newMemory.perfumeName}
                  onChange={(e) => setNewMemory(prev => ({ ...prev, perfumeName: e.target.value }))}
                />
              </div>
              <div>
                <Textarea
                  placeholder="Beschreibe den Moment..."
                  value={newMemory.memory}
                  onChange={(e) => setNewMemory(prev => ({ ...prev, memory: e.target.value }))}
                />
              </div>
              <div>
                <Input
                  placeholder="Ort (optional)"
                  value={newMemory.location}
                  onChange={(e) => setNewMemory(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Stimmung</p>
                <div className="flex flex-wrap gap-2">
                  {moodOptions.map((mood) => (
                    <Button
                      key={mood.id}
                      variant={newMemory.mood === mood.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNewMemory(prev => ({ ...prev, mood: mood.id }))}
                    >
                      {mood.emoji} {mood.label}
                    </Button>
                  ))}
                </div>
              </div>
              <Button className="w-full" onClick={saveMemory}>
                Speichern
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
