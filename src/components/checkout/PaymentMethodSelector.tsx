import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CreditCard, Shield, Lock, Banknote } from 'lucide-react';

interface PaymentMethodSelectorProps {
  value: 'stripe' | 'paypal' | 'bank_transfer';
  onChange: (value: 'stripe' | 'paypal' | 'bank_transfer') => void;
}

export function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">Zahlungsmethode</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup value={value} onValueChange={(v) => onChange(v as 'stripe' | 'paypal' | 'bank_transfer')}>
          {/* Stripe / Credit Card */}
          <div
            className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all ${
              value === 'stripe'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
            }`}
            onClick={() => onChange('stripe')}
          >
            <RadioGroupItem value="stripe" id="stripe" />
            <Label htmlFor="stripe" className="flex items-center gap-3 cursor-pointer flex-1">
              <div className="p-2 bg-muted rounded-lg">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Kreditkarte / Debitkarte</p>
                <p className="text-sm text-muted-foreground">
                  Visa, Mastercard, American Express
                </p>
              </div>
            </Label>
          </div>

          {/* PayPal */}
          <div
            className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all ${
              value === 'paypal'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
            }`}
            onClick={() => onChange('paypal')}
          >
            <RadioGroupItem value="paypal" id="paypal" />
            <Label htmlFor="paypal" className="flex items-center gap-3 cursor-pointer flex-1">
              <div className="p-2 bg-[#003087]/10 rounded-lg">
                <svg className="w-5 h-5 text-[#003087]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .756-.654h6.86c2.325 0 4.085.663 5.122 1.92.472.576.773 1.218.892 1.903.127.737.09 1.62-.107 2.624-.026.134-.053.269-.082.404l-.007.029v.097c-.413 2.158-1.358 3.665-2.806 4.478-1.39.78-3.16 1.176-5.262 1.176H8.43a.977.977 0 0 0-.966.824l-.71 4.502-.215 1.365a.507.507 0 0 1-.501.43h-.962z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium">PayPal</p>
                <p className="text-sm text-muted-foreground">
                  Sicher bezahlen mit PayPal-Konto
                </p>
              </div>
            </Label>
          </div>

          {/* Bank Transfer */}
          <div
            className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all ${
              value === 'bank_transfer'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
            }`}
            onClick={() => onChange('bank_transfer')}
          >
            <RadioGroupItem value="bank_transfer" id="bank_transfer" />
            <Label htmlFor="bank_transfer" className="flex items-center gap-3 cursor-pointer flex-1">
              <div className="p-2 bg-muted rounded-lg">
                <Banknote className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Überweisung</p>
                <p className="text-sm text-muted-foreground">
                  Banküberweisung nach Bestellung
                </p>
              </div>
            </Label>
          </div>
        </RadioGroup>

        {value === 'bank_transfer' && (
          <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
            Nach Abschluss der Bestellung erhältst du eine E-Mail mit unseren Bankdaten. 
            Der Versand erfolgt nach Zahlungseingang (1-2 Werktage).
          </div>
        )}

        {/* Security badges */}
        <div className="flex items-center justify-center gap-4 pt-4 border-t">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="w-3 h-3" />
            <span>SSL verschlüsselt</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Shield className="w-3 h-3" />
            <span>Sichere Zahlung</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}