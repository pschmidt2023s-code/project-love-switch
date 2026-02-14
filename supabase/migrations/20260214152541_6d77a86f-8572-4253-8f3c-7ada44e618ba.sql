
-- =============================================
-- 1. ABANDONED CART RECOVERY
-- =============================================
CREATE TABLE public.abandoned_carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_email text,
  cart_data jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_amount numeric DEFAULT 0,
  reminder_sent_count integer DEFAULT 0,
  last_reminder_at timestamptz,
  recovered boolean DEFAULT false,
  recovered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage abandoned carts" ON public.abandoned_carts
  FOR ALL USING (has_admin_access(auth.uid()));

CREATE POLICY "Users can view own abandoned carts" ON public.abandoned_carts
  FOR SELECT USING (auth.uid() = user_id);

-- =============================================
-- 2. REFERRAL PROGRAM
-- =============================================
CREATE TABLE public.referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  code text UNIQUE NOT NULL,
  reward_type text NOT NULL DEFAULT 'percentage',
  reward_value numeric NOT NULL DEFAULT 10,
  referee_reward_value numeric NOT NULL DEFAULT 10,
  max_uses integer,
  current_uses integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referral codes" ON public.referral_codes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own referral codes" ON public.referral_codes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage referral codes" ON public.referral_codes
  FOR ALL USING (has_admin_access(auth.uid()));

CREATE TABLE public.referral_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_id uuid REFERENCES public.referral_codes(id) ON DELETE CASCADE NOT NULL,
  referrer_id uuid NOT NULL,
  referee_id uuid NOT NULL,
  referee_email text,
  order_id uuid REFERENCES public.orders(id),
  referrer_reward numeric DEFAULT 0,
  referee_reward numeric DEFAULT 0,
  status text DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referral rewards" ON public.referral_rewards
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

CREATE POLICY "Admins can manage referral rewards" ON public.referral_rewards
  FOR ALL USING (has_admin_access(auth.uid()));

-- =============================================
-- 3. CSAT SURVEYS
-- =============================================
CREATE TABLE public.csat_surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  order_id uuid REFERENCES public.orders(id),
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback text,
  category text DEFAULT 'general',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.csat_surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create own surveys" ON public.csat_surveys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own surveys" ON public.csat_surveys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage surveys" ON public.csat_surveys
  FOR ALL USING (has_admin_access(auth.uid()));

-- =============================================
-- 4. A/B TESTING
-- =============================================
CREATE TABLE public.ab_experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  variant_a_label text DEFAULT 'Control',
  variant_b_label text DEFAULT 'Variant',
  target_element text,
  is_active boolean DEFAULT true,
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ab_experiments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage experiments" ON public.ab_experiments
  FOR ALL USING (has_admin_access(auth.uid()));

CREATE POLICY "Experiments are publicly readable" ON public.ab_experiments
  FOR SELECT USING (is_active = true);

CREATE TABLE public.ab_experiment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id uuid REFERENCES public.ab_experiments(id) ON DELETE CASCADE NOT NULL,
  variant text NOT NULL,
  event_type text NOT NULL DEFAULT 'view',
  session_id text,
  user_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ab_experiment_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert experiment events" ON public.ab_experiment_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view experiment events" ON public.ab_experiment_events
  FOR SELECT USING (has_admin_access(auth.uid()));

-- =============================================
-- 5. SHIPMENT TRACKING
-- =============================================
CREATE TABLE public.shipment_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) NOT NULL,
  user_id uuid,
  carrier text NOT NULL DEFAULT 'DHL',
  tracking_number text NOT NULL,
  tracking_url text,
  status text DEFAULT 'label_created',
  estimated_delivery date,
  events jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.shipment_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own shipments" ON public.shipment_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage shipments" ON public.shipment_tracking
  FOR ALL USING (has_admin_access(auth.uid()));

-- =============================================
-- 6. FRAUD DETECTION
-- =============================================
CREATE TABLE public.fraud_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id),
  user_id uuid,
  score numeric NOT NULL DEFAULT 0,
  risk_level text DEFAULT 'low',
  factors jsonb DEFAULT '[]'::jsonb,
  flagged boolean DEFAULT false,
  reviewed boolean DEFAULT false,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fraud_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage fraud scores" ON public.fraud_scores
  FOR ALL USING (has_admin_access(auth.uid()));

-- =============================================
-- 7. EMAIL SEQUENCES
-- =============================================
CREATE TABLE public.email_sequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  trigger_type text NOT NULL,
  is_active boolean DEFAULT true,
  steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage email sequences" ON public.email_sequences
  FOR ALL USING (has_admin_access(auth.uid()));

CREATE TABLE public.email_sequence_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id uuid REFERENCES public.email_sequences(id) ON DELETE CASCADE,
  user_id uuid,
  email text NOT NULL,
  step_index integer NOT NULL DEFAULT 0,
  status text DEFAULT 'sent',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.email_sequence_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage sequence logs" ON public.email_sequence_logs
  FOR ALL USING (has_admin_access(auth.uid()));

-- =============================================
-- 8. CONVERSION FUNNEL TRACKING
-- =============================================
CREATE TABLE public.funnel_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  user_id uuid,
  step text NOT NULL,
  page text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert funnel events" ON public.funnel_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view funnel events" ON public.funnel_events
  FOR SELECT USING (has_admin_access(auth.uid()));

-- Update triggers
CREATE TRIGGER update_abandoned_carts_updated_at BEFORE UPDATE ON public.abandoned_carts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shipment_tracking_updated_at BEFORE UPDATE ON public.shipment_tracking
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_sequences_updated_at BEFORE UPDATE ON public.email_sequences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
