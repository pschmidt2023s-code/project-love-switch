import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

interface TwoFactorSetupProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function TwoFactorSetup({ open, onClose, onComplete }: TwoFactorSetupProps) {
  // Placeholder - 2FA setup would require additional backend implementation
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Zwei-Faktor-Authentifizierung</DialogTitle>
        </DialogHeader>
        <div className="text-center py-4">
          <p className="text-muted-foreground">
            2FA-Setup ist derzeit nicht verfügbar.
          </p>
        </div>
        <Button onClick={onClose} className="w-full">
          Schließen
        </Button>
      </DialogContent>
    </Dialog>
  );
}
