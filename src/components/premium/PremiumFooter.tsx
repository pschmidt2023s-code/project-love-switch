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

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

// Payment method icons
function VisaIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 32" fill="none">
      <rect width="48" height="32" rx="4" fill="currentColor" opacity="0.1"/>
      <path d="M19.5 12l-2.5 8h-2.5l-1.5-6.4c-.1-.4-.2-.5-.5-.7-.5-.3-1.3-.5-2-.6l.1-.3h4c.5 0 1 .4 1.1.9l1 5.2 2.4-6.1h2.4zm9.5 0l-2 8h-2.3l2-8h2.3zm7.5 5.3c0-2.1-2.9-2.2-2.9-3.1 0-.3.3-.6.8-.7.7-.1 1.8 0 2.6.4l.5-2.1c-.6-.2-1.4-.4-2.3-.4-2.5 0-4.2 1.3-4.2 3.1 0 1.4 1.2 2.1 2.1 2.6.9.5 1.3.8 1.2 1.2 0 .7-.7 1-1.4 1-.8 0-1.7-.2-2.5-.6l-.5 2.2c.9.3 1.8.5 2.7.5 2.6 0 4.3-1.3 4.3-3.2l-.4.1zm6-5.3l-3.5 8h-2.5l2-7.7.5-.3h3.5z" fill="currentColor" opacity="0.5"/>
    </svg>
  );
}

function MastercardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 32" fill="none">
      <rect width="48" height="32" rx="4" fill="currentColor" opacity="0.1"/>
      <circle cx="19" cy="16" r="7" fill="currentColor" opacity="0.2"/>
      <circle cx="29" cy="16" r="7" fill="currentColor" opacity="0.15"/>
    </svg>
  );
}

function PayPalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 32" fill="none">
      <rect width="48" height="32" rx="4" fill="currentColor" opacity="0.1"/>
      <text x="12" y="20" fontSize="10" fill="currentColor" opacity="0.5" fontWeight="bold">PP</text>
    </svg>
  );
}

function KlarnaIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 32" fill="none">
      <rect width="48" height="32" rx="4" fill="currentColor" opacity="0.1"/>
      <text x="10" y="20" fontSize="9" fill="currentColor" opacity="0.5" fontWeight="bold">Klarna</text>
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
    { href: 'https://facebook.com/aldenair', label: 'Facebook', icon: FacebookIcon },
  ];

  return (
    <footer className="bg-background text-foreground border-t border-border">
      {/* Main Footer */}
      <div className="container-premium py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="inline-block mb-5">
              <span className="font-display text-xl tracking-[0.2em] text-foreground">
                ALDENAIR
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mb-6">
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
                  className="w-9 h-9 flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60 mb-4">
              Shop
            </h4>
            <nav className="space-y-2.5">
              {shopLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Service Links */}
          <div>
            <h4 className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60 mb-4">
              Service
            </h4>
            <nav className="space-y-2.5">
              {serviceLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60 mb-4">
              Rechtliches
            </h4>
            <nav className="space-y-2.5">
              {legalLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60 mb-4">
              Newsletter
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Exklusive Angebote und Neuigkeiten.
            </p>
            <Link 
              to="/newsletter"
              className="inline-flex items-center text-sm text-foreground hover:text-accent transition-colors"
            >
              Jetzt anmelden
              <ArrowUpRight className="ml-1.5 w-3.5 h-3.5" strokeWidth={1.5} />
            </Link>
            
            {/* Contact Email */}
            <div className="mt-6 pt-4 border-t border-border">
              <a 
                href="mailto:support@aldenairperfumes.de"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="w-3.5 h-3.5" strokeWidth={1.5} />
                E-Mail senden
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Payment & Trust Bar */}
      <div className="border-t border-border">
        <div className="container-premium py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground/50 mr-2">Zahlungsarten</span>
              <VisaIcon className="w-10 h-6" />
              <MastercardIcon className="w-10 h-6" />
              <PayPalIcon className="w-10 h-6" />
              <KlarnaIcon className="w-10 h-6" />
            </div>
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground/50 tracking-wider uppercase">
              <span className="flex items-center gap-1.5">🔒 SSL-verschlüsselt</span>
              <span>·</span>
              <span>🛡️ Käuferschutz</span>
              <span>·</span>
              <span>✓ Geprüfter Shop</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container-premium py-5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-muted-foreground">
              © {currentYear} ALDENAIR. Alle Rechte vorbehalten.
            </p>
            <span className="text-xs text-muted-foreground">
              Made with ♥ in Germany
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
