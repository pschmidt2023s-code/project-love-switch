import { Link } from 'react-router-dom';
import { PremiumPageLayout } from '@/components/premium/PremiumPageLayout';
import { XCircle, ArrowRight } from 'lucide-react';

const CheckoutCancel = () => {
  return (
    <PremiumPageLayout>
      <section className="section-spacing">
        <div className="container-premium max-w-lg mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-destructive/10">
            <XCircle className="w-10 h-10 text-destructive" strokeWidth={1.5} />
          </div>

          <h1 className="font-display text-3xl text-foreground mb-4">Zahlung abgebrochen</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Die Zahlung wurde abgebrochen. Dein Warenkorb ist noch gespeichert.
            Du kannst den Bestellvorgang jederzeit erneut starten.
          </p>

          <div className="space-y-3">
            <Link
              to="/cart"
              className="flex items-center justify-center w-full py-4 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors"
            >
              Zurück zum Warenkorb
              <ArrowRight className="ml-2 w-4 h-4" strokeWidth={1.5} />
            </Link>
            <Link
              to="/"
              className="flex items-center justify-center w-full py-4 border border-border text-foreground text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-muted transition-colors"
            >
              Zur Startseite
            </Link>
          </div>
        </div>
      </section>
    </PremiumPageLayout>
  );
};

export default CheckoutCancel;