import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, User, Heart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';
import { CartSidebar } from './CartSidebar';
import { useState } from 'react';

const NAV_ITEMS = [
  {
    icon: Home,
    label: 'Home',
    href: '/',
    activeHref: '/'
  },
  {
    icon: ShoppingBag,
    label: 'Warenkorb',
    href: '#cart',
    activeHref: '/cart',
    showBadge: true,
    isAction: true
  },
  {
    icon: Heart,
    label: 'Favoriten',
    href: '/favorites',
    activeHref: '/favorites',
    isAction: false
  },
  {
    icon: User,
    label: 'Profil',
    href: '/profile',
    activeHref: '/profile',
    requiresAuth: false  // Allow navigation to profile page (shows login prompt if not authenticated)
  }
];

export function MobileBottomNav() {
  const location = useLocation();
  const { itemCount } = useCart();
  const { count: favoritesCount } = useFavorites();
  const [showCart, setShowCart] = useState(false);

  // Hide on admin pages
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const handleItemClick = (item: typeof NAV_ITEMS[0]) => {
    if (item.isAction && item.label === 'Warenkorb') {
      setShowCart(true);
      return true;
    }
    return false;
  };

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/98 backdrop-blur-xl border-t border-border safe-area-inset-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.activeHref;
            const showBadge = item.showBadge && itemCount > 0;
            const showFavoritesBadge = item.label === 'Favoriten' && favoritesCount > 0;

            if (item.isAction) {
              return (
                <button
                  key={item.label}
                  className={cn(
                    'flex flex-col items-center justify-center flex-1 py-2 px-1 transition-colors relative gap-1',
                    isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                  type="button"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="relative">
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                    {showBadge && (
                      <span className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-1 text-[9px] font-semibold flex items-center justify-center bg-accent text-accent-foreground rounded-full">
                        {itemCount > 99 ? '99+' : itemCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-medium">{item.label}</span>
                  {isActive && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-foreground rounded-full" />
                  )}
                </button>
              );
            }

            return (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 py-2 px-1 transition-colors relative gap-1',
                  isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" strokeWidth={1.5} />
                  {showFavoritesBadge && (
                    <span className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-1 text-[9px] font-semibold flex items-center justify-center bg-accent text-accent-foreground rounded-full">
                      {favoritesCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-foreground rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      <CartSidebar open={showCart} onOpenChange={setShowCart} />

      {/* Spacer for bottom nav */}
      <div className="lg:hidden h-16" />
    </>
  );
}
