import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// External Support Dashboard endpoint
const SUPPORT_DASHBOARD_URL = "https://lfkmrgsxxtijxdmfuzbv.supabase.co/functions/v1/widget-api?action=create-ticket";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Server-side rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function isRateLimited(key: string, maxRequests = 5, windowMs = 3600000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count++;
  return entry.count > maxRequests;
}

interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  userId?: string;
  _hp?: string; // Honeypot field
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message, userId, _hp }: ContactRequest = await req.json();

    // Honeypot check - if filled, silently succeed (bot trap)
    if (_hp && _hp.length > 0) {
      console.log("[SUBMIT-CONTACT-TICKET] Honeypot triggered, silently dropping");
      return new Response(
        JSON.stringify({ success: true, ticketId: "dropped" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Server-side rate limiting
    if (isRateLimited(`contact-${email.toLowerCase().trim()}`)) {
      return new Response(
        JSON.stringify({ error: "Zu viele Anfragen. Bitte versuchen Sie es später erneut." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Input length limits
    if (name.length > 200 || email.length > 255 || subject.length > 500 || message.length > 5000) {
      return new Response(
        JSON.stringify({ error: "Eingabe zu lang." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate required fields
    if (!name || name.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: "Name muss mindestens 2 Zeichen haben" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return new Response(
        JSON.stringify({ error: "Ungültige E-Mail-Adresse" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!subject || subject.trim().length < 3) {
      return new Response(
        JSON.stringify({ error: "Betreff muss mindestens 3 Zeichen haben" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!message || message.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: "Nachricht muss mindestens 10 Zeichen haben" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[SUBMIT-CONTACT-TICKET] Creating ticket for:", email);

    // Use service role to bypass RLS for local database
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Save ticket locally in shop database
    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .insert({
        user_id: userId || null,
        customer_name: name.trim(),
        customer_email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
        category: "contact",
        priority: "medium",
        status: "open",
      })
      .select()
      .single();

    if (ticketError) {
      console.error("[SUBMIT-CONTACT-TICKET] Local DB error:", ticketError);
      return new Response(
        JSON.stringify({ error: "Ticket konnte nicht erstellt werden" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[SUBMIT-CONTACT-TICKET] Local ticket created:", ticket.id);

    // 2. Forward ticket to external Support Dashboard (non-blocking)
    try {
      const dashboardResponse = await fetch(SUPPORT_DASHBOARD_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
          category: "contact",
        }),
      });

      const dashboardResult = await dashboardResponse.json();
      console.log("[SUBMIT-CONTACT-TICKET] Dashboard response:", dashboardResult);
    } catch (dashboardError) {
      console.error("[SUBMIT-CONTACT-TICKET] Dashboard forward error (non-blocking):", dashboardError);
    }

    // 3. Send confirmation email (non-blocking)
    try {
      const resendKey = Deno.env.get("RESEND_API_KEY");
      if (resendKey) {
        const { Resend } = await import("https://esm.sh/resend@2.0.0");
        const resend = new Resend(resendKey);

        await resend.emails.send({
          from: "ALDENAIR <noreply@aldenairperfumes.de>",
          to: [email.trim()],
          subject: `Anfrage erhalten: ${subject.trim()}`,
          html: generateConfirmationEmail(name.trim(), ticket.id, subject.trim()),
        });

        console.log("[SUBMIT-CONTACT-TICKET] Confirmation email sent");
      }
    } catch (emailError) {
      console.error("[SUBMIT-CONTACT-TICKET] Email error (non-blocking):", emailError);
    }

    return new Response(
      JSON.stringify({ success: true, ticketId: ticket.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[SUBMIT-CONTACT-TICKET] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unbekannter Fehler" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateConfirmationEmail(customerName: string, ticketId: string, subject: string): string {
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
              <p style="margin: 8px 0 0; color: #888888; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">Kundenservice</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 48px 40px; text-align: center; background-color: #fafafa;">
              <p style="margin: 0 0 16px; font-size: 48px;">✅</p>
              <h2 style="margin: 0 0 16px; color: #0a0a0a; font-size: 24px; font-weight: 600;">Anfrage erhalten</h2>
              <p style="margin: 0; color: #666666; font-size: 16px; line-height: 24px;">Hallo ${customerName}, wir haben deine Anfrage erhalten und melden uns schnellstmöglich bei dir.</p>
            </td>
          </tr>
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
