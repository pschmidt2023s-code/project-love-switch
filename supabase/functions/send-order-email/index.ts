import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderEmailRequest {
  type: 'order_confirmation' | 'shipping_notification' | 'order_delivered';
  orderId: string;
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  items?: OrderItem[];
  subtotal?: number;
  shipping?: number;
  total?: number;
  shippingAddress?: { street: string; city: string; postalCode: string };
  trackingNumber?: string;
  trackingUrl?: string;
  carrier?: string;
  estimatedDelivery?: string;
}

// Initialize Supabase client for logging
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function logEmail(
  type: string,
  recipientEmail: string,
  recipientName: string,
  subject: string,
  status: 'sent' | 'skipped' | 'failed',
  errorMessage?: string,
  resendId?: string,
  metadata?: Record<string, unknown>
) {
  try {
    await supabase.from('email_logs').insert({
      type,
      recipient_email: recipientEmail,
      recipient_name: recipientName,
      subject,
      status,
      error_message: errorMessage,
      resend_id: resendId,
      metadata: metadata || {}
    });
    console.log(`Email logged: ${type} to ${recipientEmail} - ${status}`);
  } catch (err) {
    console.error('Failed to log email:', err);
  }
}

function generateOrderConfirmationHtml(
  customerName: string,
  orderNumber: string,
  items: OrderItem[],
  subtotal: number,
  shipping: number,
  total: number,
  shippingAddress: { street: string; city: string; postalCode: string }
): string {
  const orderDate = new Date().toLocaleDateString('de-DE');
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
        <p style="margin: 0; font-size: 15px; font-weight: 500; color: #0a0a0a;">${item.name}</p>
        <p style="margin: 4px 0 0; font-size: 13px; color: #888888;">Menge: ${item.quantity}</p>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; text-align: right;">
        <p style="margin: 0; font-size: 15px; font-weight: 500; color: #0a0a0a;">${(item.price * item.quantity).toFixed(2)} €</p>
      </td>
    </tr>
  `).join('');

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
          <!-- Header -->
          <tr>
            <td style="background-color: #0a0a0a; padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #c9a961; font-size: 28px; font-weight: 700; letter-spacing: 4px;">ALDENAIR</h1>
              <p style="margin: 8px 0 0; color: #888888; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">Premium Parfüms</p>
            </td>
          </tr>
          
          <!-- Hero -->
          <tr>
            <td style="padding: 40px; text-align: center; background-color: #fafafa;">
              <h2 style="margin: 0 0 16px; color: #0a0a0a; font-size: 24px; font-weight: 600;">Vielen Dank für deine Bestellung!</h2>
              <p style="margin: 0; color: #666666; font-size: 16px; line-height: 24px;">Hallo ${customerName}, wir haben deine Bestellung erhalten und bereiten sie mit Sorgfalt vor.</p>
            </td>
          </tr>
          
          <!-- Order Info -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9f9f9;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="text-align: center;">
                    <p style="margin: 0 0 4px; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Bestellnummer</p>
                    <p style="margin: 0; color: #0a0a0a; font-size: 16px; font-weight: 600;">${orderNumber}</p>
                  </td>
                  <td width="50%" style="text-align: center;">
                    <p style="margin: 0 0 4px; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Bestelldatum</p>
                    <p style="margin: 0; color: #0a0a0a; font-size: 16px; font-weight: 600;">${orderDate}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Items -->
          <tr>
            <td style="padding: 32px 40px;">
              <h3 style="margin: 0 0 20px; color: #0a0a0a; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Deine Bestellung</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemsHtml}
              </table>
            </td>
          </tr>
          
          <!-- Totals -->
          <tr>
            <td style="padding: 24px 40px; background-color: #fafafa;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 8px 0;">
                    <p style="margin: 0; color: #666666; font-size: 14px;">Zwischensumme</p>
                  </td>
                  <td style="padding: 8px 0; text-align: right;">
                    <p style="margin: 0; color: #0a0a0a; font-size: 14px;">${subtotal.toFixed(2)} €</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <p style="margin: 0; color: #666666; font-size: 14px;">Versand</p>
                  </td>
                  <td style="padding: 8px 0; text-align: right;">
                    <p style="margin: 0; color: #0a0a0a; font-size: 14px;">${shipping === 0 ? 'Kostenlos' : shipping.toFixed(2) + ' €'}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 0 0; border-top: 2px solid #e5e5e5;">
                    <p style="margin: 0; color: #0a0a0a; font-size: 16px; font-weight: 600;">Gesamt</p>
                  </td>
                  <td style="padding: 16px 0 0; border-top: 2px solid #e5e5e5; text-align: right;">
                    <p style="margin: 0; color: #c9a961; font-size: 20px; font-weight: 700;">${total.toFixed(2)} €</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Shipping Address -->
          <tr>
            <td style="padding: 32px 40px;">
              <h3 style="margin: 0 0 16px; color: #0a0a0a; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Lieferadresse</h3>
              <p style="margin: 0; color: #666666; font-size: 15px; line-height: 24px;">
                ${shippingAddress.street}<br>
                ${shippingAddress.postalCode} ${shippingAddress.city}
              </p>
            </td>
          </tr>
          
          <!-- CTA -->
          <tr>
            <td style="padding: 32px 40px; text-align: center;">
              <a href="https://aldenairperfumes.de/orders" style="display: inline-block; background-color: #c9a961; color: #0a0a0a; padding: 14px 32px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px;">Bestellung verfolgen</a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #0a0a0a; padding: 32px 40px; text-align: center;">
              <p style="margin: 0 0 16px; color: #888888; font-size: 13px; line-height: 20px;">
                Bei Fragen erreichst du uns unter <a href="mailto:support@aldenairperfumes.de" style="color: #c9a961; text-decoration: none;">support@aldenairperfumes.de</a>
              </p>
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

function generateShippingNotificationHtml(
  customerName: string,
  orderNumber: string,
  trackingNumber?: string,
  trackingUrl?: string,
  carrier?: string,
  estimatedDelivery?: string
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
          <!-- Header -->
          <tr>
            <td style="background-color: #0a0a0a; padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #c9a961; font-size: 28px; font-weight: 700; letter-spacing: 4px;">ALDENAIR</h1>
              <p style="margin: 8px 0 0; color: #888888; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">Premium Parfüms</p>
            </td>
          </tr>
          
          <!-- Hero -->
          <tr>
            <td style="padding: 48px 40px; text-align: center; background-color: #fafafa;">
              <p style="margin: 0 0 16px; font-size: 48px;">📦</p>
              <h2 style="margin: 0 0 16px; color: #0a0a0a; font-size: 24px; font-weight: 600;">Dein Paket ist unterwegs!</h2>
              <p style="margin: 0; color: #666666; font-size: 16px; line-height: 24px;">Hallo ${customerName}, gute Nachrichten! Deine Bestellung wurde versendet und ist auf dem Weg zu dir.</p>
            </td>
          </tr>
          
          <!-- Tracking Info -->
          <tr>
            <td style="padding: 32px 40px; background-color: #f9f9f9; text-align: center;">
              ${trackingNumber ? `
                <p style="margin: 0 0 4px; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Sendungsnummer</p>
                <p style="margin: 0 0 16px; color: #0a0a0a; font-size: 20px; font-weight: 600; font-family: monospace; letter-spacing: 1px;">${trackingNumber}</p>
              ` : ''}
              
              ${carrier ? `
                <p style="margin: 16px 0 4px; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Versanddienstleister</p>
                <p style="margin: 0 0 16px; color: #0a0a0a; font-size: 16px; font-weight: 500;">${carrier}</p>
              ` : ''}
              
              ${estimatedDelivery ? `
                <p style="margin: 16px 0 4px; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Voraussichtliche Lieferung</p>
                <p style="margin: 0; color: #c9a961; font-size: 18px; font-weight: 600;">${estimatedDelivery}</p>
              ` : ''}
            </td>
          </tr>
          
          <!-- CTA -->
          <tr>
            <td style="padding: 32px 40px; text-align: center;">
              ${trackingUrl ? `<a href="${trackingUrl}" style="display: inline-block; background-color: #c9a961; color: #0a0a0a; padding: 14px 32px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px;">Sendung verfolgen</a>` : ''}
            </td>
          </tr>
          
          <!-- Order Info -->
          <tr>
            <td style="padding: 20px 40px; background-color: #fafafa; text-align: center;">
              <p style="margin: 0; color: #666666; font-size: 14px;">Bestellnummer: <strong>${orderNumber}</strong></p>
            </td>
          </tr>
          
          <!-- Tips -->
          <tr>
            <td style="padding: 32px 40px;">
              <h3 style="margin: 0 0 16px; color: #0a0a0a; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Gut zu wissen</h3>
              <p style="margin: 0 0 8px; color: #666666; font-size: 14px; line-height: 22px;">✨ Bei Abwesenheit wird dein Paket in der nächsten Paketfiliale hinterlegt.</p>
              <p style="margin: 0; color: #666666; font-size: 14px; line-height: 22px;">📱 Aktiviere Push-Benachrichtigungen in der ALDENAIR App für Live-Updates.</p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #0a0a0a; padding: 32px 40px; text-align: center;">
              <p style="margin: 0 0 16px; color: #888888; font-size: 13px; line-height: 20px;">
                Bei Fragen erreichst du uns unter <a href="mailto:support@aldenairperfumes.de" style="color: #c9a961; text-decoration: none;">support@aldenairperfumes.de</a>
              </p>
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
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      console.log("RESEND_API_KEY not configured, skipping email");
      return new Response(JSON.stringify({ success: true, skipped: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resend = new Resend(resendKey);
    const payload: OrderEmailRequest = await req.json();
    
    console.log(`[SEND-ORDER-EMAIL] Processing ${payload.type} for order ${payload.orderNumber}`);

    let html = '';
    let subject = '';

    switch (payload.type) {
      case 'order_confirmation':
        subject = `Bestellbestätigung #${payload.orderNumber}`;
        html = generateOrderConfirmationHtml(
          payload.customerName,
          payload.orderNumber,
          payload.items || [],
          payload.subtotal || 0,
          payload.shipping || 0,
          payload.total || 0,
          payload.shippingAddress || { street: '', city: '', postalCode: '' }
        );
        break;

      case 'shipping_notification':
        subject = `Deine Bestellung #${payload.orderNumber} wurde versendet!`;
        html = generateShippingNotificationHtml(
          payload.customerName,
          payload.orderNumber,
          payload.trackingNumber,
          payload.trackingUrl,
          payload.carrier || 'DHL',
          payload.estimatedDelivery
        );
        break;

      case 'order_delivered':
        subject = `Deine Bestellung #${payload.orderNumber} wurde zugestellt`;
        html = generateShippingNotificationHtml(
          payload.customerName,
          payload.orderNumber,
          payload.trackingNumber
        );
        break;

      default:
        throw new Error(`Unknown email type: ${payload.type}`);
    }

    const { data: emailData, error } = await resend.emails.send({
      from: "ALDENAIR <noreply@aldenairperfumes.de>",
      to: [payload.customerEmail],
      subject,
      html,
    });

    if (error) {
      console.error("Email send error:", error);
      
      if (error.message?.includes("testing emails") || error.message?.includes("verify a domain")) {
        console.log("Resend test mode: Email not sent. Domain verification required.");
        await logEmail(
          payload.type, 
          payload.customerEmail, 
          payload.customerName, 
          subject, 
          'skipped', 
          error.message, 
          undefined, 
          { orderId: payload.orderId, orderNumber: payload.orderNumber, reason: 'domain_verification_required' }
        );
        return new Response(JSON.stringify({ 
          success: true, 
          warning: "Email notification skipped - domain verification required" 
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      await logEmail(
        payload.type, 
        payload.customerEmail, 
        payload.customerName, 
        subject, 
        'failed', 
        error.message, 
        undefined, 
        { orderId: payload.orderId, orderNumber: payload.orderNumber }
      );
      throw error;
    }

    console.log(`[SEND-ORDER-EMAIL] Email sent successfully: ${payload.type} to ${payload.customerEmail}`);
    await logEmail(
      payload.type, 
      payload.customerEmail, 
      payload.customerName, 
      subject, 
      'sent', 
      undefined, 
      emailData?.id, 
      { orderId: payload.orderId, orderNumber: payload.orderNumber }
    );

    return new Response(JSON.stringify({ success: true, id: emailData?.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[SEND-ORDER-EMAIL] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
