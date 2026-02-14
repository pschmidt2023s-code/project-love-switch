
-- Back-in-stock notification subscriptions
CREATE TABLE public.stock_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
  user_id UUID,
  notified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stock_notifications ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe (guest or authenticated)
CREATE POLICY "Anyone can subscribe to stock notifications"
ON public.stock_notifications FOR INSERT
WITH CHECK (true);

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON public.stock_notifications FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
ON public.stock_notifications FOR DELETE
USING (auth.uid() = user_id);

-- Admins can manage all
CREATE POLICY "Admins can manage stock notifications"
ON public.stock_notifications FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Index for efficient lookups
CREATE INDEX idx_stock_notifications_product ON public.stock_notifications(product_id, notified);
CREATE INDEX idx_stock_notifications_email ON public.stock_notifications(email);
