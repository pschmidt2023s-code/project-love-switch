import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  BarChart3,
  Settings,
  MessageSquare,
  Mail,
  Award,
  Handshake,
  Trophy,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Home,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Produkte', icon: Package },
  { id: 'orders', label: 'Bestellungen', icon: ShoppingCart },
  { id: 'customers', label: 'Kunden', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

const marketingItems = [
  { id: 'coupons', label: 'Rabattcodes', icon: Tag },
  { id: 'newsletter', label: 'Newsletter', icon: Mail },
  { id: 'contest', label: 'Gewinnspiel', icon: Trophy },
];

const partnerItems = [
  { id: 'partners', label: 'Partner', icon: Handshake },
  { id: 'payback', label: 'Payback', icon: Award },
];

const supportItems = [
  { id: 'chat', label: 'Live Chat', icon: MessageSquare },
  { id: 'settings', label: 'Einstellungen', icon: Settings },
];

export default function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { signOut } = useAuth();

  const renderMenuItem = (item: { id: string; label: string; icon: React.ElementType }) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;

    return (
      <button
        key={item.id}
        onClick={() => onTabChange(item.id)}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-primary text-primary-foreground shadow-md'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        )}
      >
        <Icon className={cn('h-5 w-5 shrink-0', collapsed && 'mx-auto')} />
        {!collapsed && <span>{item.label}</span>}
      </button>
    );
  };

  const renderSection = (title: string, items: typeof menuItems) => (
    <div className="space-y-1">
      {!collapsed && (
        <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </p>
      )}
      {items.map(renderMenuItem)}
    </div>
  );

  return (
    <aside
      className={cn(
        'h-screen bg-card border-r border-border flex flex-col transition-all duration-300 sticky top-0',
        collapsed ? 'w-[70px]' : 'w-[260px]'
      )}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Package className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Admin</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn('shrink-0', collapsed && 'mx-auto')}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <div className="px-3 space-y-6">
          {renderSection('Übersicht', menuItems)}
          <Separator />
          {renderSection('Marketing', marketingItems)}
          <Separator />
          {renderSection('Partner', partnerItems)}
          <Separator />
          {renderSection('System', supportItems)}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-border space-y-2">
        <Button
          variant="ghost"
          className={cn('w-full justify-start gap-3', collapsed && 'justify-center px-0')}
          asChild
        >
          <a href="/">
            <Home className="h-4 w-4" />
            {!collapsed && <span>Zum Shop</span>}
          </a>
        </Button>
        <Button
          variant="ghost"
          className={cn('w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10', collapsed && 'justify-center px-0')}
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Abmelden</span>}
        </Button>
      </div>
    </aside>
  );
}
