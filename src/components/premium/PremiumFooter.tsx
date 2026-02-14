import { Link } from 'react-router-dom';
import { Mail, ArrowUpRight, Lock, ShieldCheck, BadgeCheck } from 'lucide-react';

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

// Payment method badge component
function PaymentBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-8 px-3 flex items-center justify-center bg-muted border border-border text-muted-foreground text-[10px] font-bold tracking-wider select-none">
      {children}
    </div>
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mr-1">Zahlungsarten</span>
              <PaymentBadge>VISA</PaymentBadge>
              <PaymentBadge>MC</PaymentBadge>
              <PaymentBadge>PayPal</PaymentBadge>
              <PaymentBadge>Klarna</PaymentBadge>
              <PaymentBadge>Überw.</PaymentBadge>
            </div>
            <div className="flex items-center gap-5 text-[10px] text-muted-foreground tracking-[0.1em] uppercase">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                SSL-verschlüsselt
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                Käuferschutz
              </span>
              <span className="flex items-center gap-1.5">
                <BadgeCheck className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                Geprüfter Shop
              </span>
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
