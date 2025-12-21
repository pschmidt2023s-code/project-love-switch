import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="text-xl font-bold text-foreground">ALDENAIR</span>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Deine Premium-Destination für exquisite Parfüms.
            </p>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Shop</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Alle Produkte
                </Link>
              </li>
              <li>
                <Link to="/products?category=herren" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Herren
                </Link>
              </li>
              <li>
                <Link to="/products?category=50ml-bottles" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  50ml Bottles
                </Link>
              </li>
              <li>
                <Link to="/products?category=testerkits" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Testerkits
                </Link>
              </li>
            </ul>
          </div>

          {/* Service Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Service</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Kontakt
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Versand
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Rückgabe
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Rechtliches</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link to="/imprint" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Impressum
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  AGB
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} ALDENAIR. Alle Rechte vorbehalten.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-xs text-muted-foreground">
                Sichere Zahlung mit Stripe & PayPal
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
