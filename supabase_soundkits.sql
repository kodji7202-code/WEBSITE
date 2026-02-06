-- Create sound_kits table
create table public.sound_kits (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  type text not null, -- 'Drum Kit', 'Melody Pack', 'Loop Kit'
  price numeric not null default 0,
  description text,
  cover_path text, -- URL to image in Storage
  file_path text, -- URL to ZIP file in Storage (or external link)
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.sound_kits enable row level security;

-- Policies
create policy "Public Read Access"
  on public.sound_kits for select
  using ( true );

create policy "Admin Write Access"
  on public.sound_kits for insert
  with check ( true ); -- In production this should check auth.uid()

create policy "Admin Update Access"
  on public.sound_kits for update
  using ( true );

create policy "Admin Delete Access"
  on public.sound_kits for delete
  using ( true );
