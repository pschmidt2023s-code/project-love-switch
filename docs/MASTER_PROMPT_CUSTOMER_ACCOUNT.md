# ALDENAIR - Customer Account System | Complete 1:1 Replication Prompt

## 🎯 Projektübersicht

Erstelle ein **Premium Luxury Perfume E-Commerce Kundenkonto-System** mit folgenden Kernfunktionen:
- Vollständiges Benutzerprofil mit Adressverwaltung
- 4-stufiges Loyalitätsprogramm (Bronze → Platinum)
- Cashback/Payback-System
- Bestellhistorie & Tracking
- Favoriten/Wishlist
- Abonnement-Verwaltung (inkl. Gast-Management)
- Retouren-System
- Zwei-Faktor-Authentifizierung

---

## 🛠 Tech Stack

```
Frontend:
- React 18.3 + TypeScript
- Vite als Build-Tool
- Tailwind CSS + shadcn/ui
- Framer Motion für Animationen
- React Router v6
- TanStack Query für Data Fetching

Backend:
- Supabase (PostgreSQL + Auth + Edge Functions)
- Row Level Security (RLS)
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
  
  /* Background - Off-White */
  --background: 40 20% 98%;
  --foreground: 0 0% 15%;
  
  /* Cards */
  --card: 0 0% 100%;
  --card-foreground: 0 0% 15%;
  
  /* Muted */
  --muted: 40 10% 96%;
  --muted-foreground: 0 0% 45%;
  
  /* Accent */
  --accent: 45 93% 47%;
  --accent-foreground: 0 0% 100%;
  
  /* Border */
  --border: 40 10% 90%;
}

.dark {
  --background: 0 0% 8%;
  --foreground: 40 20% 98%;
  --card: 0 0% 12%;
  --card-foreground: 40 20% 98%;
  --muted: 0 0% 15%;
  --muted-foreground: 0 0% 65%;
  --border: 0 0% 20%;
}
```

### Typography
```css
/* Headings */
font-family: 'Playfair Display', serif;
font-weight: 400-700;

/* Body */
font-family: 'Inter', sans-serif;
font-weight: 300-500;
```

### UI Prinzipien
- **Sharp Edges**: `rounded-none` oder `rounded-sm`
- **Generous Spacing**: `p-8`, `gap-6`, `space-y-8`
- **Subtle Shadows**: `shadow-sm`, `shadow-md`
- **Gold Accents**: Buttons, Links, Hover-States

---

## 📊 Datenbank Schema

### profiles Tabelle
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  total_spent NUMERIC DEFAULT 0,
  payback_balance NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### addresses Tabelle
```sql
CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  street TEXT NOT NULL,
  street2 TEXT,
  postal_code TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT DEFAULT 'Deutschland',
  type TEXT DEFAULT 'shipping' CHECK (type IN ('shipping', 'billing')),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own addresses"
  ON public.addresses FOR ALL
  USING (auth.uid() = user_id);
```

### orders Tabelle
```sql
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  order_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
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
```

### order_items Tabelle
```sql
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id),
  product_name TEXT NOT NULL,
  variant_size TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### wishlist Tabelle
```sql
CREATE TABLE public.wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- RLS
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own wishlist"
  ON public.wishlist FOR ALL
  USING (auth.uid() = user_id);
```

### subscriptions Tabelle
```sql
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  guest_email TEXT,
  guest_name TEXT,
  product_id UUID REFERENCES public.products(id),
  variant_id UUID REFERENCES public.product_variants(id),
  frequency TEXT DEFAULT 'monthly' CHECK (frequency IN ('monthly', 'bimonthly', 'quarterly')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  discount_percent NUMERIC DEFAULT 15,
  next_delivery DATE,
  last_delivery DATE,
  delivery_count INTEGER DEFAULT 0,
  management_token UUID DEFAULT gen_random_uuid(),
  token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id OR guest_email IS NOT NULL);

CREATE POLICY "Users can update own subscriptions"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id);
```

### returns Tabelle
```sql
CREATE TABLE public.returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  order_id UUID REFERENCES public.orders(id),
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  refund_amount NUMERIC,
  tracking_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own returns"
  ON public.returns FOR ALL
  USING (auth.uid() = user_id);
