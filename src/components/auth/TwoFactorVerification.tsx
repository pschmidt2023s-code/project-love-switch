import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

interface TwoFactorVerificationProps {
  open: boolean;
  onClose: () => void;
  onVerified: () => void;
  challengeId: string;
}

export function TwoFactorVerification({ open, onClose, onVerified, challengeId }: TwoFactorVerificationProps) {
  // Placeholder - 2FA verification would require additional backend implementation
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-center">2FA Verifizierung</DialogTitle>
        </DialogHeader>
        <div className="text-center py-4">
          <p className="text-muted-foreground">
            2FA-Verifizierung ist derzeit nicht verfügbar.
          </p>
        </div>
        <Button onClick={onClose} className="w-full">
          Schließen
        </Button>
      </DialogContent>
    </Dialog>
  );
}
