-- Fix email_logs INSERT policy: require authentication (service role bypasses RLS anyway)
DROP POLICY IF EXISTS "Service role can insert email logs" ON public.email_logs;
CREATE POLICY "Authenticated can insert email logs"
  ON public.email_logs
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);