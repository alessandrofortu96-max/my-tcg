-- ==============================
-- my-tcg.it — RLS e policy "read-only pubblico"
-- ==============================
-- Obiettivo: chiunque può leggere prodotti pubblicati e recensioni pubblicate;
-- solo server/service role può creare/modificare.

-- Abilita RLS
alter table public.products        enable row level security;
alter table public.product_images  enable row level security;
alter table public.featured_products enable row level security;
alter table public.reviews         enable row level security;
alter table public.games           enable row level security;
alter table public.product_types   enable row level security;
alter table public.site_settings   enable row level security;

-- POLICY: SELECT pubblica (anon & authenticated)
-- Rimuovi policy esistenti se presenti (per permettere re-esecuzione idempotente)
drop policy if exists "prodotti pubblicati leggibili" on public.products;
drop policy if exists "immagini leggibili se prodotto pubblicato" on public.product_images;
drop policy if exists "featured leggibili se prodotto pubblicato" on public.featured_products;
drop policy if exists "reviews pubblicate leggibili" on public.reviews;
drop policy if exists "lookup tabelle di rif" on public.games;
drop policy if exists "lookup tabelle di rif types" on public.product_types;
drop policy if exists "settings leggibili" on public.site_settings;

-- Crea le policy
create policy "prodotti pubblicati leggibili"
on public.products
for select
to anon, authenticated
using (published = true);

create policy "immagini leggibili se prodotto pubblicato"
on public.product_images
for select
to anon, authenticated
using (exists (
  select 1 from public.products p where p.id = product_id and p.published = true
));

create policy "featured leggibili se prodotto pubblicato"
on public.featured_products
for select
to anon, authenticated
using (exists (
  select 1 from public.products p where p.id = product_id and p.published = true
));

create policy "reviews pubblicate leggibili"
on public.reviews
for select
to anon, authenticated
using (published = true);

create policy "lookup tabelle di rif"
on public.games
for select
to anon, authenticated
using (true);

create policy "lookup tabelle di rif types"
on public.product_types
for select
to anon, authenticated
using (true);

create policy "settings leggibili"
on public.site_settings
for select
to anon, authenticated
using (true);

-- Nessuna policy di INSERT/UPDATE/DELETE per utenti pubblici.
-- Le operazioni di scrittura le fai SOLO da backend con Service Role (RLS bypass).

-- Nota storage (facoltativo): se vuoi usare i bucket Supabase per immagini/screenshot:
-- crea bucket pubblici
insert into storage.buckets (id, name, public) values
  ('product-images','product-images', true),
  ('review-screens','review-screens', true)
on conflict (id) do nothing;

-- Imposta le policies di storage via dashboard (pubbliche in sola lettura; upload solo con service role).

