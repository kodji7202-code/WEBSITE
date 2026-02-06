-- SECURE STORAGE SCRIPT
-- This script locks down production buckets to prevent unauthorized access.

-- 1. Make Buckets Private
-- "kits" -> Sound Kits (ZIPs) -> PRIVATE
-- "beats" -> MP3/WAV (Full) -> PRIVATE
-- "stems" -> Track Stems (ZIP) -> PRIVATE
-- "covers" -> Public Images -> REMAIN PUBLIC
-- "previews" -> MP3 Previews -> REMAIN PUBLIC (if exists)

update storage.buckets set public = false where id in ('kits', 'beats', 'stems');
update storage.buckets set public = true where id in ('covers', 'previews');

-- 2. Drop Insecure Policies (Allowing anon select)
-- We remove "Anon Select" policies for private buckets
drop policy if exists "Anon Select Kits" on storage.objects;
drop policy if exists "Give me access to everything" on storage.objects;
drop policy if exists "Public Access" on storage.objects;
-- (Add any specific policies we might have created previously)

-- 3. Create SECURE Policies
-- Allow Service Role (Edge Functions) full access
-- Service Role bypasses RLS by default, but explicit policies help clarity

-- Allow authenticated upload (Admin Dashboard works as 'authenticated' or 'anon' depending on implementation)
-- If Admin is using client-side auth mock, it might be 'anon'. 
-- IF ADMIN IS 'ANON', WE MUST ALLOW INSERT FOR ANON, BUT NOT SELECT.

-- Policy: Anon can INSERT (Upload) but NOT SELECT (Download) in private buckets
drop policy if exists "Anon Upload Kits" on storage.objects;
create policy "Anon Upload Kits" on storage.objects for insert 
with check ( bucket_id = 'kits' );

drop policy if exists "Anon Upload Beats" on storage.objects;
create policy "Anon Upload Beats" on storage.objects for insert 
with check ( bucket_id = 'beats' );

drop policy if exists "Anon Upload Stems" on storage.objects;
create policy "Anon Upload Stems" on storage.objects for insert 
with check ( bucket_id = 'stems' );

-- Policy: Only Service Role (Signed URL creator) can SELECT from private buckets
-- NOTE: `createSignedUrl` works by creating a token. The actual download request uses `storage.objects` permissions.
-- When a Signed URL is used, Supabase verifies the signature. 
-- WE DO NOT NEED A "SELECT" POLICY FOR SIGNED URLS TO WORK if they are signed by Service Role?
-- Actually, Supabase Storage RLS:
-- If public=false, you need a Signed URL.
-- A Signed URL grants temporary permission to access the file.
-- So we just need to ensure NO public 'select' policy exists for 'anon'.

-- 4. Verify Public Buckets
-- Covers and Previews should be readable by everyone
drop policy if exists "Public Read Covers" on storage.objects;
create policy "Public Read Covers" on storage.objects for select 
using ( bucket_id = 'covers' );

drop policy if exists "Public Read Previews" on storage.objects;
create policy "Public Read Previews" on storage.objects for select 
using ( bucket_id = 'previews' );

-- 5. Extra Safety: Deny all other selects on private buckets implicitly (by not adding a policy)
