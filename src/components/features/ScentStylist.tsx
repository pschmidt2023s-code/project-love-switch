import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Sun, Moon, Cloud, Zap, Heart, Briefcase, PartyPopper, Loader2 } from 'lucide-react';

const moods = [
  { id: 'energetic', label: 'Energiegeladen', icon: Zap, color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400', occasion: 'sport' },
  { id: 'romantic', label: 'Romantisch', icon: Heart, color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400', occasion: 'date' },
  { id: 'professional', label: 'Professionell', icon: Briefcase, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', occasion: 'business' },
  { id: 'relaxed', label: 'Entspannt', icon: Cloud, color: 'bg-green-500/10 text-green-600 dark:text-green-400', occasion: 'daily' },
  { id: 'festive', label: 'Festlich', icon: PartyPopper, color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400', occasion: 'evening' },
];

const timeOfDay = [
  { id: 'morning', label: 'Morgen', icon: Sun, intensity: 'light' },
  { id: 'afternoon', label: 'Nachmittag', icon: Sun, intensity: 'medium' },
  { id: 'evening', label: 'Abend', icon: Moon, intensity: 'strong' },
];

export function ScentStylist() {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGetRecommendation = async () => {
    if (!selectedMood || !selectedTime) return;

    setIsLoading(true);
    
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Navigate to products with filter
    const mood = moods.find(m => m.id === selectedMood);
    navigate(`/products?occasion=${mood?.occasion || 'daily'}`);
    
    setIsLoading(false);
  };

  return (
    <Card className="overflow-hidden border-primary/20">
      <CardHeader className="bg-gradient-to-br from-primary/10 to-transparent pb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-lg bg-primary/20">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <Badge variant="secondary" className="text-xs">KI-gestützt</Badge>
        </div>
        <CardTitle className="text-xl">Duft-Stylist</CardTitle>
        <p className="text-sm text-muted-foreground">
          Finde den perfekten Duft für deine Stimmung
        </p>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div>
          <p className="text-sm font-medium mb-2">Wie fühlst du dich?</p>
          <div className="flex flex-wrap gap-2">
            {moods.map((mood) => {
              const Icon = mood.icon;
              return (
                <Button
                  key={mood.id}
                  variant={selectedMood === mood.id ? 'default' : 'outline'}
                  size="sm"
                  className="gap-1"
                  onClick={() => setSelectedMood(mood.id)}
                >
                  <Icon className="w-3 h-3" />
                  {mood.label}
                </Button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Tageszeit?</p>
          <div className="flex gap-2">
            {timeOfDay.map((time) => {
              const Icon = time.icon;
              return (
                <Button
                  key={time.id}
                  variant={selectedTime === time.id ? 'default' : 'outline'}
                  size="sm"
                  className="gap-1 flex-1"
                  onClick={() => setSelectedTime(time.id)}
                >
                  <Icon className="w-3 h-3" />
                  {time.label}
                </Button>
              );
            })}
          </div>
        </div>

        <Button 
          className="w-full" 
          disabled={!selectedMood || !selectedTime || isLoading}
          onClick={handleGetRecommendation}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analysiere...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Duft empfehlen
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
