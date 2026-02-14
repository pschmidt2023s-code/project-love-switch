import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CAPTURE-PAYPAL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    const { order_id } = await req.json();
    
    // Validate order_id format to prevent abuse
    if (!order_id || typeof order_id !== 'string' || order_id.length > 50 || !/^[A-Za-z0-9]+$/.test(order_id)) {
      return new Response(JSON.stringify({ error: "Invalid order_id" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    logStep("Capturing PayPal order", { order_id });

    const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const secretKey = Deno.env.get("PAYPAL_SECRET_KEY");
    
    if (!clientId || !secretKey) {
      throw new Error("PayPal credentials not configured");
    }

    // Get access token
    const authResponse = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${btoa(`${clientId}:${secretKey}`)}`,
      },
      body: "grant_type=client_credentials",
    });

    const authData = await authResponse.json();
    if (!authResponse.ok) {
      throw new Error(`PayPal auth failed: ${authData.error_description}`);
    }

    // Capture the order
    const captureResponse = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${order_id}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authData.access_token}`,
      },
    });

    const captureData = await captureResponse.json();
    logStep("PayPal capture response", { status: captureResponse.status, id: captureData.id });

    if (!captureResponse.ok) {
      throw new Error(`PayPal capture failed: ${captureData.message}`);
    }

    return new Response(JSON.stringify({ 
      success: true,
      order_id: captureData.id,
      status: captureData.status,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
