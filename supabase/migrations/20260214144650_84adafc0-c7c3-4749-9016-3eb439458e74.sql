
-- contest_entries: only admins can read entries
CREATE POLICY "Only admins can view contest entries"
ON public.contest_entries FOR SELECT
USING (has_admin_access(auth.uid()));
