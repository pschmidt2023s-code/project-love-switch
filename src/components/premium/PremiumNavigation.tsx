import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, LogOut, ShoppingBag, Settings, Search, Menu, X, Heart } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { AuthModal } from '@/components/AuthModal';
import { CartSidebar } from '@/components/CartSidebar';
import { DarkModeToggle } from '@/components/DarkModeToggle';

export function PremiumNavigation() {
  const { user, signOut } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowSearch(false);
        setShowMobileMenu(false);
        setShowUserMenu(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  useEffect(() => {
    setShowMobileMenu(false);
    setShowSearch(false);
  }, [location.pathname]);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();
        setIsAdmin(!!data);
      } catch {
        setIsAdmin(false);
      }
    };
    checkAdminRole();
  }, [user]);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Kollektion' },
    { to: '/scent-finder', label: 'Duft-Finder' },
    { to: '/about', label: 'Über Uns' },
    { to: '/contact', label: 'Kontakt' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-foreground text-background py-2.5">
        <div className="container-premium">
          <p className="text-center text-[11px] tracking-[0.2em] uppercase font-medium">
            Kostenloser Versand ab 50€ · 14 Tage Rückgabe · Premium Qualität
          </p>
        </div>
      </div>

      {/* Main Navigation */}
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-background/98 backdrop-blur-xl border-b border-border shadow-sm'
            : 'bg-background border-b border-border'
        }`}
      >
        <nav className="container-premium">
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
            {/* Left: Mobile Menu Toggle - fixed width for balance */}
            <div className="flex items-center w-10 lg:hidden">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="flex items-center justify-center w-10 h-10 text-foreground hover:text-muted-foreground transition-colors"
                aria-label={showMobileMenu ? 'Menü schließen' : 'Menü öffnen'}
              >
                {showMobileMenu ? (
                  <X className="w-5 h-5" strokeWidth={1.5} />
                ) : (
                  <Menu className="w-5 h-5" strokeWidth={1.5} />
                )}
              </button>
            </div>

            {/* Left: Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative text-[11px] tracking-[0.15em] uppercase font-medium transition-colors duration-300 ${
                    isActive(link.to)
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {link.label}
                  {isActive(link.to) && (
                    <span className="absolute -bottom-1 left-0 w-full h-px bg-accent" />
                  )}
                </Link>
              ))}
            </div>

            {/* Center: Logo - truly centered */}
            <Link
              to="/"
              className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center"
            >
              <h1 className="font-display text-lg sm:text-xl md:text-2xl tracking-[0.2em] sm:tracking-[0.25em] text-foreground font-medium whitespace-nowrap">
                ALDENAIR
              </h1>
            </Link>

            {/* Right: Actions - consistent sizing */}
            <div className="flex items-center gap-0 sm:gap-1">
              {/* Search */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 text-foreground hover:text-muted-foreground transition-colors"
                aria-label="Suche"
              >
                <Search className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </button>

              {/* Dark Mode - hidden on small mobile */}
              <div className="hidden sm:flex">
                <DarkModeToggle />
              </div>

              {/* Favorites - hidden on mobile */}
              <Link
                to="/favorites"
                className="hidden md:flex items-center justify-center w-10 h-10 text-foreground hover:text-muted-foreground transition-colors"
                aria-label="Favoriten"
              >
                <Heart className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </Link>

              {/* Cart */}
              <button
                onClick={() => setShowCart(true)}
                className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 text-foreground hover:text-muted-foreground transition-colors"
                aria-label="Warenkorb"
              >
                <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.5} />
                {itemCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 min-w-[14px] sm:min-w-[16px] h-3.5 sm:h-4 flex items-center justify-center bg-accent text-accent-foreground text-[8px] sm:text-[9px] font-semibold px-0.5 sm:px-1">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </button>

              {/* User Menu */}
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 text-foreground hover:text-muted-foreground transition-colors"
                    aria-label="Konto"
                  >
                    <User className="w-[18px] h-[18px]" strokeWidth={1.5} />
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-card border border-border shadow-xl animate-fade-in z-50">
                      <div className="px-5 py-4 border-b border-border">
                        <p className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground">
                          Konto
                        </p>
                        <p className="text-sm text-foreground truncate mt-1 font-medium">
                          {user.email}
                        </p>
                      </div>
                      
                      <div className="py-2">
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-5 py-3 text-sm text-foreground hover:bg-muted transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="w-4 h-4" strokeWidth={1.5} />
                          <span>Mein Profil</span>
                        </Link>
                        
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-3 px-5 py-3 text-sm text-foreground hover:bg-muted transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Settings className="w-4 h-4" strokeWidth={1.5} />
                            <span>Admin Dashboard</span>
                          </Link>
                        )}
                      </div>
                      
                      <div className="border-t border-border py-2">
                        <button
                          onClick={() => {
                            signOut();
                            setShowUserMenu(false);
                          }}
                          className="flex items-center gap-3 w-full px-5 py-3 text-sm text-destructive hover:bg-muted transition-colors"
                        >
                          <LogOut className="w-4 h-4" strokeWidth={1.5} />
                          <span>Abmelden</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <AuthModal>
                  <button className="hidden sm:flex items-center px-5 py-2 text-[11px] tracking-[0.1em] uppercase font-medium text-foreground border border-foreground hover:bg-foreground hover:text-background transition-all duration-300">
                    Anmelden
                  </button>
                </AuthModal>
              )}
            </div>
          </div>
        </nav>

        {/* Search Overlay */}
        {showSearch && (
          <div className="absolute top-full left-0 right-0 bg-background border-b border-border animate-fade-in">
            <div className="container-premium py-6">
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                  <input
                    type="text"
                    placeholder="Suche nach Düften..."
                    className="w-full pl-8 pr-4 py-3 bg-transparent border-b border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent text-lg"
                    autoFocus
                  />
                  <button
                    onClick={() => setShowSearch(false)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-background border-b border-border animate-fade-in z-50">
            <div className="container-premium py-8">
              <nav className="space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`block py-4 text-xl font-display tracking-wider border-b border-border transition-colors ${
                      isActive(link.to)
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              
              {!user && (
                <div className="pt-8">
                  <AuthModal>
                    <button className="w-full py-4 text-[11px] tracking-[0.15em] uppercase font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors">
                      Anmelden
                    </button>
                  </AuthModal>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <CartSidebar open={showCart} onOpenChange={setShowCart} />
    </>
  );
}
