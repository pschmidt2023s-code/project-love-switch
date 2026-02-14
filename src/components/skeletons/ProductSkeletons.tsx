/* ═══════════════════════════════════════════════════════════════════════════
   SKELETON LOADING COMPONENTS
   Shimmer-based loading states for all major UI patterns
   ═══════════════════════════════════════════════════════════════════════════ */

export function ProductCardSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Produkt wird geladen">
      <div className="aspect-[3/4] skeleton" />
      <div className="space-y-2">
        <div className="h-3 w-16 skeleton" />
        <div className="h-5 w-3/4 skeleton" />
        <div className="h-3 w-1/2 skeleton" />
        <div className="h-5 w-24 skeleton" />
      </div>
      <span className="sr-only">Laden…</span>
    </div>
  );
}

export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-6" role="status" aria-label="Produkte werden geladen">
      {[...Array(count)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="min-h-[85vh] skeleton flex items-center justify-center" role="status" aria-label="Hero-Bereich wird geladen">
      <div className="space-y-6 text-center">
        <div className="h-3 w-32 skeleton mx-auto" />
        <div className="h-12 w-80 skeleton mx-auto" />
        <div className="h-6 w-64 skeleton mx-auto" />
        <div className="h-12 w-48 skeleton mx-auto" />
      </div>
      <span className="sr-only">Laden…</span>
    </div>
  );
}

export function FeaturesSkeleton() {
  return (
    <div className="py-8 lg:py-12 border-y border-border" role="status" aria-label="Features werden geladen">
      <div className="container-premium">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="text-center space-y-3">
              <div className="w-10 h-10 skeleton mx-auto" />
              <div className="h-4 w-24 skeleton mx-auto" />
              <div className="h-3 w-32 skeleton mx-auto" />
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Laden…</span>
    </div>
  );
}

export function OrderSkeleton() {
  return (
    <div className="space-y-3" role="status" aria-label="Bestellungen werden geladen">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-20 skeleton" />
      ))}
      <span className="sr-only">Laden…</span>
    </div>
  );
}

export function AccountSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Konto wird geladen">
      <div className="h-8 w-48 skeleton" />
      <div className="h-64 skeleton" />
      <span className="sr-only">Laden…</span>
    </div>
  );
}

export function CheckoutSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" role="status" aria-label="Checkout wird geladen">
      <div className="space-y-6">
        <div className="h-8 w-48 skeleton" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-12 skeleton" />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-8 w-32 skeleton" />
        <div className="h-48 skeleton" />
        <div className="h-14 skeleton" />
      </div>
      <span className="sr-only">Laden…</span>
    </div>
  );
}

export function NavigationSkeleton() {
  return (
    <div className="h-16 lg:h-20 border-b border-border flex items-center px-4 lg:px-8" role="status" aria-label="Navigation wird geladen">
      <div className="h-6 w-28 skeleton" />
      <div className="hidden lg:flex flex-1 justify-center gap-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-4 w-16 skeleton" />
        ))}
      </div>
      <div className="flex gap-2 ml-auto">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-10 w-10 skeleton" />
        ))}
      </div>
      <span className="sr-only">Laden…</span>
    </div>
  );
}
