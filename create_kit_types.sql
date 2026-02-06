-- Create kit_types table for Price ID automation
create table public.kit_types (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  stripe_price_id text not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.kit_types enable row level security;

-- Public Read Policy
create policy "Public Read Kit Types"
  on public.kit_types for select
  using ( true );

-- Populate with User provided data
insert into public.kit_types (name, stripe_price_id) values
  ('Drum Kit', 'price_1SxurEGyzcHlN8PYK7B0A1AZ'),
  ('Melody Pack', 'price_1SxurXGyzcHlN8PYDfHvGvbI'),
  ('Loop Kit', 'price_1SxuunGyzcHlN8PY518sydZY'),
  ('One Shot Kit', 'price_1SxuvCGyzcHlN8PYwDSFRRcH')
on conflict (name) do update 
  set stripe_price_id = excluded.stripe_price_id;
