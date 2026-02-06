import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@14.10.0"

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) throw new Error('STRIPE_SECRET_KEY not set on server.');

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const { cartItems, origin } = await req.json()

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      throw new Error('Cart is empty');
    }

    const line_items = [];
    const filesMetadata: any[] = [];

    // Iterate items sent from frontend
    for (const item of cartItems) {
      // The priceId is now passed from the frontend, where it was fetched from the 'licenses' table.
      // This assumes 'stripe_payment_link' column in DB holds the Price ID (e.g., price_123).
      // If it held a URL, this would fail. We assume "Payment Link" implies the ID for API usage.
      const priceId = item.priceId;

      if (priceId) {
        line_items.push({
          price: priceId,
          quantity: 1,
        });

        filesMetadata.push({
          name: item.name || 'Unknown Beat',
          url: item.url || '',
          license: item.license
        });
      }
    }

    if (line_items.length === 0) {
      throw new Error('No valid price IDs found.');
    }

    const success_url = `${origin}/success.html?session_id={CHECKOUT_SESSION_ID}`;
    const cancel_url = `${origin}/`;

    const filesJson = JSON.stringify(filesMetadata);
    const metadata = filesJson.length < 500
      ? { files_json: filesJson }
      : { files_json: "DATA_TOO_LARGE_CHECK_DB" };

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: 'payment',
      success_url,
      cancel_url,
      metadata: metadata,
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})