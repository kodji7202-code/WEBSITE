-- FINAL PERMISSIONS FIX
-- This script grants low-level table permissions which are often missing

-- 1. Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2. Grant access to valid tables
GRANT ALL ON TABLE public.beats TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.sound_kits TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.licenses TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.contact_messages TO anon, authenticated, service_role;

-- 3. Grant access to sequences (important for ID generation if not UUID)
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 4. Re-apply RLS Policies (Just to be safe)
alter table public.sound_kits enable row level security;

drop policy if exists "Enable all for anon sound_kits" on public.sound_kits;

create policy "Enable all for anon sound_kits"
  on public.sound_kits for all
  using ( true )
  with check ( true );

-- 5. Repeat for Beats
alter table public.beats enable row level security;
drop policy if exists "Enable all for anon beats" on public.beats;

create policy "Enable all for anon beats"
  on public.beats for all
  using ( true )
  with check ( true );

-- 6. Verify Storage
insert into storage.buckets (id, name, public) values ('kits', 'kits', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('covers', 'covers', true) on conflict (id) do nothing;

create policy "Anon Insert Kits" on storage.objects for insert with check ( bucket_id = 'kits' );
create policy "Anon Select Kits" on storage.objects for select using ( bucket_id = 'kits' );
create policy "Anon Insert Covers" on storage.objects for insert with check ( bucket_id = 'covers' );
create policy "Anon Select Covers" on storage.objects for select using ( bucket_id = 'covers' );
