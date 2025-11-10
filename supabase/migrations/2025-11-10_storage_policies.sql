-- ==============================
-- my-tcg.it — Storage Policies per product-images
-- ==============================
-- Obiettivo: permettere agli utenti autenticati di uploadare immagini prodotti

-- Crea il bucket se non esiste
-- NOTA: Se il bucket esiste già con restrizioni MIME type, potrebbe bloccarli
-- Verifica nel dashboard Supabase → Storage → product-images → Settings
-- e rimuovi le restrizioni su "Allowed MIME types" se presenti
insert into storage.buckets (id, name, public)
values
  ('product-images', 'product-images', true)
on conflict (id) do update
set
  public = true;

-- NOTA IMPORTANTE: Le restrizioni sui MIME types (allowed_mime_types) possono causare errori
-- Se vedi errori "mime type application/json is not supported", vai nel dashboard Supabase:
-- 1. Storage → product-images → Settings
-- 2. Rimuovi o modifica "Allowed MIME types" per permettere: image/jpeg, image/jpg, image/png, image/webp
-- 3. Oppure rimuovi completamente le restrizioni se vuoi permettere tutti i tipi di immagine

-- Rimuovi policy esistenti se presenti (per permettere re-esecuzione idempotente)
drop policy if exists "product-images-public-read" on storage.objects;
drop policy if exists "product-images-authenticated-upload" on storage.objects;
drop policy if exists "product-images-authenticated-delete" on storage.objects;
drop policy if exists "product-images-authenticated-update" on storage.objects;

-- Policy: chiunque può leggere le immagini (bucket pubblico)
create policy "product-images-public-read"
on storage.objects
for select
to public
using (bucket_id = 'product-images');

-- Policy: utenti autenticati possono uploadare in qualsiasi cartella del bucket
create policy "product-images-authenticated-upload"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'product-images');

-- Policy: utenti autenticati possono eliminare file dal bucket
create policy "product-images-authenticated-delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'product-images');

-- Policy: utenti autenticati possono aggiornare file nel bucket
create policy "product-images-authenticated-update"
on storage.objects
for update
to authenticated
using (bucket_id = 'product-images');

