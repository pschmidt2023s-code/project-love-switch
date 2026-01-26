import { useLocation } from 'react-router-dom';
import { Home, ShoppingBag, User, Heart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/hooks/useFavorites';
import { CartSidebar } from './CartSidebar';
import { MobileNavItem } from './mobile/MobileNavItem';
import { useState } from 'react';

export function MobileBottomNav() {
  const location = useLocation();
  const { itemCount } = useCart();
  const { count: favoritesCount } = useFavorites();
  const [showCart, setShowCart] = useState(false);

  // Hide on admin pages
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/98 backdrop-blur-xl border-t border-border safe-area-inset-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          <MobileNavItem
            icon={Home}
            label="Home"
            href="/"
            isActive={location.pathname === '/'}
          />
          <MobileNavItem
            icon={ShoppingBag}
            label="Warenkorb"
            isActive={location.pathname === '/cart'}
            badge={itemCount}
            onClick={() => setShowCart(true)}
          />
          <MobileNavItem
            icon={Heart}
            label="Favoriten"
            href="/favorites"
            isActive={location.pathname === '/favorites'}
            badge={favoritesCount}
          />
          <MobileNavItem
            icon={User}
            label="Profil"
            href="/profile"
            isActive={location.pathname === '/profile'}
          />
        </div>
      </nav>

      <CartSidebar open={showCart} onOpenChange={setShowCart} />

      {/* Spacer for bottom nav */}
      <div className="lg:hidden h-16" />
    </>
  );
}
