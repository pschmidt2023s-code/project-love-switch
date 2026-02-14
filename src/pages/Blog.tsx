import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, Search } from 'lucide-react';
import { PremiumPageLayout } from '@/components/premium/PremiumPageLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Seo } from '@/components/Seo';
import { supabase } from '@/integrations/supabase/client';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  author_name: string;
  category: string | null;
  tags: string[];
  published_at: string | null;
  read_time_minutes: number | null;
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, cover_image, author_name, category, tags, published_at, read_time_minutes')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (!error && data) {
        setPosts(data);
      }
      setLoading(false);
    }
    fetchPosts();
  }, []);

  const categories = [...new Set(posts.map(p => p.category).filter(Boolean))] as string[];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.excerpt || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <PremiumPageLayout>
      <Seo
        title="Blog | ALDENAIR"
        description="Parfüm-Guides, Duftberatung und Neuigkeiten von ALDENAIR. Entdecke Tipps zur Duftauswahl und Pflege."
        canonicalPath="/blog"
      />

      <div className="container-premium py-8 lg:py-12">
        <Breadcrumb
          items={[{ label: 'Blog' }]}
          className="mb-8"
        />

        {/* Header */}
        <div className="text-center mb-10 lg:mb-16">
          <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-3">
            Magazin
          </span>
          <h1 className="font-display text-3xl lg:text-5xl text-foreground mb-4">
            ALDENAIR Journal
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Duftguides, Tipps und Geschichten aus der Welt der Parfümerie
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Artikel durchsuchen..."
              className="w-full pl-11 pr-4 py-3 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 text-[10px] tracking-[0.1em] uppercase font-medium border transition-colors ${
                !selectedCategory ? 'bg-foreground text-background border-foreground' : 'border-border text-foreground hover:border-accent'
              }`}
            >
              Alle
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-[10px] tracking-[0.1em] uppercase font-medium border transition-colors ${
                  selectedCategory === cat ? 'bg-foreground text-background border-foreground' : 'border-border text-foreground hover:border-accent'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-4">
                <div className="aspect-[16/9] bg-muted animate-pulse" />
                <div className="h-4 w-20 bg-muted animate-pulse" />
                <div className="h-6 w-3/4 bg-muted animate-pulse" />
                <div className="h-12 bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Keine Artikel gefunden.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredPosts.map((post, index) => (
              <article
                key={post.id}
                className={`group ${index === 0 ? 'md:col-span-2 lg:col-span-2' : ''}`}
              >
                <Link to={`/blog/${post.slug}`} className="block">
                  {/* Cover Image */}
                  <div className={`relative overflow-hidden bg-muted mb-4 ${index === 0 ? 'aspect-[2/1]' : 'aspect-[16/9]'}`}>
                    {post.cover_image ? (
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-accent/20 to-muted" />
                    )}
                    {post.category && (
                      <span className="absolute top-4 left-4 px-3 py-1 bg-background/90 backdrop-blur-sm text-[10px] tracking-[0.1em] uppercase font-medium text-foreground">
                        {post.category}
                      </span>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
                    {post.published_at && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
                        {new Date(post.published_at).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                    {post.read_time_minutes && (
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                        {post.read_time_minutes} Min.
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className={`font-display text-foreground group-hover:text-accent transition-colors mb-2 ${index === 0 ? 'text-2xl lg:text-3xl' : 'text-lg'}`}>
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Read More */}
                  <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase font-medium text-accent group-hover:gap-3 transition-all">
                    Weiterlesen
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </span>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </PremiumPageLayout>
  );
}
