
-- Fix radio_schedule policies (also likely restrictive)
DROP POLICY IF EXISTS "Radio schedule is publicly readable" ON public.radio_schedule;
DROP POLICY IF EXISTS "Admins can manage radio schedule" ON public.radio_schedule;

-- Check if policies exist with different names, drop all
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'radio_schedule' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.radio_schedule', pol.policyname);
  END LOOP;
END $$;

-- Recreate as PERMISSIVE
CREATE POLICY "Radio schedule is publicly readable"
ON public.radio_schedule
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage radio schedule"
ON public.radio_schedule
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));
