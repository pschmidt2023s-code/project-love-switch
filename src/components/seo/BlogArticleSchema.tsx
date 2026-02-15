import { useEffect } from 'react';

interface BlogArticleSchemaProps {
  post: {
    title: string;
    excerpt: string | null;
    content: string;
    author_name: string;
    published_at: string | null;
    cover_image: string | null;
    category: string | null;
  };
  slug: string;
}

export function BlogArticleSchema({ post, slug }: BlogArticleSchemaProps) {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt || post.title,
      image: post.cover_image || 'https://aldenairperfumes.de/images/aldenair-prestige.png',
      author: {
        '@type': 'Person',
        name: post.author_name,
      },
      publisher: {
        '@type': 'Organization',
        name: 'ALDENAIR',
        logo: {
          '@type': 'ImageObject',
          url: 'https://aldenairperfumes.de/images/aldenair-prestige.png',
        },
      },
      datePublished: post.published_at || new Date().toISOString(),
      dateModified: post.published_at || new Date().toISOString(),
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://aldenairperfumes.de/blog/${slug}`,
      },
      ...(post.category && { articleSection: post.category }),
      wordCount: post.content.split(/\s+/).length,
      inLanguage: 'de-DE',
    };

    script.text = JSON.stringify(structuredData);
    script.id = 'blog-article-schema';

    const existing = document.getElementById(script.id);
    if (existing) existing.remove();

    document.head.appendChild(script);

    return () => {
      const el = document.getElementById(script.id);
      if (el) document.head.removeChild(el);
    };
  }, [post, slug]);

  return null;
}
