import { Link } from 'react-router-dom';
import { Mail, ArrowUpRight } from 'lucide-react';

// Simple SVG icons for social media
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  );
}

function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0a12 12 0 0 0-4.37 23.17c-.1-.94-.2-2.4.04-3.43l1.4-5.95s-.35-.7-.35-1.74c0-1.63.95-2.85 2.13-2.85 1 0 1.49.75 1.49 1.66 0 1.01-.64 2.52-.98 3.93-.28 1.17.59 2.13 1.74 2.13 2.09 0 3.69-2.2 3.69-5.38 0-2.81-2.02-4.78-4.9-4.78-3.34 0-5.3 2.5-5.3 5.09 0 1.01.39 2.09.88 2.68.1.12.11.22.08.34-.09.37-.29 1.18-.33 1.34-.05.22-.18.26-.41.16-1.52-.7-2.48-2.94-2.48-4.74 0-3.86 2.8-7.41 8.09-7.41 4.25 0 7.55 3.03 7.55 7.07 0 4.22-2.66 7.61-6.35 7.61-1.24 0-2.4-.64-2.8-1.4l-.76 2.9c-.28 1.06-1.03 2.4-1.53 3.21A12 12 0 1 0 12 0z"/>
    </svg>
  );
}

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

  const socialLinks = [
    { href: 'https://instagram.com/aldenair', label: 'Instagram', icon: InstagramIcon },
    { href: 'https://tiktok.com/@aldenair', label: 'TikTok', icon: TikTokIcon },
    { href: 'https://pinterest.com/aldenair', label: 'Pinterest', icon: PinterestIcon },
  ];

  return (
    <footer className="bg-foreground text-background">
      {/* Main Footer */}
      <div className="container-premium py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="inline-block mb-5">
              <span className="font-display text-xl tracking-[0.2em] text-background">
                ALDENAIR
              </span>
            </Link>
            <p className="text-background/60 text-sm leading-relaxed max-w-xs mb-6">
              Deine Premium-Destination für exquisite Parfüms und Düfte. 
              Hochwertige Duftkreationen inspiriert von weltbekannten Luxusmarken.
            </p>
            
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center border border-background/20 text-background/60 hover:text-background hover:border-background/50 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-[10px] tracking-[0.2em] uppercase text-background/40 mb-4">
              Shop
            </h4>
            <nav className="space-y-2.5">
              {shopLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block text-sm text-background/60 hover:text-background transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Service Links */}
          <div>
            <h4 className="text-[10px] tracking-[0.2em] uppercase text-background/40 mb-4">
              Service
            </h4>
            <nav className="space-y-2.5">
              {serviceLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block text-sm text-background/60 hover:text-background transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-[10px] tracking-[0.2em] uppercase text-background/40 mb-4">
              Rechtliches
            </h4>
            <nav className="space-y-2.5">
              {legalLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block text-sm text-background/60 hover:text-background transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-[10px] tracking-[0.2em] uppercase text-background/40 mb-4">
              Newsletter
            </h4>
            <p className="text-sm text-background/60 mb-4">
              Exklusive Angebote und Neuigkeiten.
            </p>
            <Link 
              to="/newsletter"
              className="inline-flex items-center text-sm text-background hover:text-accent transition-colors"
            >
              Jetzt anmelden
              <ArrowUpRight className="ml-1.5 w-3.5 h-3.5" strokeWidth={1.5} />
            </Link>
            
            {/* Contact Email */}
            <div className="mt-6 pt-4 border-t border-background/10">
              <a 
                href="mailto:support@aldenairperfumes.de"
                className="flex items-center gap-2 text-sm text-background/60 hover:text-background transition-colors"
              >
                <Mail className="w-3.5 h-3.5" strokeWidth={1.5} />
                E-Mail senden
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container-premium py-5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-background/40">
              © {currentYear} ALDENAIR. Alle Rechte vorbehalten.
            </p>
            <span className="text-xs text-background/40">
              Made with ♥ in Germany
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}