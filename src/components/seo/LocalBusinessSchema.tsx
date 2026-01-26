import { useEffect } from 'react';

export function LocalBusinessSchema() {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Store',
      '@id': 'https://aldenairperfumes.de/#organization',
      name: 'ALDENAIR',
      description: 'Premium Parfüms und exklusive Duftkreationen - hochwertige Düfte inspiriert von weltbekannten Marken zu fairen Preisen.',
      url: 'https://aldenairperfumes.de',
      logo: {
        '@type': 'ImageObject',
        url: 'https://aldenairperfumes.de/images/aldenair-prestige.png'
      },
      image: 'https://aldenairperfumes.de/images/aldenair-prestige.png',
      priceRange: '€€',
      currenciesAccepted: 'EUR',
      paymentAccepted: 'PayPal, Kreditkarte, Stripe',
      areaServed: {
        '@type': 'Country',
        name: 'Deutschland'
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'ALDENAIR Parfüm Kollektion',
        itemListElement: [
          {
            '@type': 'OfferCatalog',
            name: 'Herrendüfte',
            itemListElement: {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Product',
                name: 'ALDENAIR Herrenparfüms'
              }
            }
          },
          {
            '@type': 'OfferCatalog',
            name: 'Damendüfte',
            itemListElement: {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Product',
                name: 'ALDENAIR Damenparfüms'
              }
            }
          },
          {
            '@type': 'OfferCatalog',
            name: 'Sparsets',
            itemListElement: {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Product',
                name: 'ALDENAIR Sparsets'
              }
            }
          }
        ]
      },
      sameAs: [],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        availableLanguage: ['German', 'English'],
        email: 'info@aldenairperfumes.de'
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://aldenairperfumes.de/products?search={search_term_string}'
        },
        'query-input': 'required name=search_term_string'
      }
    };

    script.text = JSON.stringify(structuredData);
    script.id = 'local-business-schema';
    
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
  }, []);

  return null;
}
