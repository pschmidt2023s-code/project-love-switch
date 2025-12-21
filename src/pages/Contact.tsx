import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const contactInfo = [
  { icon: Mail, label: 'E-Mail', value: 'info@aldenair.de' },
  { icon: Phone, label: 'Telefon', value: '+49 123 456 789' },
  { icon: MapPin, label: 'Standort', value: 'Deutschland' },
  { icon: Clock, label: 'Erreichbarkeit', value: 'Mo-Fr 9-18 Uhr' },
];

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Nachricht gesendet',
      description: 'Wir werden uns so schnell wie möglich bei Ihnen melden.',
    });
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-6xl mx-auto px-4 lg:px-8 py-12 lg:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Kontakt
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Haben Sie Fragen zu unseren Produkten oder Ihrer Bestellung? 
            Wir sind gerne für Sie da.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <Card className="lg:col-span-1 border-border/50">
            <CardHeader>
              <CardTitle>Kontaktdaten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {contactInfo.map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="font-medium text-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Contact Form */}
          <Card className="lg:col-span-2 border-border/50">
            <CardHeader>
              <CardTitle>Nachricht senden</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ihr Name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-Mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="ihre@email.de"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Betreff</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Worum geht es?"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Nachricht</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Ihre Nachricht..."
                    rows={5}
                    required
                  />
                </div>
                <Button type="submit" className="w-full sm:w-auto">
                  Nachricht senden
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
