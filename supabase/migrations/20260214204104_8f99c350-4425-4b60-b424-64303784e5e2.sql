
-- Drop the restrictive policies
DROP POLICY IF EXISTS "Tracks are publicly readable" ON public.tracks;
DROP POLICY IF EXISTS "Admins can manage tracks" ON public.tracks;

-- Recreate as PERMISSIVE (default) so either one grants access
CREATE POLICY "Tracks are publicly readable"
ON public.tracks
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage tracks"
ON public.tracks
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));
