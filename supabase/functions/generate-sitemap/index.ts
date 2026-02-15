import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml',
};

const SITE_URL = 'https://aldenairperfumes.de';

// Static pages with their priorities and change frequencies
const staticPages = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/products', priority: '0.9', changefreq: 'daily' },
  { path: '/sparkits', priority: '0.8', changefreq: 'weekly' },
  { path: '/scent-finder', priority: '0.8', changefreq: 'weekly' },
  { path: '/story', priority: '0.7', changefreq: 'monthly' },
  { path: '/about', priority: '0.7', changefreq: 'monthly' },
  { path: '/blog', priority: '0.7', changefreq: 'weekly' },
  { path: '/contact', priority: '0.7', changefreq: 'monthly' },
  { path: '/faq', priority: '0.7', changefreq: 'weekly' },
  { path: '/newsletter', priority: '0.6', changefreq: 'monthly' },
  { path: '/partner', priority: '0.6', changefreq: 'monthly' },
  { path: '/referral', priority: '0.5', changefreq: 'monthly' },
  { path: '/shipping', priority: '0.5', changefreq: 'monthly' },
  { path: '/returns', priority: '0.5', changefreq: 'monthly' },
  { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
  { path: '/terms', priority: '0.3', changefreq: 'yearly' },
  { path: '/imprint', priority: '0.3', changefreq: 'yearly' },
];

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all active products
    const { data: products, error } = await supabase
      .from('products')
      .select('slug, updated_at, name, image_url')
      .eq('is_active', true);

    if (error) {
      console.error('[Sitemap] Error fetching products:', error);
      throw error;
    }

    // Fetch published blog posts
    const { data: blogPosts } = await supabase
      .from('blog_posts')
      .select('slug, published_at, title')
      .eq('is_published', true)
      .order('published_at', { ascending: false });

    const today = new Date().toISOString().split('T')[0];

    // Build sitemap XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

    // Add static pages
    for (const page of staticPages) {
      xml += `  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <xhtml:link rel="alternate" hreflang="de" href="${SITE_URL}${page.path}" />
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    }

    // Add product pages
    if (products) {
      for (const product of products) {
        const lastmod = product.updated_at 
          ? new Date(product.updated_at).toISOString().split('T')[0]
          : today;
        
        xml += `  <url>
    <loc>${SITE_URL}/products/${product.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>`;
        if (product.image_url) {
          xml += `
    <image:image>
      <image:loc>${product.image_url.startsWith('http') ? product.image_url : SITE_URL + product.image_url}</image:loc>
      <image:title>${product.name} - ALDENAIR Premium Parfüm</image:title>
    </image:image>`;
        }
        xml += `
  </url>
`;
      }
    }

    // Add blog post pages
    if (blogPosts) {
      for (const post of blogPosts) {
        const lastmod = post.published_at
          ? new Date(post.published_at).toISOString().split('T')[0]
          : today;
        
        xml += `  <url>
    <loc>${SITE_URL}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
      }
    }

    xml += '</urlset>';

    console.log(`[Sitemap] Generated sitemap with ${staticPages.length} static pages and ${products?.length || 0} products`);

    return new Response(xml, {
      status: 200,
      headers: corsHeaders,
    });

  } catch (error) {
    console.error('[Sitemap] Error:', error);
    
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <priority>1.0</priority>
  </url>
</urlset>`,
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  }
});
