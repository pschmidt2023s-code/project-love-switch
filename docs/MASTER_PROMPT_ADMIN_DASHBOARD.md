# ALDENAIR - Admin Dashboard System | Complete 1:1 Replication Prompt

## 🎯 Projektübersicht

Erstelle ein **Premium Luxury E-Commerce Admin Dashboard** mit folgenden Kernfunktionen:
- Rollenbasierte Zugriffskontrolle (Admin, Manager, Support)
- KPI-Dashboard mit Echtzeit-Statistiken
- Produkt- & Inventarverwaltung
- Bestellmanagement mit Status-Workflow
- Kundenverwaltung & CRM
- Ticket-System mit SLA-Monitoring
- Abonnement-Analytics
- E-Mail-Log & Retry-System
- Coupon- & Partner-Management
- System-Einstellungen

---

## 🛠 Tech Stack

```
Frontend:
- React 18.3 + TypeScript
- Vite als Build-Tool
- Tailwind CSS + shadcn/ui
- Recharts für Charts
- TanStack Query für Data Fetching
- React Router v6

Backend:
- Supabase (PostgreSQL + Auth + Edge Functions)
- Row Level Security (RLS)
- Realtime Subscriptions
- Resend für E-Mails
```

---

## 🎨 Design System

### Farbpalette (HSL)
```css
:root {
  /* Primary - Gold */
  --primary: 45 93% 47%;
  --primary-foreground: 0 0% 100%;
  
  /* Background */
  --background: 40 20% 98%;
  --foreground: 0 0% 15%;
  
  /* Sidebar */
  --sidebar-background: 0 0% 8%;
  --sidebar-foreground: 40 20% 98%;
  --sidebar-accent: 45 93% 47%;
  
  /* Cards */
  --card: 0 0% 100%;
  --card-foreground: 0 0% 15%;
  
  /* Status Colors */
  --success: 142 76% 36%;
  --warning: 38 92% 50%;
  --destructive: 0 84% 60%;
  --info: 199 89% 48%;
}

.dark {
  --background: 0 0% 8%;
  --foreground: 40 20% 98%;
  --card: 0 0% 12%;
  --sidebar-background: 0 0% 5%;
}
```

### Typography
```css
/* Headings */
font-family: 'Inter', sans-serif;
font-weight: 500-700;

/* Body */
font-family: 'Inter', sans-serif;
font-weight: 400;

/* Monospace (IDs, Codes) */
font-family: 'JetBrains Mono', monospace;
```

---

## 📊 Datenbank Schema

### user_roles Tabelle
```sql
-- Role Enum
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'support', 'customer');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Helper Functions
CREATE OR REPLACE FUNCTION public.has_role(_role app_role, _user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.has_admin_access(_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'manager', 'support')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role::TEXT FROM public.user_roles
    WHERE user_id = _user_id
    ORDER BY 
      CASE role 
        WHEN 'admin' THEN 1 
        WHEN 'manager' THEN 2 
        WHEN 'support' THEN 3 
        ELSE 4 
      END
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### products Tabelle
```sql
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  brand TEXT DEFAULT 'ALDENAIR',
  description TEXT,
  ai_description TEXT,
  base_price NUMERIC NOT NULL,
  original_price NUMERIC,
  image_url TEXT,
  category_id UUID REFERENCES public.categories(id),
  inspired_by TEXT,
  gender TEXT CHECK (gender IN ('unisex', 'masculine', 'feminine')),
  top_notes TEXT[],
  middle_notes TEXT[],
  base_notes TEXT[],
  scent_notes TEXT[],
  ingredients TEXT[],
  seasons TEXT[],
  occasions TEXT[],
  rating NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  size TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone"
  ON public.products FOR SELECT USING (true);

CREATE POLICY "Admins and Managers can manage products"
  ON public.products FOR ALL
  USING (public.has_role('admin') OR public.has_role('manager'));
```

### product_variants Tabelle
```sql
CREATE TABLE public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT,
  sku TEXT UNIQUE,
  size TEXT NOT NULL,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  stock INTEGER DEFAULT 0,
  in_stock BOOLEAN DEFAULT true,
  image TEXT,
  description TEXT,
  ai_description TEXT,
  inspired_by_fragrance TEXT,
  top_notes TEXT[],
  middle_notes TEXT[],
  base_notes TEXT[],
  ingredients TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-update in_stock based on stock level
CREATE OR REPLACE FUNCTION public.update_in_stock()
RETURNS TRIGGER AS $$
BEGIN
  NEW.in_stock := NEW.stock > 0;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_variant_in_stock
  BEFORE INSERT OR UPDATE OF stock ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.update_in_stock();
