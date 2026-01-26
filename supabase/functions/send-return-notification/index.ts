import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: 'new_return' | 'status_change';
  returnId: string;
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  reason?: string;
  newStatus?: string;
  refundAmount?: number;
  trackingNumber?: string;
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
    const { 
      type, 
      returnId, 
      customerEmail, 
      customerName, 
      orderNumber, 
      reason, 
      newStatus,
      refundAmount,
      trackingNumber 
    }: NotificationRequest = await req.json();

    let emailSubject = "";
    let emailHtml = "";

    const baseStyles = `
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1a1a1a;
    `;

    const statusLabels: Record<string, string> = {
      'pending': 'Ausstehend',
      'approved': 'Genehmigt',
      'rejected': 'Abgelehnt',
      'received': 'Ware eingegangen',
      'refunded': 'Erstattet',
      'completed': 'Abgeschlossen'
    };

    switch (type) {
      case 'new_return':
        emailSubject = `Retoure eingegangen: ${orderNumber}`;
        emailHtml = `
          <div style="${baseStyles}">
            <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">Retourenanfrage erhalten</h1>
            <p>Hallo ${customerName},</p>
            <p>wir haben Ihre Retourenanfrage erhalten und werden diese schnellstmöglich bearbeiten.</p>
            <div style="background: #f8f8f8; padding: 20px; margin: 20px 0; border-left: 3px solid #c9a961;">
              <p style="margin: 0; color: #666;"><strong>Bestellnummer:</strong> ${orderNumber}</p>
              <p style="margin: 10px 0 0; color: #666;"><strong>Retouren-ID:</strong> ${returnId.slice(0, 8).toUpperCase()}</p>
              <p style="margin: 10px 0 0; color: #666;"><strong>Grund:</strong> ${reason || 'Nicht angegeben'}</p>
            </div>
            <p>Sie erhalten eine weitere E-Mail, sobald wir Ihre Retoure bearbeitet haben.</p>
            <p>Mit freundlichen Grüßen,<br>Ihr ALDENAIR Team</p>
          </div>
        `;
        break;

      case 'status_change':
        emailSubject = `Retoure aktualisiert: ${orderNumber}`;
        let statusMessage = '';
        
        if (newStatus === 'approved') {
          statusMessage = `<p>Ihre Retoure wurde <strong style="color: #16a34a;">genehmigt</strong>. Bitte senden Sie die Ware an uns zurück.</p>`;
        } else if (newStatus === 'rejected') {
          statusMessage = `<p>Leider mussten wir Ihre Retourenanfrage <strong style="color: #dc2626;">ablehnen</strong>. Bei Fragen kontaktieren Sie bitte unseren Kundenservice.</p>`;
        } else if (newStatus === 'received') {
          statusMessage = `<p>Wir haben Ihre Rücksendung erhalten und prüfen die Ware.</p>`;
        } else if (newStatus === 'refunded') {
          statusMessage = `<p>Ihre Erstattung von <strong>€${refundAmount?.toFixed(2) || '0.00'}</strong> wurde veranlasst.</p>`;
        } else if (newStatus === 'completed') {
          statusMessage = `<p>Ihre Retoure wurde erfolgreich abgeschlossen.</p>`;
        }

        emailHtml = `
          <div style="${baseStyles}">
            <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">Status-Update für Ihre Retoure</h1>
            <p>Hallo ${customerName},</p>
            ${statusMessage}
            <div style="background: #f8f8f8; padding: 20px; margin: 20px 0; border-left: 3px solid #c9a961;">
              <p style="margin: 0; color: #666;"><strong>Neuer Status:</strong> ${statusLabels[newStatus || ''] || newStatus}</p>
              <p style="margin: 10px 0 0; color: #666;"><strong>Bestellnummer:</strong> ${orderNumber}</p>
              ${trackingNumber ? `<p style="margin: 10px 0 0; color: #666;"><strong>Sendungsverfolgung:</strong> ${trackingNumber}</p>` : ''}
            </div>
            <p>Mit freundlichen Grüßen,<br>Ihr ALDENAIR Team</p>
          </div>
        `;
        break;
    }

    const { data: emailData, error } = await resend.emails.send({
      from: "ALDENAIR <noreply@aldenairperfumes.de>",
      to: [customerEmail],
      subject: emailSubject,
      html: emailHtml,
    });

    if (error) {
      console.error("Email send error:", error);
      // Handle Resend test mode limitation gracefully
      if (error.message?.includes("testing emails") || error.message?.includes("verify a domain")) {
        console.log("Resend test mode: Email not sent to external recipient. Domain verification required.");
        await logEmail(type, customerEmail, customerName, emailSubject, 'skipped', error.message, undefined, { returnId, orderNumber, reason: 'domain_verification_required' });
        return new Response(JSON.stringify({ 
          success: true, 
          warning: "Email notification skipped - domain verification required for production emails" 
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      await logEmail(type, customerEmail, customerName, emailSubject, 'failed', error.message, undefined, { returnId, orderNumber });
      throw error;
    }

    console.log(`Email sent: ${type} to ${customerEmail}`);
    await logEmail(type, customerEmail, customerName, emailSubject, 'sent', undefined, emailData?.id, { returnId, orderNumber });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-return-notification:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
