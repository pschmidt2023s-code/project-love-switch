import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SUBSCRIPTION-REMINDERS] ${step}${detailsStr}`);
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const sendEmailWithRetry = async (
  emailData: { from: string; to: string[]; subject: string; html: string },
  retries = 3
): Promise<{ success: boolean; error?: string; resendId?: string }> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      logStep(`Email attempt ${attempt}/${retries}`, { to: emailData.to[0] });
      
      const result = await resend.emails.send(emailData);
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      logStep("Email sent successfully", { resendId: result.data?.id });
      return { success: true, resendId: result.data?.id };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logStep(`Email attempt ${attempt} failed`, { error: errorMessage });
      
      if (attempt === retries) {
        return { success: false, error: errorMessage };
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  return { success: false, error: "Max retries reached" };
};

const generateReminderEmail = (subscription: {
  guest_name?: string | null;
  guest_email?: string | null;
  next_delivery: string;
  frequency: string;
  discount_percent: number;
  variant?: { name?: string | null; size?: string } | null;
  product?: { name?: string | null } | null;
}) => {
  const name = subscription.guest_name || "Geschätzter Kunde";
  const productName = subscription.variant?.name || subscription.product?.name || "Ihr Parfüm";
  const nextDeliveryDate = new Date(subscription.next_delivery).toLocaleDateString('de-DE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Abo-Erinnerung</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8f7f4;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f7f4;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e3df;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #e5e3df;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 8px; color: #1a1a1a;">ALDENAIR</h1>
              <p style="margin: 10px 0 0; font-size: 10px; letter-spacing: 3px; color: #888888; text-transform: uppercase;">Parfümerie</p>
            </td>
          </tr>

          <!-- Icon -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <div style="width: 60px; height: 60px; margin: 0 auto; background-color: #f8f7f4; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 30px;">📦</span>
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <h2 style="margin: 0 0 20px; font-size: 22px; font-weight: 400; color: #1a1a1a; text-align: center;">
                Ihre nächste Lieferung steht bevor
              </h2>
              
              <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.7; color: #4a4a4a;">
                Liebe(r) ${name},
              </p>
              
              <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.7; color: #4a4a4a;">
                Wir möchten Sie daran erinnern, dass Ihre nächste Abo-Lieferung in <strong>3 Tagen</strong> erfolgt.
              </p>

              <!-- Delivery Details -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0; background-color: #f8f7f4; padding: 25px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px; font-size: 10px; letter-spacing: 2px; color: #888888; text-transform: uppercase;">
                      Nächste Lieferung
                    </p>
                    <p style="margin: 0 0 15px; font-size: 16px; color: #1a1a1a; font-weight: 500;">
                      ${nextDeliveryDate}
                    </p>
                    <p style="margin: 0 0 5px; font-size: 10px; letter-spacing: 2px; color: #888888; text-transform: uppercase;">
                      Produkt
                    </p>
                    <p style="margin: 0 0 15px; font-size: 16px; color: #1a1a1a;">
                      ${productName}
                    </p>
                    <p style="margin: 0 0 5px; font-size: 10px; letter-spacing: 2px; color: #888888; text-transform: uppercase;">
                      Ihr Rabatt
                    </p>
                    <p style="margin: 0; font-size: 16px; color: #c9a050; font-weight: 500;">
                      ${subscription.discount_percent}% Abonnenten-Rabatt
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 30px; font-size: 15px; line-height: 1.7; color: #4a4a4a;">
                Falls Sie Änderungen an Ihrem Abonnement vornehmen möchten, können Sie dies jederzeit in Ihrem Kundenkonto tun oder uns kontaktieren.
              </p>

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <a href="https://aldenair.de/profile" style="display: inline-block; padding: 16px 40px; background-color: #1a1a1a; color: #ffffff; text-decoration: none; font-size: 11px; letter-spacing: 2px; text-transform: uppercase;">
                      Mein Abonnement verwalten
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid #e5e3df; text-align: center;">
              <p style="margin: 0 0 10px; font-size: 12px; color: #888888;">
                Vielen Dank für Ihr Vertrauen in ALDENAIR.
              </p>
              <p style="margin: 0; font-size: 11px; color: #aaaaaa;">
                Bei Fragen: support@aldenair.de
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting subscription reminders cron job");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Calculate the date 3 days from now
    const now = new Date();
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(now.getDate() + 3);
    const targetDate = threeDaysFromNow.toISOString().split('T')[0];

    logStep("Checking for subscriptions with next delivery", { targetDate });

    // Get subscriptions that need reminders
    const { data: subscriptions, error: fetchError } = await supabaseAdmin
      .from('subscriptions')
      .select(`
        id,
        user_id,
        guest_email,
        guest_name,
        next_delivery,
        frequency,
        discount_percent,
        product:products(name),
        variant:product_variants(name, size)
      `)
      .eq('status', 'active')
      .eq('next_delivery', targetDate);

    if (fetchError) {
      throw new Error(`Failed to fetch subscriptions: ${fetchError.message}`);
    }

    logStep("Found subscriptions to remind", { count: subscriptions?.length || 0 });

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No subscriptions to remind", count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let sentCount = 0;
    let failedCount = 0;

    for (const subscription of subscriptions) {
      let email: string | null = subscription.guest_email;
      let name: string | null = subscription.guest_name;

      // If it's a user subscription, fetch their email from profiles
      if (subscription.user_id && !email) {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('email, first_name')
          .eq('id', subscription.user_id)
          .single();

        if (profile) {
          email = profile.email;
          name = profile.first_name;
        }
      }

      if (!email) {
        logStep("Skipping subscription without email", { subscriptionId: subscription.id });
        continue;
      }

      const htmlContent = generateReminderEmail({
        ...subscription,
        guest_name: name,
        guest_email: email,
        product: Array.isArray(subscription.product) ? subscription.product[0] : subscription.product,
        variant: Array.isArray(subscription.variant) ? subscription.variant[0] : subscription.variant,
      });

      const senderEmail = Deno.env.get("RESEND_API_KEY")?.startsWith("re_")
        ? "ALDENAIR <noreply@aldenair.de>"
        : "ALDENAIR <onboarding@resend.dev>";

      const emailResult = await sendEmailWithRetry({
        from: senderEmail,
        to: [email],
        subject: "Erinnerung: Ihre Abo-Lieferung in 3 Tagen",
        html: htmlContent,
      });

      // Log the email
      await supabaseAdmin.from('email_logs').insert({
        type: 'subscription_reminder',
        recipient_email: email,
        recipient_name: name,
        subject: "Erinnerung: Ihre Abo-Lieferung in 3 Tagen",
        status: emailResult.success ? 'sent' : 'failed',
        error_message: emailResult.error,
        resend_id: emailResult.resendId,
        metadata: {
          subscription_id: subscription.id,
          next_delivery: subscription.next_delivery,
        },
      });

      if (emailResult.success) {
        sentCount++;
      } else {
        failedCount++;
      }
    }

    logStep("Cron job completed", { sentCount, failedCount });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sent ${sentCount} reminder emails, ${failedCount} failed`,
        sentCount,
        failedCount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in send-subscription-reminders", { error: errorMessage });
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