```

### orders Tabelle
```sql
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  order_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'
  )),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN (
    'pending', 'paid', 'failed', 'refunded'
  )),
  payment_method TEXT,
  subtotal NUMERIC NOT NULL,
  discount NUMERIC DEFAULT 0,
  shipping_cost NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  shipping_address_id UUID REFERENCES public.addresses(id),
  billing_address_id UUID REFERENCES public.addresses(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all orders"
  ON public.orders FOR ALL
  USING (public.has_admin_access());
```

### tickets Tabelle
```sql
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT CHECK (category IN ('order', 'product', 'shipping', 'return', 'payment', 'other')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting', 'resolved', 'closed')),
  assigned_to UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Support can manage tickets"
  ON public.tickets FOR ALL
  USING (public.has_admin_access());

CREATE POLICY "Users can view own tickets"
  ON public.tickets FOR SELECT
  USING (auth.uid() = user_id);
```

### ticket_replies Tabelle
```sql
CREATE TABLE public.ticket_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.ticket_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Support can manage replies"
  ON public.ticket_replies FOR ALL
  USING (public.has_admin_access());
```

### coupons Tabelle
```sql
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL DEFAULT 0,
  min_order_amount NUMERIC,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage coupons"
  ON public.coupons FOR ALL
  USING (public.has_role('admin') OR public.has_role('manager'));

CREATE POLICY "Everyone can validate coupons"
  ON public.coupons FOR SELECT
  USING (is_active = true);
```

### partners Tabelle
```sql
CREATE TABLE public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  partner_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  commission_rate NUMERIC DEFAULT 10,
  total_sales NUMERIC DEFAULT 0,
  total_commission NUMERIC DEFAULT 0,
  total_paid_out NUMERIC DEFAULT 0,
  bank_details JSONB,
  application_data JSONB,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage partners"
  ON public.partners FOR ALL
  USING (public.has_role('admin'));

CREATE POLICY "Partners can view own data"
  ON public.partners FOR SELECT
  USING (auth.uid() = user_id);
```

### email_logs Tabelle
```sql
CREATE TABLE public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
  resend_id TEXT,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view email logs"
  ON public.email_logs FOR ALL
  USING (public.has_role('admin'));
```

### settings Tabelle
```sql
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Shipping
  free_shipping_threshold NUMERIC DEFAULT 50,
  standard_shipping_cost NUMERIC DEFAULT 4.95,
  express_shipping_cost NUMERIC DEFAULT 9.95,
  -- Notifications
  email_notifications BOOLEAN DEFAULT true,
  order_alerts BOOLEAN DEFAULT true,
  low_stock_alerts BOOLEAN DEFAULT true,
  low_stock_threshold INTEGER DEFAULT 10,
  -- Checkout
  allow_guest_checkout BOOLEAN DEFAULT true,
  -- Maintenance
  maintenance_mode BOOLEAN DEFAULT false,
  maintenance_message TEXT,
  -- Announcement Bar
  announce_bar_enabled BOOLEAN DEFAULT false,
  announce_bar_message TEXT,
  announce_bar_link TEXT,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read settings"
  ON public.settings FOR SELECT USING (true);

CREATE POLICY "Admins can update settings"
  ON public.settings FOR UPDATE
  USING (public.has_role('admin'));

-- Insert default settings
INSERT INTO public.settings (id) VALUES (gen_random_uuid());
```

---

## 🔐 Role-Based Access Control

### useAdminRole Hook
```typescript
// src/hooks/useAdminRole.ts
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type AdminRole = 'admin' | 'manager' | 'support' | null;

interface UseAdminRoleResult {
  role: AdminRole;
  isAdmin: boolean;
  isManager: boolean;
  isSupport: boolean;
  hasAdminAccess: boolean;
  isLoading: boolean;
  permissions: {
    canManageProducts: boolean;
    canManageOrders: boolean;
    canManageCustomers: boolean;
    canViewAnalytics: boolean;
    canManageInventory: boolean;
    canManageSettings: boolean;
    canManageUsers: boolean;
    canViewAuditLogs: boolean;
  };
}

export function useAdminRole(): UseAdminRoleResult {
  const { user } = useAuth();
  const [role, setRole] = useState<AdminRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setIsLoading(false);
      return;
    }

    const fetchRole = async () => {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .in('role', ['admin', 'manager', 'support'])
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setRole(data.role as AdminRole);
        } else {
          setRole(null);
        }
      } catch (error) {
        console.error('Error fetching admin role:', error);
        setRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRole();
  }, [user]);

  const isAdmin = role === 'admin';
  const isManager = role === 'manager';
  const isSupport = role === 'support';
  const hasAdminAccess = isAdmin || isManager || isSupport;

  // Role-based permissions
  const permissions = {
    // Admin: Full access
    // Manager: Products, Orders, Customers, Inventory, Analytics
    // Support: Orders, Customers, Tickets only
    canManageProducts: isAdmin || isManager,
    canManageOrders: hasAdminAccess,
    canManageCustomers: hasAdminAccess,
    canViewAnalytics: isAdmin || isManager,
    canManageInventory: isAdmin || isManager,
    canManageSettings: isAdmin,
    canManageUsers: isAdmin,
    canViewAuditLogs: isAdmin,
  };

  return {
    role,
    isAdmin,
    isManager,
    isSupport,
    hasAdminAccess,
    isLoading,
    permissions,
  };
}
```

### Permission Matrix

| Feature | Admin | Manager | Support |
|---------|-------|---------|---------|
| Dashboard KPIs | ✅ | ✅ | ❌ |
| Products CRUD | ✅ | ✅ | ❌ |
| Inventory | ✅ | ✅ | ❌ |
| Orders | ✅ | ✅ | ✅ (view only) |
| Customers | ✅ | ✅ | ✅ (view only) |
| Tickets | ✅ | ✅ | ✅ |
| Coupons | ✅ | ✅ | ❌ |
| Partners | ✅ | ❌ | ❌ |
| Analytics | ✅ | ✅ | ❌ |
| Settings | ✅ | ❌ | ❌ |
| User Management | ✅ | ❌ | ❌ |
| Audit Logs | ✅ | ❌ | ❌ |

---

## 📐 Layout Structure

### AdminLayout Component
```typescript
// src/components/admin/AdminLayout.tsx
import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAdminRole } from '@/hooks/useAdminRole';
import { AdminSidebar } from './AdminSidebar';
import { 
  SidebarProvider, 
  SidebarInset, 
  SidebarTrigger 
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';

export function AdminLayout() {
  const { hasAdminAccess, isLoading } = useAdminRole();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!hasAdminAccess) {
    return <Navigate to="/" replace />;
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="font-semibold">ALDENAIR Admin</h1>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

### AdminSidebar Component
```typescript
// src/components/admin/AdminSidebar.tsx
import { Link, useLocation } from 'react-router-dom';
import { useAdminRole } from '@/hooks/useAdminRole';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Ticket,
  BarChart3,
  Settings,
  Tag,
  Handshake,
  Mail,
  Warehouse,
  RotateCcw,
  MessageSquare,
  FileText,
  CreditCard,
  Calendar,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function AdminSidebar() {
  const location = useLocation();
  const { permissions, role } = useAdminRole();
  const { signOut } = useAuth();

  const menuItems = [
    // Main
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      href: '/admin',
      show: true 
    },
    // Commerce
    { 
      icon: Package, 
      label: 'Produkte', 
      href: '/admin/products',
      show: permissions.canManageProducts 
    },
    { 
      icon: Warehouse, 
      label: 'Inventar', 
      href: '/admin/inventory',
      show: permissions.canManageInventory 
    },
    { 
      icon: ShoppingCart, 
      label: 'Bestellungen', 
      href: '/admin/orders',
      show: permissions.canManageOrders 
    },
    { 
      icon: RotateCcw, 
      label: 'Retouren', 
      href: '/admin/returns',
      show: permissions.canManageOrders 
    },
    // CRM
    { 
      icon: Users, 
      label: 'Kunden', 
      href: '/admin/customers',
      show: permissions.canManageCustomers 
    },
    { 
      icon: Ticket, 
      label: 'Tickets', 
      href: '/admin/tickets',
      show: true 
    },
    { 
      icon: MessageSquare, 
      label: 'Live Chat', 
      href: '/admin/chat',
      show: true 
    },
    // Marketing
    { 
      icon: Tag, 
      label: 'Gutscheine', 
      href: '/admin/coupons',
      show: permissions.canManageProducts 
    },
    { 
      icon: Mail, 
      label: 'Newsletter', 
      href: '/admin/newsletter',
      show: permissions.canManageProducts 
    },
    { 
      icon: Calendar, 
      label: 'Gewinnspiele', 
      href: '/admin/contests',
      show: permissions.canManageProducts 
    },
    // Subscriptions
    { 
      icon: CreditCard, 
      label: 'Abonnements', 
      href: '/admin/subscriptions',
      show: permissions.canViewAnalytics 
    },
    // Partners
    { 
      icon: Handshake, 
      label: 'Partner', 
      href: '/admin/partners',
      show: permissions.canManageSettings 
    },
    { 
      icon: CreditCard, 
      label: 'Payback', 
      href: '/admin/payback',
      show: permissions.canManageSettings 
    },
    // Analytics
    { 
      icon: BarChart3, 
      label: 'Analytics', 
      href: '/admin/analytics',
      show: permissions.canViewAnalytics 
    },
    { 
      icon: FileText, 
      label: 'E-Mail Logs', 
      href: '/admin/email-logs',
      show: permissions.canManageSettings 
    },
    { 
      icon: FileText, 
      label: 'Audit Logs', 
      href: '/admin/audit-logs',
      show: permissions.canViewAuditLogs 
    },
    // Settings
    { 
      icon: Users, 
      label: 'Benutzer', 
      href: '/admin/users',
      show: permissions.canManageUsers 
    },
    { 
      icon: Settings, 
      label: 'Einstellungen', 
      href: '/admin/settings',
      show: permissions.canManageSettings 
    },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(href);
  };

  return (
    <Sidebar>
      <SidebarContent>
        {/* Logo */}
        <div className="p-4 border-b border-sidebar-border">
          <Link to="/" className="font-serif text-xl text-sidebar-accent">
            ALDENAIR
          </Link>
          <p className="text-xs text-sidebar-foreground/60 mt-1">
            Admin Panel • {role}
          </p>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Hauptmenü</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.filter(item => item.show).map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                  >
                    <Link to={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut}>
              <LogOut className="h-4 w-4" />
              <span>Abmelden</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
```

---

## 📊 Dashboard KPIs

### AdminDashboardContent Component
```typescript
// src/components/admin/AdminDashboardContent.tsx
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { 
  ShoppingCart, 
  DollarSign, 
  Users, 
  Package,
  TrendingUp,
  AlertTriangle,
  Ticket as TicketIcon,
  CreditCard,
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  lowStockItems: number;
  pendingOrders: number;
  openTickets: number;
  activeSubscriptions: number;
  monthlyRecurringRevenue: number;
}

export function AdminDashboardContent() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    lowStockItems: 0,
    pendingOrders: 0,
    openTickets: 0,
    activeSubscriptions: 0,
    monthlyRecurringRevenue: 0,
  });
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch orders
      const { data: orders } = await supabase
        .from('orders')
        .select('total, status, created_at');

      // Fetch profiles count
      const { count: customerCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch low stock variants
      const { count: lowStock } = await supabase
        .from('product_variants')
        .select('*', { count: 'exact', head: true })
        .lt('stock', 10);

      // Fetch open tickets
      const { count: openTickets } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .in('status', ['open', 'in_progress']);

      // Fetch active subscriptions
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('*, product_variants(price)')
        .eq('status', 'active');

      // Calculate stats
      const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total), 0) || 0;
      const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
      
      const mrr = subscriptions?.reduce((sum, s) => {
        const price = s.product_variants?.price || 0;
        const discount = s.discount_percent || 0;
        return sum + (price * (1 - discount / 100));
      }, 0) || 0;

      setStats({
        totalOrders: orders?.length || 0,
        totalRevenue,
        totalCustomers: customerCount || 0,
        lowStockItems: lowStock || 0,
        pendingOrders,
        openTickets: openTickets || 0,
        activeSubscriptions: subscriptions?.length || 0,
        monthlyRecurringRevenue: mrr,
      });

      // Generate revenue chart data (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      const chartData = last7Days.map(date => {
        const dayOrders = orders?.filter(o => 
          o.created_at.startsWith(date)
        ) || [];
        return {
          date: new Date(date).toLocaleDateString('de-DE', { weekday: 'short' }),
          revenue: dayOrders.reduce((sum, o) => sum + Number(o.total), 0),
          orders: dayOrders.length,
        };
      });

      setRevenueData(chartData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const kpiCards = [
    {
      title: 'Gesamtumsatz',
      value: `${stats.totalRevenue.toFixed(2)}€`,
      icon: DollarSign,
      trend: '+12%',
      color: 'text-green-500',
    },
    {
      title: 'Bestellungen',
      value: stats.totalOrders,
      icon: ShoppingCart,
      subtitle: `${stats.pendingOrders} ausstehend`,
      color: 'text-blue-500',
    },
    {
      title: 'Kunden',
      value: stats.totalCustomers,
      icon: Users,
      trend: '+8%',
      color: 'text-purple-500',
    },
    {
      title: 'Niedrige Bestände',
      value: stats.lowStockItems,
      icon: AlertTriangle,
      color: stats.lowStockItems > 0 ? 'text-red-500' : 'text-green-500',
    },
    {
      title: 'Offene Tickets',
      value: stats.openTickets,
      icon: TicketIcon,
      color: stats.openTickets > 5 ? 'text-orange-500' : 'text-blue-500',
    },
    {
      title: 'MRR (Abos)',
      value: `${stats.monthlyRecurringRevenue.toFixed(2)}€`,
      icon: CreditCard,
      subtitle: `${stats.activeSubscriptions} aktiv`,
      color: 'text-primary',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              {kpi.trend && (
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {kpi.trend}
                </p>
              )}
              {kpi.subtitle && (
                <p className="text-xs text-muted-foreground">{kpi.subtitle}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Umsatz (letzte 7 Tage)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(2)}€`, 'Umsatz']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary) / 0.2)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Bestellungen (letzte 7 Tage)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="orders" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

