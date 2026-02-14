
-- Fix chat_messages: drop the old permissive SELECT policy (USING true) if it still exists
DROP POLICY IF EXISTS "Users can view messages in their session" ON public.chat_messages;

-- Fix stock_notifications: drop the leaky policy
DROP POLICY IF EXISTS "Users can view own notifications" ON public.stock_notifications;

-- Recreate stock_notifications: authenticated users see only their own
CREATE POLICY "Users can view own notifications"
ON public.stock_notifications FOR SELECT
USING (auth.uid() = user_id AND user_id IS NOT NULL);
