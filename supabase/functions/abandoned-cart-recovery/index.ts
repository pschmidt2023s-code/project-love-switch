import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Find abandoned carts older than 1 hour, not recovered, with less than 3 reminders
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: carts, error } = await supabase
      .from('abandoned_carts')
      .select('*')
      .eq('recovered', false)
      .lt('reminder_sent_count', 3)
      .lt('created_at', oneHourAgo)
      .order('created_at', { ascending: true })
      .limit(10);

    if (error) throw error;

    let sentCount = 0;

    for (const cart of carts || []) {
      let email = cart.guest_email;

      // If no guest email, try to get user email
      if (!email && cart.user_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', cart.user_id)
          .single();
        email = profile?.email;
      }

      if (!email) continue;

      // Send reminder email
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'ALDENAIR <noreply@aldenair.de>',
          to: email,
          subject: cart.reminder_sent_count === 0
            ? 'Du hast etwas vergessen! 🛒'
            : cart.reminder_sent_count === 1
            ? 'Dein Warenkorb wartet auf dich'
            : 'Letzte Chance: 10% Rabatt auf deinen Warenkorb',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Hallo!</h2>
              <p>Du hast Artikel in deinem Warenkorb hinterlassen. Schließe deine Bestellung jetzt ab!</p>
              <p>Warenkorbwert: <strong>€${Number(cart.total_amount).toFixed(2)}</strong></p>
              ${cart.reminder_sent_count >= 2 ? '<p><strong>Nutze den Code COMEBACK10 für 10% Rabatt!</strong></p>' : ''}
              <a href="https://sweet-code-shift.lovable.app/cart" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; margin-top: 16px;">Zum Warenkorb</a>
            </div>
          `,
        }),
      });

      if (emailRes.ok) {
        sentCount++;
        await supabase
          .from('abandoned_carts')
          .update({
            reminder_sent_count: cart.reminder_sent_count + 1,
            last_reminder_at: new Date().toISOString(),
          })
          .eq('id', cart.id);

        // Log the email
        await supabase.from('email_logs').insert({
          type: 'abandoned_cart_reminder',
          recipient_email: email,
          subject: 'Warenkorb-Erinnerung',
          status: 'sent',
        });
      }
    }

    return new Response(JSON.stringify({ success: true, sent: sentCount }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