---

## 📦 Produkt-Management

### ProductManagement Component
```typescript
// src/components/admin/ProductManagement.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  is_active: boolean;
  image_url: string;
  category_id: string;
  product_variants: {
    id: string;
    size: string;
    price: number;
    stock: number;
  }[];
}

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_variants (id, size, price, stock)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (formData: Partial<Product>) => {
    try {
      if (editingProduct) {
        // Update
        const { error } = await supabase
          .from('products')
          .update(formData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast({ title: 'Produkt aktualisiert' });
      } else {
        // Create
        const { error } = await supabase
          .from('products')
          .insert(formData);

        if (error) throw error;
        toast({ title: 'Produkt erstellt' });
      }

      fetchProducts();
      setIsDialogOpen(false);
      setEditingProduct(null);
    } catch (error: any) {
      toast({ 
        title: 'Fehler', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Produkt wirklich löschen?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Produkt gelöscht' });
      fetchProducts();
    } catch (error: any) {
      toast({ 
        title: 'Fehler', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Produkte</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingProduct(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Neues Produkt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Produkt bearbeiten' : 'Neues Produkt'}
              </DialogTitle>
            </DialogHeader>
            <ProductForm 
              product={editingProduct} 
              onSave={handleSave}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Produkte suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produkt</TableHead>
              <TableHead>Preis</TableHead>
              <TableHead>Varianten</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img 
                      src={product.image_url || '/placeholder.svg'} 
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.slug}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{product.base_price.toFixed(2)}€</TableCell>
                <TableCell>
                  {product.product_variants?.length || 0} Varianten
                </TableCell>
                <TableCell>
                  <Badge variant={product.is_active ? 'default' : 'secondary'}>
                    {product.is_active ? 'Aktiv' : 'Inaktiv'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        setEditingProduct(product);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Product Form Component
function ProductForm({ 
  product, 
  onSave, 
  onCancel 
}: { 
  product: Product | null;
  onSave: (data: Partial<Product>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    base_price: product?.base_price || 0,
    is_active: product?.is_active ?? true,
    image_url: product?.image_url || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Name</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Slug</label>
          <Input
            value={formData.slug}
            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Grundpreis (€)</label>
          <Input
            type="number"
            step="0.01"
            value={formData.base_price}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              base_price: parseFloat(e.target.value) 
            }))}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Status</label>
          <Select
            value={formData.is_active ? 'active' : 'inactive'}
            onValueChange={(v) => setFormData(prev => ({ 
              ...prev, 
              is_active: v === 'active' 
            }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Aktiv</SelectItem>
              <SelectItem value="inactive">Inaktiv</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Bild-URL</label>
        <Input
          value={formData.image_url}
          onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Abbrechen
        </Button>
        <Button type="submit">
          {product ? 'Speichern' : 'Erstellen'}
        </Button>
      </div>
    </form>
  );
}
```

