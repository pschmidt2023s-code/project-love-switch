import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ManageSubscriptionRequest {
  action: 'validate' | 'pause' | 'resume' | 'cancel' | 'generate_link';
  subscriptionId?: string;
  token?: string;
  email?: string;
}

// Simple token generation using base64 encoding of subscription ID + timestamp + secret
function generateToken(subscriptionId: string): string {
  const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!.slice(0, 32);
  const timestamp = Date.now();
  const payload = `${subscriptionId}:${timestamp}:${secret}`;
  return btoa(payload).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function validateToken(token: string, subscriptionId: string): boolean {
  try {
    const decoded = atob(token.replace(/-/g, '+').replace(/_/g, '/'));
    const parts = decoded.split(':');
    if (parts.length !== 3) return false;
    
    const [tokenSubId, timestampStr, tokenSecret] = parts;
    const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!.slice(0, 32);
    
    // Check subscription ID matches
    if (tokenSubId !== subscriptionId) return false;
    
    // Check secret matches
    if (tokenSecret !== secret) return false;
    
    // Check token is not expired (valid for 30 days)
    const timestamp = parseInt(timestampStr);
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    if (Date.now() - timestamp > thirtyDaysMs) return false;
    
    return true;
  } catch {
    return false;
  }
}

function generateManageLinkEmail(
  customerName: string,
  manageUrl: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f6f6f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f6f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <tr>
            <td style="background-color: #0a0a0a; padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #c9a961; font-size: 28px; font-weight: 700; letter-spacing: 4px;">ALDENAIR</h1>
              <p style="margin: 8px 0 0; color: #888888; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">Premium Parfüms</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 48px 40px; text-align: center;">
              <p style="margin: 0 0 16px; font-size: 48px;">🔗</p>
              <h2 style="margin: 0 0 16px; color: #0a0a0a; font-size: 24px; font-weight: 600;">Dein Abo-Verwaltungslink</h2>
              <p style="margin: 0 0 32px; color: #666666; font-size: 16px; line-height: 24px;">
                Hallo ${customerName}, hier ist dein persönlicher Link zur Verwaltung deines Parfüm-Abos.
                Du kannst damit dein Abo pausieren, fortsetzen oder kündigen.
              </p>
              <a href="${manageUrl}" style="display: inline-block; background-color: #c9a961; color: #0a0a0a; padding: 14px 32px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px;">Abo verwalten</a>
              <p style="margin: 24px 0 0; color: #888888; font-size: 13px;">
                Dieser Link ist 30 Tage gültig.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #fafafa; padding: 24px 40px; text-align: center;">
              <p style="margin: 0; color: #666666; font-size: 13px; line-height: 20px;">
                Falls du diesen Link nicht angefordert hast, kannst du diese E-Mail ignorieren.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #0a0a0a; padding: 24px 40px; text-align: center;">
              <p style="margin: 0; color: #666666; font-size: 12px;">© 2026 ALDENAIR. Alle Rechte vorbehalten.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, subscriptionId, token, email }: ManageSubscriptionRequest = await req.json();
    
    console.log(`[MANAGE-SUBSCRIPTION] Action: ${action}`);

    // Generate magic link for guest
    if (action === 'generate_link') {
      if (!email) {
        return new Response(JSON.stringify({ error: "Email is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Find active subscription for this email
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('guest_email', email)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subError || !subscription) {
        return new Response(JSON.stringify({ error: "No active subscription found for this email" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const magicToken = generateToken(subscription.id);
      const baseUrl = req.headers.get("origin") || "https://aldenairperfumes.de";
      const manageUrl = `${baseUrl}/manage-subscription?id=${subscription.id}&token=${magicToken}`;

      // Send email with magic link
      const resendKey = Deno.env.get("RESEND_API_KEY");
      if (resendKey) {
        const resend = new Resend(resendKey);
        const html = generateManageLinkEmail(subscription.guest_name || 'Kunde', manageUrl);
        
        await resend.emails.send({
          from: "ALDENAIR <noreply@aldenairperfumes.de>",
          to: [email],
          subject: "Dein Abo-Verwaltungslink",
          html,
        });

        console.log(`[MANAGE-SUBSCRIPTION] Magic link sent to ${email}`);
      }

      return new Response(JSON.stringify({ success: true, message: "Link sent to email" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // All other actions require subscription ID and token
    if (!subscriptionId || !token) {
      return new Response(JSON.stringify({ error: "Subscription ID and token are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate token
    if (!validateToken(token, subscriptionId)) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch subscription
    const { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*, product_variants(name, size, price, product_id, products(name, image_url))')
      .eq('id', subscriptionId)
      .single();

    if (fetchError || !subscription) {
      return new Response(JSON.stringify({ error: "Subscription not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle different actions
    switch (action) {
      case 'validate':
        return new Response(JSON.stringify({ 
          success: true, 
          subscription: {
            id: subscription.id,
            status: subscription.status,
            frequency: subscription.frequency,
            next_delivery: subscription.next_delivery,
            guest_name: subscription.guest_name,
            guest_email: subscription.guest_email,
            discount_percent: subscription.discount_percent,
            delivery_count: subscription.delivery_count,
            product: subscription.product_variants?.products?.name || 'Unbekanntes Produkt',
            variant: subscription.product_variants?.name || subscription.product_variants?.size,
            price: subscription.product_variants?.price,
            image: subscription.product_variants?.products?.image_url
          }
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      case 'pause':
        if (subscription.status !== 'active') {
          return new Response(JSON.stringify({ error: "Subscription is not active" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        await supabase
          .from('subscriptions')
          .update({ status: 'paused', updated_at: new Date().toISOString() })
          .eq('id', subscriptionId);

        console.log(`[MANAGE-SUBSCRIPTION] Paused subscription ${subscriptionId}`);
        return new Response(JSON.stringify({ success: true, newStatus: 'paused' }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      case 'resume':
        if (subscription.status !== 'paused') {
          return new Response(JSON.stringify({ error: "Subscription is not paused" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        // Calculate new next_delivery date
        const nextDelivery = new Date();
        if (subscription.frequency === 'monthly') {
          nextDelivery.setMonth(nextDelivery.getMonth() + 1);
        } else if (subscription.frequency === 'bimonthly') {
          nextDelivery.setMonth(nextDelivery.getMonth() + 2);
        } else {
          nextDelivery.setMonth(nextDelivery.getMonth() + 3);
        }

        await supabase
          .from('subscriptions')
          .update({ 
            status: 'active', 
            next_delivery: nextDelivery.toISOString().split('T')[0],
            updated_at: new Date().toISOString() 
          })
          .eq('id', subscriptionId);

        console.log(`[MANAGE-SUBSCRIPTION] Resumed subscription ${subscriptionId}`);
        return new Response(JSON.stringify({ success: true, newStatus: 'active', nextDelivery: nextDelivery.toISOString().split('T')[0] }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      case 'cancel':
        await supabase
          .from('subscriptions')
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('id', subscriptionId);

        console.log(`[MANAGE-SUBSCRIPTION] Cancelled subscription ${subscriptionId}`);
        return new Response(JSON.stringify({ success: true, newStatus: 'cancelled' }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

  } catch (error: unknown) {
    console.error("[MANAGE-SUBSCRIPTION] Error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
