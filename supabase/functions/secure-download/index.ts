import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from "https://esm.sh/stripe@14.10.0"

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

interface FileMetadata {
  name: string;
  url: string;
  license: string;
}

interface SignedFile extends FileMetadata {
  downloadUrl: string;
}

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
        if (!stripeKey) throw new Error('STRIPE_SECRET_KEY not set.');

        const stripe = new Stripe(stripeKey, {
            apiVersion: '2023-10-16',
            httpClient: Stripe.createFetchHttpClient(),
        })

        const { session_id }: { session_id: string } = await req.json()
        if (!session_id) throw new Error('Session ID missing');

        // 1. Verify Stripe Session
        const session = await stripe.checkout.sessions.retrieve(session_id);
        if (!session || session.payment_status !== 'paid') {
            throw new Error('Payment not verified');
        }

        // 2. Parse Metadata (Files)
        let files: FileMetadata[] = [];
        if (session.metadata && session.metadata.files_json) {
            files = JSON.parse(session.metadata.files_json);
        } else {
            throw new Error('No files found in purchase metadata');
        }

        // 3. Generate Signed URLs
        const signedFiles: SignedFile[] = await Promise.all(files.map(async (file: FileMetadata) => {
            let bucket = '';
            let path = '';

            // Detect bucket and path from URL
            if (file.url.includes('/kits/')) {
                bucket = 'kits';
                path = file.url.split('/kits/')[1];
            } else if (file.url.includes('/beats/')) {
                bucket = 'beats';
                path = file.url.split('/beats/')[1];
            } else if (file.url.includes('/stems/')) {
                bucket = 'stems';
                path = file.url.split('/stems/')[1];
            }

            if (bucket && path) {
                // Generate Signed URL (valid 1 hour)
                const { data, error } = await supabaseClient
                    .storage
                    .from(bucket)
                    .createSignedUrl(decodeURIComponent(path), 3600);

                if (data?.signedUrl) {
                    return { ...file, downloadUrl: data.signedUrl };
                }
            }

            // Fallback: return original URL
            return { ...file, downloadUrl: file.url };
        }));

        return new Response(
            JSON.stringify({ files: signedFiles }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return new Response(
            JSON.stringify({ error: message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
