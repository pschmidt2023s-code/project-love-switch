import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Lock, User, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PremiumPageLayout } from '@/components/premium/PremiumPageLayout';
import { toast } from 'sonner';
import { validateEmail, validatePasswordStrength } from '@/lib/validation';
import { authRateLimiter } from '@/lib/rate-limiter';
import heroBg from '@/assets/hero-bg.jpg';

export default function Auth() {
  const { user, signIn, signUp, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const clientId = `auth-signin-${email}`;
    if (!authRateLimiter.isAllowed(clientId)) {
      const remainingTime = Math.ceil(authRateLimiter.getBlockTimeRemaining(clientId) / 1000 / 60);
      toast.error(`Zu viele Versuche. Bitte warten Sie ${remainingTime} Minuten.`);
      return;
    }
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) { toast.error(emailValidation.message || 'Ungültige E-Mail'); return; }
    if (!password) { toast.error('Bitte geben Sie Ihr Passwort ein.'); return; }
    setIsSubmitting(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message.includes('Invalid login credentials') ? 'Ungültige Anmeldedaten' : error.message);
      } else {
        toast.success('Erfolgreich angemeldet');
        navigate('/');
      }
    } catch { toast.error('Ein unerwarteter Fehler ist aufgetreten.'); }
    finally { setIsSubmitting(false); }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const clientId = `auth-signup-${email}`;
    if (!authRateLimiter.isAllowed(clientId)) {
      const remainingTime = Math.ceil(authRateLimiter.getBlockTimeRemaining(clientId) / 1000 / 60);
      toast.error(`Zu viele Versuche. Bitte warten Sie ${remainingTime} Minuten.`);
      return;
    }
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) { toast.error(emailValidation.message || 'Ungültige E-Mail'); return; }
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) { toast.error(passwordValidation.message || 'Passwort zu schwach'); return; }
    if (password !== confirmPassword) { toast.error('Passwörter stimmen nicht überein.'); return; }
    if (!fullName.trim()) { toast.error('Bitte geben Sie Ihren Namen ein.'); return; }

    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    setIsSubmitting(true);
    try {
      const { error } = await signUp(email, password, { first_name: firstName, last_name: lastName });
      if (error) {
        toast.error(error.message.includes('already registered') ? 'Diese E-Mail ist bereits registriert' : error.message);
      } else {
        toast.success('Registrierung erfolgreich! Willkommen bei ALDENAIR.');
        navigate('/');
      }
    } catch { toast.error('Ein unerwarteter Fehler ist aufgetreten.'); }
    finally { setIsSubmitting(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <PremiumPageLayout>
    <div className="grid lg:grid-cols-2 min-h-[70vh]">
      {/* Left: Brand panel with background image */}
      <div className="hidden lg:flex flex-col justify-center items-center relative overflow-hidden">
        <img src={heroBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 max-w-sm text-center space-y-6 p-12 lg:p-16">
          <h2 className="font-display text-4xl xl:text-5xl leading-[0.95] text-white">ALDENAIR</h2>
          <p className="text-white/50 text-sm leading-relaxed">
            Erstellen Sie ein Konto, um exklusive Düfte zu entdecken, 
            5% Cashback zu sammeln und Ihre Bestellungen zu verwalten.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
            <div className="text-center">
              <div className="font-display text-xl text-white">5%</div>
              <div className="text-[9px] tracking-[0.1em] uppercase text-white/40">Cashback</div>
            </div>
            <div className="text-center">
              <div className="font-display text-xl text-white">14</div>
              <div className="text-[9px] tracking-[0.1em] uppercase text-white/40">Tage Rückgabe</div>
            </div>
            <div className="text-center">
              <div className="font-display text-xl text-white">50€</div>
              <div className="text-[9px] tracking-[0.1em] uppercase text-white/40">Gratis Versand</div>
            </div>
          </div>

          {/* Trust indicator */}
          <div className="flex items-center justify-center gap-2 pt-4">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-[10px] tracking-wider uppercase text-white/40">Premium seit 2024</span>
          </div>
        </div>
      </div>
      
      {/* Right: Form */}
      <div className="flex items-center justify-center p-6 lg:p-12">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Zurück zum Shop
          </Link>
          <h1 className="font-display text-3xl text-foreground mb-2">
            {activeTab === 'signin' ? 'Willkommen zurück' : 'Konto erstellen'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {activeTab === 'signin' ? 'Melden Sie sich mit Ihren Zugangsdaten an.' : 'Erstellen Sie Ihr persönliches ALDENAIR Konto.'}
          </p>
        </div>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'signin' | 'signup')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Anmelden</TabsTrigger>
                <TabsTrigger value="signup">Registrieren</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">E-Mail-Adresse</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="signin-email" type="email" placeholder="ihre@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" disabled={isSubmitting} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Passwort</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="signin-password" type="password" placeholder="Ihr Passwort" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" disabled={isSubmitting} required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting || !email || !password}>
                    {isSubmitting ? "Anmelden..." : (<>Anmelden<ArrowRight className="ml-2 h-4 w-4" /></>)}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Vollständiger Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="signup-name" type="text" placeholder="Max Mustermann" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10" disabled={isSubmitting} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">E-Mail-Adresse</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="signup-email" type="email" placeholder="ihre@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" disabled={isSubmitting} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Passwort</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="signup-password" type="password" placeholder="Sicheres Passwort" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" disabled={isSubmitting} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Passwort bestätigen</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="confirm-password" type="password" placeholder="Passwort wiederholen" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10" disabled={isSubmitting} required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting || !email || !password || !confirmPassword || !fullName}>
                    {isSubmitting ? "Registrieren..." : (<>Konto erstellen<ArrowRight className="ml-2 h-4 w-4" /></>)}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <p className="text-xs text-center text-muted-foreground mt-4">
              Mit der Anmeldung stimmen Sie unseren{' '}
              <Link to="/terms" className="text-primary hover:underline">Nutzungsbedingungen</Link>{' '}und{' '}
              <Link to="/privacy" className="text-primary hover:underline">Datenschutzrichtlinien</Link>{' '}zu.
            </p>
      </div>
      </div>
    </div>
    </PremiumPageLayout>
  );
}
