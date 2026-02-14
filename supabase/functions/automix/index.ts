import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tracks } = await req.json();

    if (!tracks || tracks.length < 2) {
      return new Response(
        JSON.stringify({ error: "Mindestens 2 Tracks erforderlich" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = `Du bist ein professioneller DJ und Musik-Analyst. Analysiere diese Track-Liste und erstelle die optimale Reihenfolge für einen nahtlosen Automix.

Tracks:
${tracks.map((t: any, i: number) => `${i + 1}. "${t.title}" - BPM: ${t.bpm || 'unbekannt'}, Genre: ${t.genre || 'unbekannt'}, Mood: ${t.mood || 'unbekannt'}, Energy: ${t.energy || 'unbekannt'}`).join('\n')}

Regeln:
- Sortiere nach harmonischem Flow (ähnliche BPM nahe beieinander)
- Baue Energie langsam auf und bringe sie zum Höhepunkt
- Beachte Genre-Übergänge (ähnliche Genres nacheinander)
- Empfehle Crossfade-Dauern zwischen den Tracks (2-8 Sekunden)

Antworte NUR mit diesem JSON-Format:
{
  "order": ["track-id-1", "track-id-2", ...],
  "crossfades": [{"from": "id", "to": "id", "duration": 4, "reason": "kurze Begründung"}],
  "summary": "Kurze Beschreibung des Mix-Flows auf Deutsch"
}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "Du bist ein DJ-Automix-Algorithmus. Antworte nur mit validem JSON." },
          { role: "user", content: prompt },
        ],
        temperature: 0.5,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit erreicht, bitte versuche es später erneut." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Credits aufgebraucht, bitte lade Credits nach." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON");
      }
    } catch {
      // Fallback: return tracks in original order
      result = {
        order: tracks.map((t: any) => t.id),
        crossfades: [],
        summary: "Tracks in Originalreihenfolge (KI-Analyse nicht möglich)",
      };
    }

    // Validate all IDs exist
    const trackIds = new Set(tracks.map((t: any) => t.id));
    const validOrder = (result.order || []).filter((id: string) => trackIds.has(id));
    // Add any missing tracks at the end
    for (const t of tracks) {
      if (!validOrder.includes(t.id)) validOrder.push(t.id);
    }
    result.order = validOrder;

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[AUTOMIX] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
