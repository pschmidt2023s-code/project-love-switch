import { useEffect, useState, useCallback } from 'react';

export interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

export interface WebVitalsData {
  lcp: WebVitalMetric | null;
  fid: WebVitalMetric | null;
  cls: WebVitalMetric | null;
  fcp: WebVitalMetric | null;
  ttfb: WebVitalMetric | null;
  inp: WebVitalMetric | null;
}

const THRESHOLDS: Record<string, { good: number; poor: number }> = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
};

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const t = THRESHOLDS[name];
  if (!t) return 'good';
  if (value <= t.good) return 'good';
  if (value <= t.poor) return 'needs-improvement';
  return 'poor';
}

export function useWebVitals() {
  const [vitals, setVitals] = useState<WebVitalsData>({
    lcp: null, fid: null, cls: null, fcp: null, ttfb: null, inp: null,
  });
  const [history, setHistory] = useState<WebVitalMetric[]>([]);

  useEffect(() => {
    let mounted = true;

    const handleMetric = (metric: any) => {
      if (!mounted) return;
      const m: WebVitalMetric = {
        name: metric.name,
        value: metric.value,
        rating: metric.rating || getRating(metric.name, metric.value),
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType || 'navigate',
      };

      setVitals(prev => ({
        ...prev,
        [metric.name.toLowerCase()]: m,
      }));
      setHistory(prev => [...prev.slice(-49), m]);
    };

    import('web-vitals').then(({ onLCP, onFID, onCLS, onFCP, onTTFB, onINP }) => {
      if (!mounted) return;
      onLCP(handleMetric);
      onFID(handleMetric);
      onCLS(handleMetric);
      onFCP(handleMetric);
      onTTFB(handleMetric);
      onINP(handleMetric);
    }).catch(console.error);

    return () => { mounted = false; };
  }, []);

  const getScore = useCallback((): number => {
    const metrics = [vitals.lcp, vitals.fid, vitals.cls, vitals.fcp, vitals.ttfb, vitals.inp].filter(Boolean);
    if (metrics.length === 0) return 0;
    const scores = metrics.map(m => m!.rating === 'good' ? 100 : m!.rating === 'needs-improvement' ? 50 : 0);
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [vitals]);

  return { vitals, history, getScore };
}
