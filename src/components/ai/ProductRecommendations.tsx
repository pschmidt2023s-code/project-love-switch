import React, { useState, useEffect, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Recommendation {
  productId: string;
  productName: string;
  reason: string;
  matchScore: number;
  product?: {
    id: string;
    name: string;
    slug: string;
    image_url: string;
    base_price: number;
    variants: Array<{
      id: string;
      name: string;
      price: number;
      size: string;
      in_stock: boolean;
    }>;
  };
}

interface RecommendationsResponse {
  recommendations: Recommendation[];
  summary: string;
  purchaseHistoryUsed: boolean;
}

interface ProductRecommendationsProps {
  preferences?: {
    notes?: string[];
    seasons?: string[];
    occasions?: string[];
    gender?: string;
  };
  limit?: number;
  showTitle?: boolean;
  className?: string;
}

export const ProductRecommendations = forwardRef<HTMLDivElement, ProductRecommendationsProps>(function ProductRecommendations({
  preferences,
  limit = 4,
  showTitle = true,
  className = '',
}, ref) {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-recommendations', {
        body: { preferences, limit },
      });

      if (fnError) throw fnError;

      const response = data as RecommendationsResponse;
      setRecommendations(response.recommendations || []);
      setSummary(response.summary || '');
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
      setError('Empfehlungen konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [user?.id, JSON.stringify(preferences)]);

  if (error && recommendations.length === 0) {
    return null;
  }

  return (
    <div ref={ref} className={`space-y-6 ${className}`}>
      {showTitle && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-accent" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="font-display text-xl text-foreground">
                {user ? 'Für Sie empfohlen' : 'Unsere Empfehlungen'}
              </h2>
              <p className="text-xs text-muted-foreground">
                {user ? 'Basierend auf Ihren Präferenzen' : 'Entdecken Sie unsere Bestseller'}
              </p>
            </div>
          </div>
          <button
            onClick={fetchRecommendations}
            disabled={loading}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            title="Neue Empfehlungen laden"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.5} />
          </button>
        </div>
      )}

      {summary && (
        <p className="text-sm text-muted-foreground italic">{summary}</p>
      )}

      {loading && recommendations.length === 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="bg-card border border-border animate-pulse">
              <div className="aspect-[3/4] bg-muted" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-3/4 bg-muted" />
                <div className="h-3 w-1/2 bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={recommendations.map(r => r.productId).join('-')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {recommendations.map((rec, index) => (
              <motion.div
                key={rec.productId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link
                  to={`/products/${rec.product?.slug || rec.productId}`}
                  className="group block bg-card border border-border hover:border-accent/50 transition-colors"
                >
                  {/* Image */}
                  <div className="aspect-[3/4] bg-secondary/30 overflow-hidden relative">
                    {rec.product?.image_url ? (
                      <img
                        src={rec.product.image_url}
                        alt={rec.productName}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <span className="font-display text-2xl">A</span>
                      </div>
                    )}
                    
                    {/* Match Score Badge */}
                    <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-2 py-1">
                      <span className="text-[10px] tracking-[0.1em] uppercase text-accent font-medium">
                        {rec.matchScore}% Match
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-2">
                    <h3 className="font-display text-sm text-foreground line-clamp-1">
                      {rec.productName}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {rec.reason}
                    </p>
                    
                    {rec.product?.base_price && (
                      <p className="text-sm font-medium text-foreground">
                        ab €{rec.product.base_price.toFixed(2)}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-1 text-accent text-xs">
                      <span>Entdecken</span>
                      <ChevronRight className="w-3 h-3" strokeWidth={1.5} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {loading && recommendations.length > 0 && (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-accent" strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
});

ProductRecommendations.displayName = 'ProductRecommendations';
