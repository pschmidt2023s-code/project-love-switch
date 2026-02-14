import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { User, UserPlus, AlertCircle, Mail, ArrowLeft } from 'lucide-react';
import { validatePasswordStrength, validateEmail } from '@/lib/validation';
import { authRateLimiter } from '@/lib/security';
import { lovable } from '@/integrations/lovable/index';
import { Separator } from '@/components/ui/separator';

interface AuthModalProps {
  children: React.ReactNode;
}

export function AuthModal({ children }: AuthModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
  const [passwordError, setPasswordError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    const clientId = `auth-signin-${email.trim().toLowerCase()}`;
    if (!authRateLimiter.isAllowed(clientId)) {
      toast({
        title: "Zu viele Anmeldeversuche",
        description: "Bitte warten Sie 15 Minuten, bevor Sie es erneut versuchen.",
        variant: "destructive",
      });
      return;
    }

    const emailValidation = validateEmail(email.trim());
    if (!emailValidation.isValid) {
      toast({
        title: "Ungültige E-Mail",
        description: emailValidation.message || "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
        variant: "destructive",
      });
      return;
    }

    if (!password || password.length < 6) {
      toast({
        title: "Passwort erforderlich",
        description: "Bitte geben Sie Ihr Passwort ein (mindestens 6 Zeichen).",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await signIn(email.trim(), password);

    if (error) {
      toast({
        title: "Anmeldung fehlgeschlagen",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Erfolgreich angemeldet",
        description: "Willkommen zurück!",
      });
      setOpen(false);
      resetForm();
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    const clientId = `auth-signup-${email.trim().toLowerCase()}`;
    if (!authRateLimiter.isAllowed(clientId)) {
      toast({
        title: "Zu viele Registrierungsversuche",
        description: "Bitte warten Sie 15 Minuten, bevor Sie es erneut versuchen.",
        variant: "destructive",
      });
      return;
    }

    const emailValidation = validateEmail(email.trim());
    if (!emailValidation.isValid) {
      toast({
        title: "Ungültige E-Mail",
        description: emailValidation.message || "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
        variant: "destructive",
      });
      return;
    }

    if (!fullName.trim() || fullName.length < 2) {
      toast({
        title: "Name erforderlich",
        description: "Bitte geben Sie Ihren vollständigen Namen ein (mindestens 2 Zeichen).",
        variant: "destructive",
      });
      return;
    }

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.message || 'Passwort ist zu schwach');
      return;
    }

    setLoading(true);
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    const { error } = await signUp(email.trim(), password, { first_name: firstName, last_name: lastName });

    if (error) {
      toast({
        title: "Registrierung fehlgeschlagen",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Registrierung erfolgreich",
        description: "Willkommen bei ALDENAIR!",
      });
      setOpen(false);
      resetForm();
    }
    setLoading(false);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setPasswordError('');
    setPasswordStrength('weak');
    setShowForgotPassword(false);
    setResetEmailSent(false);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordError('');
    const validation = validatePasswordStrength(value);
    setPasswordStrength(validation.strength);
    if (!validation.isValid && value.length > 0) {
      setPasswordError(validation.message || '');
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'strong': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      default: return 'text-red-600';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />

          <div className="relative p-6 pb-4">
            <DialogHeader className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-2">
                <User className="w-6 h-6 text-primary" />
              </div>
              <DialogTitle className="text-xl font-semibold">Willkommen bei ALDENAIR</DialogTitle>
              <p className="text-sm text-muted-foreground">Melden Sie sich an oder erstellen Sie ein Konto</p>
            </DialogHeader>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-muted/50">
                <TabsTrigger value="login" className="flex items-center justify-center gap-2 h-10 text-sm font-medium">
                  <User className="w-4 h-4" />
                  <span>Anmelden</span>
                </TabsTrigger>
                <TabsTrigger value="register" className="flex items-center justify-center gap-2 h-10 text-sm font-medium">
                  <UserPlus className="w-4 h-4" />
                  <span>Registrieren</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="login" className="mt-0 p-6 pt-6">
              {showForgotPassword ? (
                <div className="space-y-5">
                  {resetEmailSent ? (
                    <div className="text-center space-y-4">
                      <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                        <Mail className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">E-Mail gesendet!</h3>
                        <p className="text-sm text-muted-foreground">
                          Wir haben Ihnen eine E-Mail mit einem Link zum Zurücksetzen Ihres Passworts gesendet.
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          setShowForgotPassword(false);
                          setResetEmailSent(false);
                        }}
                      >
                        Zurück zur Anmeldung
                      </Button>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(false)}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Zurück
                      </button>
                      <div className="text-center">
                        <h3 className="font-semibold text-foreground mb-2">Passwort vergessen?</h3>
                        <p className="text-sm text-muted-foreground">
                          Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen.
                        </p>
                      </div>
                      <form 
                        onSubmit={async (e) => {
                          e.preventDefault();
                          const emailValidation = validateEmail(email.trim());
                          if (!emailValidation.isValid) {
                            toast({
                              title: "Ungültige E-Mail",
                              description: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
                              variant: "destructive",
                            });
                            return;
                          }
                          setLoading(true);
                          try {
                            const { supabase } = await import('@/integrations/supabase/client');
                            const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                              redirectTo: `${window.location.origin}/auth?type=recovery`,
                            });
                            if (error) throw error;
                            setResetEmailSent(true);
                          } catch (error: any) {
                            toast({
                              title: "Fehler",
                              description: error.message || "E-Mail konnte nicht gesendet werden.",
                              variant: "destructive",
                            });
                          } finally {
                            setLoading(false);
                          }
                        }}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="reset-email" className="text-sm font-medium">E-Mail</Label>
                          <Input
                            id="reset-email"
                            type="email"
                            placeholder="ihre@email.de"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="h-11"
                          />
                        </div>
                        <Button type="submit" className="w-full h-11" disabled={loading}>
                          {loading ? 'Senden...' : 'Link senden'}
                        </Button>
                      </form>
                    </>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSignIn} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm font-medium">E-Mail</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="ihre@email.de"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password" className="text-sm font-medium">Passwort</Label>
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-xs text-primary hover:underline"
                      >
                        Passwort vergessen?
                      </button>
                    </div>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Ihr Passwort"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 text-base font-medium" disabled={loading}>
                    {loading ? 'Anmelden...' : 'Anmelden'}
                  </Button>

                  <div className="relative">
                    <Separator />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground">oder</span>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 gap-2"
                    disabled={loading}
                    onClick={async () => {
                      setLoading(true);
                      const { error } = await lovable.auth.signInWithOAuth("google", {
                        redirect_uri: window.location.origin,
                      });
                      if (error) {
                        toast({ title: "Google-Anmeldung fehlgeschlagen", description: String(error), variant: "destructive" });
                      }
                      setLoading(false);
                    }}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Mit Google anmelden
                  </Button>
                </form>
              )}
            </TabsContent>

            <TabsContent value="register" className="mt-0 p-6 pt-6">
              <form onSubmit={handleSignUp} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="register-name" className="text-sm font-medium">Vollständiger Name</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Max Mustermann"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-sm font-medium">E-Mail</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="ihre@email.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-sm font-medium">Passwort</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Mindestens 8 Zeichen"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    required
                    minLength={8}
                    className="h-11"
                  />
                  {password && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              passwordStrength === 'strong' ? 'w-full bg-green-500' :
                              passwordStrength === 'medium' ? 'w-2/3 bg-yellow-500' :
                              'w-1/3 bg-red-500'
                            }`}
                          />
                        </div>
                        <span className={`text-xs font-medium ${getPasswordStrengthColor()}`}>
                          {passwordStrength === 'strong' ? 'Stark' : passwordStrength === 'medium' ? 'Mittel' : 'Schwach'}
                        </span>
                      </div>
                      {passwordError && (
                        <div className="flex items-start gap-1.5 text-xs text-destructive">
                          <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                          <span>{passwordError}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <Button type="submit" className="w-full h-11 text-base font-medium" disabled={loading}>
                  {loading ? 'Registrieren...' : 'Konto erstellen'}
                </Button>

                <div className="relative">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground">oder</span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 gap-2"
                  disabled={loading}
                  onClick={async () => {
                    setLoading(true);
                    const { error } = await lovable.auth.signInWithOAuth("google", {
                      redirect_uri: window.location.origin,
                    });
                    if (error) {
                      toast({ title: "Google-Anmeldung fehlgeschlagen", description: String(error), variant: "destructive" });
                    }
                    setLoading(false);
                  }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Mit Google registrieren
                </Button>

                <p className="text-xs text-center text-muted-foreground pt-2">
                  Mit der Registrierung stimmen Sie unseren{' '}
                  <a href="/terms" className="text-primary hover:underline">AGB</a>
                  {' '}und{' '}
                  <a href="/privacy" className="text-primary hover:underline">Datenschutzrichtlinien</a>
                  {' '}zu.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
