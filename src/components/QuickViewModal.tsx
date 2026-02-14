import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star, X, Heart, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface QuickViewModalProps {
  productId: string | null;
  open: boolean;
  onClose: () => void;
}

interface ProductData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  base_price: number;
  original_price: number | null;
  rating: number | null;
  review_count: number | null;
  brand: string | null;
  top_notes: string[] | null;
  middle_notes: string[] | null;
  base_notes: string[] | null;
  inspired_by: string | null;
}

export function QuickViewModal({ productId, open, onClose }: QuickViewModalProps) {
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!productId || !open) return;
    setLoading(true);
    supabase
      .from('products')
      .select('id, name, slug, description, image_url, base_price, original_price, rating, review_count, brand, top_notes, middle_notes, base_notes, inspired_by')
      .eq('id', productId)
      .single()
      .then(({ data }) => {
        setProduct(data);
        setLoading(false);
      });
  }, [productId, open]);

  if (!open) return null;

  const discount = product?.original_price
    ? Math.round((1 - product.base_price / product.original_price) * 100)
    : 0;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden" aria-describedby="quick-view-desc">
        <DialogTitle className="sr-only">{product?.name || 'Produkt-Schnellansicht'}</DialogTitle>
        {loading || !product ? (
          <div className="p-12 flex items-center justify-center" role="status">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <span className="sr-only">Laden…</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image */}
            <div className="aspect-square bg-muted/30 relative">
              <img
                src={product.image_url || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {discount > 0 && (
                <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground">
                  -{discount}%
                </Badge>
              )}
            </div>

            {/* Details */}
            <div className="p-6 flex flex-col gap-4">
              <div>
                {product.brand && (
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{product.brand}</p>
                )}
                <h2 className="text-xl font-display text-foreground">{product.name}</h2>
                {product.inspired_by && (
                  <p className="text-xs text-muted-foreground mt-1">Inspiriert von {product.inspired_by}</p>
                )}
              </div>

              {/* Rating */}
              {product.rating && product.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-accent text-accent" />
                  <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
                  {product.review_count && product.review_count > 0 && (
                    <span className="text-xs text-muted-foreground">({product.review_count})</span>
                  )}
                </div>
              )}

              {/* Price */}
              <div className="flex items-center gap-3">
                <span className="text-2xl font-display text-foreground">
                  ab {product.base_price.toFixed(2)} €
                </span>
                {product.original_price && product.original_price > product.base_price && (
                  <span className="text-sm text-muted-foreground line-through">
                    {product.original_price.toFixed(2)} €
                  </span>
                )}
              </div>

              {/* Description */}
              <p id="quick-view-desc" className="text-sm text-muted-foreground line-clamp-3">
                {product.description || 'Ein exquisiter Duft aus der ALDENAIR Kollektion.'}
              </p>

              {/* Scent Notes */}
              {(product.top_notes?.length || product.middle_notes?.length || product.base_notes?.length) && (
                <div className="space-y-2">
                  {product.top_notes?.length ? (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground w-16">Kopf:</span>
                      {product.top_notes.map(n => (
                        <span key={n} className="text-xs bg-muted px-2 py-0.5">{n}</span>
                      ))}
                    </div>
                  ) : null}
                  {product.middle_notes?.length ? (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground w-16">Herz:</span>
                      {product.middle_notes.map(n => (
                        <span key={n} className="text-xs bg-muted px-2 py-0.5">{n}</span>
                      ))}
                    </div>
                  ) : null}
                  {product.base_notes?.length ? (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground w-16">Basis:</span>
                      {product.base_notes.map(n => (
                        <span key={n} className="text-xs bg-muted px-2 py-0.5">{n}</span>
                      ))}
                    </div>
                  ) : null}
                </div>
              )}

              {/* Actions */}
              <div className="mt-auto flex gap-2 pt-4">
                <Button asChild className="flex-1 gap-2">
                  <Link to={`/products/${product.slug}`} onClick={onClose}>
                    <ExternalLink className="w-4 h-4" />
                    Zum Produkt
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
