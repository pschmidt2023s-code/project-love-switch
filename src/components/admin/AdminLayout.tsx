import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Tag, 
  Mail, 
  Trophy, 
  Handshake, 
  Wallet, 
  MessageSquare, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Home,
  LogOut,
  Warehouse,
  Ticket,
  Shield,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'Bestellungen', icon: ShoppingCart },
  { id: 'products', label: 'Produkte', icon: Package },
  { id: 'inventory', label: 'Lagerbestand', icon: Warehouse },
  { id: 'customers', label: 'Kunden', icon: Users },
  { id: 'tickets', label: 'Support-Tickets', icon: Ticket },
  { id: 'returns', label: 'Retouren', icon: Package },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'coupons', label: 'Gutscheine', icon: Tag },
  { id: 'newsletter', label: 'Newsletter', icon: Mail },
  { id: 'contest', label: 'Gewinnspiel', icon: Trophy },
  { id: 'partners', label: 'Partner', icon: Handshake },
  { id: 'payback', label: 'Payback', icon: Wallet },
  { id: 'chat', label: 'Live Chat', icon: MessageSquare },
  { id: 'emails', label: 'E-Mail-Logs', icon: Mail },
  { id: 'audit', label: 'Audit-Logs', icon: Shield },
  { id: 'settings', label: 'Einstellungen', icon: Settings },
];

export function AdminLayout({ children, activeTab, onTabChange }: AdminLayoutProps) {
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Close mobile menu when tab changes
  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  // Close mobile menu on resize to desktop
  useEffect(() => {
    if (!isMobile) {
      setMobileMenuOpen(false);
    }
  }, [isMobile]);

  const SidebarContent = () => (
    <>
      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className={`space-y-1 ${collapsed && !isMobile ? 'px-2' : 'px-3'}`}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                activeTab === item.id
                  ? 'bg-accent/10 text-accent'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              } ${collapsed && !isMobile ? 'justify-center' : ''}`}
              title={collapsed && !isMobile ? item.label : undefined}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
              {(!collapsed || isMobile) && <span>{item.label}</span>}
            </button>
          ))}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-border p-3 space-y-1">
        <Link
          to="/"
          className={`flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors ${
            collapsed && !isMobile ? 'justify-center' : ''
          }`}
          title={collapsed && !isMobile ? 'Zur Website' : undefined}
        >
          <Home className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
          {(!collapsed || isMobile) && <span>Zur Website</span>}
        </Link>
        
        <button
          onClick={() => signOut()}
          className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-destructive hover:bg-muted/50 transition-colors ${
            collapsed && !isMobile ? 'justify-center' : ''
          }`}
          title={collapsed && !isMobile ? 'Abmelden' : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
          {(!collapsed || isMobile) && <span>Abmelden</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      {isMobile && (
        <header className="sticky top-0 z-50 h-14 bg-background border-b border-border flex items-center justify-between px-4">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-2 text-foreground"
          >
            <Menu className="w-5 h-5" strokeWidth={1.5} />
          </button>
          
          <span className="font-display text-lg tracking-[0.15em] text-foreground">ADMIN</span>
          
          <div className="w-8 h-8 bg-accent/10 flex items-center justify-center text-accent text-sm font-medium">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
        </header>
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobile && mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      {isMobile && (
        <aside 
          className={`fixed left-0 top-0 h-full w-72 bg-card border-r border-border flex flex-col z-50 transition-transform duration-300 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Mobile Header */}
          <div className="h-14 flex items-center justify-between px-4 border-b border-border">
            <span className="font-display text-lg tracking-[0.15em] text-foreground">ALDENAIR</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 -mr-2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
          
          <SidebarContent />
        </aside>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside 
          className={`fixed left-0 top-0 h-screen bg-card border-r border-border flex flex-col transition-all duration-300 z-50 ${
            collapsed ? 'w-16' : 'w-64'
          }`}
        >
          {/* Logo */}
          <div className={`h-16 flex items-center border-b border-border ${collapsed ? 'px-4 justify-center' : 'px-6'}`}>
            {collapsed ? (
              <span className="font-display text-lg font-medium text-foreground">A</span>
            ) : (
              <span className="font-display text-lg tracking-[0.15em] text-foreground">ALDENAIR</span>
            )}
          </div>

          <SidebarContent />

          {/* Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-20 w-6 h-6 bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-3 h-3" strokeWidth={1.5} />
            ) : (
              <ChevronLeft className="w-3 h-3" strokeWidth={1.5} />
            )}
          </button>
        </aside>
      )}

      {/* Main Content */}
      <div className={`transition-all duration-300 ${!isMobile ? (collapsed ? 'ml-16' : 'ml-64') : ''}`}>
        {/* Desktop Topbar */}
        {!isMobile && (
          <header className="sticky top-0 z-40 h-16 bg-background/95 backdrop-blur-sm border-b border-border flex items-center justify-between px-6">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Suche..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-4 py-2 bg-muted/50 border border-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-border transition-colors"
                />
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user?.email}
              </span>
              <div className="w-8 h-8 bg-accent/10 flex items-center justify-center text-accent text-sm font-medium">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
            </div>
          </header>
        )}

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
