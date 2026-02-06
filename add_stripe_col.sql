-- Add Stripe Price ID to sound_kits
alter table public.sound_kits 
add column stripe_price_id text;

-- Ensure RLS allows update (already covered by broad policies, but good to check)
-- This column will hold the Stripe Price ID (e.g. price_1Hh...)
