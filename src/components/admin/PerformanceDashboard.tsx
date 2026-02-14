import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useWebVitals, WebVitalMetric } from '@/hooks/useWebVitals';
import { Activity, Gauge, Image, Zap, Clock, MousePointer, Move, Eye } from 'lucide-react';

const VITAL_CONFIG: Record<string, { label: string; unit: string; icon: React.ElementType; description: string }> = {
  LCP: { label: 'Largest Contentful Paint', unit: 'ms', icon: Eye, description: 'Ladezeit des größten sichtbaren Elements' },
  FID: { label: 'First Input Delay', unit: 'ms', icon: MousePointer, description: 'Reaktionszeit auf erste Interaktion' },
  CLS: { label: 'Cumulative Layout Shift', unit: '', icon: Move, description: 'Visuelle Stabilität der Seite' },
  FCP: { label: 'First Contentful Paint', unit: 'ms', icon: Zap, description: 'Zeit bis erster Inhalt sichtbar' },
  TTFB: { label: 'Time to First Byte', unit: 'ms', icon: Clock, description: 'Server-Antwortzeit' },
  INP: { label: 'Interaction to Next Paint', unit: 'ms', icon: Activity, description: 'Reaktionsfähigkeit bei Interaktionen' },
};

const ratingColors: Record<string, string> = {
  good: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  'needs-improvement': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  poor: 'bg-destructive/10 text-destructive border-destructive/20',
};

const ratingLabels: Record<string, string> = {
  good: 'Gut',
  'needs-improvement': 'Verbesserbar',
  poor: 'Schlecht',
};