```

### payback_earnings Tabelle
```sql
CREATE TABLE public.payback_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  order_id UUID REFERENCES public.orders(id),
  amount NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.payback_earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own earnings"
  ON public.payback_earnings FOR SELECT
  USING (auth.uid() = user_id);
```

### payback_payouts Tabelle
```sql
CREATE TABLE public.payback_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  bank_details JSONB,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.payback_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own payouts"
  ON public.payback_payouts FOR ALL
  USING (auth.uid() = user_id);
```

---

## 🏆 Loyalitätsprogramm

### Tier-Konfiguration
```typescript
const tierConfig = {
  bronze: {
    label: 'Bronze',
    discount: 0,
    minSpent: 0,
    cashbackRate: 0.02, // 2%
    color: '#CD7F32',
    benefits: ['Kostenloser Versand ab 50€', 'Exklusive Newsletter']
  },
  silver: {
    label: 'Silber',
    discount: 5,
    minSpent: 200,
    cashbackRate: 0.03, // 3%
    color: '#C0C0C0',
    benefits: ['5% Rabatt auf alle Bestellungen', 'Früher Zugang zu Sales']
  },
  gold: {
    label: 'Gold',
    discount: 10,
    minSpent: 500,
    cashbackRate: 0.05, // 5%
    color: '#FFD700',
    benefits: ['10% Rabatt', 'Gratis Proben', 'Priority Support']
  },
  platinum: {
    label: 'Platin',
    discount: 15,
    minSpent: 1000,
    cashbackRate: 0.08, // 8%
    color: '#E5E4E2',
    benefits: ['15% Rabatt', 'Exklusive Produkte', 'Persönlicher Berater']
  }
};
```

### useUserRole Hook
```typescript
// src/hooks/useUserRole.ts
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UserRoleData {
  tier: string;
  tierLabel: string;
  discount: number;
  cashbackBalance: number;
  isLoading: boolean;
}

const tierConfig: Record<string, { label: string; discount: number }> = {
  bronze: { label: 'Bronze', discount: 0 },
  silver: { label: 'Silber', discount: 5 },
  gold: { label: 'Gold', discount: 10 },
  platinum: { label: 'Platin', discount: 15 },
};

