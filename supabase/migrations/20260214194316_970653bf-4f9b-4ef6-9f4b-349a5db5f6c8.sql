-- Create radio schedule table for time-slot based track scheduling
CREATE TABLE IF NOT EXISTS public.radio_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id uuid NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  day_of_week integer, -- 0=Sunday, 1=Monday, ..., 6=Saturday. NULL = every day
  start_time time NOT NULL,
  end_time time NOT NULL,
  priority integer NOT NULL DEFAULT 0, -- higher = overrides default rotation
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.radio_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Radio schedule is publicly readable"
ON public.radio_schedule FOR SELECT
USING (true);

CREATE POLICY "Admins can manage radio schedule"
ON public.radio_schedule FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_radio_schedule_updated_at
BEFORE UPDATE ON public.radio_schedule
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add mode to radio_config: 'rotation' or 'scheduled'
ALTER TABLE public.radio_config ADD COLUMN IF NOT EXISTS mode text NOT NULL DEFAULT 'rotation';