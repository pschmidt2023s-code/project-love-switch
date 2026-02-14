import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data, error } = await supabase.auth.getClaims(authHeader.replace('Bearer ', ''));
    if (error || !data?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = data.claims.sub;

    // Fetch all user data
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const [profile, addresses, orders, wishlist, returns, tickets, subscriptions, paybackEarnings] = await Promise.all([
      serviceClient.from('profiles').select('*').eq('id', userId).single(),
      serviceClient.from('addresses').select('*').eq('user_id', userId),
      serviceClient.from('orders').select('*, order_items(*)').eq('user_id', userId),
      serviceClient.from('wishlist').select('*').eq('user_id', userId),
      serviceClient.from('returns').select('*').eq('user_id', userId),
      serviceClient.from('tickets').select('*').eq('user_id', userId),
      serviceClient.from('subscriptions').select('*').eq('user_id', userId),
      serviceClient.from('payback_earnings').select('*').eq('user_id', userId),
    ]);

    const exportData = {
      export_date: new Date().toISOString(),
      gdpr_article: 'Art. 15 DSGVO - Auskunftsrecht',
      personal_data: {
        profile: profile.data,
        addresses: addresses.data || [],
      },
      transaction_data: {
        orders: orders.data || [],
        returns: returns.data || [],
        subscriptions: subscriptions.data || [],
      },
      engagement_data: {
        wishlist: wishlist.data || [],
        payback_earnings: paybackEarnings.data || [],
      },
      support_data: {
        tickets: tickets.data || [],
      },
    };

    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="dsgvo-export-${userId}.json"`,
      },
    });
  } catch (error) {
    console.error('GDPR Export Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
