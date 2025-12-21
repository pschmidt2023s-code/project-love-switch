import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Sun, Cloud, Snowflake, Leaf } from 'lucide-react';

const seasonConfig = {
  winter: { icon: Snowflake, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Winter' },
  spring: { icon: Leaf, color: 'text-green-400', bg: 'bg-green-500/10', label: 'Frühling' },
  summer: { icon: Sun, color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Sommer' },
  autumn: { icon: Cloud, color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'Herbst' },
};

const seasonReasons: Record<string, { reason: string; weather: string; temp: string }> = {
  winter: {
    reason: 'Perfekt für kalte Wintertage - wärmende Gewürze und einhüllender Amber',
    weather: 'Kalt & Trocken',
    temp: '-2°C bis 5°C',
  },
  spring: {
    reason: 'Frühlingshaft und lebendig - florale Frische für Neuanfänge',
    weather: 'Mild & Wechselhaft',
    temp: '10°C bis 18°C',
  },
  summer: {
    reason: 'Leicht und erfrischend - zitrus-frische Noten für heiße Tage',
    weather: 'Warm & Sonnig',
    temp: '22°C bis 30°C',
  },
  autumn: {
    reason: 'Warm und gemütlich - holzige Noten für goldene Herbsttage',
    weather: 'Kühl & Nebelig',
    temp: '8°C bis 15°C',
  },
};

export function ScentCalendar() {
  const navigate = useNavigate();
  
  const currentSeason = useMemo(() => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }, []);

  const config = seasonConfig[currentSeason];
  const seasonInfo = seasonReasons[currentSeason];
  const Icon = config.icon;

  const handleViewProducts = () => {
    navigate(`/products?season=${currentSeason}`);
  };

  return (
    <Card className="overflow-hidden border-primary/20">
      <CardHeader className="bg-gradient-to-br from-primary/10 to-transparent pb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-lg bg-primary/20">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <Badge variant="secondary" className="text-xs">Saisonal</Badge>
        </div>
        <CardTitle className="text-xl">Duft-Kalender</CardTitle>
        <p className="text-sm text-muted-foreground">
          Der perfekte Duft für die aktuelle Jahreszeit
        </p>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className={`p-4 rounded-xl ${config.bg}`}>
          <div className="flex items-center gap-3 mb-3">
            <Icon className={`w-8 h-8 ${config.color}`} />
            <div>
              <p className="font-semibold">{config.label}</p>
              <p className="text-xs text-muted-foreground">{seasonInfo.weather}</p>
            </div>
            <Badge variant="outline" className="ml-auto">
              {seasonInfo.temp}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {seasonInfo.reason}
          </p>
        </div>

        <Button className="w-full" onClick={handleViewProducts}>
          <Calendar className="w-4 h-4 mr-2" />
          Saison-Düfte entdecken
        </Button>
      </CardContent>
    </Card>
  );
}
