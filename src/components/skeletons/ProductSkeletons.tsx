export function ProductCardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="aspect-[3/4] bg-muted" />
      <div className="space-y-2">
        <div className="h-3 w-16 bg-muted" />
        <div className="h-5 w-3/4 bg-muted" />
        <div className="h-3 w-1/2 bg-muted" />
        <div className="h-5 w-24 bg-muted" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-6">
      {[...Array(count)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="min-h-[85vh] bg-muted animate-pulse flex items-center justify-center">
      <div className="space-y-6 text-center">
        <div className="h-3 w-32 bg-muted-foreground/10 mx-auto" />
        <div className="h-12 w-80 bg-muted-foreground/10 mx-auto" />
        <div className="h-6 w-64 bg-muted-foreground/10 mx-auto" />
        <div className="h-12 w-48 bg-muted-foreground/10 mx-auto" />
      </div>
    </div>
  );
}

export function FeaturesSkeleton() {
  return (
    <div className="py-8 lg:py-12 border-y border-border">
      <div className="container-premium">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="text-center animate-pulse space-y-3">
              <div className="w-10 h-10 bg-muted mx-auto" />
              <div className="h-4 w-24 bg-muted mx-auto" />
              <div className="h-3 w-32 bg-muted mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function OrderSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-20 bg-muted" />
      ))}
    </div>
  );
}

export function AccountSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-48 bg-muted" />
      <div className="h-64 bg-muted" />
    </div>
  );
}
