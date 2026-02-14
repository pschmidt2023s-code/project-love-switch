import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-signature",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SHOP-WEBHOOK] ${step}${detailsStr}`);
};

interface WebhookPayload {
  id?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  total?: number;
  currency?: string;
  status?: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
    variant_size?: string;
  }>;
  shipping_address?: {
    street?: string;
    street2?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  };
}

// Constant-time comparison to prevent timing attacks
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function verifySignature(body: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  const expectedSig = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return timingSafeEqual(signature, expectedSig);
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received", { method: req.method });

    // Authenticate the webhook request
    const webhookSecret = Deno.env.get("WEBHOOK_SECRET");
    if (!webhookSecret) {
      logStep("ERROR: WEBHOOK_SECRET not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Webhook not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const rawBody = await req.text();
    const signature = req.headers.get("x-webhook-signature");

    if (!signature) {
      logStep("ERROR: Missing webhook signature");
      return new Response(
        JSON.stringify({ success: false, error: "Missing signature" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const isValid = await verifySignature(rawBody, signature, webhookSecret);
    if (!isValid) {
      logStep("ERROR: Invalid webhook signature");
      return new Response(
        JSON.stringify({ success: false, error: "Invalid signature" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    logStep("Signature verified successfully");

    // Parse source from query params
    const url = new URL(req.url);
    const source = url.searchParams.get("source") || "unknown";
    logStep("Source identified", { source });

    // Parse the webhook payload
    const payload: WebhookPayload = JSON.parse(rawBody);
    logStep("Payload received", { 
      id: payload.id, 
      email: payload.email,
      total: payload.total,
      itemCount: payload.items?.length 
    });

    // Validate required fields
    if (!payload.total && payload.total !== 0) {
      throw new Error("Missing required field: total");
    }

    // Initialize Supabase client with service role for inserting orders
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Generate order number
    const orderNumber = `EXT-${source.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    
    // Calculate subtotal from items or use total
    const subtotal = payload.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) ?? payload.total ?? 0;
    const total = payload.total ?? subtotal;

    // Map status to our internal status
    const statusMap: Record<string, string> = {
      "processing": "processing",
      "pending": "pending",
      "paid": "paid",
      "shipped": "shipped",
      "delivered": "delivered",
      "cancelled": "cancelled",
      "completed": "delivered",
      "refunded": "cancelled",
    };
    const mappedStatus = statusMap[payload.status?.toLowerCase() ?? ""] || "pending";

    // Create the order
    const orderData = {
      order_number: orderNumber,
      subtotal: subtotal,
      total: total,
      status: mappedStatus,
      payment_status: mappedStatus === "paid" || mappedStatus === "shipped" || mappedStatus === "delivered" ? "paid" : "pending",
      payment_method: "external",
      notes: `Externe Bestellung via Webhook (${source})${payload.id ? ` - Externe ID: ${payload.id}` : ''}${payload.email ? ` - Kunde: ${payload.email}` : ''}`,
    };

    logStep("Creating order", orderData);

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      logStep("Order creation failed", { error: orderError.message });
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    logStep("Order created", { orderId: order.id, orderNumber: order.order_number });

    // Insert order items if provided
    if (payload.items && payload.items.length > 0) {
      const orderItems = payload.items.map(item => ({
        order_id: order.id,
        product_name: item.name,
        variant_size: item.variant_size || "Standard",
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabaseAdmin
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        logStep("Order items creation failed", { error: itemsError.message });
      } else {
        logStep("Order items created", { count: orderItems.length });
      }
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        order_id: order.id,
        order_number: order.order_number,
        message: "Order created successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Request processing failed"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
