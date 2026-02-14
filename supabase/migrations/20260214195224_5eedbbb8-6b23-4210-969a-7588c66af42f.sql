-- Add is_hidden column for "leak" tracks
ALTER TABLE public.tracks ADD COLUMN is_hidden boolean NOT NULL DEFAULT false;

-- Create index for efficient filtering
CREATE INDEX idx_tracks_is_hidden ON public.tracks(is_hidden);
