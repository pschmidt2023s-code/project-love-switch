import React, { useState } from 'react';
import { Star, ThumbsUp, User } from 'lucide-react';

interface Review {
  id: string;
  author: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  helpful: number;
  verified: boolean;
}

// Demo reviews for display
const demoReviews: Review[] = [
  {
    id: '1',
    author: 'Michael S.',
    rating: 5,
    title: 'Fantastischer Duft!',
    content: 'Ich bin begeistert von der Qualität. Der Duft hält den ganzen Tag und ich bekomme ständig Komplimente. Absolut empfehlenswert für jeden, der nach einer hochwertigen Alternative sucht.',
    date: '2024-01-10',
    helpful: 12,
    verified: true,
  },
  {
    id: '2',
    author: 'Sarah K.',
    rating: 4,
    title: 'Sehr gutes Preis-Leistungs-Verhältnis',
    content: 'Riecht wirklich toll und hält lange. Einziger kleiner Kritikpunkt: Die Verpackung könnte etwas hochwertiger sein. Aber der Duft selbst ist top!',
    date: '2024-01-05',
    helpful: 8,
    verified: true,
  },
  {
    id: '3',
    author: 'Thomas W.',
    rating: 5,
    title: 'Mein neuer Lieblingsduft',
    content: 'Habe schon mehrere Düfte hier bestellt und bin immer wieder begeistert. Schneller Versand, tolle Qualität. Werde definitiv wieder bestellen!',
    date: '2023-12-28',
    helpful: 15,
    verified: true,
  },
];

interface ProductReviewsProps {
  productId: string;
  productName: string;
  averageRating?: number;
  reviewCount?: number;
}

export const ProductReviews = React.forwardRef<HTMLElement, ProductReviewsProps>(function ProductReviews({ productId, productName, averageRating = 4.8, reviewCount = 24 }, ref) {
  const [reviews] = useState<Review[]>(demoReviews);
  const [sortBy, setSortBy] = useState<'recent' | 'helpful'>('helpful');

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'helpful') return b.helpful - a.helpful;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const ratingDistribution = [
    { stars: 5, count: 18, percentage: 75 },
    { stars: 4, count: 4, percentage: 17 },
    { stars: 3, count: 1, percentage: 4 },
    { stars: 2, count: 1, percentage: 4 },
    { stars: 1, count: 0, percentage: 0 },
  ];

  return (
    <section ref={ref} className="py-10 lg:py-16 border-t border-border">
      <div className="container-premium">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
          <div>
            <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-3">
              Kundenbewertungen
            </span>
            <h2 className="font-display text-2xl lg:text-3xl text-foreground">
              Was unsere Kunden sagen
            </h2>
          </div>

          {/* Overall Rating */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-4xl font-display text-foreground mb-1">
                {averageRating.toFixed(1)}
              </p>
              <div className="flex items-center gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(averageRating)
                        ? 'fill-accent text-accent'
                        : 'text-muted-foreground'
                    }`}
                    strokeWidth={1.5}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {reviewCount} Bewertungen
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="hidden sm:block space-y-1">
              {ratingDistribution.map((item) => (
                <div key={item.stars} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-muted-foreground">{item.stars}</span>
                  <Star className="w-3 h-3 text-accent fill-accent" strokeWidth={1.5} />
                  <div className="w-24 h-1.5 bg-muted">
                    <div 
                      className="h-full bg-accent" 
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="w-6 text-muted-foreground">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sort */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setSortBy('helpful')}
            className={`px-4 py-2 text-[10px] tracking-[0.1em] uppercase font-medium border transition-colors ${
              sortBy === 'helpful'
                ? 'bg-foreground text-background border-foreground'
                : 'bg-card text-foreground border-border hover:border-accent'
            }`}
          >
            Hilfreichste
          </button>
          <button
            onClick={() => setSortBy('recent')}
            className={`px-4 py-2 text-[10px] tracking-[0.1em] uppercase font-medium border transition-colors ${
              sortBy === 'recent'
                ? 'bg-foreground text-background border-foreground'
                : 'bg-card text-foreground border-border hover:border-accent'
            }`}
          >
            Neueste
          </button>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {sortedReviews.map((review) => (
            <div 
              key={review.id}
              className="bg-card border border-border p-5 lg:p-6"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted flex items-center justify-center">
                    <User className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {review.author}
                      </span>
                      {review.verified && (
                        <span className="text-[9px] tracking-[0.1em] uppercase px-2 py-0.5 bg-success/10 text-success">
                          Verifiziert
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.date).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.rating
                          ? 'fill-accent text-accent'
                          : 'text-muted-foreground'
                      }`}
                      strokeWidth={1.5}
                    />
                  ))}
                </div>
              </div>

              {/* Content */}
              <h4 className="font-medium text-foreground mb-2">
                {review.title}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {review.content}
              </p>

              {/* Footer */}
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <ThumbsUp className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>Hilfreich ({review.helpful})</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <button className="px-8 py-3 border border-foreground text-foreground text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground hover:text-background transition-colors">
            Mehr Bewertungen laden
          </button>
        </div>
      </div>
    </section>
  );
});

ProductReviews.displayName = 'ProductReviews';
