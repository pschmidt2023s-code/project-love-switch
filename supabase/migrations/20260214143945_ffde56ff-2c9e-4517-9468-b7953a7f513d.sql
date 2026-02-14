
-- Fix 1: Chat messages - restrict SELECT to admins only (visitors use service role via edge function)
DROP POLICY IF EXISTS "Users can view messages in their session" ON public.chat_messages;

CREATE POLICY "Only admins can view chat messages"
ON public.chat_messages
FOR SELECT
USING (has_admin_access(auth.uid()));

-- Fix 2: Stock notifications - remove public email exposure
DROP POLICY IF EXISTS "Users can view own notifications" ON public.stock_notifications;

CREATE POLICY "Users can view own notifications"
ON public.stock_notifications
FOR SELECT
USING (auth.uid() = user_id AND user_id IS NOT NULL);

CREATE POLICY "Admins can view all stock notifications"
ON public.stock_notifications
FOR SELECT
USING (has_admin_access(auth.uid()));
