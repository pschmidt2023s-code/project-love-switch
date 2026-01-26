import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

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

    let emailSubject = "";
    let emailHtml = "";

    const baseStyles = `
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1a1a1a;
    `;

    switch (type) {
      case 'new_ticket':
        emailSubject = `Ticket erhalten: ${subject}`;
        emailHtml = `
          <div style="${baseStyles}">
            <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">Vielen Dank für Ihre Anfrage</h1>
            <p>Hallo ${customerName},</p>
            <p>wir haben Ihre Anfrage erhalten und werden uns schnellstmöglich bei Ihnen melden.</p>
            <div style="background: #f8f8f8; padding: 20px; margin: 20px 0; border-left: 3px solid #c9a961;">
              <p style="margin: 0; color: #666;"><strong>Betreff:</strong> ${subject}</p>
              <p style="margin: 10px 0 0; color: #666;"><strong>Ticket-ID:</strong> ${ticketId.slice(0, 8).toUpperCase()}</p>
            </div>
            <p>Mit freundlichen Grüßen,<br>Ihr ALDENAIR Team</p>
          </div>
        `;
        break;

      case 'ticket_reply':
        emailSubject = `Neue Antwort: ${subject}`;
        emailHtml = `
          <div style="${baseStyles}">
            <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">Neue Antwort auf Ihr Ticket</h1>
            <p>Hallo ${customerName},</p>
            <p>es gibt eine neue Antwort auf Ihre Anfrage:</p>
            <div style="background: #f8f8f8; padding: 20px; margin: 20px 0; border-left: 3px solid #c9a961;">
              <p style="margin: 0; color: #666;">${message || ''}</p>
            </div>
            <p>Mit freundlichen Grüßen,<br>Ihr ALDENAIR Team</p>
          </div>
        `;
        break;

      case 'status_change':
        const statusLabels: Record<string, string> = {
          'open': 'Offen',
          'in_progress': 'In Bearbeitung',
          'resolved': 'Gelöst',
          'closed': 'Geschlossen'
        };
        emailSubject = `Statusänderung: ${subject}`;
        emailHtml = `
          <div style="${baseStyles}">
            <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">Status-Update für Ihr Ticket</h1>
            <p>Hallo ${customerName},</p>
            <p>der Status Ihrer Anfrage wurde aktualisiert:</p>
            <div style="background: #f8f8f8; padding: 20px; margin: 20px 0; border-left: 3px solid #c9a961;">
              <p style="margin: 0; color: #666;"><strong>Neuer Status:</strong> ${statusLabels[newStatus || ''] || newStatus}</p>
              <p style="margin: 10px 0 0; color: #666;"><strong>Betreff:</strong> ${subject}</p>
            </div>
            <p>Mit freundlichen Grüßen,<br>Ihr ALDENAIR Team</p>
          </div>
        `;
        break;
    }

    const { error } = await resend.emails.send({
      from: "ALDENAIR <noreply@resend.dev>",
      to: [customerEmail],
      subject: emailSubject,
      html: emailHtml,
    });

    if (error) {
      console.error("Email send error:", error);
      throw error;
    }

    console.log(`Email sent: ${type} to ${customerEmail}`);

    return new Response(JSON.stringify({ success: true }), {
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
