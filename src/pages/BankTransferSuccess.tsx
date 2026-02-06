import { useLocation, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Copy, Banknote, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';
import { useEffect } from 'react';

interface BankDetails {
  account_holder: string;
  iban: string;
  bic: string;
  bank_name: string;
  reference: string;
}

const BankTransferSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  
  const state = location.state as {
    bank_details: BankDetails;
    total: string;
    currency: string;
  } | null;

  useEffect(() => {
    // Clear cart after showing bank details
    if (state?.bank_details) {
      clearCart();
    }
  }, [state, clearCart]);

  if (!state?.bank_details) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-bold mb-4">Keine Überweisungsdaten gefunden</h1>
          <Button onClick={() => navigate('/products')}>Zurück zum Shop</Button>
        </main>
        <Footer />
      </div>
    );
  }

  const { bank_details, total, currency } = state;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} kopiert!`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/products')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück zum Shop
        </Button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 mb-4">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Bestellung erfolgreich!</h1>
          <p className="text-muted-foreground">
            Bitte überweise den Betrag mit den unten stehenden Daten.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Banknote className="w-5 h-5 text-primary" />
              <CardTitle>Überweisungsdaten</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Empfänger</p>
                  <p className="font-medium">{bank_details.account_holder}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(bank_details.account_holder, 'Empfänger')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">IBAN</p>
                  <p className="font-medium font-mono">{bank_details.iban}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(bank_details.iban.replace(/\s/g, ''), 'IBAN')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">BIC</p>
                  <p className="font-medium font-mono">{bank_details.bic}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(bank_details.bic, 'BIC')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Bank</p>
                  <p className="font-medium">{bank_details.bank_name}</p>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Verwendungszweck</p>
                  <p className="font-bold font-mono text-primary">{bank_details.reference}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(bank_details.reference, 'Verwendungszweck')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex justify-between items-center p-3 bg-success/10 border border-success/20 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Betrag</p>
                  <p className="font-bold text-xl text-success">{total} {currency}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(total, 'Betrag')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
          <p className="font-medium mb-2">Wichtige Hinweise:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Bitte gib unbedingt den <strong>Verwendungszweck</strong> an</li>
            <li>Der Versand erfolgt nach Zahlungseingang (1-2 Werktage)</li>
            <li>Du erhältst eine Bestätigungs-E-Mail sobald deine Zahlung eingegangen ist</li>
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BankTransferSuccess;
