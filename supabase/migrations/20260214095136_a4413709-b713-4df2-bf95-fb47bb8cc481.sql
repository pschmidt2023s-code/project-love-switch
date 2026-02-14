
-- Product Reviews Table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  author_name TEXT NOT NULL DEFAULT 'Anonym',
  is_verified_purchase BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT true,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are publicly readable" ON public.reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Authenticated users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all reviews" ON public.reviews FOR ALL USING (has_admin_access(auth.uid()));

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Blog Posts Table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  author_name TEXT NOT NULL DEFAULT 'ALDENAIR Team',
  category TEXT DEFAULT 'Allgemein',
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  read_time_minutes INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published blog posts are publicly readable" ON public.blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage blog posts" ON public.blog_posts FOR ALL USING (has_admin_access(auth.uid()));

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample blog posts
INSERT INTO public.blog_posts (title, slug, excerpt, content, category, tags, is_published, published_at, read_time_minutes, cover_image) VALUES
('Die Kunst der Duftkomposition', 'kunst-der-duftkomposition', 'Erfahre, wie Meisterparfümeure harmonische Düfte kreieren und welche Rolle Kopf-, Herz- und Basisnoten spielen.', E'# Die Kunst der Duftkomposition\n\nDie Parfümerie ist eine der ältesten Künste der Menschheit. Seit Jahrtausenden verwenden Menschen Düfte, um Emotionen zu wecken, Erinnerungen zu schaffen und ihre Persönlichkeit auszudrücken.\n\n## Die Duftpyramide\n\nJedes Parfüm besteht aus drei Schichten:\n\n### Kopfnoten\nDie Kopfnoten sind der erste Eindruck – leicht, frisch und flüchtig. Sie bestehen oft aus Zitrusfrüchten, Kräutern oder leichten Blütennoten.\n\n### Herznoten\nDas Herzstück des Duftes entfaltet sich nach einigen Minuten. Hier finden sich reichere Blüten-, Gewürz- oder Fruchtnoten.\n\n### Basisnoten\nDie Basisnoten sind das Fundament. Sie bestehen aus schweren, langanhaltenden Inhaltsstoffen wie Moschus, Amber, Sandelholz oder Vanille.\n\n## Tipps für die Duftauswahl\n\n1. **Testen Sie auf der Haut** – Düfte reagieren unterschiedlich auf verschiedene Hauttypen\n2. **Geben Sie dem Duft Zeit** – Warten Sie mindestens 30 Minuten, bevor Sie urteilen\n3. **Weniger ist mehr** – Ein guter Duft muss nicht aufdringlich sein', 'Duftguide', ARRAY['Parfüm', 'Duftpyramide', 'Tipps'], true, now(), 7, 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=400&fit=crop'),
('5 Tipps für langanhaltenden Duft', 'tipps-langanhaltender-duft', 'Mit diesen einfachen Tricks hält dein Lieblingsparfüm den ganzen Tag.', E'# 5 Tipps für langanhaltenden Duft\n\nKennst du das? Du sprühst morgens dein Lieblingsparfüm auf und mittags ist der Duft verflogen. Mit diesen Tipps gehört das der Vergangenheit an.\n\n## 1. Auf die Pulspunkte sprühen\nSprühe dein Parfüm auf die Pulspunkte: Handgelenke, Hals, hinter die Ohren und in die Armbeuge. Die Wärme dieser Stellen aktiviert den Duft.\n\n## 2. Haut vorher eincremen\nParfüm hält besser auf feuchter Haut. Verwende eine unparfümierte Bodylotion vor dem Auftragen.\n\n## 3. Nicht reiben\nViele Menschen reiben ihre Handgelenke aneinander – das zerstört die Duftmoleküle! Einfach aufsprühen und trocknen lassen.\n\n## 4. In die Haare sprühen\nHaare sind ein exzellenter Duftträger. Sprühe aus ca. 30cm Entfernung leicht über deine Haare.\n\n## 5. Richtig aufbewahren\nLagere deine Parfüms kühl, trocken und dunkel. Hitze und Sonnenlicht zersetzen die Duftmoleküle.', 'Tipps', ARRAY['Parfüm', 'Haltbarkeit', 'Tricks'], true, now() - interval '3 days', 4, 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800&h=400&fit=crop'),
('ALDENAIR: Luxus-Düfte zum fairen Preis', 'aldenair-luxus-duefte-fairer-preis', 'Wie ALDENAIR es schafft, hochwertige Parfüms inspiriert von Luxusmarken zu erschwinglichen Preisen anzubieten.', E'# ALDENAIR: Luxus-Düfte zum fairen Preis\n\nWarum kosten Designer-Parfüms oft über 100€? Und wie schafft es ALDENAIR, vergleichbare Qualität zu einem Bruchteil des Preises anzubieten?\n\n## Das Geheimnis der Parfümindustrie\n\nBei einem 100€-Designer-Parfüm entfallen oft nur 5-10€ auf die eigentlichen Inhaltsstoffe. Der Rest geht für Marketing, Celebrity-Werbung und luxuriöse Verpackungen drauf.\n\n## Der ALDENAIR-Ansatz\n\nWir investieren in das, was wirklich zählt: **hochwertige Inhaltsstoffe**. Ohne teure TV-Spots und ohne Celebrity-Deals können wir Düfte anbieten, die von den besten Parfüms der Welt inspiriert sind – zu einem fairen Preis.\n\n## Unsere Qualitätsversprechen\n\n- **Hochwertige Duftstoffe** aus Grasse, Frankreich\n- **Langanhaltende Formeln** mit 15-20% Duftölanteil\n- **Made in Germany** – strenge Qualitätskontrollen\n- **14 Tage Rückgaberecht** – kein Risiko', 'Über uns', ARRAY['ALDENAIR', 'Qualität', 'Preise'], true, now() - interval '7 days', 5, 'https://images.unsplash.com/photo-1594035910387-fba71f185186?w=800&h=400&fit=crop');
