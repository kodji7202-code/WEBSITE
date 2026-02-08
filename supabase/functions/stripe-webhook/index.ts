import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@14.10.0"

// --- CONFIGURATION ---
// You must set these in Supabase Secrets:
// STRIPE_SECRET_KEY
// STRIPE_WEBHOOK_SIGNING_SECRET
// RESEND_API_KEY

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

interface EmailFile {
  name: string;
  url: string;
  license: string;
}

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})
const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET') || '';
const resendApiKey = Deno.env.get('RESEND_API_KEY') || '';

serve(async (req: Request) => {
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return new Response('No signature', { status: 400 });
  }

  try {
    const body = await req.text();
    let event: Stripe.Event;

    // 1. Verify Stripe Webhook Signature
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        endpointSecret
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Verification failed';
      console.error(`Webhook signature verification failed.`, message);
      return new Response(message, { status: 400 });
    }

    // 2. Handle the Event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerEmail = session.customer_details?.email;
      const filesJson = session.metadata?.files_json;

      if (customerEmail && filesJson) {
        console.log(`Processing order for ${customerEmail}`);

        let files: EmailFile[] = [];
        try {
            files = JSON.parse(filesJson);
        } catch (_e) {
            console.error("Error parsing files metadata");
        }

        // 3. Send Email via Resend
        if (files.length > 0) {
            await sendEmail(customerEmail, files);
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error';
    console.error(err);
    return new Response(message, { status: 500 });
  }
})

async function sendEmail(to: string, files: EmailFile[]): Promise<void> {
    if (!resendApiKey) {
        console.error("RESEND_API_KEY is missing");
        return;
    }

    // Construct Email HTML
    const filesListHtml = files.map((f: EmailFile) => `
        <div style="padding: 15px; background: #f4f4f5; border-radius: 8px; margin-bottom: 10px;">
            <strong style="display:block; font-size: 16px; color: #18181b;">${f.name}</strong>
            <span style="font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 1px;">${f.license} LICENSE</span>
            <br/>
            <a href="${f.url}" style="display: inline-block; margin-top: 10px; padding: 10px 20px; background: #a855f7; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 12px;">DOWNLOAD</a>
        </div>
    `).join('');

    const htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h1 style="color: #a855f7;">Thank you for your order!</h1>
            <p>Your payment has been confirmed. Below you will find the download links for your purchased products:</p>

            ${filesListHtml}

            <p style="margin-top: 30px; font-size: 12px; color: #999;">If you have any issues with the download, please contact us.</p>
        </div>
    `;

    // Fetch call to Resend API
    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
            from: 'Lejja Beats <orders@lejja-beats.com>',
            to: [to],
            subject: 'Your Download Links - Lejja Beats Order',
            html: htmlContent
        })
    });

    const data = await res.json();
    console.log("Email sending result:", data);
}
