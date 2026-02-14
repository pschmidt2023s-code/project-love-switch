import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Camera, Heart, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface GalleryItem {
  id: string;
  customer_name: string;
  image_url: string;
  caption: string | null;
  product_name: string | null;
  created_at: string;
}

// Placeholder data for when DB is empty
const placeholderItems: GalleryItem[] = [
  {
    id: 'p1', customer_name: 'Sarah M.', image_url: '/images/aldenair-111.png',
    caption: 'Mein absoluter Lieblingsduft! 💕', product_name: 'ALDENAIR N°111', created_at: new Date().toISOString(),
  },
  {
    id: 'p2', customer_name: 'Luca K.', image_url: '/images/aldenair-632.png',
    caption: 'Perfekt für den Sommer ☀️', product_name: 'ALDENAIR N°632', created_at: new Date().toISOString(),
  },
  {
    id: 'p3', customer_name: 'Nina R.', image_url: '/images/aldenair-888.png',
    caption: 'Die Verpackung ist einfach wow!', product_name: 'ALDENAIR N°888', created_at: new Date().toISOString(),
  },
  {
    id: 'p4', customer_name: 'Max B.', image_url: '/images/aldenair-prestige.png',
    caption: 'Luxus-Feeling pur 🖤', product_name: 'ALDENAIR Prestige', created_at: new Date().toISOString(),
  },
];

export function UnboxingGallery() {
  const { data: items = [] } = useQuery({
    queryKey: ['unboxing-gallery'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('unboxing_gallery')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(8);
      if (error) throw error;
      return data as GalleryItem[];
    },
  });

  const displayItems = items.length > 0 ? items : placeholderItems;

  return (
    <section className="section-padding border-t border-border overflow-hidden">
      <div className="container-premium">
        <div className="text-center mb-10">
          <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent mb-4">
            <Camera className="w-4 h-4 inline-block mr-2 -mt-0.5" />
            #ALDENAIR Community
          </span>
          <h2 className="font-display text-2xl lg:text-3xl text-foreground mb-4">
            Unsere Kunden, ihre Momente
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Echte Eindrücke von echten ALDENAIR Fans. Teile dein Unboxing mit #ALDENAIR
          </p>
        </div>

        {/* Masonry-style grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
          {displayItems.map((item, idx) => (
            <motion.div
              key={item.id}
              className="group relative overflow-hidden bg-muted"
              style={{ aspectRatio: idx % 3 === 0 ? '3/4' : '1/1' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <img
                src={item.image_url}
                alt={`${item.customer_name} - ${item.product_name || 'ALDENAIR'}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                loading="lazy"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="w-3.5 h-3.5 text-white" />
                  <span className="text-white text-xs font-medium">{item.customer_name}</span>
                </div>
                {item.caption && (
                  <p className="text-white/80 text-xs line-clamp-2">{item.caption}</p>
                )}
                {item.product_name && (
                  <span className="text-accent text-[9px] tracking-[0.1em] uppercase mt-1">
                    {item.product_name}
                  </span>
                )}
              </div>

              {/* Corner badge */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-7 h-7 bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Star className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Teile dein ALDENAIR Erlebnis auf Instagram mit{' '}
            <span className="text-accent font-medium">#ALDENAIR</span>{' '}
            und werde hier gefeatured!
          </p>
        </div>
      </div>
    </section>
  );
}
