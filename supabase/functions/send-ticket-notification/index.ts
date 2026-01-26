import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

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
  type: 'new_ticket' | 'ticket_reply' | 'status_change';
  ticketId: string;
  customerEmail: string;
  customerName: string;
  subject: string;
  message?: string;
  newStatus?: string;
}

function generateTicketEmailHtml(
  type: 'new_ticket' | 'ticket_reply' | 'status_change',
  customerName: string,
  ticketId: string,
  subject: string,
  message?: string,
  newStatus?: string
): string {
  const statusLabels: Record<string, string> = {
    'open': 'Offen',
    'in_progress': 'In Bearbeitung',
    'resolved': 'Gelöst',
    'closed': 'Geschlossen'
  };

  const statusColors: Record<string, string> = {
    'open': '#3b82f6',
    'in_progress': '#f59e0b',
    'resolved': '#10b981',
    'closed': '#6b7280'
  };

  let heroIcon = '📩';
  let heroTitle = '';
  let heroSubtitle = '';
  let contentHtml = '';

  switch (type) {
    case 'new_ticket':
      heroIcon = '✅';
      heroTitle = 'Anfrage erhalten';
      heroSubtitle = `Hallo ${customerName}, wir haben deine Anfrage erhalten und melden uns schnellstmöglich bei dir.`;
      contentHtml = `
        <tr>
          <td style="padding: 32px 40px;">
            <div style="background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); border-radius: 8px; padding: 24px; border-left: 4px solid #c9a961;">
              <p style="margin: 0 0 8px; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Betreff</p>
              <p style="margin: 0 0 16px; color: #0a0a0a; font-size: 16px; font-weight: 500;">${subject}</p>
              <p style="margin: 0 0 8px; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Ticket-ID</p>
              <p style="margin: 0; color: #0a0a0a; font-size: 18px; font-weight: 600; font-family: monospace;">${ticketId.slice(0, 8).toUpperCase()}</p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 40px 32px;">
            <p style="margin: 0; color: #666666; font-size: 14px; line-height: 22px;">
              💡 <strong>Tipp:</strong> Unser Support-Team antwortet in der Regel innerhalb von 24 Stunden.
            </p>
          </td>
        </tr>
      `;
      break;

    case 'ticket_reply':
      heroIcon = '💬';
      heroTitle = 'Neue Antwort';
      heroSubtitle = `Hallo ${customerName}, es gibt eine neue Antwort auf deine Anfrage.`;
      contentHtml = `
        <tr>
          <td style="padding: 32px 40px;">
            <div style="background: #ffffff; border-radius: 8px; padding: 24px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <p style="margin: 0 0 16px; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Nachricht vom ALDENAIR Team</p>
              <p style="margin: 0; color: #0a0a0a; font-size: 15px; line-height: 26px; white-space: pre-wrap;">${message || ''}</p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 40px 32px;">
            <p style="margin: 0 0 8px; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Betreff</p>
            <p style="margin: 0; color: #0a0a0a; font-size: 14px; font-weight: 500;">${subject}</p>
          </td>
        </tr>
      `;
      break;

    case 'status_change':
      heroIcon = '🔔';
      heroTitle = 'Status-Update';
      heroSubtitle = `Hallo ${customerName}, der Status deiner Anfrage wurde aktualisiert.`;
      const statusColor = statusColors[newStatus || ''] || '#6b7280';
      const statusLabel = statusLabels[newStatus || ''] || newStatus;
      contentHtml = `
        <tr>
          <td style="padding: 32px 40px; text-align: center;">
            <p style="margin: 0 0 16px; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Neuer Status</p>
            <span style="display: inline-block; background-color: ${statusColor}; color: #ffffff; padding: 10px 24px; font-size: 14px; font-weight: 600; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px;">${statusLabel}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 24px 40px; background-color: #f9fafb;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="50%" style="text-align: center;">
                  <p style="margin: 0 0 4px; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Betreff</p>
                  <p style="margin: 0; color: #0a0a0a; font-size: 14px; font-weight: 500;">${subject}</p>
                </td>
                <td width="50%" style="text-align: center;">
                  <p style="margin: 0 0 4px; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Ticket-ID</p>
                  <p style="margin: 0; color: #0a0a0a; font-size: 14px; font-weight: 600; font-family: monospace;">${ticketId.slice(0, 8).toUpperCase()}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
      break;
  }

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
              <p style="margin: 8px 0 0; color: #888888; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">Kundenservice</p>
            </td>
          </tr>
          
          <!-- Hero -->
          <tr>
            <td style="padding: 48px 40px; text-align: center; background-color: #fafafa;">
              <p style="margin: 0 0 16px; font-size: 48px;">${heroIcon}</p>
              <h2 style="margin: 0 0 16px; color: #0a0a0a; font-size: 24px; font-weight: 600;">${heroTitle}</h2>
              <p style="margin: 0; color: #666666; font-size: 16px; line-height: 24px;">${heroSubtitle}</p>
            </td>
          </tr>
          
          <!-- Content -->
          ${contentHtml}
          
          <!-- CTA -->
          <tr>
            <td style="padding: 32px 40px; text-align: center;">
              <a href="https://aldenairperfumes.de/contact" style="display: inline-block; background-color: #c9a961; color: #0a0a0a; padding: 14px 32px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px;">Antworten</a>
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
    const { type, ticketId, customerEmail, customerName, subject, message, newStatus }: NotificationRequest = await req.json();

    console.log(`[SEND-TICKET-NOTIFICATION] Processing ${type} for ticket ${ticketId}`);

    const emailSubjects: Record<string, string> = {
      'new_ticket': `Anfrage erhalten: ${subject}`,
      'ticket_reply': `Neue Antwort: ${subject}`,
      'status_change': `Status-Update: ${subject}`
    };

    const emailSubject = emailSubjects[type] || subject;
    const emailHtml = generateTicketEmailHtml(type, customerName, ticketId, subject, message, newStatus);

    const { data: emailData, error } = await resend.emails.send({
      from: "ALDENAIR <noreply@aldenairperfumes.de>",
      to: [customerEmail],
      subject: emailSubject,
      html: emailHtml,
    });

    if (error) {
      console.error("Email send error:", error);
      if (error.message?.includes("testing emails") || error.message?.includes("verify a domain")) {
        console.log("Resend test mode: Email not sent. Domain verification required.");
        await logEmail(type, customerEmail, customerName, emailSubject, 'skipped', error.message, undefined, { ticketId, reason: 'domain_verification_required' });
        return new Response(JSON.stringify({ 
          success: true, 
          warning: "Email notification skipped - domain verification required" 
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      await logEmail(type, customerEmail, customerName, emailSubject, 'failed', error.message, undefined, { ticketId });
      throw error;
    }

    console.log(`[SEND-TICKET-NOTIFICATION] Email sent: ${type} to ${customerEmail}`);
    await logEmail(type, customerEmail, customerName, emailSubject, 'sent', undefined, emailData?.id, { ticketId });

    return new Response(JSON.stringify({ success: true, id: emailData?.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-ticket-notification:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
