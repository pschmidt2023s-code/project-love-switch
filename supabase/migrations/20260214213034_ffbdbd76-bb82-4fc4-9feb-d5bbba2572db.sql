
-- Unboxing Gallery table for user-generated content
CREATE TABLE public.unboxing_gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  customer_name TEXT NOT NULL DEFAULT 'Anonym',
  image_url TEXT NOT NULL,
  caption TEXT,
  product_name TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.unboxing_gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved photos are publicly readable"
  ON public.unboxing_gallery FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Admins can manage gallery"
  ON public.unboxing_gallery FOR ALL
  USING (has_admin_access(auth.uid()));

CREATE POLICY "Authenticated users can submit photos"
  ON public.unboxing_gallery FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- VIP Early Access table
CREATE TABLE public.vip_drops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  drop_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  product_id UUID REFERENCES public.products(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.vip_drops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active drops are publicly readable"
  ON public.vip_drops FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage drops"
  ON public.vip_drops FOR ALL
  USING (has_admin_access(auth.uid()));

-- Spin wheel prizes config
CREATE TABLE public.spin_prizes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  discount_value NUMERIC DEFAULT 0,
  discount_type TEXT DEFAULT 'percentage',
  probability NUMERIC NOT NULL DEFAULT 10,
  color TEXT DEFAULT '#B8860B',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.spin_prizes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Prizes are publicly readable"
  ON public.spin_prizes FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage prizes"
  ON public.spin_prizes FOR ALL
  USING (has_admin_access(auth.uid()));

-- Spin results log
CREATE TABLE public.spin_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  prize_id UUID REFERENCES public.spin_prizes(id),
  prize_label TEXT NOT NULL,
  coupon_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.spin_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit spin results"
  ON public.spin_results FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view spin results"
  ON public.spin_results FOR SELECT
  USING (has_admin_access(auth.uid()));

-- Gamification: badges
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges"
  ON public.user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage badges"
  ON public.user_badges FOR ALL
  USING (has_admin_access(auth.uid()));

-- Insert default spin prizes
INSERT INTO public.spin_prizes (label, discount_value, discount_type, probability, color) VALUES
  ('5% Rabatt', 5, 'percentage', 25, '#B8860B'),
  ('10% Rabatt', 10, 'percentage', 20, '#DAA520'),
  ('Gratis Versand', 0, 'free_shipping', 20, '#1a1a1a'),
  ('15% Rabatt', 15, 'percentage', 10, '#C5A55A'),
  ('Probe gratis', 0, 'free_sample', 15, '#2d2d2d'),
  ('Nächstes Mal!', 0, 'nothing', 10, '#666666');
