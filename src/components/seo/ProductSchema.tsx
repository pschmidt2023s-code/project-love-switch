import { useEffect } from 'react';

interface ProductSchemaProps {
  product: {
    name: string;
    description: string;
    image: string;
    price: number;
    originalPrice?: number;
    currency?: string;
    sku?: string;
    brand?: string;
    availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
    rating?: number;
    reviewCount?: number;
    url: string;
  };
}

export function ProductSchema({ product }: ProductSchemaProps) {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: product.image,
      sku: product.sku,
      brand: {
        '@type': 'Brand',
        name: product.brand || 'ALDENAIR'
      },
      offers: {
        '@type': 'Offer',
        url: product.url,
        priceCurrency: product.currency || 'EUR',
        price: product.price.toFixed(2),
        ...(product.originalPrice && {
          priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }),
        availability: `https://schema.org/${product.availability || 'InStock'}`,
        seller: {
          '@type': 'Organization',
          name: 'ALDENAIR'
        }
      },
      ...(product.rating && product.reviewCount && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: product.rating.toFixed(1),
          reviewCount: product.reviewCount,
          bestRating: '5',
          worstRating: '1'
        }
      })
    };

    script.text = JSON.stringify(structuredData);
    script.id = `product-schema-${product.sku || product.name}`;
    
    // Remove existing script if present
    const existing = document.getElementById(script.id);
    if (existing) {
      existing.remove();
    }
    
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById(script.id);
      if (el) {
        document.head.removeChild(el);
      }
    };
  }, [product]);

  return null;
}
