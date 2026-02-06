-- Enable RLS (idempotent)
alter table public.beats enable row level security;
alter table public.sound_kits enable row level security;

-- 1. CLEANUP: Drop existing policies to ensure clean slate
drop policy if exists "Public Read Access" on public.beats;
drop policy if exists "Enable read access for all users" on public.beats;
drop policy if exists "Admin Write Access" on public.beats;
drop policy if exists "Enable insert for all users" on public.beats;
drop policy if exists "Enable update for all users" on public.beats;
drop policy if exists "Enable delete for all users" on public.beats;

drop policy if exists "Public Read Access" on public.sound_kits;
drop policy if exists "Admin Write Access" on public.sound_kits;
drop policy if exists "Admin Update Access" on public.sound_kits;
drop policy if exists "Admin Delete Access" on public.sound_kits;

-- 2. BEATS TABLE POLICIES (Allow public read, allow anon write for Dashboard)
create policy "Allow Public Read Beats"
  on public.beats for select
  using ( true );

create policy "Allow Anon Insert Beats"
  on public.beats for insert
  with check ( true );

create policy "Allow Anon Update Beats"
  on public.beats for update
  using ( true );

create policy "Allow Anon Delete Beats"
  on public.beats for delete
  using ( true );

-- 3. SOUND KITS TABLE POLICIES (Allow public read, allow anon write for Dashboard)
create policy "Allow Public Read Sound Kits"
  on public.sound_kits for select
  using ( true );

create policy "Allow Anon Insert Sound Kits"
  on public.sound_kits for insert
  with check ( true );

create policy "Allow Anon Update Sound Kits"
  on public.sound_kits for update
  using ( true );

create policy "Allow Anon Delete Sound Kits"
  on public.sound_kits for delete
  using ( true );

-- 4. STORAGE BUCKETS (Cover images and Files)
-- Ensure 'covers' and 'kits' buckets exist and are public
insert into storage.buckets (id, name, public) 
values ('covers', 'covers', true) 
on conflict (id) do nothing;

insert into storage.buckets (id, name, public) 
values ('kits', 'kits', true) 
on conflict (id) do nothing;

insert into storage.buckets (id, name, public) 
values ('mp3s', 'mp3s', true) 
on conflict (id) do nothing;

-- Storage Policies - Public Read
create policy "Public Access Covers"
  on storage.objects for select
  using ( bucket_id = 'covers' );

create policy "Public Access Kits" 
  on storage.objects for select
  using ( bucket_id = 'kits' );

create policy "Public Access MP3s"
  on storage.objects for select
  using ( bucket_id = 'mp3s' );

-- Storage Policies - Anon Write (for Dashboard)
create policy "Anon Upload Covers"
  on storage.objects for insert
  with check ( bucket_id = 'covers' );

create policy "Anon Upload Kits"
  on storage.objects for insert
  with check ( bucket_id = 'kits' );

create policy "Anon Upload MP3s"
  on storage.objects for insert
  with check ( bucket_id = 'mp3s' );
