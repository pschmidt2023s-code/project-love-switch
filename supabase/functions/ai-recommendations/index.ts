import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[AI-RECOMMENDATIONS] ${step}`, details ? JSON.stringify(details) : "");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    let userPreferences: Record<string, unknown> = {};

    // Get user if authenticated
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabaseClient.auth.getUser(token);
      userId = userData.user?.id || null;
      logStep("User authenticated", { userId });
    }

    // Get request body for preferences
    const body = await req.json().catch(() => ({}));
    const { preferences, limit = 6 } = body;

    // Fetch user's order history if authenticated
    let purchaseHistory: string[] = [];
    if (userId) {
      const { data: orders } = await supabaseClient
        .from("orders")
        .select(`
          order_items (
            product_name,
            variant_id
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (orders) {
        purchaseHistory = orders.flatMap((o: any) => 
          o.order_items?.map((item: any) => item.product_name) || []
        );
      }
      logStep("Purchase history fetched", { count: purchaseHistory.length });
    }

    // Fetch all active products with their scent profiles
    const { data: products, error: productsError } = await supabaseClient
      .from("products")
      .select(`
        id,
        name,
        slug,
        description,
        brand,
        gender,
        top_notes,
        middle_notes,
        base_notes,
        seasons,
        occasions,
        image_url,
        base_price,
        product_variants (
          id,
          name,
          price,
          size,
          in_stock
        )
      `)
      .eq("is_active", true);

    if (productsError) {
      throw new Error(`Failed to fetch products: ${productsError.message}`);
    }

    logStep("Products fetched", { count: products?.length });

    // Build AI prompt for recommendations
    const systemPrompt = `Du bist ein Parfüm-Experte und Berater für ALDENAIR, eine Luxus-Parfümmarke. 
Deine Aufgabe ist es, personalisierte Duftempfehlungen zu geben basierend auf:
- Kaufhistorie des Kunden (falls vorhanden)
- Duftpräferenzen (Noten, Jahreszeiten, Anlässe)
- Verfügbare Produkte im Sortiment

Antworte immer auf Deutsch und im JSON-Format.`;

    const userPrompt = `Analysiere folgende Informationen und empfehle die ${limit} besten Parfüms:

Kaufhistorie: ${purchaseHistory.length > 0 ? purchaseHistory.join(", ") : "Keine bisherigen Käufe"}

Präferenzen: ${preferences ? JSON.stringify(preferences) : "Keine spezifischen Präferenzen angegeben"}

Verfügbare Produkte:
${products?.map(p => `
- ${p.name}: 
  Top-Noten: ${p.top_notes?.join(", ") || "N/A"}
  Herz-Noten: ${p.middle_notes?.join(", ") || "N/A"}
  Basis-Noten: ${p.base_notes?.join(", ") || "N/A"}
  Jahreszeiten: ${p.seasons?.join(", ") || "Ganzjährig"}
  Anlässe: ${p.occasions?.join(", ") || "Vielseitig"}
`).join("\n")}

Gib die Empfehlungen als JSON-Array zurück mit folgendem Format:
{
  "recommendations": [
    {
      "productId": "uuid",
      "productName": "Name",
      "reason": "Kurze Begründung auf Deutsch warum dieses Parfüm empfohlen wird",
      "matchScore": 85
    }
  ],
  "summary": "Kurze Zusammenfassung der Empfehlungen"
}`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    logStep("Calling AI gateway");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await aiResponse.text();
      throw new Error(`AI gateway error: ${aiResponse.status} - ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    logStep("AI response received");

    // Parse AI response
    let recommendations;
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in AI response");
      }
    } catch {
      logStep("Failed to parse AI response, using fallback");
      // Fallback: Return first N products
      recommendations = {
        recommendations: products?.slice(0, limit).map((p) => ({
          productId: p.id,
          productName: p.name,
          reason: "Ein exklusiver Duft aus unserer Kollektion",
          matchScore: 75,
        })),
        summary: "Entdecken Sie unsere beliebtesten Düfte",
      };
    }

    // Enrich recommendations with product data
    const enrichedRecommendations = recommendations.recommendations?.map((rec: any) => {
      const product = products?.find((p) => p.id === rec.productId || p.name === rec.productName);
      if (product) {
        return {
          ...rec,
          product: {
            id: product.id,
            name: product.name,
            slug: product.slug,
            image_url: product.image_url,
            base_price: product.base_price,
            variants: product.product_variants,
          },
        };
      }
      return rec;
    }).filter((rec: any) => rec.product);

    logStep("Recommendations enriched", { count: enrichedRecommendations?.length });

    return new Response(
      JSON.stringify({
        recommendations: enrichedRecommendations,
        summary: recommendations.summary,
        purchaseHistoryUsed: purchaseHistory.length > 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
