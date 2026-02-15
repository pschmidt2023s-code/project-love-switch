import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft, Share2 } from 'lucide-react';
import { PremiumPageLayout } from '@/components/premium/PremiumPageLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Seo } from '@/components/Seo';
import { SocialShare } from '@/components/SocialShare';
import { BreadcrumbSchema, BlogArticleSchema } from '@/components/seo';
import { supabase } from '@/integrations/supabase/client';

interface BlogPostFull {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image: string | null;
  author_name: string;
  category: string | null;
  tags: string[];
  published_at: string | null;
  read_time_minutes: number | null;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostFull | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (data) setPost(data);
      setLoading(false);
    }
    if (slug) fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <PremiumPageLayout>
        <div className="container-premium py-16 max-w-3xl mx-auto">
          <div className="space-y-6">
            <div className="h-4 w-24 bg-muted animate-pulse" />
            <div className="h-10 w-3/4 bg-muted animate-pulse" />
            <div className="aspect-[2/1] bg-muted animate-pulse" />
            <div className="space-y-3">
              <div className="h-4 bg-muted animate-pulse" />
              <div className="h-4 w-5/6 bg-muted animate-pulse" />
              <div className="h-4 w-4/6 bg-muted animate-pulse" />
            </div>
          </div>
        </div>
      </PremiumPageLayout>
    );
  }

  if (!post) {
    return (
      <PremiumPageLayout>
        <div className="container-premium py-24 text-center">
          <h1 className="font-display text-2xl text-foreground mb-4">Artikel nicht gefunden</h1>
          <Link to="/blog" className="text-accent hover:underline">Zurück zum Blog</Link>
        </div>
      </PremiumPageLayout>
    );
  }

  // Simple markdown-like rendering (safe, no dangerouslySetInnerHTML)
  const renderBoldText = (text: string, keyPrefix: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, j) =>
      j % 2 === 1 ? <strong key={`${keyPrefix}-${j}`} className="text-foreground font-medium">{part}</strong> : part
    );
  };

  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-display text-foreground mt-8 mb-3">{line.slice(4)}</h3>;
      if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-display text-foreground mt-10 mb-4">{line.slice(3)}</h2>;
      if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-display text-foreground mt-10 mb-4">{line.slice(2)}</h1>;
      if (line.startsWith('- ')) return <li key={i} className="ml-4 text-muted-foreground leading-relaxed">{line.slice(2)}</li>;
      if (line.match(/^\d+\.\s/)) return <li key={i} className="ml-4 text-muted-foreground leading-relaxed list-decimal">{line.replace(/^\d+\.\s/, '')}</li>;
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} className="text-sm text-muted-foreground leading-relaxed">{renderBoldText(line, `p${i}`)}</p>;
    });
  };

  return (
    <PremiumPageLayout>
      <Seo
        title={`${post.title} | ALDENAIR Parfüm Blog`}
        description={post.excerpt || `${post.title} – Tipps und Guides rund um Premium-Parfüms von ALDENAIR.`}
        canonicalPath={`/blog/${slug}`}
        ogImage={post.cover_image || '/images/aldenair-prestige.png'}
      />
      <BreadcrumbSchema items={[
        { name: 'Startseite', url: 'https://aldenairperfumes.de' },
        { name: 'Blog', url: 'https://aldenairperfumes.de/blog' },
        { name: post.title, url: `https://aldenairperfumes.de/blog/${slug}` }
      ]} />
      <BlogArticleSchema post={post} slug={slug || ''} />

      <div className="container-premium py-8 lg:py-12">
        <Breadcrumb
          items={[
            { label: 'Blog', path: '/blog' },
            { label: post.title }
          ]}
          className="mb-8"
        />

        <article className="max-w-3xl mx-auto">
          {/* Category */}
          {post.category && (
            <span className="inline-block text-[10px] tracking-[0.2em] uppercase text-accent font-medium mb-4">
              {post.category}
            </span>
          )}

          {/* Title */}
          <h1 className="font-display text-3xl lg:text-4xl text-foreground mb-6">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <span>{post.author_name}</span>
              {post.published_at && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {new Date(post.published_at).toLocaleDateString('de-DE', {
                    day: '2-digit', month: 'long', year: 'numeric',
                  })}
                </span>
              )}
              {post.read_time_minutes && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {post.read_time_minutes} Min. Lesezeit
                </span>
              )}
            </div>
            <SocialShare url={`/blog/${slug}`} title={post.title} description={post.excerpt || undefined} />
          </div>

          {/* Cover Image */}
          {post.cover_image && (
            <div className="aspect-[2/1] overflow-hidden bg-muted mb-10">
              <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Content */}
          <div className="prose-custom space-y-1">
            {renderContent(post.content)}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-6 border-t border-border">
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <span key={tag} className="px-3 py-1.5 bg-muted text-muted-foreground text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Back */}
          <div className="mt-12">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
              Alle Artikel
            </Link>
          </div>
        </article>
      </div>
    </PremiumPageLayout>
  );
}
