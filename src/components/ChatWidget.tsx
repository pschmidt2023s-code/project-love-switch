import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `Du bist der ALDENAIR Duftberater – ein freundlicher und kompetenter Kundenservice-Chatbot für den Premium-Parfüm-Shop ALDENAIR. 

Deine Aufgaben:
- Hilf Kunden bei der Duftauswahl basierend auf ihren Vorlieben
- Beantworte Fragen zu Produkten, Versand, Retouren und Bestellungen
- Gib Tipps zur Parfüm-Anwendung und -Aufbewahrung
- Sei stets höflich, professionell und hilfreich

Wichtige Infos:
- Kostenloser Versand ab 50€
- 14 Tage Rückgaberecht
- Made in Germany
- Düfte inspiriert von Luxusmarken zu fairen Preisen
- Bei komplexen Problemen verweise auf das Kontaktformular unter /contact

Antworte immer auf Deutsch, kurz und prägnant (max 2-3 Sätze).`;

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Willkommen bei ALDENAIR! 👋 Wie kann ich dir bei der Duftauswahl helfen?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-recommendations', {
        body: {
          type: 'chat',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.filter(m => m.id !== 'welcome').map(m => ({
              role: m.role,
              content: m.content,
            })),
            { role: 'user', content: userMessage.content },
          ],
        },
      });

      const assistantContent = data?.response || data?.recommendations || 
        'Entschuldigung, ich kann gerade nicht antworten. Bitte kontaktiere uns über das Kontaktformular.';

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: typeof assistantContent === 'string' ? assistantContent : 'Ich helfe dir gerne weiter! Beschreibe mir, welche Art von Duft du suchst.',
        },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Entschuldigung, es gab ein technisches Problem. Bitte versuche es erneut oder kontaktiere uns unter /contact.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 w-14 h-14 bg-foreground text-background flex items-center justify-center shadow-lg hover:bg-foreground/90 transition-colors"
            aria-label="Chat öffnen"
          >
            <MessageCircle className="w-6 h-6" strokeWidth={1.5} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-8rem)] bg-card border border-border shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-foreground text-background">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-background/20 flex items-center justify-center">
                  <Bot className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-medium">ALDENAIR Duftberater</p>
                  <p className="text-[10px] opacity-70">Online • Antwortet sofort</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:opacity-70 transition-opacity"
                aria-label="Chat schließen"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 bg-accent/10 flex-shrink-0 flex items-center justify-center mt-0.5">
                      <Bot className="w-4 h-4 text-accent" strokeWidth={1.5} />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-3 py-2 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-foreground text-background'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 bg-muted flex-shrink-0 flex items-center justify-center mt-0.5">
                      <User className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 bg-accent/10 flex-shrink-0 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-accent" strokeWidth={1.5} />
                  </div>
                  <div className="bg-muted px-3 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border p-3">
              <form
                onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                className="flex gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Deine Frage..."
                  className="flex-1 px-3 py-2 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 bg-foreground text-background flex items-center justify-center hover:bg-foreground/90 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