function VitalCard({ metric }: { metric: WebVitalMetric | null }) {
  if (!metric) return null;
  const config = VITAL_CONFIG[metric.name];
  if (!config) return null;
  const Icon = config.icon;
  const displayValue = metric.name === 'CLS' ? metric.value.toFixed(3) : Math.round(metric.value);

  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <span className="text-xs font-medium text-muted-foreground">{metric.name}</span>
          </div>
          <Badge variant="outline" className={ratingColors[metric.rating]}>
            {ratingLabels[metric.rating]}
          </Badge>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold tabular-nums">
            {displayValue}
            <span className="text-xs font-normal text-muted-foreground ml-1">{config.unit}</span>
          </p>
          <p className="text-[11px] text-muted-foreground">{config.description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function PerformanceScore({ score }: { score: number }) {
  const color = score >= 80 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-destructive';
  const bgColor = score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-destructive';

  return (
    <Card className="border-border/50">
      <CardContent className="p-6">
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8"
                className={color}
                strokeDasharray={`${(score / 100) * 251.2} 251.2`}
                strokeLinecap="round"
              />
            </svg>
            <span className={`absolute text-2xl font-bold ${color}`}>{score}</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">Performance Score</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {score >= 80 ? 'Exzellente Performance! Die Seite lädt schnell und reagiert flüssig.' :
               score >= 50 ? 'Gute Performance mit Verbesserungspotenzial.' :
               'Performance muss optimiert werden. Mehrere Metriken sind im roten Bereich.'}
            </p>
            <div className="mt-3">
              <Progress value={score} className={`h-1.5 ${bgColor}`} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ResourceStats() {
  const stats = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const images = entries.filter(e => e.initiatorType === 'img' || e.name.match(/\.(png|jpg|jpeg|webp|gif|svg|avif)(\?|$)/i));
    const scripts = entries.filter(e => e.initiatorType === 'script');
    const styles = entries.filter(e => e.initiatorType === 'css' || e.name.endsWith('.css'));

    const totalSize = entries.reduce((sum, e) => sum + (e.transferSize || 0), 0);
    const imgSize = images.reduce((sum, e) => sum + (e.transferSize || 0), 0);

    return {
      totalResources: entries.length,
      images: images.length,
      scripts: scripts.length,
      styles: styles.length,
      totalSizeKB: Math.round(totalSize / 1024),
      imgSizeKB: Math.round(imgSize / 1024),
      avgLoadTime: entries.length > 0
        ? Math.round(entries.reduce((sum, e) => sum + e.duration, 0) / entries.length)
        : 0,
      slowest: entries.length > 0
        ? entries.reduce((slowest, e) => e.duration > slowest.duration ? e : slowest).name.split('/').pop()?.substring(0, 30) || '—'
        : '—',
    };
  }, []);

  if (!stats) return null;

  const items = [
    { label: 'Ressourcen gesamt', value: stats.totalResources },
    { label: 'Bilder', value: stats.images },
    { label: 'Scripts', value: stats.scripts },
    { label: 'Stylesheets', value: stats.styles },
    { label: 'Gesamtgröße', value: `${stats.totalSizeKB} KB` },
    { label: 'Bildgröße', value: `${stats.imgSizeKB} KB` },
    { label: 'Ø Ladezeit', value: `${stats.avgLoadTime} ms` },
    { label: 'Langsamste', value: stats.slowest },
  ];

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Image className="h-4 w-4" strokeWidth={1.5} />
          Ressourcen-Analyse
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map(item => (
            <div key={item.label} className="space-y-1">
              <p className="text-[11px] text-muted-foreground">{item.label}</p>
              <p className="text-sm font-semibold tabular-nums">{item.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function NavigationTiming() {
  const timing = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (entries.length === 0) return null;
    const nav = entries[0];
    return {
      dns: Math.round(nav.domainLookupEnd - nav.domainLookupStart),
      tcp: Math.round(nav.connectEnd - nav.connectStart),
      ttfb: Math.round(nav.responseStart - nav.requestStart),
      download: Math.round(nav.responseEnd - nav.responseStart),
      domParsing: Math.round(nav.domInteractive - nav.responseEnd),
      domReady: Math.round(nav.domContentLoadedEventEnd - nav.fetchStart),
      fullLoad: Math.round(nav.loadEventEnd - nav.fetchStart),
    };
  }, []);

  if (!timing) return null;

  const steps = [
    { label: 'DNS', value: timing.dns, color: 'bg-blue-500' },
    { label: 'TCP', value: timing.tcp, color: 'bg-indigo-500' },
    { label: 'TTFB', value: timing.ttfb, color: 'bg-violet-500' },
    { label: 'Download', value: timing.download, color: 'bg-purple-500' },
    { label: 'DOM Parse', value: timing.domParsing, color: 'bg-pink-500' },
  ];
  const total = steps.reduce((sum, s) => sum + s.value, 0) || 1;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Gauge className="h-4 w-4" strokeWidth={1.5} />
          Navigation Timing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex h-3 rounded-full overflow-hidden bg-muted">
          {steps.map(step => (
            <div
              key={step.label}
              className={`${step.color} transition-all`}
              style={{ width: `${(step.value / total) * 100}%` }}
              title={`${step.label}: ${step.value}ms`}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-4">
          {steps.map(step => (
            <div key={step.label} className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-sm ${step.color}`} />
              <span className="text-xs text-muted-foreground">{step.label}: <strong>{step.value}ms</strong></span>
            </div>
          ))}
        </div>
        <div className="flex gap-6 pt-2 border-t border-border/50">
          <div>
            <p className="text-[11px] text-muted-foreground">DOM Ready</p>
            <p className="text-sm font-semibold">{timing.domReady}ms</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Full Load</p>
            <p className="text-sm font-semibold">{timing.fullLoad}ms</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PerformanceDashboard() {
  const { vitals, getScore } = useWebVitals();
  const score = getScore();
  const vitalsList = [vitals.lcp, vitals.fcp, vitals.ttfb, vitals.cls, vitals.inp, vitals.fid].filter(Boolean);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Performance</h2>
        <p className="text-sm text-muted-foreground">Web Vitals, Ladezeiten und Ressourcen-Analyse</p>
      </div>

      <PerformanceScore score={score} />

      {vitalsList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[vitals.lcp, vitals.fcp, vitals.ttfb, vitals.cls, vitals.inp, vitals.fid].map((m, i) => (
            <VitalCard key={i} metric={m} />
          ))}
        </div>
      ) : (
        <Card className="border-border/50">
          <CardContent className="p-8 text-center">
            <Activity className="h-8 w-8 mx-auto mb-3 text-muted-foreground animate-pulse" />
            <p className="text-sm text-muted-foreground">Web Vitals werden erfasst… Navigiere durch den Shop, um Metriken zu sammeln.</p>
          </CardContent>
        </Card>
      )}

      <NavigationTiming />
      <ResourceStats />
    </div>
  );
}

export default PerformanceDashboard;
