import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const name = firstName || 'Kunde';

    const htmlContent = `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:Georgia,'Times New Roman',serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <!-- Header -->
    <div style="background:#1a1a1a;padding:40px 30px;text-align:center;">
      <h1 style="color:#b48c46;font-size:28px;font-weight:400;letter-spacing:4px;margin:0;">ALDENAIR</h1>
      <p style="color:#888;font-size:11px;letter-spacing:3px;margin-top:8px;text-transform:uppercase;">Premium Parfüms</p>
    </div>
    
    <!-- Content -->
    <div style="padding:40px 30px;">
      <h2 style="font-size:22px;color:#1a1a1a;font-weight:400;margin:0 0 20px;">
        Willkommen, ${name}!
      </h2>
      
      <p style="color:#555;font-size:15px;line-height:1.8;margin:0 0 20px;">
        Wir freuen uns, Sie bei ALDENAIR begrüßen zu dürfen. Entdecken Sie unsere exklusive Kollektion 
        hochwertiger Parfüms — inspiriert von weltbekannten Luxusmarken.
      </p>
      
      <div style="background:#f9f8f5;border-left:3px solid #b48c46;padding:20px;margin:25px 0;">
        <p style="color:#1a1a1a;font-size:14px;margin:0;font-style:italic;">
          „Jeder Duft erzählt eine Geschichte. Finden Sie Ihre."
        </p>
      </div>
      
      <p style="color:#555;font-size:15px;line-height:1.8;margin:0 0 25px;">
        Als Willkommensgeschenk erhalten Sie <strong>kostenlosen Versand</strong> auf Ihre erste Bestellung ab 30€.
      </p>
      
      <!-- CTA -->
      <div style="text-align:center;margin:30px 0;">
        <a href="https://sweet-code-shift.lovable.app/products" 
           style="display:inline-block;background:#1a1a1a;color:#ffffff;padding:16px 40px;font-size:12px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;font-weight:600;">
          Kollektion entdecken
        </a>
      </div>
      
      <!-- Benefits -->
      <div style="border-top:1px solid #eee;padding-top:25px;margin-top:30px;">
        <p style="font-size:13px;color:#888;text-transform:uppercase;letter-spacing:2px;margin:0 0 15px;">Ihre Vorteile</p>
        <table style="width:100%;" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:8px 0;color:#555;font-size:14px;">✦ Kostenloser Versand ab 50€</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#555;font-size:14px;">✦ 14 Tage Rückgaberecht</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#555;font-size:14px;">✦ Gratis Duftproben bei jeder Bestellung</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#555;font-size:14px;">✦ Treueprogramm mit exklusiven Rabatten</td>
          </tr>
        </table>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background:#1a1a1a;padding:25px 30px;text-align:center;">
      <p style="color:#888;font-size:11px;letter-spacing:1px;margin:0;">
        © 2026 ALDENAIR · Premium Parfüms
      </p>
    </div>
  </div>
</body>
</html>`;

    // Send via Resend
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'ALDENAIR <noreply@aldenairperfumes.de>',
        to: [email],
        subject: `Willkommen bei ALDENAIR, ${name}!`,
        html: htmlContent,
      }),
    });

    const resendData = await resendRes.json();

    // Log the email
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase.from('email_logs').insert({
      type: 'welcome',
      recipient_email: email,
      recipient_name: name,
      subject: `Willkommen bei ALDENAIR, ${name}!`,
      status: resendRes.ok ? 'sent' : 'failed',
      resend_id: resendData.id || null,
      error_message: resendRes.ok ? null : JSON.stringify(resendData),
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Welcome email error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
