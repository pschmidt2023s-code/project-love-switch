import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Send, User, Clock } from 'lucide-react';

interface ChatSession {
  id: string;
  visitor_name: string | null;
  visitor_email: string | null;
  status: string | null;
  last_message: string | null;
  unread_count: number | null;
  created_at: string | null;
  updated_at: string | null;
}

interface ChatMessage {
  id: string;
  session_id: string | null;
  sender: string;
  content: string;
  created_at: string | null;
}

export default function LiveChatManagement() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      loadMessages(selectedSession.id);
    }
  }, [selectedSession]);

  const loadSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedSession) return;

    try {
      const { error } = await supabase.from('chat_messages').insert({
        session_id: selectedSession.id,
        sender: 'admin',
        content: newMessage,
      });

      if (error) throw error;

      await supabase
        .from('chat_sessions')
        .update({ 
          last_message: newMessage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedSession.id);

      setNewMessage('');
      loadMessages(selectedSession.id);
    } catch (error) {
      toast({ title: 'Fehler', description: 'Nachricht konnte nicht gesendet werden', variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Aktiv</Badge>;
      case 'closed':
        return <Badge variant="secondary">Geschlossen</Badge>;
      case 'waiting':
      default:
        return <Badge variant="outline">Wartend</Badge>;
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8">Laden...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Live Chat</h2>
        <p className="text-muted-foreground">{sessions.length} Chat-Sitzungen</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        <Card className="lg:col-span-1">
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Keine Chat-Sitzungen</p>
                </div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-4 border-b cursor-pointer transition-colors ${
                      selectedSession?.id === session.id ? 'bg-primary/10' : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedSession(session)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {session.visitor_name || 'Besucher'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {session.visitor_email || 'Keine E-Mail'}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(session.status)}
                    </div>
                    {session.last_message && (
                      <p className="text-sm text-muted-foreground mt-2 truncate">
                        {session.last_message}
                      </p>
                    )}
                    {session.unread_count && session.unread_count > 0 && (
                      <Badge variant="default" className="mt-2">
                        {session.unread_count} neu
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="p-0 h-full flex flex-col">
            {selectedSession ? (
              <>
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">{selectedSession.visitor_name || 'Besucher'}</p>
                      <p className="text-xs text-muted-foreground">{selectedSession.visitor_email}</p>
                    </div>
                  </div>
                  {getStatusBadge(selectedSession.status)}
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.sender === 'admin'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.created_at 
                              ? new Date(message.created_at).toLocaleTimeString('de-DE', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })
                              : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="p-4 border-t flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Nachricht eingeben..."
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <Button onClick={sendMessage}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Wählen Sie eine Chat-Sitzung aus</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