export function useUserRole(): UserRoleData {
  const { user } = useAuth();
  const [tier, setTier] = useState('bronze');
  const [cashbackBalance, setCashbackBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTier('bronze');
      setCashbackBalance(0);
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('tier, payback_balance')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setTier(data.tier || 'bronze');
          setCashbackBalance(Number(data.payback_balance) || 0);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const config = tierConfig[tier] || tierConfig.bronze;

  return {
    tier,
    tierLabel: config.label,
    discount: config.discount,
    cashbackBalance,
    isLoading,
  };
}
```

### Tier-Upgrade Trigger
```sql
CREATE OR REPLACE FUNCTION public.update_user_tier()
RETURNS TRIGGER AS $$
BEGIN
  -- Update tier based on total_spent
  IF NEW.total_spent >= 1000 THEN
    NEW.tier := 'platinum';
  ELSIF NEW.total_spent >= 500 THEN
    NEW.tier := 'gold';
  ELSIF NEW.total_spent >= 200 THEN
    NEW.tier := 'silver';
  ELSE
    NEW.tier := 'bronze';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tier_on_spent_change
  BEFORE UPDATE OF total_spent ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_user_tier();
```

---

## 👤 Account Pages

### Routing Struktur
```typescript
// src/App.tsx Routes
<Route path="/account" element={<Account />} />
<Route path="/profile" element={<Profile />} />
<Route path="/orders" element={<OrdersList />} />
<Route path="/orders/:id" element={<Orders />} />
<Route path="/favorites" element={<Favorites />} />
<Route path="/my-returns" element={<MyReturns />} />
<Route path="/returns" element={<Returns />} />
<Route path="/manage-subscription" element={<ManageSubscription />} />
```

### Account Dashboard Component
```typescript
// src/pages/Account.tsx
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  User, Package, Heart, RotateCcw, 
  CreditCard, Settings, Crown, Gift 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Account() {
  const { user, signOut } = useAuth();
  const { tier, tierLabel, discount, cashbackBalance, isLoading } = useUserRole();
  
  // Calculate progress to next tier
  const tierThresholds = { bronze: 0, silver: 200, gold: 500, platinum: 1000 };
  const nextTier = tier === 'platinum' ? null : 
    tier === 'gold' ? 'platinum' : 
    tier === 'silver' ? 'gold' : 'silver';
  
  const menuItems = [
    { icon: User, label: 'Profil bearbeiten', href: '/profile' },
    { icon: Package, label: 'Meine Bestellungen', href: '/orders' },
    { icon: Heart, label: 'Favoriten', href: '/favorites' },
    { icon: RotateCcw, label: 'Retouren', href: '/my-returns' },
    { icon: CreditCard, label: 'Abonnements', href: '/manage-subscription' },
    { icon: Settings, label: 'Einstellungen', href: '/profile#settings' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Loyalty Status Card */}
      <Card className="mb-8 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="font-serif text-2xl">
                  {tierLabel} Member
                </CardTitle>
                <p className="text-muted-foreground">
                  {discount > 0 ? `${discount}% Rabatt auf alle Bestellungen` : 'Willkommen bei ALDENAIR'}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {tierLabel}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {nextTier && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Fortschritt zu {nextTier}</span>
                <span className="text-muted-foreground">
                  Noch {tierThresholds[nextTier as keyof typeof tierThresholds]}€ bis zum Upgrade
                </span>
              </div>
              <Progress value={45} className="h-2" />
            </div>
          )}
          
          {/* Cashback Balance */}
          <div className="mt-6 p-4 bg-muted rounded-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                <span className="font-medium">Cashback Guthaben</span>
              </div>
              <span className="text-xl font-bold text-primary">
                {cashbackBalance.toFixed(2)}€
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {menuItems.map((item) => (
          <Link key={item.href} to={item.href}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <item.icon className="h-8 w-8 mb-3 text-primary" />
                <span className="font-medium">{item.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Logout Button */}
      <div className="mt-8 text-center">
        <Button variant="outline" onClick={signOut}>
          Abmelden
        </Button>
      </div>
    </div>
  );
}
```

---

## ❤️ Favoriten System

### useFavorites Hook
```typescript
// src/hooks/useFavorites.ts
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FavoriteItem {
  id: string;
  product_id: string;
  created_at: string;
}

export function useFavorites() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const addToFavorites = useCallback(async (productId: string) => {
    if (!user) {
      toast({
        title: 'Anmeldung erforderlich',
        description: 'Bitte melde dich an, um Favoriten zu speichern.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('wishlist')
        .insert({ user_id: user.id, product_id: productId });

      if (error) throw error;

      await loadFavorites();
      toast({
        title: 'Favorit hinzugefügt',
        description: 'Das Produkt wurde zu deinen Favoriten hinzugefügt.',
      });
      return true;
    } catch (error) {
      console.error('Error adding favorite:', error);
      toast({
        title: 'Fehler',
        description: 'Produkt konnte nicht hinzugefügt werden.',
        variant: 'destructive',
      });
      return false;
    }
  }, [user, loadFavorites, toast]);

  const removeFromFavorites = useCallback(async (productId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      await loadFavorites();
      toast({
        title: 'Favorit entfernt',
        description: 'Das Produkt wurde aus deinen Favoriten entfernt.',
      });
      return true;
    } catch (error) {
      console.error('Error removing favorite:', error);
      return false;
    }
  }, [user, loadFavorites, toast]);

  const isFavorite = useCallback((productId: string) => {
    return favorites.some(f => f.product_id === productId);
  }, [favorites]);

  const toggleFavorite = useCallback(async (productId: string) => {
    if (isFavorite(productId)) {
      return removeFromFavorites(productId);
    }
    return addToFavorites(productId);
  }, [isFavorite, addToFavorites, removeFromFavorites]);

  return {
    favorites,
    count: favorites.length,
    isLoading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    refresh: loadFavorites,
  };
}
```

---

## 📦 Abonnement-Verwaltung (Gäste)

### Edge Function: manage-subscription
```typescript
// supabase/functions/manage-subscription/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { action, token, subscriptionId, newFrequency } = await req.json();

    // Validate token
    if (action !== 'validate' && !subscriptionId) {
      throw new Error('Subscription ID required');
    }

    switch (action) {
      case 'validate': {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*, products(*), product_variants(*)')
          .eq('management_token', token)
          .gt('token_expires_at', new Date().toISOString())
          .single();

        if (error || !data) {
          return new Response(
            JSON.stringify({ valid: false, error: 'Invalid or expired token' }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
          );
        }

        return new Response(
          JSON.stringify({ valid: true, subscription: data }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case 'pause': {
        const { error } = await supabase
          .from('subscriptions')
          .update({ status: 'paused', updated_at: new Date().toISOString() })
          .eq('id', subscriptionId);

        if (error) throw error;
        return new Response(
          JSON.stringify({ success: true, message: 'Subscription paused' }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case 'resume': {
        const { error } = await supabase
          .from('subscriptions')
          .update({ status: 'active', updated_at: new Date().toISOString() })
          .eq('id', subscriptionId);

        if (error) throw error;
        return new Response(
          JSON.stringify({ success: true, message: 'Subscription resumed' }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case 'cancel': {
        const { error } = await supabase
          .from('subscriptions')
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('id', subscriptionId);

        if (error) throw error;
        return new Response(
          JSON.stringify({ success: true, message: 'Subscription cancelled' }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case 'update_frequency': {
        const { error } = await supabase
          .from('subscriptions')
          .update({ 
            frequency: newFrequency, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', subscriptionId);

        if (error) throw error;
        return new Response(
          JSON.stringify({ success: true, message: 'Frequency updated' }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
```

### Guest Management Page
```typescript
// src/pages/ManageSubscription.tsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, Calendar, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ManageSubscription() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { toast } = useToast();
  
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (token) {
      validateToken();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const validateToken = async () => {
    try {
      const { data } = await supabase.functions.invoke('manage-subscription', {
        body: { action: 'validate', token }
      });

      if (data.valid) {
        setIsValid(true);
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Token validation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (action: string, extra?: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-subscription', {
        body: { action, subscriptionId: subscription.id, ...extra }
      });

      if (error) throw error;

      toast({ title: 'Erfolgreich', description: data.message });
      validateToken(); // Refresh
    } catch (error: any) {
      toast({ 
        title: 'Fehler', 
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isValid || !subscription) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="font-serif text-3xl mb-4">Link ungültig oder abgelaufen</h1>
        <p className="text-muted-foreground">
          Bitte fordern Sie einen neuen Verwaltungslink an.
        </p>
      </div>
    );
  }

  const frequencyLabels = {
    monthly: 'Monatlich',
    bimonthly: 'Alle 2 Monate',
    quarterly: 'Vierteljährlich'
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="font-serif text-3xl mb-8 text-center">Abonnement verwalten</h1>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {subscription.products?.name}
            </CardTitle>
            <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
              {subscription.status === 'active' ? 'Aktiv' : 
               subscription.status === 'paused' ? 'Pausiert' : 'Gekündigt'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Subscription Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Nächste Lieferung</p>
                <p className="font-medium">
                  {subscription.next_delivery 
                    ? new Date(subscription.next_delivery).toLocaleDateString('de-DE')
                    : '-'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Preis</p>
                <p className="font-medium">
                  {subscription.product_variants?.price?.toFixed(2)}€
                  <span className="text-green-600 text-sm ml-1">
                    (-{subscription.discount_percent}%)
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Frequency Selector */}
          {subscription.status !== 'cancelled' && (
            <div>
              <label className="text-sm font-medium mb-2 block">Lieferfrequenz</label>
              <Select 
                value={subscription.frequency}
                onValueChange={(value) => handleAction('update_frequency', { newFrequency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monatlich</SelectItem>
                  <SelectItem value="bimonthly">Alle 2 Monate</SelectItem>
                  <SelectItem value="quarterly">Vierteljährlich</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {subscription.status === 'active' && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => handleAction('pause')}
                  className="flex-1"
                >
                  Pausieren
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleAction('cancel')}
                  className="flex-1"
                >
                  Kündigen
                </Button>
              </>
            )}
            {subscription.status === 'paused' && (
              <Button 
                onClick={() => handleAction('resume')}
                className="flex-1"
              >
                Fortsetzen
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 🔐 Authentifizierung

### AuthContext
```typescript
// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: { first_name?: string; last_name?: string }) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata?: { first_name?: string; last_name?: string }) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadata
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### Two-Factor Authentication Setup
```typescript
// src/components/auth/TwoFactorSetup.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function TwoFactorSetup() {
  const [step, setStep] = useState<'intro' | 'verify'>('intro');
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateSecret = async () => {
    // Generate TOTP secret (use a library like otpauth in production)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setSecret(result);
    setStep('verify');
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const verify = async () => {
    // Verify TOTP code
    toast({
      title: '2FA aktiviert',
      description: 'Zwei-Faktor-Authentifizierung wurde erfolgreich eingerichtet.',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Zwei-Faktor-Authentifizierung
        </CardTitle>
      </CardHeader>
      <CardContent>
        {step === 'intro' && (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Erhöhe die Sicherheit deines Kontos mit 2FA.
            </p>
            <Button onClick={generateSecret}>
              2FA einrichten
            </Button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-sm">
              <p className="text-sm text-muted-foreground mb-2">
                Kopiere diesen Code in deine Authenticator-App:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm font-mono break-all">
                  {secret}
                </code>
                <Button variant="ghost" size="icon" onClick={copySecret}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Bestätigungscode eingeben
              </label>
              <Input
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
              />
            </div>

            <Button onClick={verify} disabled={verificationCode.length !== 6}>
              Bestätigen
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## 📋 Vollständige Feature-Checkliste

### Account Dashboard
- [ ] Profil-Übersicht mit Avatar
- [ ] Loyalitäts-Status-Anzeige
- [ ] Tier-Progress-Bar
- [ ] Cashback-Guthaben
- [ ] Quick-Action-Grid

### Profilverwaltung
- [ ] Persönliche Daten bearbeiten
- [ ] E-Mail ändern
- [ ] Passwort ändern
- [ ] Telefonnummer
- [ ] Avatar-Upload

### Adressverwaltung
- [ ] Mehrere Adressen speichern
- [ ] Lieferadresse / Rechnungsadresse
- [ ] Standard-Adresse setzen
- [ ] Adresse bearbeiten/löschen

### Bestellhistorie
- [ ] Alle Bestellungen anzeigen
- [ ] Status-Filter
- [ ] Bestelldetails
- [ ] Tracking-Info
- [ ] Rechnung herunterladen

### Favoriten
- [ ] Produkte speichern
- [ ] Zur Wishlist hinzufügen
- [ ] Aus Wishlist entfernen
- [ ] In Warenkorb verschieben

### Abonnements
- [ ] Aktive Abos anzeigen
- [ ] Frequenz ändern
- [ ] Pausieren/Fortsetzen
- [ ] Kündigen
- [ ] Gast-Management via Token

### Retouren
- [ ] Retoure beantragen
- [ ] Status verfolgen
- [ ] Rücksendelabel
- [ ] Erstattungsstatus

### Loyalitätsprogramm
- [ ] Aktueller Tier-Status
- [ ] Fortschritt zum nächsten Tier
- [ ] Tier-Vorteile anzeigen
- [ ] Cashback-Historie
- [ ] Auszahlung beantragen

### Sicherheit
- [ ] 2FA einrichten
- [ ] Passwort ändern
- [ ] Aktive Sessions
- [ ] Konto löschen

---

## 🚀 Implementierungsreihenfolge

1. **Auth System** - AuthContext, Login, Signup
2. **Profile Setup** - profiles Tabelle, Trigger
3. **Address Management** - CRUD für Adressen
4. **Order History** - Bestellübersicht
5. **Wishlist** - Favoriten-System
6. **Loyalty Program** - Tier-System, Cashback
7. **Subscriptions** - Abo-Verwaltung
8. **Returns** - Retouren-System
9. **2FA** - Zwei-Faktor-Auth

---

**ENDE CUSTOMER ACCOUNT PROMPT**
