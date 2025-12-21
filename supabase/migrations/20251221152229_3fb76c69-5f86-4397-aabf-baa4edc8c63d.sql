-- =====================
-- COUPON / RABATTCODE System
-- =====================
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage' or 'fixed'
  discount_value NUMERIC NOT NULL DEFAULT 0,
  min_order_amount NUMERIC DEFAULT 0,
  max_uses INTEGER DEFAULT NULL,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coupons are publicly readable" ON public.coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- =====================
-- NEWSLETTER SUBSCRIBERS
-- =====================
CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage newsletter" ON public.newsletter_subscribers FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);

-- =====================
-- PAYBACK / CASHBACK System
-- =====================
CREATE TABLE public.payback_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.payback_earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payback" ON public.payback_earnings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage payback" ON public.payback_earnings FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.payback_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed'
  bank_details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.payback_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payouts" ON public.payback_payouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage payouts" ON public.payback_payouts FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Add payback_balance to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS payback_balance NUMERIC DEFAULT 0;

-- =====================
-- PARTNER / AFFILIATE System
-- =====================
CREATE TABLE public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  partner_code TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  commission_rate NUMERIC DEFAULT 5, -- percentage
  total_sales NUMERIC DEFAULT 0,
  total_commission NUMERIC DEFAULT 0,
  total_paid_out NUMERIC DEFAULT 0,
  bank_details JSONB DEFAULT '{}',
  application_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own partner data" ON public.partners FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage partners" ON public.partners FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- =====================
-- CONTEST / GEWINNSPIEL System
-- =====================
CREATE TABLE public.contest_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  birth_date DATE,
  message TEXT,
  images TEXT[] DEFAULT '{}',
  is_winner BOOLEAN DEFAULT false,
  winner_position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.contest_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit entry" ON public.contest_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage entries" ON public.contest_entries FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- =====================
-- LIVE CHAT System
-- =====================
CREATE TABLE public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_name TEXT,
  visitor_email TEXT,
  status TEXT DEFAULT 'waiting', -- 'waiting', 'active', 'closed'
  last_message TEXT,
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage chat sessions" ON public.chat_sessions FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sender TEXT NOT NULL, -- 'visitor' or 'admin'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage chat messages" ON public.chat_messages FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- =====================
-- USER TIER for Payback/Discount (add to profiles)
-- =====================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'bronze';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_spent NUMERIC DEFAULT 0;