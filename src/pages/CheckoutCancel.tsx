import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

const CheckoutCancel = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-md mx-auto text-center">
          <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          
          <h1 className="text-3xl font-bold mb-4">Zahlung abgebrochen</h1>
          
          <p className="text-muted-foreground mb-8">
            Die Zahlung wurde abgebrochen. Ihr Warenkorb ist noch gespeichert.
            Sie können den Bestellvorgang jederzeit erneut starten.
          </p>

          <div className="space-y-4">
            <Button asChild className="w-full">
              <Link to="/cart">Zurück zum Warenkorb</Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link to="/">Zur Startseite</Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutCancel;
