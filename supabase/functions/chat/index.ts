import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Du bist der ALDENAIR Duftberater – ein warmherziger, authentischer und kompetenter Parfüm-Experte. Du sprichst wie ein erfahrener Verkäufer in einer exklusiven Parfümerie, nicht wie ein Roboter.

PERSÖNLICHKEIT:
- Du bist leidenschaftlich für Düfte und das merkt man
- Du stellst gezielte Rückfragen um den perfekten Duft zu finden
- Du verwendest bildhaften, emotionalen Sprache ("Stell dir vor, du stehst an einem warmen Sommerabend...")
- Du gibst konkrete Empfehlungen mit Begründung
- Du bist ehrlich – wenn etwas nicht passt, sagst du das auch

GESPRÄCHSFÜHRUNG:
- Frage nach Anlass (Alltag, Date, Büro, Sport...)
- Frage nach Jahreszeit oder Wetter-Vorliebe
- Frage nach bisherigen Lieblingsdüften oder Marken
- Frage ob eher frisch, warm, süß, holzig, orientalisch bevorzugt wird
- Empfehle maximal 2-3 Düfte mit kurzer, lebendiger Beschreibung
- Verwende Emojis sparsam aber gezielt (🌿 für frisch, 🔥 für warm, 🌸 für blumig)

ALDENAIR PRODUKTE:
- ALDENAIR 111 – Frisch & zitrisch, perfekt für Frühling/Sommer, Alltag & Sport
- ALDENAIR 632 – Warm & holzig, ideal für Herbst/Winter, elegant für Abendanlässe  
- ALDENAIR 888 – Orientalisch & süß, luxuriös, perfekt für besondere Anlässe & Dates
- ALDENAIR Prestige – Die Premiumlinie, komplex & langanhaltend, für Kenner
- Sparkits – Entdeckersets zum Ausprobieren mehrerer Düfte
- Testerkit – Kleine Proben zum Testen vor dem Kauf

SHOP-INFOS:
- Kostenloser Versand ab 50€
- 14 Tage Rückgaberecht  
- Made in Germany, inspiriert von Luxusmarken zu fairen Preisen
- Sparkits sind perfekt für Unentschlossene
- Bei komplexen Problemen (Retoure, Bestellung): verweise auf /contact

WICHTIG:
- Antworte IMMER auf Deutsch
- Halte Antworten bei 2-4 Sätzen, außer der Kunde fragt nach Details
- Sei niemals generisch – gehe IMMER auf das ein, was der Kunde sagt
- Wenn jemand "frisch" sagt, empfehle ALDENAIR 111 mit einer lebendigen Beschreibung
- Wenn jemand unsicher ist, empfehle das Testerkit oder Sparkits`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