---

## 🎫 Ticket-System

### TicketingSystem Component
```typescript
// src/components/admin/TicketingSystem.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { Clock, User, AlertCircle, CheckCircle2, Send } from 'lucide-react';

interface Ticket {
  id: string;
  customer_name: string;
  customer_email: string;
  subject: string;
  message: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
}

interface TicketReply {
  id: string;
  message: string;
  is_internal: boolean;
  created_at: string;
  user_id: string;
}

// SLA Configuration (in hours)
const SLA_CONFIG = {
  urgent: 2,
  high: 8,
  medium: 24,
  low: 72,
};

export function TicketingSystem() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replies, setReplies] = useState<TicketReply[]>([]);
  const [replyText, setReplyText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchTickets();
    
    // Realtime subscription
    const channel = supabase
      .channel('tickets')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'tickets' 
      }, fetchTickets)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [statusFilter, priorityFilter]);

  const fetchTickets = async () => {
    let query = supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }
    if (priorityFilter !== 'all') {
      query = query.eq('priority', priorityFilter);
    }

    const { data, error } = await query;
    if (!error) setTickets(data || []);
  };

  const fetchReplies = async (ticketId: string) => {
    const { data, error } = await supabase
      .from('ticket_replies')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (!error) setReplies(data || []);
  };

  const selectTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    fetchReplies(ticket.id);
  };

  const updateTicketStatus = async (status: string) => {
    if (!selectedTicket) return;

    const { error } = await supabase
      .from('tickets')
      .update({ 
        status, 
        updated_at: new Date().toISOString(),
        resolved_at: status === 'resolved' ? new Date().toISOString() : null,
      })
      .eq('id', selectedTicket.id);

    if (error) {
      toast({ title: 'Fehler', variant: 'destructive' });
    } else {
      toast({ title: 'Status aktualisiert' });
      fetchTickets();
      setSelectedTicket(prev => prev ? { ...prev, status } as Ticket : null);
    }
  };

  const sendReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;

    const { error } = await supabase
      .from('ticket_replies')
      .insert({
        ticket_id: selectedTicket.id,
        message: replyText,
        is_internal: isInternal,
      });

    if (error) {
      toast({ title: 'Fehler', variant: 'destructive' });
    } else {
      setReplyText('');
      fetchReplies(selectedTicket.id);
      
      // Send email notification if not internal
      if (!isInternal) {
        await supabase.functions.invoke('send-ticket-notification', {
          body: {
            ticketId: selectedTicket.id,
            type: 'reply',
            message: replyText,
          }
        });
      }
    }
  };

  const getSLAStatus = (ticket: Ticket) => {
    const created = new Date(ticket.created_at);
    const now = new Date();
    const hoursElapsed = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    const slaHours = SLA_CONFIG[ticket.priority];
    
    if (ticket.status === 'resolved' || ticket.status === 'closed') {
      return { status: 'met', label: 'SLA erfüllt' };
    }
    
    if (hoursElapsed > slaHours) {
      return { status: 'breached', label: 'SLA überschritten' };
    }
    
    const remaining = slaHours - hoursElapsed;
    if (remaining < 2) {
      return { status: 'warning', label: `${remaining.toFixed(1)}h verbleibend` };
    }
    
    return { status: 'ok', label: `${remaining.toFixed(0)}h verbleibend` };
  };

  const priorityColors = {
    low: 'bg-gray-500',
    medium: 'bg-blue-500',
    high: 'bg-orange-500',
    urgent: 'bg-red-500',
  };

  const statusColors = {
    open: 'bg-yellow-500',
    in_progress: 'bg-blue-500',
    waiting: 'bg-purple-500',
    resolved: 'bg-green-500',
    closed: 'bg-gray-500',
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Ticket List */}
      <div className="w-1/3 flex flex-col">
        <div className="flex gap-2 mb-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              <SelectItem value="open">Offen</SelectItem>
              <SelectItem value="in_progress">In Bearbeitung</SelectItem>
              <SelectItem value="waiting">Wartend</SelectItem>
              <SelectItem value="resolved">Gelöst</SelectItem>
              <SelectItem value="closed">Geschlossen</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Priorität" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              <SelectItem value="urgent">Dringend</SelectItem>
              <SelectItem value="high">Hoch</SelectItem>
              <SelectItem value="medium">Mittel</SelectItem>
              <SelectItem value="low">Niedrig</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 overflow-auto space-y-2">
          {tickets.map((ticket) => {
            const sla = getSLAStatus(ticket);
            return (
              <Card 
                key={ticket.id}
                className={`cursor-pointer transition-colors ${
                  selectedTicket?.id === ticket.id ? 'border-primary' : ''
                }`}
                onClick={() => selectTicket(ticket)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium line-clamp-1">{ticket.subject}</h3>
                    <Badge className={priorityColors[ticket.priority]}>
                      {ticket.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>{ticket.customer_name}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline" className={statusColors[ticket.status]}>
                      {ticket.status}
                    </Badge>
                    <span className={`text-xs ${
                      sla.status === 'breached' ? 'text-red-500' :
                      sla.status === 'warning' ? 'text-orange-500' : 
                      'text-muted-foreground'
                    }`}>
                      <Clock className="h-3 w-3 inline mr-1" />
                      {sla.label}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Ticket Detail */}
      <div className="flex-1 flex flex-col">
        {selectedTicket ? (
          <>
            <Card className="flex-1 flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{selectedTicket.subject}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {selectedTicket.customer_name} • {selectedTicket.customer_email}
                    </p>
                  </div>
                  <Select 
                    value={selectedTicket.status} 
                    onValueChange={updateTicketStatus}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Offen</SelectItem>
                      <SelectItem value="in_progress">In Bearbeitung</SelectItem>
                      <SelectItem value="waiting">Wartend</SelectItem>
                      <SelectItem value="resolved">Gelöst</SelectItem>
                      <SelectItem value="closed">Geschlossen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto p-4 space-y-4">
                {/* Original Message */}
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    {formatDistanceToNow(new Date(selectedTicket.created_at), { 
                      addSuffix: true, 
                      locale: de 
                    })}
                  </p>
                  <p className="whitespace-pre-wrap">{selectedTicket.message}</p>
                </div>

                {/* Replies */}
                {replies.map((reply) => (
                  <div 
                    key={reply.id}
                    className={`p-4 rounded-lg ${
                      reply.is_internal 
                        ? 'bg-yellow-50 border border-yellow-200' 
                        : 'bg-primary/5 ml-8'
                    }`}
                  >
                    {reply.is_internal && (
                      <Badge variant="outline" className="mb-2">
                        Interne Notiz
                      </Badge>
                    )}
                    <p className="text-sm text-muted-foreground mb-2">
                      {formatDistanceToNow(new Date(reply.created_at), { 
                        addSuffix: true, 
                        locale: de 
                      })}
                    </p>
                    <p className="whitespace-pre-wrap">{reply.message}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Reply Input */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="rounded"
                  />
                  Interne Notiz
                </label>
              </div>
              <div className="flex gap-2">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={isInternal ? 'Interne Notiz...' : 'Antwort schreiben...'}
                  className="flex-1"
                  rows={3}
                />
                <Button onClick={sendReply} disabled={!replyText.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Wähle ein Ticket aus
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## ⚙️ System-Einstellungen

### SettingsManagement Component
```typescript
// src/components/admin/SettingsManagement.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Save, Truck, Bell, ShoppingCart, Wrench, Megaphone } from 'lucide-react';

