import { createClient } from 'npm:@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface NotificationPayload {
  user_id: string;
  title: string;
  message: string;
  data?: Record<string, any>;
}

interface ExpoPushMessage {
  to: string;
  sound: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: NotificationPayload = await req.json();
    const { user_id, title, message, data } = payload;

    if (!user_id || !title || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get user's push tokens
    const { data: tokens, error: tokenError } = await supabase
      .from('user_push_tokens')
      .select('push_token')
      .eq('user_id', user_id);

    if (tokenError) {
      console.error('Error fetching push tokens:', tokenError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch push tokens' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!tokens || tokens.length === 0) {
      console.log('No push tokens found for user:', user_id);
      return new Response(
        JSON.stringify({ message: 'No push tokens registered for user' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Prepare push notifications
    const messages: ExpoPushMessage[] = tokens.map((token) => ({
      to: token.push_token,
      sound: 'default',
      title,
      body: message,
      data: data || {},
    }));

    // Send to Expo Push Notification service
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();

    console.log('Push notification sent:', result);

    return new Response(
      JSON.stringify({ success: true, result }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in send-push-notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
