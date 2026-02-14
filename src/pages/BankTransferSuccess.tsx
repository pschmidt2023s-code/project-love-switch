import { useLocation, useNavigate } from 'react-router-dom';
import { PremiumPageLayout } from '@/components/premium/PremiumPageLayout';
import { CheckCircle, Copy, Banknote, ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';
import { useEffect, useRef } from 'react';

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
  const hasCleared = useRef(false);
  
  const state = location.state as {
    bank_details: BankDetails;
    total: string;
    currency: string;
  } | null;

  useEffect(() => {
    if (state?.bank_details && !hasCleared.current) {
      hasCleared.current = true;
      clearCart();
    }
  }, [state?.bank_details, clearCart]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} kopiert!`);
  };

  if (!state?.bank_details) {
    return (
      <PremiumPageLayout>
        <section className="section-spacing">
          <div className="container-premium text-center max-w-md mx-auto">
            <h1 className="font-display text-2xl text-foreground mb-4">Keine Überweisungsdaten gefunden</h1>
            <button
              onClick={() => navigate('/products')}
              className="inline-flex items-center px-8 py-4 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-foreground/90 transition-colors"
            >
              Zurück zum Shop
              <ArrowRight className="ml-2 w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </section>
      </PremiumPageLayout>
    );
  }

  const { bank_details, total, currency } = state;

  return (
    <PremiumPageLayout>
      {/* Header */}
      <section className="border-b border-border">
        <div className="container-premium py-8 lg:py-12">
          <button
            onClick={() => navigate('/products')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            Zurück zum Shop
          </button>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 flex items-center justify-center bg-accent/10">
              <CheckCircle className="w-6 h-6 text-accent" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="font-display text-2xl text-foreground">Bestellung erfolgreich!</h1>
              <p className="text-sm text-muted-foreground">Bitte überweise den Betrag mit den unten stehenden Daten.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="container-premium max-w-2xl mx-auto">
          {/* Bank Details */}
          <div className="border border-border mb-6">
            <div className="p-5 border-b border-border flex items-center gap-3">
              <Banknote className="w-5 h-5 text-accent" strokeWidth={1.5} />
              <h2 className="text-[10px] tracking-[0.2em] uppercase text-accent font-medium">Überweisungsdaten</h2>
            </div>
            <div className="divide-y divide-border">
              {[
                { label: 'Empfänger', value: bank_details.account_holder, copyVal: bank_details.account_holder },
                { label: 'IBAN', value: bank_details.iban, copyVal: bank_details.iban.replace(/\s/g, ''), mono: true },
                { label: 'BIC', value: bank_details.bic, copyVal: bank_details.bic, mono: true },
                { label: 'Bank', value: bank_details.bank_name },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground mb-1">{item.label}</p>
                    <p className={`text-sm font-medium text-foreground ${item.mono ? 'font-mono' : ''}`}>{item.value}</p>
                  </div>
                  {item.copyVal && (
                    <button onClick={() => copyToClipboard(item.copyVal!, item.label)} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                      <Copy className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  )}
                </div>
              ))}

              {/* Reference - highlighted */}
              <div className="flex items-center justify-between p-5 bg-accent/5">
                <div>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground mb-1">Verwendungszweck</p>
                  <p className="text-sm font-bold font-mono text-accent">{bank_details.reference}</p>
                </div>
                <button onClick={() => copyToClipboard(bank_details.reference, 'Verwendungszweck')} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                  <Copy className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>

              {/* Amount */}
              <div className="flex items-center justify-between p-5 bg-accent/10">
                <div>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground mb-1">Betrag</p>
                  <p className="font-display text-xl text-accent font-bold">{total} {currency}</p>
                </div>
                <button onClick={() => copyToClipboard(total, 'Betrag')} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                  <Copy className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="p-5 border border-border text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-2">Wichtige Hinweise:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Bitte gib unbedingt den <strong className="text-foreground">Verwendungszweck</strong> an</li>
              <li>Der Versand erfolgt nach Zahlungseingang (1-2 Werktage)</li>
              <li>Du erhältst eine Bestätigung sobald deine Zahlung eingegangen ist</li>
            </ul>
          </div>
        </div>
      </section>
    </PremiumPageLayout>
  );
};

export default BankTransferSuccess;