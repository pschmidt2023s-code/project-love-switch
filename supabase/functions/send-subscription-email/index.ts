import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubscriptionEmailRequest {
  type: 'subscription_confirmation' | 'subscription_reminder' | 'subscription_cancelled' | 'subscription_delivery';
  subscriptionId: string;
  customerEmail: string;
  customerName: string;
  productName: string;
  variantName?: string;
  frequency: string;
  discountPercent: number;
  price: number;
  nextDelivery?: string;
  isGuest: boolean;
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

function getFrequencyLabel(frequency: string): string {
  switch (frequency) {
    case 'monthly': return 'Monatlich';
    case 'bi_monthly': return 'Alle 2 Monate';
    case 'quarterly': return 'Vierteljährlich';
    default: return frequency;
  }
}

function generateSubscriptionConfirmationHtml(
  customerName: string,
  productName: string,
  variantName: string,
  frequency: string,
  discountPercent: number,
  price: number,
  nextDelivery: string,
  isGuest: boolean
): string {
  const discountedPrice = price * (1 - discountPercent / 100);
  
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
            <td style="padding: 48px 40px; text-align: center; background: linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%);">
              <p style="margin: 0 0 16px; font-size: 56px;">🎁</p>
              <h2 style="margin: 0 0 16px; color: #0a0a0a; font-size: 26px; font-weight: 700;">Willkommen im Parfüm-Abo!</h2>
              <p style="margin: 0; color: #666666; font-size: 16px; line-height: 26px;">
                ${isGuest ? `Hallo ${customerName}` : `Liebe(r) ${customerName}`}, dein exklusives Parfüm-Abonnement wurde erfolgreich aktiviert.
              </p>
            </td>
          </tr>
          
          <!-- Subscription Details -->
          <tr>
            <td style="padding: 32px 40px;">
              <h3 style="margin: 0 0 24px; color: #0a0a0a; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; border-bottom: 2px solid #c9a961; padding-bottom: 12px;">Dein Abo im Überblick</h3>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 16px; background-color: #fafafa; border-radius: 8px; margin-bottom: 12px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <p style="margin: 0 0 4px; color: #888888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Produkt</p>
                          <p style="margin: 0; color: #0a0a0a; font-size: 18px; font-weight: 600;">${productName}</p>
                          ${variantName ? `<p style="margin: 4px 0 0; color: #666666; font-size: 14px;">${variantName}</p>` : ''}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 16px;">
                <tr>
                  <td width="50%" style="padding: 16px; background-color: #fafafa; border-radius: 8px;">
                    <p style="margin: 0 0 4px; color: #888888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Lieferintervall</p>
                    <p style="margin: 0; color: #0a0a0a; font-size: 16px; font-weight: 600;">${getFrequencyLabel(frequency)}</p>
                  </td>
                  <td width="50%" style="padding: 16px; background-color: #fafafa; border-radius: 8px;">
                    <p style="margin: 0 0 4px; color: #888888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Dein Rabatt</p>
                    <p style="margin: 0; color: #c9a961; font-size: 16px; font-weight: 700;">${discountPercent}% gespart</p>
                  </td>
                </tr>
              </table>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 16px;">
                <tr>
                  <td width="50%" style="padding: 16px; background-color: #fafafa; border-radius: 8px;">
                    <p style="margin: 0 0 4px; color: #888888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Abo-Preis</p>
                    <p style="margin: 0;">
                      <span style="color: #0a0a0a; font-size: 20px; font-weight: 700;">€${discountedPrice.toFixed(2)}</span>
                      <span style="color: #888888; font-size: 14px; text-decoration: line-through; margin-left: 8px;">€${price.toFixed(2)}</span>
                    </p>
                  </td>
                  <td width="50%" style="padding: 16px; background-color: #0a0a0a; border-radius: 8px;">
                    <p style="margin: 0 0 4px; color: #888888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Nächste Lieferung</p>
                    <p style="margin: 0; color: #c9a961; font-size: 16px; font-weight: 600;">${nextDelivery}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Benefits -->
          <tr>
            <td style="padding: 32px 40px; background-color: #fafafa;">
              <h3 style="margin: 0 0 20px; color: #0a0a0a; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Deine Abo-Vorteile</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 12px 0;">
                    <p style="margin: 0; color: #0a0a0a; font-size: 15px;">✨ <strong>${discountPercent}% Rabatt</strong> auf jede Lieferung</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <p style="margin: 0; color: #0a0a0a; font-size: 15px;">🚚 <strong>Kostenloser Versand</strong> bei jeder Bestellung</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <p style="margin: 0; color: #0a0a0a; font-size: 15px;">🎁 <strong>Exklusive Proben</strong> als Dankeschön</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <p style="margin: 0; color: #0a0a0a; font-size: 15px;">⏸️ <strong>Jederzeit kündbar</strong> – volle Flexibilität</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- CTA -->
          <tr>
            <td style="padding: 32px 40px; text-align: center;">
              ${isGuest ? `
                <p style="margin: 0 0 20px; color: #666666; font-size: 14px;">Erstelle ein Konto, um dein Abo jederzeit zu verwalten:</p>
                <a href="https://aldenairperfumes.de/auth" style="display: inline-block; background-color: #c9a961; color: #0a0a0a; padding: 14px 32px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px;">Konto erstellen</a>
              ` : `
                <a href="https://aldenairperfumes.de/profile" style="display: inline-block; background-color: #c9a961; color: #0a0a0a; padding: 14px 32px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px;">Abo verwalten</a>
              `}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #0a0a0a; padding: 32px 40px; text-align: center;">
              <p style="margin: 0 0 16px; color: #888888; font-size: 13px; line-height: 20px;">
                Fragen zu deinem Abo? Schreib uns an <a href="mailto:support@aldenairperfumes.de" style="color: #c9a961; text-decoration: none;">support@aldenairperfumes.de</a>
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

function generateSubscriptionReminderHtml(
  customerName: string,
  productName: string,
  nextDelivery: string,
  price: number,
  discountPercent: number,
  isGuest: boolean
): string {
  const discountedPrice = price * (1 - discountPercent / 100);
  
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
            <td style="padding: 48px 40px; text-align: center; background: linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%);">
              <p style="margin: 0 0 16px; font-size: 56px;">📅</p>
              <h2 style="margin: 0 0 16px; color: #0a0a0a; font-size: 24px; font-weight: 700;">Deine nächste Lieferung steht bevor!</h2>
              <p style="margin: 0; color: #666666; font-size: 16px; line-height: 26px;">
                Hallo ${customerName}, in Kürze wird dein Lieblingsduft zu dir unterwegs sein.
              </p>
            </td>
          </tr>
          
          <!-- Delivery Info -->
          <tr>
            <td style="padding: 32px 40px; text-align: center; background-color: #fafafa;">
              <p style="margin: 0 0 8px; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Nächste Lieferung am</p>
              <p style="margin: 0 0 24px; color: #c9a961; font-size: 28px; font-weight: 700;">${nextDelivery}</p>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 300px; margin: 0 auto;">
                <tr>
                  <td style="padding: 16px; background-color: #ffffff; border-radius: 8px; text-align: center;">
                    <p style="margin: 0 0 4px; color: #888888; font-size: 11px; text-transform: uppercase;">Produkt</p>
                    <p style="margin: 0 0 8px; color: #0a0a0a; font-size: 16px; font-weight: 600;">${productName}</p>
                    <p style="margin: 0;">
                      <span style="color: #c9a961; font-size: 18px; font-weight: 700;">€${discountedPrice.toFixed(2)}</span>
                      <span style="color: #888888; font-size: 12px; margin-left: 4px;">(${discountPercent}% Rabatt)</span>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- CTA -->
          <tr>
            <td style="padding: 32px 40px; text-align: center;">
              <p style="margin: 0 0 20px; color: #666666; font-size: 14px;">Möchtest du etwas ändern?</p>
              ${isGuest ? `
                <a href="mailto:support@aldenairperfumes.de" style="display: inline-block; background-color: #c9a961; color: #0a0a0a; padding: 14px 32px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px;">Kontaktiere uns</a>
              ` : `
                <a href="https://aldenairperfumes.de/profile" style="display: inline-block; background-color: #c9a961; color: #0a0a0a; padding: 14px 32px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px;">Abo verwalten</a>
              `}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #0a0a0a; padding: 32px 40px; text-align: center;">
              <p style="margin: 0 0 16px; color: #888888; font-size: 13px; line-height: 20px;">
                Fragen? <a href="mailto:support@aldenairperfumes.de" style="color: #c9a961; text-decoration: none;">support@aldenairperfumes.de</a>
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

function generateSubscriptionCancelledHtml(
  customerName: string,
  productName: string,
  isGuest: boolean
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
              <p style="margin: 0 0 16px; font-size: 48px;">👋</p>
              <h2 style="margin: 0 0 16px; color: #0a0a0a; font-size: 24px; font-weight: 600;">Schade, dass du gehst!</h2>
              <p style="margin: 0; color: #666666; font-size: 16px; line-height: 26px;">
                Hallo ${customerName}, dein Parfüm-Abo für <strong>${productName}</strong> wurde erfolgreich gekündigt.
              </p>
            </td>
          </tr>
          
          <!-- Message -->
          <tr>
            <td style="padding: 32px 40px;">
              <p style="margin: 0 0 16px; color: #666666; font-size: 15px; line-height: 24px;">
                Wir hoffen, du hattest eine tolle Zeit mit ALDENAIR. Du kannst jederzeit wieder ein Abo abschließen und von unseren exklusiven Vorteilen profitieren.
              </p>
              <p style="margin: 0; color: #666666; font-size: 15px; line-height: 24px;">
                Falls du Feedback für uns hast, würden wir uns sehr freuen, von dir zu hören!
              </p>
            </td>
          </tr>
          
          <!-- CTA -->
          <tr>
            <td style="padding: 32px 40px; text-align: center;">
              <a href="https://aldenairperfumes.de/products" style="display: inline-block; background-color: #c9a961; color: #0a0a0a; padding: 14px 32px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px;">Weiter shoppen</a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #0a0a0a; padding: 32px 40px; text-align: center;">
              <p style="margin: 0 0 16px; color: #888888; font-size: 13px; line-height: 20px;">
                Fragen? <a href="mailto:support@aldenairperfumes.de" style="color: #c9a961; text-decoration: none;">support@aldenairperfumes.de</a>
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
    const payload: SubscriptionEmailRequest = await req.json();
    
    console.log(`[SEND-SUBSCRIPTION-EMAIL] Processing ${payload.type} for subscription ${payload.subscriptionId}`);

    let html = '';
    let subject = '';

    switch (payload.type) {
      case 'subscription_confirmation':
        subject = `Willkommen bei deinem ALDENAIR Parfüm-Abo! 🎁`;
        html = generateSubscriptionConfirmationHtml(
          payload.customerName,
          payload.productName,
          payload.variantName || '',
          payload.frequency,
          payload.discountPercent,
          payload.price,
          payload.nextDelivery || 'Wird berechnet',
          payload.isGuest
        );
        break;

      case 'subscription_reminder':
        subject = `📅 Deine nächste ALDENAIR Lieferung steht bevor`;
        html = generateSubscriptionReminderHtml(
          payload.customerName,
          payload.productName,
          payload.nextDelivery || '',
          payload.price,
          payload.discountPercent,
          payload.isGuest
        );
        break;

      case 'subscription_cancelled':
        subject = `Dein ALDENAIR Parfüm-Abo wurde gekündigt`;
        html = generateSubscriptionCancelledHtml(
          payload.customerName,
          payload.productName,
          payload.isGuest
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
          { subscriptionId: payload.subscriptionId, reason: 'domain_verification_required' }
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
        { subscriptionId: payload.subscriptionId }
      );
      throw error;
    }

    console.log(`[SEND-SUBSCRIPTION-EMAIL] Email sent successfully: ${payload.type} to ${payload.customerEmail}`);
    await logEmail(
      payload.type, 
      payload.customerEmail, 
      payload.customerName, 
      subject, 
      'sent', 
      undefined, 
      emailData?.id, 
      { subscriptionId: payload.subscriptionId }
    );

    return new Response(JSON.stringify({ success: true, id: emailData?.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-subscription-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
