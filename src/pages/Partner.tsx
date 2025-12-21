import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Users,
  Euro,
  Copy,
  Check,
  TrendingUp,
  Share2,
  ArrowLeft
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { AuthModal } from '@/components/AuthModal';

interface Partner {
  id: string;
  partner_code: string;
  status: string;
  commission_rate: number;
  total_sales: number;
  total_commission: number;
  total_paid_out: number;
}

export default function Partner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [applicationData, setApplicationData] = useState({
    first_name: '',
    last_name: '',
    motivation: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      loadPartnerData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadPartnerData = async () => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      setPartner(data);
    } catch (error) {
      console.error('Error loading partner data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (partner?.partner_code) {
      navigator.clipboard.writeText(partner.partner_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Code kopiert!",
        description: "Dein Partner-Code wurde in die Zwischenablage kopiert.",
      });
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      const partnerCode = `ALD${Date.now().toString(36).toUpperCase()}`;
      
      const { error } = await supabase
        .from('partners')
        .insert({
          user_id: user.id,
          partner_code: partnerCode,
          status: 'pending',
          application_data: applicationData
        });

      if (error) throw error;

      toast({
        title: "Bewerbung eingereicht!",
        description: "Wir werden deine Bewerbung prüfen und uns bei dir melden.",
      });
      
      loadPartnerData();
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Fehler",
        description: "Ein Fehler ist aufgetreten. Bitte versuche es später erneut.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-background pb-20 md:pb-0">
          <div className="container mx-auto px-4 py-16 text-center">
            <Users className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-4">Partner-Programm</h1>
            <p className="text-muted-foreground mb-8">
              Melde dich an, um Partner zu werden und bis zu 10% Provision zu verdienen.
            </p>
            <AuthModal>
              <Button size="lg">Jetzt anmelden</Button>
            </AuthModal>
          </div>
        </div>
        <Footer />
        <MobileBottomNav />
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="mb-8"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>

            <h1 className="text-3xl font-bold mb-8">Partner-Programm</h1>

            {loading ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                </CardContent>
              </Card>
            ) : partner ? (
              <div className="space-y-6">
                {/* Status Card */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold">Partner-Status</h2>
                        <p className="text-muted-foreground">Code: {partner.partner_code}</p>
                      </div>
                      <Badge variant={partner.status === 'approved' ? 'default' : 'secondary'}>
                        {partner.status === 'approved' ? 'Aktiv' : 
                         partner.status === 'pending' ? 'Ausstehend' : partner.status}
                      </Badge>
                    </div>
                    {partner.status === 'approved' && (
                      <Button onClick={handleCopyCode} className="mt-4" variant="outline">
                        {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                        {copied ? 'Kopiert!' : 'Code kopieren'}
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Stats Cards */}
                {partner.status === 'approved' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Umsatz</p>
                            <p className="text-2xl font-bold">{partner.total_sales?.toFixed(2) || '0.00'} €</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                            <Euro className="w-6 h-6 text-green-500" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Verdient</p>
                            <p className="text-2xl font-bold">{partner.total_commission?.toFixed(2) || '0.00'} €</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <Share2 className="w-6 h-6 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Provision</p>
                            <p className="text-2xl font-bold">{partner.commission_rate || 5}%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Partner werden</CardTitle>
                  <CardDescription>
                    Verdiene bis zu 10% Provision auf alle Verkäufe, die über deinen Partner-Link getätigt werden.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleApply} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Vorname</Label>
                        <Input
                          value={applicationData.first_name}
                          onChange={(e) => setApplicationData({ ...applicationData, first_name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label>Nachname</Label>
                        <Input
                          value={applicationData.last_name}
                          onChange={(e) => setApplicationData({ ...applicationData, last_name: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Warum möchtest du Partner werden?</Label>
                      <Textarea
                        value={applicationData.motivation}
                        onChange={(e) => setApplicationData({ ...applicationData, motivation: e.target.value })}
                        placeholder="Erzähle uns etwas über dich und warum du ALDENAIR bewerben möchtest..."
                        rows={4}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting ? 'Wird eingereicht...' : 'Bewerbung einreichen'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      <Footer />
      <MobileBottomNav />
    </>
  );
}
