import { useState } from 'react';
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
  Warehouse,
  FileText,
  Shield,
  Activity,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminRole } from '@/hooks/useAdminRole';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { signOut } = useAuth();
  const { role, permissions, isLoading } = useAdminRole();

  // Menu items with permission requirements
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, show: true },
    { id: 'orders', label: 'Bestellungen', icon: ShoppingCart, show: permissions.canManageOrders },
    { id: 'products', label: 'Produkte', icon: Package, show: permissions.canManageProducts },
    { id: 'customers', label: 'Kunden', icon: Users, show: permissions.canManageCustomers },
    { id: 'inventory', label: 'Inventar', icon: Warehouse, show: permissions.canManageInventory },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, show: permissions.canViewAnalytics },
  ].filter(item => item.show);

  const marketingItems = [
    { id: 'coupons', label: 'Rabattcodes', icon: Tag, show: permissions.canManageProducts },
    { id: 'newsletter', label: 'Newsletter', icon: Mail, show: permissions.canManageProducts },
    { id: 'contest', label: 'Gewinnspiel', icon: Trophy, show: permissions.canManageProducts },
  ].filter(item => item.show);

  const partnerItems = [
    { id: 'partners', label: 'Partner', icon: Handshake, show: permissions.canManageCustomers },
    { id: 'payback', label: 'Payback', icon: Award, show: permissions.canManageCustomers },
  ].filter(item => item.show);

  const supportItems = [
    { id: 'tickets', label: 'Tickets', icon: MessageSquare, show: permissions.canManageOrders },
    { id: 'chat', label: 'Live Chat', icon: MessageSquare, show: permissions.canManageOrders },
  ].filter(item => item.show);

  const systemItems = [
    { id: 'performance', label: 'Performance', icon: Activity, show: permissions.canViewAnalytics },
    { id: 'audit', label: 'Audit Logs', icon: FileText, show: permissions.canViewAuditLogs },
    { id: 'settings', label: 'Einstellungen', icon: Settings, show: permissions.canManageSettings },
  ].filter(item => item.show);

  const renderMenuItem = (item: { id: string; label: string; icon: React.ElementType }) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;

    return (
      <button
        key={item.id}
        onClick={() => onTabChange(item.id)}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-foreground text-background'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
      >
        <Icon className={cn('h-4 w-4 shrink-0', collapsed && 'mx-auto')} strokeWidth={1.5} />
        {!collapsed && <span>{item.label}</span>}
      </button>
    );
  };

  const renderSection = (title: string, items: typeof menuItems) => {
    if (items.length === 0) return null;
    
    return (
      <div className="space-y-1">
        {!collapsed && (
          <p className="px-3 py-2 text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
            {title}
          </p>
        )}
        {items.map(renderMenuItem)}
      </div>
    );
  };

  // Role badge
  const getRoleBadge = () => {
    if (isLoading || !role) return null;
    
    const roleLabels = {
      admin: { label: 'Admin', color: 'bg-destructive text-destructive-foreground' },
      manager: { label: 'Manager', color: 'bg-accent text-accent-foreground' },
      support: { label: 'Support', color: 'bg-muted text-muted-foreground' },
    };
    
    const config = roleLabels[role];
    if (!config) return null;

    return (
      <span className={cn('px-2 py-0.5 text-[9px] tracking-wider uppercase', config.color)}>
        {config.label}
      </span>
    );
  };

  return (
    <aside
      className={cn(
        'h-screen bg-card border-r border-border flex flex-col transition-all duration-300 sticky top-0',
        collapsed ? 'w-[60px]' : 'w-[240px]'
      )}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center border border-border">
              <Shield className="h-4 w-4 text-foreground" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-sm">Admin</span>
              {getRoleBadge()}
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn('shrink-0 h-8 w-8', collapsed && 'mx-auto')}
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
        <div className="px-2 space-y-6">
          {renderSection('Übersicht', menuItems)}
          {marketingItems.length > 0 && (
            <>
              <Separator className="mx-1" />
              {renderSection('Marketing', marketingItems)}
            </>
          )}
          {partnerItems.length > 0 && (
            <>
              <Separator className="mx-1" />
              {renderSection('Partner', partnerItems)}
            </>
          )}
          {supportItems.length > 0 && (
            <>
              <Separator className="mx-1" />
              {renderSection('Support', supportItems)}
            </>
          )}
          {systemItems.length > 0 && (
            <>
              <Separator className="mx-1" />
              {renderSection('System', systemItems)}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-2 border-t border-border space-y-1">
        <Button
          variant="ghost"
          size="sm"
          className={cn('w-full justify-start gap-3 h-9', collapsed && 'justify-center px-0')}
          asChild
        >
          <a href="/">
            <Home className="h-4 w-4" strokeWidth={1.5} />
            {!collapsed && <span className="text-sm">Zum Shop</span>}
          </a>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'w-full justify-start gap-3 h-9 text-destructive hover:text-destructive hover:bg-destructive/10', 
            collapsed && 'justify-center px-0'
          )}
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4" strokeWidth={1.5} />
          {!collapsed && <span className="text-sm">Abmelden</span>}
        </Button>
      </div>
    </aside>
  );
}
