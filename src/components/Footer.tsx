import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t border-border mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <span className="text-xl font-bold text-foreground">ALDENAIR</span>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Deine Premium-Destination für exquisite Parfüms und Düfte. Hochwertige Duftkreationen inspiriert von weltbekannten Luxusmarken.
            </p>
          </div>

          {/* Shop Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Shop</h3>
            <div className="space-y-2">
              <Link to="/products" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Alle Produkte
              </Link>
              <Link to="/products?category=herren" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Herren
              </Link>
              <Link to="/products?category=damen" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Damen
              </Link>
              <Link to="/products?category=unisex" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Unisex
              </Link>
            </div>
          </div>

          {/* Info Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Informationen</h3>
            <div className="space-y-2">
              <Link to="/about" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Über uns
              </Link>
              <Link to="/contact" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Kontakt
              </Link>
              <Link to="/shipping" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Versand
              </Link>
              <Link to="/returns" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Rückgabe
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Kontakt</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 text-primary" />
                <span>info@aldenair.de</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 text-primary" />
                <span>+49 123 456 789</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Deutschland</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} ALDENAIR. Alle Rechte vorbehalten.
            </p>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Datenschutz
              </Link>
              <Link to="/imprint" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Impressum
              </Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                AGB
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
