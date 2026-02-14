
-- Create VIP subscriptions table to track membership status
CREATE TABLE public.vip_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vip_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own VIP subscription
CREATE POLICY "Users can view own VIP subscription"
ON public.vip_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can manage all VIP subscriptions
CREATE POLICY "Admins can manage VIP subscriptions"
ON public.vip_subscriptions
FOR ALL
USING (has_admin_access(auth.uid()));

-- Service role can insert/update (for edge functions)
CREATE POLICY "Service can manage VIP subscriptions"
ON public.vip_subscriptions
FOR ALL
USING (true)
WITH CHECK (true);

-- Wait, that's too permissive. Let me use a better approach.
-- Drop the overly permissive policy
DROP POLICY "Service can manage VIP subscriptions" ON public.vip_subscriptions;

-- Add update trigger
CREATE TRIGGER update_vip_subscriptions_updated_at
BEFORE UPDATE ON public.vip_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for admin monitoring
ALTER PUBLICATION supabase_realtime ADD TABLE public.vip_subscriptions;
