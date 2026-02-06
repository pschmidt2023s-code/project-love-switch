import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");
    
    const requestBody = await req.json();
    const { items, payment_method, user_id: bodyUserId, origin: bodyOrigin } = requestBody;
    // Support both 'email' and 'bodyEmail' field names for backwards compatibility
    const bodyEmail = requestBody.email || requestBody.bodyEmail || null;
    const origin = req.headers.get("origin") || bodyOrigin || "https://sweet-code-shift.lovable.app";
    logStep("Request body", { items, payment_method, bodyEmail, origin });

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    let userEmail = bodyEmail || null;
    let userId = bodyUserId || null;
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      if (data.user) {
        userEmail = data.user.email || userEmail;
        userId = data.user.id || userId;
        logStep("User authenticated", { email: userEmail, userId });
      }
    }

    if (payment_method === "paypal") {
      // PayPal Checkout
      const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
      const secretKey = Deno.env.get("PAYPAL_SECRET_KEY");
      
      if (!clientId || !secretKey) {
        throw new Error("PayPal credentials not configured");
      }

      // Get PayPal access token
      const authResponse = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${btoa(`${clientId}:${secretKey}`)}`,
        },
        body: "grant_type=client_credentials",
      });

      const authData = await authResponse.json();
      logStep("PayPal auth response", { status: authResponse.status });

      if (!authResponse.ok) {
        throw new Error(`PayPal auth failed: ${authData.error_description}`);
      }

      // Calculate total
      const total = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
      
      // Create PayPal order
      const orderResponse = await fetch("https://api-m.paypal.com/v2/checkout/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authData.access_token}`,
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [{
            amount: {
              currency_code: "EUR",
              value: total.toFixed(2),
              breakdown: {
                item_total: {
                  currency_code: "EUR",
                  value: total.toFixed(2),
                },
              },
            },
            items: items.map((item: any) => ({
              name: item.name,
              quantity: String(item.quantity),
              unit_amount: {
                currency_code: "EUR",
                value: item.price.toFixed(2),
              },
            })),
          }],
          application_context: {
            return_url: `${origin}/checkout/success`,
            cancel_url: `${origin}/checkout/cancel`,
            brand_name: "ALDENAIR",
            user_action: "PAY_NOW",
          },
        }),
      });

      const orderData = await orderResponse.json();
      logStep("PayPal order created", { orderId: orderData.id });

      if (!orderResponse.ok) {
        throw new Error(`PayPal order creation failed: ${orderData.message}`);
      }

      const approveLink = orderData.links.find((link: any) => link.rel === "approve");
      
      return new Response(JSON.stringify({ 
        url: approveLink?.href,
        order_id: orderData.id,
        payment_method: "paypal"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    } else {
      // Stripe Checkout
      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
        apiVersion: "2025-08-27.basil",
      });

      // Check for existing Stripe customer
      let customerId;
      if (userEmail) {
        const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
        if (customers.data.length > 0) {
          customerId = customers.data[0].id;
          logStep("Found existing Stripe customer", { customerId });
        }
      }

      // Create line items from cart
      const lineItems = items.map((item: any) => {
        // Make image URL absolute if it's a relative path
        let imageUrl = item.image;
        if (imageUrl && imageUrl.startsWith('/')) {
          imageUrl = `${origin}${imageUrl}`;
        }
        
        return {
          price_data: {
            currency: "eur",
            product_data: {
              name: item.name,
              images: imageUrl ? [imageUrl] : [],
            },
            unit_amount: Math.round(item.price * 100), // Convert to cents
          },
          quantity: item.quantity,
        };
      });

      logStep("Creating Stripe session", { lineItems: lineItems.length });

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        customer_email: customerId ? undefined : userEmail,
        line_items: lineItems,
        mode: "payment",
        success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/checkout/cancel`,
        shipping_address_collection: {
          allowed_countries: ["DE", "AT", "CH"],
        },
        billing_address_collection: "required",
        metadata: {
          user_id: userId || "",
        },
      });

      logStep("Stripe session created", { sessionId: session.id });

      return new Response(JSON.stringify({ 
        url: session.url,
        session_id: session.id,
        payment_method: "stripe"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
