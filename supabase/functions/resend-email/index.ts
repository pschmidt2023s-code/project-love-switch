import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ResendEmailRequest {
  emailLogId: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendEmailWithRetry(
  resend: any,
  emailParams: { from: string; to: string[]; subject: string; html: string },
  retries = MAX_RETRIES
): Promise<{ data?: { id: string }; error?: any }> {
  let lastError: any = null;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`[RESEND-EMAIL] Attempt ${attempt}/${retries}`);
      const result = await resend.emails.send(emailParams);
      
      if (result.error) {
        if (result.error.message?.includes("testing emails") || 
            result.error.message?.includes("verify a domain") ||
            result.error.message?.includes("invalid_email")) {
          return result;
        }
        lastError = result.error;
        console.warn(`[RESEND-EMAIL] Attempt ${attempt} failed:`, result.error.message);
      } else {
        return result;
      }
    } catch (err) {
      lastError = err;
      console.warn(`[RESEND-EMAIL] Attempt ${attempt} threw exception:`, err);
    }
    
    if (attempt < retries) {
      const backoffDelay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
      await delay(backoffDelay);
    }
  }
  
  return { error: lastError };
}

function generateGenericRetryHtml(
  type: string,
  recipientName: string,
  metadata: Record<string, any>
): string {
  const content = metadata?.originalContent || 'Diese E-Mail wurde erneut gesendet.';
  
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
            <td style="padding: 40px; text-align: center;">
              <h2 style="margin: 0 0 16px; color: #0a0a0a; font-size: 20px; font-weight: 600;">Hallo ${recipientName || 'Kunde'},</h2>
              <p style="margin: 0; color: #666666; font-size: 15px; line-height: 24px;">${content}</p>
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
    // Verify admin access
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id)
      .in('role', ['admin', 'manager'])
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Access denied" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { emailLogId }: ResendEmailRequest = await req.json();
    
    if (!emailLogId) {
      return new Response(JSON.stringify({ error: "emailLogId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch original email log
    const { data: emailLog, error: logError } = await supabase
      .from('email_logs')
      .select('*')
      .eq('id', emailLogId)
      .single();

    if (logError || !emailLog) {
      return new Response(JSON.stringify({ error: "Email log not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (emailLog.status === 'sent') {
      return new Response(JSON.stringify({ error: "Email already sent successfully" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[RESEND-EMAIL] Retrying email ${emailLogId} to ${emailLog.recipient_email}`);

    const resend = new Resend(resendKey);

    const html = generateGenericRetryHtml(
      emailLog.type,
      emailLog.recipient_name,
      emailLog.metadata || {}
    );

    const emailParams = {
      from: "ALDENAIR <noreply@aldenairperfumes.de>",
      to: [emailLog.recipient_email],
      subject: emailLog.subject,
      html,
    };

    const { data: emailData, error: sendError } = await sendEmailWithRetry(resend, emailParams);

    if (sendError) {
      console.error("[RESEND-EMAIL] Failed after retries:", sendError);
      
      // Update log with new error
      await supabase
        .from('email_logs')
        .update({
          error_message: sendError.message || 'Retry failed',
          metadata: {
            ...(emailLog.metadata || {}),
            lastRetryAt: new Date().toISOString(),
            retryError: sendError.message
          }
        })
        .eq('id', emailLogId);

      return new Response(JSON.stringify({ 
        success: false, 
        error: sendError.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update log to sent
    await supabase
      .from('email_logs')
      .update({
        status: 'sent',
        resend_id: emailData?.id,
        error_message: null,
        metadata: {
          ...(emailLog.metadata || {}),
          resentAt: new Date().toISOString(),
          resentBy: userData.user.id
        }
      })
      .eq('id', emailLogId);

    console.log(`[RESEND-EMAIL] Successfully resent email ${emailLogId}`);

    return new Response(JSON.stringify({ 
      success: true, 
      resendId: emailData?.id 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("[RESEND-EMAIL] Error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
