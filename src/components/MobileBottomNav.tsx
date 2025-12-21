import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, User, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
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
    requiresAuth: true
  }
];

export function MobileBottomNav() {
  const location = useLocation();
  const { itemCount } = useCart();
  const { user } = useAuth();
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
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border safe-area-inset-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.activeHref;
            const showBadge = item.showBadge && itemCount > 0;
            const showFavoritesBadge = item.label === 'Favoriten' && favoritesCount > 0;

            if (item.requiresAuth && !user) {
              return (
                <Link
                  key={item.label}
                  to="/auth"
                  className={cn(
                    'flex flex-col items-center justify-center flex-1 py-2 px-1 transition-colors',
                    'text-muted-foreground hover:text-primary'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                </Link>
              );
            }

            if (item.isAction) {
              return (
                <Button
                  key={item.label}
                  variant="ghost"
                  className={cn(
                    'flex flex-col items-center justify-center flex-1 h-auto py-2 px-1 relative',
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                  )}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="relative">
                    <Icon className="w-5 h-5" />
                    {showBadge && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center"
                      >
                        {itemCount > 99 ? '99+' : itemCount}
                      </Badge>
                    )}
                  </div>
                  <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                </Button>
              );
            }

            return (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 py-2 px-1 transition-colors relative',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                )}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {showFavoritesBadge && (
                    <Badge
                      variant="secondary"
                      className="absolute -top-2 -right-2 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center"
                    >
                      {favoritesCount}
                    </Badge>
                  )}
                </div>
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
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
