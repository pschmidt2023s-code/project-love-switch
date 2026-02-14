
-- Storage bucket for audio files
INSERT INTO storage.buckets (id, name, public) VALUES ('audio', 'audio', true);

-- Allow public read access to audio files
CREATE POLICY "Public can read audio files"
ON storage.objects FOR SELECT
USING (bucket_id = 'audio');

-- Only admins can upload audio
CREATE POLICY "Admins can upload audio"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'audio' AND public.has_role(auth.uid(), 'admin'));

-- Only admins can delete audio
CREATE POLICY "Admins can delete audio"
ON storage.objects FOR DELETE
USING (bucket_id = 'audio' AND public.has_role(auth.uid(), 'admin'));

-- Tracks table
CREATE TABLE public.tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL DEFAULT 'ALDENAIR',
  album TEXT,
  genre TEXT,
  bpm INTEGER,
  duration_seconds INTEGER,
  audio_url TEXT NOT NULL,
  cover_url TEXT,
  is_external BOOLEAN NOT NULL DEFAULT false,
  waveform_data JSONB,
  mood TEXT,
  energy TEXT CHECK (energy IN ('low', 'medium', 'high')),
  key_signature TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  play_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tracks are publicly readable"
ON public.tracks FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage tracks"
ON public.tracks FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Playlists table
CREATE TABLE public.playlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  is_public BOOLEAN DEFAULT true,
  is_automix BOOLEAN DEFAULT false,
  automix_config JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public playlists are readable"
ON public.playlists FOR SELECT
USING (is_public = true);

CREATE POLICY "Admins can manage playlists"
ON public.playlists FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Playlist tracks junction table
CREATE TABLE public.playlist_tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  crossfade_duration NUMERIC DEFAULT 3.0,
  transition_type TEXT DEFAULT 'crossfade',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(playlist_id, track_id)
);

ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Playlist tracks are publicly readable"
ON public.playlist_tracks FOR SELECT
USING (EXISTS (SELECT 1 FROM public.playlists WHERE id = playlist_tracks.playlist_id AND is_public = true));

CREATE POLICY "Admins can manage playlist tracks"
ON public.playlist_tracks FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update triggers
CREATE TRIGGER update_tracks_updated_at
BEFORE UPDATE ON public.tracks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_playlists_updated_at
BEFORE UPDATE ON public.playlists
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
