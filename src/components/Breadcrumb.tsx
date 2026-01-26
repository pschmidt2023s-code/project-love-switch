import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const routeLabels: Record<string, string> = {
  '/': 'Home',
  '/products': 'Kollektion',
  '/about': 'Über Uns',
  '/contact': 'Kontakt',
  '/faq': 'FAQ',
  '/returns': 'Rückgabe',
  '/shipping': 'Versand',
  '/privacy': 'Datenschutz',
  '/terms': 'AGB',
  '/imprint': 'Impressum',
  '/newsletter': 'Newsletter',
  '/favorites': 'Favoriten',
  '/profile': 'Profil',
  '/scent-finder': 'Duft-Finder',
  '/sparkits': 'Sparsets',
  '/partner': 'Partner',
  '/cart': 'Warenkorb',
  '/checkout': 'Kasse',
};

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  const location = useLocation();

  // Auto-generate breadcrumbs from path if not provided
  const breadcrumbs: BreadcrumbItem[] = items || (() => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const crumbs: BreadcrumbItem[] = [];
    
    let currentPath = '';
    pathParts.forEach((part, index) => {
      currentPath += `/${part}`;
      const isLast = index === pathParts.length - 1;
      
      // Check if this is a product detail page
      if (pathParts[0] === 'products' && index === 1) {
        crumbs.push({
          label: decodeURIComponent(part).replace(/-/g, ' '),
          path: isLast ? undefined : currentPath,
        });
      } else {
        crumbs.push({
          label: routeLabels[currentPath] || part.charAt(0).toUpperCase() + part.slice(1),
          path: isLast ? undefined : currentPath,
        });
      }
    });
    
    return crumbs;
  })();

  if (breadcrumbs.length === 0) return null;

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center gap-2 text-sm ${className}`}
    >
      <Link 
        to="/" 
        className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Home"
      >
        <Home className="w-3.5 h-3.5" strokeWidth={1.5} />
      </Link>
      
      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="w-3 h-3 text-muted-foreground/50" strokeWidth={1.5} />
          {item.path ? (
            <Link 
              to={item.path}
              className="text-muted-foreground hover:text-foreground transition-colors text-[11px] tracking-[0.05em] uppercase"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground text-[11px] tracking-[0.05em] uppercase font-medium">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
