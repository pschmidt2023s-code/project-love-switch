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
  const headerRef = useRef<HTMLElement>(null);
  const [isInverted, setIsInverted] = useState(false);
  
  // Simple and reliable background detection
  useEffect(() => {
    const checkBackground = () => {
      // Sample multiple points just below the header
      const headerHeight = headerRef.current?.getBoundingClientRect().height || 80;
      const sampleY = headerHeight + 5;
      
      // Temporarily make header non-interactive for element sampling
      if (headerRef.current) {
        headerRef.current.style.pointerEvents = 'none';
      }
      
      const centerElement = document.elementFromPoint(window.innerWidth / 2, sampleY);
      
      // Restore pointer events
      if (headerRef.current) {
        headerRef.current.style.pointerEvents = '';
      }
      
      if (!centerElement) {
        setIsInverted(false);
        return;
      }
      
      // Walk up the DOM tree to find background
      let el: Element | null = centerElement;
      let shouldInvert = false;
      
      while (el && el !== document.documentElement) {
        // Check for explicit data attributes first (most reliable)
        if (el.hasAttribute('data-header-dark')) {
          shouldInvert = true;
          break;
        }
        if (el.hasAttribute('data-header-light')) {
          shouldInvert = false;
          break;
        }
        
        const styles = getComputedStyle(el);
        const bgImage = styles.backgroundImage;
        const bgColor = styles.backgroundColor;
        
        // Background images (photos, gradients to dark) = assume dark
        if (bgImage && bgImage !== 'none' && bgImage.includes('url')) {
          shouldInvert = true;
          break;
        }
        
        // Check for dark gradients
        if (bgImage && bgImage !== 'none' && (bgImage.includes('rgb(0') || bgImage.includes('rgba(0'))) {
          shouldInvert = true;
          break;
        }
        
        // Check background color luminance
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
          const match = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          if (match) {
            const r = parseInt(match[1]);
            const g = parseInt(match[2]);
            const b = parseInt(match[3]);
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            
            if (luminance < 0.5) {
              shouldInvert = true;
              break;
            } else if (luminance > 0.5) {
              shouldInvert = false;
              break;
            }
          }
        }
        
        el = el.parentElement;
      }
      
      setIsInverted(shouldInvert);
    };
    
    // Check immediately and after short delay for page load
    checkBackground();
    const timer = setTimeout(checkBackground, 200);
    
    // Check on scroll with throttling
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          checkBackground();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', checkBackground, { passive: true });
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkBackground);
    };
  }, []);

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
  
  // Transition class for smooth fade - colors are handled via CSS in index.css
  const transitionClass = 'transition-colors duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]';

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
        ref={headerRef}
        data-inverted={isInverted ? "true" : "false"}
        className={`nav-header sticky top-0 z-50 ${transitionClass} ${
          isScrolled
            ? isInverted 
              ? 'bg-black/95 backdrop-blur-xl border-b border-white/10 shadow-lg' 
              : 'bg-background/98 backdrop-blur-xl border-b border-border shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <nav className="container-premium">
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
            {/* Left: Mobile Menu Toggle - fixed width for balance */}
            <div className="flex items-center w-10 lg:hidden">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className={`nav-icon flex items-center justify-center w-10 h-10 hover:opacity-70 ${transitionClass}`}
                aria-label={showMobileMenu ? 'Menü schließen' : 'Menü öffnen'}
              >
                {showMobileMenu ? (
                  <X className={`w-5 h-5 ${transitionClass}`} strokeWidth={1.5} />
                ) : (
                  <Menu className={`w-5 h-5 ${transitionClass}`} strokeWidth={1.5} />
                )}
              </button>
            </div>

            {/* Left: Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`nav-link relative text-[11px] tracking-[0.15em] uppercase font-medium hover:opacity-80 ${transitionClass} ${
                    isActive(link.to) ? '' : 'nav-link-muted'
                  }`}
                >
                  {link.label}
                  {isActive(link.to) && (
                    <span className="nav-underline absolute -bottom-1 left-0 w-full h-px bg-accent" />
                  )}
                </Link>
              ))}
            </div>

            {/* Center: Logo - truly centered */}
            <Link
              to="/"
              className={`nav-logo absolute left-1/2 -translate-x-1/2 flex items-center justify-center ${transitionClass}`}
            >
              <h1 className="font-display text-lg sm:text-xl md:text-2xl tracking-[0.2em] sm:tracking-[0.25em] font-medium whitespace-nowrap">
                ALDENAIR
              </h1>
            </Link>

            {/* Right: Actions - consistent sizing */}
            <div className="flex items-center gap-0 sm:gap-1">
              {/* Search */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`nav-icon flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 hover:opacity-70 ${transitionClass}`}
                aria-label="Suche"
              >
                <Search className={`w-[18px] h-[18px] ${transitionClass}`} strokeWidth={1.5} />
              </button>

              {/* Dark Mode - hidden on small mobile */}
              <div className="hidden sm:flex dark-mode-btn">
                <DarkModeToggle />
              </div>

              {/* Favorites - hidden on mobile */}
              <Link
                to="/favorites"
                className={`nav-icon hidden md:flex items-center justify-center w-10 h-10 hover:opacity-70 ${transitionClass}`}
                aria-label="Favoriten"
              >
                <Heart className={`w-[18px] h-[18px] ${transitionClass}`} strokeWidth={1.5} />
              </Link>

              {/* Cart */}
              <button
                onClick={() => setShowCart(true)}
                className={`nav-icon relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 hover:opacity-70 ${transitionClass}`}
                aria-label="Warenkorb"
              >
                <ShoppingBag className={`w-[18px] h-[18px] ${transitionClass}`} strokeWidth={1.5} />
                {itemCount > 0 && (
                  <span className="nav-badge absolute top-0.5 right-0.5 sm:top-1 sm:right-1 min-w-[14px] sm:min-w-[16px] h-3.5 sm:h-4 flex items-center justify-center text-[8px] sm:text-[9px] font-semibold px-0.5 sm:px-1 bg-accent text-accent-foreground">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </button>

              {/* User Menu */}
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className={`nav-icon flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 hover:opacity-70 ${transitionClass}`}
                    aria-label="Konto"
                  >
                    <User className={`w-[18px] h-[18px] ${transitionClass}`} strokeWidth={1.5} />
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
                  <button 
                    className={`nav-btn hidden sm:flex items-center px-5 py-2 text-[11px] tracking-[0.1em] uppercase font-medium border ${transitionClass}`}
                  >
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
