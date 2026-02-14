import { Link } from 'react-router-dom';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { X } from 'lucide-react';

export function RecentlyViewed() {
  const { items, clearAll } = useRecentlyViewed();

  if (items.length === 0) return null;

  return (
    <section className="py-8 lg:py-12 border-t border-border">
      <div className="container-premium">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-2">
              Zuletzt angesehen
            </span>
            <h2 className="font-display text-xl lg:text-2xl text-foreground">
              Kürzlich betrachtet
            </h2>
          </div>
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3 h-3" strokeWidth={1.5} />
            Löschen
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {items.map((item) => (
            <Link
              key={item.id}
              to={`/products/${item.slug}`}
              className="flex-shrink-0 w-36 lg:w-44 group"
            >
              <div className="aspect-[3/4] bg-muted overflow-hidden mb-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <h3 className="text-sm text-foreground line-clamp-1 group-hover:text-accent transition-colors">
                {item.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {item.price.toFixed(2).replace('.', ',')} €
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
