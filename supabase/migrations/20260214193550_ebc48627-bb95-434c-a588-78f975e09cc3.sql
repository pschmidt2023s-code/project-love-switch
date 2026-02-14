-- Add YouTube URL field and radio scheduling fields to tracks
ALTER TABLE public.tracks 
ADD COLUMN IF NOT EXISTS youtube_url text,
ADD COLUMN IF NOT EXISTS scheduled_start time,
ADD COLUMN IF NOT EXISTS scheduled_end time;

-- Create radio_config table for global radio settings
CREATE TABLE IF NOT EXISTS public.radio_config (
  id text PRIMARY KEY DEFAULT 'default',
  is_live boolean NOT NULL DEFAULT false,
  playlist_id uuid REFERENCES public.playlists(id),
  loop_start_epoch bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.radio_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Radio config is publicly readable"
ON public.radio_config FOR SELECT
USING (true);

CREATE POLICY "Admins can manage radio config"
ON public.radio_config FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default config
INSERT INTO public.radio_config (id, is_live, loop_start_epoch)
VALUES ('default', false, EXTRACT(EPOCH FROM now())::bigint)
ON CONFLICT (id) DO NOTHING;

-- Add updated_at trigger
CREATE TRIGGER update_radio_config_updated_at
BEFORE UPDATE ON public.radio_config
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();