interface Settings {
  id: string;
  // Shipping
  free_shipping_threshold: number;
  standard_shipping_cost: number;
  express_shipping_cost: number;
  // Notifications
  email_notifications: boolean;
  order_alerts: boolean;
  low_stock_alerts: boolean;
  low_stock_threshold: number;
  // Checkout
  allow_guest_checkout: boolean;
  // Maintenance
  maintenance_mode: boolean;
  maintenance_message: string;
  // Announcement
  announce_bar_enabled: boolean;
  announce_bar_message: string;
  announce_bar_link: string;
}

export function SettingsManagement() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .single();

    if (!error && data) {
      setSettings(data);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!settings) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id);

      if (error) throw error;

      toast({ title: 'Einstellungen gespeichert' });
    } catch (error: any) {
      toast({ 
        title: 'Fehler', 
        description: error.message,
        variant: 'destructive' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => prev ? { ...prev, [key]: value } : null);
  };

  if (isLoading || !settings) {
    return <div>Laden...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Einstellungen</h1>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Speichern...' : 'Speichern'}
        </Button>
      </div>

      <Tabs defaultValue="shipping">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="shipping">
            <Truck className="h-4 w-4 mr-2" />
            Versand
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Benachrichtigungen
          </TabsTrigger>
          <TabsTrigger value="checkout">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Checkout
          </TabsTrigger>
          <TabsTrigger value="maintenance">
            <Wrench className="h-4 w-4 mr-2" />
            Wartung
          </TabsTrigger>
          <TabsTrigger value="announcement">
            <Megaphone className="h-4 w-4 mr-2" />
            Ankündigung
          </TabsTrigger>
        </TabsList>

        {/* Shipping Settings */}
        <TabsContent value="shipping">
          <Card>
            <CardHeader>
              <CardTitle>Versandeinstellungen</CardTitle>
              <CardDescription>
                Konfiguriere Versandkosten und Schwellenwerte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">
                    Kostenloser Versand ab (€)
                  </label>
                  <Input
                    type="number"
                    value={settings.free_shipping_threshold}
                    onChange={(e) => updateSetting(
                      'free_shipping_threshold', 
                      parseFloat(e.target.value)
                    )}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Standardversand (€)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={settings.standard_shipping_cost}
                    onChange={(e) => updateSetting(
                      'standard_shipping_cost', 
                      parseFloat(e.target.value)
                    )}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Expressversand (€)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={settings.express_shipping_cost}
                    onChange={(e) => updateSetting(
                      'express_shipping_cost', 
                      parseFloat(e.target.value)
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Benachrichtigungen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">E-Mail-Benachrichtigungen</p>
                  <p className="text-sm text-muted-foreground">
                    Erhalte E-Mails bei wichtigen Ereignissen
                  </p>
                </div>
                <Switch
                  checked={settings.email_notifications}
                  onCheckedChange={(v) => updateSetting('email_notifications', v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Bestellbenachrichtigungen</p>
                  <p className="text-sm text-muted-foreground">
                    Bei neuen Bestellungen benachrichtigen
                  </p>
                </div>
                <Switch
                  checked={settings.order_alerts}
                  onCheckedChange={(v) => updateSetting('order_alerts', v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Lagerbestand-Warnungen</p>
                  <p className="text-sm text-muted-foreground">
                    Warnung bei niedrigem Bestand
                  </p>
                </div>
                <Switch
                  checked={settings.low_stock_alerts}
                  onCheckedChange={(v) => updateSetting('low_stock_alerts', v)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Niedriger Bestand Schwellenwert
                </label>
                <Input
                  type="number"
                  value={settings.low_stock_threshold}
                  onChange={(e) => updateSetting(
                    'low_stock_threshold', 
                    parseInt(e.target.value)
                  )}
                  className="max-w-[200px]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Checkout Settings */}
        <TabsContent value="checkout">
          <Card>
            <CardHeader>
              <CardTitle>Checkout-Einstellungen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Gast-Checkout erlauben</p>
                  <p className="text-sm text-muted-foreground">
                    Kunden können ohne Konto bestellen
                  </p>
                </div>
                <Switch
                  checked={settings.allow_guest_checkout}
                  onCheckedChange={(v) => updateSetting('allow_guest_checkout', v)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Settings */}
        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>Wartungsmodus</CardTitle>
              <CardDescription>
                Aktiviere den Wartungsmodus um Besucher umzuleiten
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Wartungsmodus aktivieren</p>
                  <p className="text-sm text-muted-foreground">
                    Shop ist für Besucher nicht erreichbar
                  </p>
                </div>
                <Switch
                  checked={settings.maintenance_mode}
                  onCheckedChange={(v) => updateSetting('maintenance_mode', v)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Wartungsnachricht</label>
                <Textarea
                  value={settings.maintenance_message || ''}
                  onChange={(e) => updateSetting('maintenance_message', e.target.value)}
                  placeholder="Wir sind bald wieder für Sie da..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Announcement Bar */}
        <TabsContent value="announcement">
          <Card>
            <CardHeader>
              <CardTitle>Ankündigungsleiste</CardTitle>
              <CardDescription>
                Zeige eine Nachricht am oberen Rand der Seite
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Ankündigung aktivieren</p>
                </div>
                <Switch
                  checked={settings.announce_bar_enabled}
                  onCheckedChange={(v) => updateSetting('announce_bar_enabled', v)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Nachricht</label>
                <Input
                  value={settings.announce_bar_message || ''}
                  onChange={(e) => updateSetting('announce_bar_message', e.target.value)}
                  placeholder="🎉 Kostenloser Versand ab 50€!"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Link (optional)</label>
                <Input
                  value={settings.announce_bar_link || ''}
                  onChange={(e) => updateSetting('announce_bar_link', e.target.value)}
                  placeholder="/sale"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## 📧 E-Mail-Log & Retry

### EmailLogsManagement Component
```typescript
// src/components/admin/EmailLogsManagement.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { RefreshCw, Search, RotateCcw } from 'lucide-react';

interface EmailLog {
  id: string;
  type: string;
  recipient_email: string;
  recipient_name: string;
  subject: string;
  status: 'pending' | 'sent' | 'failed' | 'bounced';
  error_message: string;
  resend_id: string;
  metadata: any;
  created_at: string;
}

export function EmailLogsManagement() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('email_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!error) setLogs(data || []);
    setIsLoading(false);
  };

  const retryEmail = async (log: EmailLog) => {
    setRetryingId(log.id);
    
    try {
      const { data, error } = await supabase.functions.invoke('resend-email', {
        body: {
          emailLogId: log.id,
          type: log.type,
          recipient: log.recipient_email,
          recipientName: log.recipient_name,
          subject: log.subject,
          metadata: log.metadata,
        }
      });

      if (error) throw error;

      toast({ 
        title: 'E-Mail erneut gesendet',
        description: `An ${log.recipient_email}` 
      });
      fetchLogs();
    } catch (error: any) {
      toast({ 
        title: 'Fehler',
        description: error.message,
        variant: 'destructive' 
      });
    } finally {
      setRetryingId(null);
    }
  };

  const statusColors = {
    pending: 'bg-yellow-500',
    sent: 'bg-green-500',
    failed: 'bg-red-500',
    bounced: 'bg-orange-500',
  };

  const typeLabels: Record<string, string> = {
    order_confirmation: 'Bestellbestätigung',
    order_shipped: 'Versandbestätigung',
    ticket_reply: 'Ticket-Antwort',
    subscription_reminder: 'Abo-Erinnerung',
    password_reset: 'Passwort-Reset',
  };

  const filteredLogs = logs.filter(log =>
    log.recipient_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">E-Mail Logs</h1>
        <Button variant="outline" onClick={fetchLogs}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Aktualisieren
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="E-Mail oder Betreff suchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Datum</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead>Empfänger</TableHead>
              <TableHead>Betreff</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aktion</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-mono text-sm">
                  {format(new Date(log.created_at), 'dd.MM.yy HH:mm', { locale: de })}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {typeLabels[log.type] || log.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{log.recipient_name || '-'}</p>
                    <p className="text-sm text-muted-foreground">{log.recipient_email}</p>
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {log.subject}
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[log.status]}>
                    {log.status}
                  </Badge>
                  {log.error_message && (
                    <p className="text-xs text-red-500 mt-1 max-w-[150px] truncate">
                      {log.error_message}
                    </p>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {log.status === 'failed' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => retryEmail(log)}
                      disabled={retryingId === log.id}
                    >
                      <RotateCcw className={`h-4 w-4 ${
                        retryingId === log.id ? 'animate-spin' : ''
                      }`} />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
```

---

## 📋 Vollständige Feature-Checkliste

### Dashboard
- [ ] KPI-Cards mit Echtzeit-Daten
- [ ] Umsatz-Chart (7 Tage)
- [ ] Bestellungen-Chart
- [ ] Niedrige Bestände Alert
- [ ] Offene Tickets Count
- [ ] MRR (Abonnements)

### Produkt-Management
- [ ] Produkte auflisten
- [ ] Produkt erstellen
- [ ] Produkt bearbeiten
- [ ] Produkt löschen
- [ ] Varianten verwalten
- [ ] Bilder hochladen
- [ ] Kategorien zuweisen
- [ ] Scent Notes (Top/Middle/Base)

### Inventar
- [ ] Bestandsübersicht
- [ ] Stock Updates
- [ ] Low Stock Alerts
- [ ] Bestandshistorie

### Bestellungen
- [ ] Alle Bestellungen
- [ ] Status-Filter
- [ ] Status ändern
- [ ] Bestelldetails
- [ ] Tracking hinzufügen
- [ ] Notizen

### Kunden
- [ ] Kundenliste
- [ ] Kundendetails
- [ ] Bestellhistorie
- [ ] Tier-Status
- [ ] Profil bearbeiten

### Tickets
- [ ] Ticket-Liste
- [ ] SLA-Monitoring
- [ ] Prioritäten
- [ ] Status-Workflow
- [ ] Antworten
- [ ] Interne Notizen
- [ ] E-Mail-Benachrichtigungen

### Gutscheine
- [ ] Coupon erstellen
- [ ] Prozent/Fixbetrag
- [ ] Mindestbestellwert
- [ ] Ablaufdatum
- [ ] Nutzungslimit

### Partner
- [ ] Partner-Anträge
- [ ] Genehmigung
- [ ] Provisionen
- [ ] Auszahlungen

### Analytics
- [ ] Umsatz-Reports
- [ ] Bestseller
- [ ] Kundensegmente
- [ ] Abo-Churn Rate
- [ ] Revenue at Risk

### E-Mail Logs
- [ ] Alle E-Mails
- [ ] Status-Tracking
- [ ] Fehler-Anzeige
- [ ] Retry-Funktion

### Einstellungen
- [ ] Versandkosten
- [ ] Benachrichtigungen
- [ ] Checkout-Optionen
- [ ] Wartungsmodus
- [ ] Ankündigungsleiste

### Benutzerverwaltung
- [ ] Benutzer auflisten
- [ ] Rollen zuweisen
- [ ] Benutzer deaktivieren

---

## 🚀 Implementierungsreihenfolge

1. **Database Setup** - Alle Tabellen, RLS, Funktionen
2. **Auth & Roles** - useAdminRole Hook, RBAC
3. **Layout** - AdminLayout, Sidebar
4. **Dashboard** - KPIs, Charts
5. **Products** - CRUD, Varianten
6. **Orders** - Bestellverwaltung
7. **Customers** - Kundenliste
8. **Tickets** - Support-System
9. **Settings** - Konfiguration
10. **Email Logs** - Monitoring & Retry

---

**ENDE ADMIN DASHBOARD PROMPT**
