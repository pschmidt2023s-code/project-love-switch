import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';

export function PremiumFooter() {
  const currentYear = new Date().getFullYear();

  const shopLinks = [
    { to: '/products', label: 'Alle Produkte' },
    { to: '/products?gender=herren', label: 'Herren' },
    { to: '/products?gender=damen', label: 'Damen' },
    { to: '/products?gender=unisex', label: 'Unisex' },
    { to: '/sparkits', label: 'Sparsets' },
  ];

  const serviceLinks = [
    { to: '/contact', label: 'Kontakt' },
    { to: '/faq', label: 'FAQ' },
    { to: '/returns', label: 'Rückgabe' },
    { to: '/shipping', label: 'Versand' },
  ];

  const legalLinks = [
    { to: '/privacy', label: 'Datenschutz' },
    { to: '/terms', label: 'AGB' },
    { to: '/imprint', label: 'Impressum' },
  ];

  return (
    <footer className="bg-foreground text-background">
      {/* Main Footer */}
      <div className="container-premium py-16 lg:py-24">
        <div className="grid-12">
          {/* Brand */}
          <div className="col-span-12 lg:col-span-4 mb-12 lg:mb-0">
            <Link to="/" className="inline-block mb-6">
              <span className="font-display text-2xl tracking-[0.2em] text-background">
                ALDENAIR
              </span>
            </Link>
            <p className="text-background/70 text-sm leading-relaxed max-w-xs mb-8">
              Deine Premium-Destination für exquisite Parfüms und Düfte. 
              Hochwertige Duftkreationen inspiriert von weltbekannten Luxusmarken.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <a 
                href="mailto:support@aldenairperfumes.de"
                className="flex items-center gap-3 text-sm text-background/70 hover:text-background transition-colors"
              >
                <Mail className="w-4 h-4" strokeWidth={1.5} />
                support@aldenairperfumes.de
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div className="col-span-6 sm:col-span-4 lg:col-span-2">
            <h4 className="text-[10px] tracking-[0.2em] uppercase text-background/50 mb-6">
              Shop
            </h4>
            <nav className="space-y-3">
              {shopLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block text-sm text-background/70 hover:text-background transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Service Links */}
          <div className="col-span-6 sm:col-span-4 lg:col-span-2">
            <h4 className="text-[10px] tracking-[0.2em] uppercase text-background/50 mb-6">
              Service
            </h4>
            <nav className="space-y-3">
              {serviceLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block text-sm text-background/70 hover:text-background transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Legal Links */}
          <div className="col-span-6 sm:col-span-4 lg:col-span-2">
            <h4 className="text-[10px] tracking-[0.2em] uppercase text-background/50 mb-6">
              Rechtliches
            </h4>
            <nav className="space-y-3">
              {legalLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block text-sm text-background/70 hover:text-background transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Newsletter */}
          <div className="col-span-12 sm:col-span-8 lg:col-span-2 mt-8 lg:mt-0">
            <h4 className="text-[10px] tracking-[0.2em] uppercase text-background/50 mb-6">
              Newsletter
            </h4>
            <p className="text-sm text-background/70 mb-4">
              Exklusive Angebote und Neuigkeiten.
            </p>
            <Link 
              to="/newsletter"
              className="inline-flex items-center text-sm text-background hover:text-accent transition-colors"
            >
              Jetzt anmelden
              <ArrowUpRight className="ml-2 w-4 h-4" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container-premium py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-background/50">
              © {currentYear} ALDENAIR. Alle Rechte vorbehalten.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-xs text-background/50">
                Made with ♥ in Germany
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
