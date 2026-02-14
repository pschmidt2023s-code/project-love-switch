import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

interface ReturnRequest {
  orderNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  street: string;
  postalCode: string;
  city: string;
  items: string;
  reason: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body: ReturnRequest = await req.json();

    const { orderNumber, firstName, lastName, email, street, postalCode, city, items, reason } = body;

    // Validate required fields
    if (!orderNumber || !firstName || !lastName || !email || !reason || !items) {
      return new Response(
        JSON.stringify({ error: "Bitte füllen Sie alle Pflichtfelder aus." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[PROCESS-RETURN] Looking up order: ${orderNumber}`);

    // 1. Validate order number exists
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, created_at, total, user_id, status")
      .eq("order_number", orderNumber.trim())
      .maybeSingle();

    if (orderError) {
      console.error("[PROCESS-RETURN] DB error:", orderError);
      return new Response(
        JSON.stringify({ error: "Fehler bei der Bestellnummer-Prüfung." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!order) {
      console.log(`[PROCESS-RETURN] Order not found: ${orderNumber}`);
      return new Response(
        JSON.stringify({ error: "Die angegebene Bestellnummer wurde nicht gefunden. Bitte überprüfen Sie Ihre Eingabe." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Check if within 14-day return window
    const orderDate = new Date(order.created_at);
    const now = new Date();
    const daysSinceOrder = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
    const withinReturnWindow = (now.getTime() - orderDate.getTime()) <= FOURTEEN_DAYS_MS;

    const autoApproved = withinReturnWindow;
    const returnStatus = autoApproved ? "approved" : "pending";

    console.log(`[PROCESS-RETURN] Order date: ${orderDate.toISOString()}, days since: ${daysSinceOrder}, auto-approved: ${autoApproved}`);

    // 3. Create return record
    const { data: returnRecord, error: returnError } = await supabase
      .from("returns")
      .insert({
        order_id: order.id,
        user_id: order.user_id,
        reason: reason.trim(),
        status: returnStatus,
        notes: `Kunde: ${firstName} ${lastName}\nAdresse: ${street}, ${postalCode} ${city}\nArtikel: ${items}\nTage seit Bestellung: ${daysSinceOrder}${!autoApproved ? '\n⚠️ Außerhalb der 14-Tage-Frist - manuelle Prüfung erforderlich' : '\n✅ Innerhalb der 14-Tage-Frist - automatisch genehmigt'}`,
        refund_amount: autoApproved ? Number(order.total) : 0,
      })
      .select("id")
      .single();

    if (returnError) {
      console.error("[PROCESS-RETURN] Return insert error:", returnError);
      return new Response(
        JSON.stringify({ error: "Retoure konnte nicht erstellt werden." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[PROCESS-RETURN] Return created: ${returnRecord.id}, status: ${returnStatus}`);

    // 4. Send confirmation email
    const resendKey = Deno.env.get("RESEND_API_KEY");
    let emailSent = false;

    if (resendKey) {
      try {
        const resend = new Resend(resendKey);
        const customerName = `${firstName} ${lastName}`;
        const returnId = returnRecord.id.slice(0, 8).toUpperCase();

        const emailHtml = generateConfirmationEmail(
          customerName,
          returnId,
          orderNumber,
          items,
          reason,
          autoApproved,
          daysSinceOrder
        );

        const emailSubject = autoApproved
          ? `✅ Retoure genehmigt - Retourenschein folgt innerhalb 24h | ${orderNumber}`
          : `📋 Retoure eingegangen - Prüfung erforderlich | ${orderNumber}`;

        const { error: emailError } = await resend.emails.send({
          from: "ALDENAIR <noreply@aldenairperfumes.de>",
          to: [email],
          subject: emailSubject,
          html: emailHtml,
        });

        if (emailError) {
          console.error("[PROCESS-RETURN] Email error:", emailError);
        } else {
          emailSent = true;
          console.log(`[PROCESS-RETURN] Confirmation email sent to ${email}`);
        }

        // Log email
        await supabase.from("email_logs").insert({
          type: "return_confirmation",
          recipient_email: email,
          recipient_name: customerName,
          subject: emailSubject,
          status: emailError ? "failed" : "sent",
          error_message: emailError?.message,
          metadata: { returnId: returnRecord.id, orderNumber, autoApproved },
        });
      } catch (emailErr) {
        console.error("[PROCESS-RETURN] Email exception:", emailErr);
      }
    }

    // 5. Forward to external support dashboard
    try {
      await fetch(
        "https://lfkmrgsxxtijxdmfuzbv.supabase.co/functions/v1/widget-api?action=create-ticket",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: `${firstName} ${lastName}`,
            email,
            subject: `Retoure ${autoApproved ? "(Auto-Genehmigt)" : "(Manuelle Prüfung)"}: ${orderNumber}`,
            message: `Retouren-Anfrage\n\nBestellnummer: ${orderNumber}\nTage seit Bestellung: ${daysSinceOrder}\nStatus: ${autoApproved ? "Automatisch genehmigt (≤14 Tage)" : "Manuelle Prüfung erforderlich (>14 Tage)"}\n\nArtikel: ${items}\nGrund: ${reason}\nAdresse: ${street}, ${postalCode} ${city}`,
            category: "return",
          }),
        }
      );
      console.log("[PROCESS-RETURN] Forwarded to support dashboard");
    } catch (dashErr) {
      console.error("[PROCESS-RETURN] Dashboard forward error:", dashErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        returnId: returnRecord.id,
        status: returnStatus,
        autoApproved,
        daysSinceOrder,
        emailSent,
        message: autoApproved
          ? "Ihre Retoure wurde automatisch genehmigt. Sie erhalten innerhalb von 24 Stunden einen Retourenschein per E-Mail."
          : "Ihre Retoure wurde eingereicht und wird manuell geprüft, da die 14-Tage-Frist überschritten wurde. Wir melden uns innerhalb von 24 Stunden.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[PROCESS-RETURN] Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unerwarteter Fehler" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateConfirmationEmail(
  customerName: string,
  returnId: string,
  orderNumber: string,
  items: string,
  reason: string,
  autoApproved: boolean,
  daysSinceOrder: number
): string {
  const statusColor = autoApproved ? "#10b981" : "#f59e0b";
  const statusLabel = autoApproved ? "Genehmigt" : "In Prüfung";
  const statusIcon = autoApproved ? "✅" : "⏳";
  const heroTitle = autoApproved ? "Retoure genehmigt" : "Retoure wird geprüft";
  const heroSubtitle = autoApproved
    ? `Hallo ${customerName}, deine Retoure wurde automatisch genehmigt. Du erhältst innerhalb von 24 Stunden deinen Retourenschein per E-Mail.`
    : `Hallo ${customerName}, da die 14-Tage-Frist überschritten wurde (${daysSinceOrder} Tage), wird deine Retoure manuell geprüft. Wir melden uns innerhalb von 24 Stunden.`;

  const nextStepsHtml = autoApproved
    ? `
      <p style="margin: 0 0 8px; color: #666666; font-size: 14px; line-height: 22px;">1️⃣ Du erhältst innerhalb von <strong>24 Stunden</strong> deinen Retourenschein per E-Mail</p>
      <p style="margin: 0 0 8px; color: #666666; font-size: 14px; line-height: 22px;">2️⃣ Drucke den Retourenschein aus und lege ihn dem Paket bei</p>
      <p style="margin: 0 0 8px; color: #666666; font-size: 14px; line-height: 22px;">3️⃣ Bringe das Paket zur nächsten DHL-Filiale</p>
      <p style="margin: 0; color: #666666; font-size: 14px; line-height: 22px;">4️⃣ Erstattung innerhalb von 5-7 Werktagen nach Wareneingang</p>
    `
    : `
      <p style="margin: 0 0 8px; color: #666666; font-size: 14px; line-height: 22px;">1️⃣ Deine Anfrage wird von unserem Team geprüft</p>
      <p style="margin: 0 0 8px; color: #666666; font-size: 14px; line-height: 22px;">2️⃣ Du erhältst innerhalb von <strong>24 Stunden</strong> eine Rückmeldung per E-Mail</p>
      <p style="margin: 0; color: #666666; font-size: 14px; line-height: 22px;">3️⃣ Bei Genehmigung senden wir dir den Retourenschein zu</p>
    `;

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
              <p style="margin: 8px 0 0; color: #888888; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">Retouren-Service</p>
            </td>
          </tr>
          
          <!-- Hero -->
          <tr>
            <td style="padding: 48px 40px; text-align: center; background-color: #fafafa;">
              <p style="margin: 0 0 16px; font-size: 48px;">${statusIcon}</p>
              <h2 style="margin: 0 0 16px; color: #0a0a0a; font-size: 24px; font-weight: 600;">${heroTitle}</h2>
              <p style="margin: 0; color: #666666; font-size: 16px; line-height: 24px;">${heroSubtitle}</p>
            </td>
          </tr>

          <!-- Status Badge -->
          <tr>
            <td style="padding: 24px 40px; text-align: center;">
              <span style="display: inline-block; background-color: ${statusColor}; color: #ffffff; padding: 10px 24px; font-size: 14px; font-weight: 600; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px;">${statusLabel}</span>
            </td>
          </tr>
          
          <!-- Details -->
          <tr>
            <td style="padding: 24px 40px;">
              <div style="background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); border-radius: 8px; padding: 24px; border-left: 4px solid #c9a961;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      <p style="margin: 0 0 6px; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Bestellnummer</p>
                      <p style="margin: 0 0 16px; color: #0a0a0a; font-size: 16px; font-weight: 600;">${orderNumber}</p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p style="margin: 0 0 6px; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Retouren-ID</p>
                      <p style="margin: 0 0 16px; color: #0a0a0a; font-size: 18px; font-weight: 600; font-family: monospace;">${returnId}</p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p style="margin: 0 0 6px; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Artikel</p>
                      <p style="margin: 0 0 16px; color: #0a0a0a; font-size: 14px;">${items}</p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p style="margin: 0 0 6px; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Grund</p>
                      <p style="margin: 0; color: #0a0a0a; font-size: 14px;">${reason}</p>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
          
          <!-- Next Steps -->
          <tr>
            <td style="padding: 16px 40px 32px;">
              <h3 style="margin: 0 0 16px; color: #0a0a0a; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Nächste Schritte</h3>
              ${nextStepsHtml}
            </td>
          </tr>

          <!-- Important Note for auto-approved -->
          ${autoApproved ? `
          <tr>
            <td style="padding: 0 40px 32px;">
              <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px;">
                <p style="margin: 0; color: #065f46; font-size: 14px; line-height: 20px;">
                  <strong>📧 Retourenschein:</strong> Du erhältst deinen kostenlosen Retourenschein innerhalb von 24 Stunden an diese E-Mail-Adresse.
                </p>
              </div>
            </td>
          </tr>
          ` : `
          <tr>
            <td style="padding: 0 40px 32px;">
              <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 20px;">
                  <strong>ℹ️ Hinweis:</strong> Deine Retoure liegt außerhalb der 14-Tage-Frist (${daysSinceOrder} Tage). Unser Team prüft deine Anfrage und meldet sich innerhalb von 24 Stunden.
                </p>
              </div>
            </td>
          </tr>
          `}
          
          <!-- CTA -->
          <tr>
            <td style="padding: 0 40px 32px; text-align: center;">
              <a href="https://aldenairperfumes.de/my-returns" style="display: inline-block; background-color: #c9a961; color: #0a0a0a; padding: 14px 32px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px;">Retoure ansehen</a>
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
