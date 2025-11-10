-- ==============================
-- my-tcg.it — Policy Admin per utenti autenticati
-- ==============================
-- Permette agli utenti autenticati di gestire prodotti e recensioni

-- POLICY: INSERT/UPDATE/DELETE per utenti autenticati (admin)
-- Nota: Per limitare solo a utenti specifici, usa una tabella admin_users
-- o controlla l'email nella policy (es. using (auth.jwt() ->> 'email' = 'admin@my-tcg.it'))

-- Rimuovi policy esistenti se presenti (per permettere re-esecuzione idempotente)
drop policy if exists "utenti autenticati possono creare prodotti" on public.products;
drop policy if exists "utenti autenticati possono aggiornare prodotti" on public.products;
drop policy if exists "utenti autenticati possono eliminare prodotti" on public.products;
drop policy if exists "utenti autenticati possono gestire immagini" on public.product_images;
drop policy if exists "utenti autenticati possono gestire featured" on public.featured_products;
drop policy if exists "utenti autenticati possono gestire recensioni" on public.reviews;
drop policy if exists "utenti autenticati possono creare games" on public.games;

-- PRODOTTI
create policy "utenti autenticati possono creare prodotti"
on public.products
for insert
to authenticated
with check (true);

create policy "utenti autenticati possono aggiornare prodotti"
on public.products
for update
to authenticated
using (true)
with check (true);

create policy "utenti autenticati possono eliminare prodotti"
on public.products
for delete
to authenticated
using (true);

-- IMMAGINI PRODOTTO
create policy "utenti autenticati possono gestire immagini"
on public.product_images
for all
to authenticated
using (true)
with check (true);

-- FEATURED
create policy "utenti autenticati possono gestire featured"
on public.featured_products
for all
to authenticated
using (true)
with check (true);

-- RECENSIONI
create policy "utenti autenticati possono gestire recensioni"
on public.reviews
for all
to authenticated
using (true)
with check (true);

-- GAMES (per permettere creazione di "other" se necessario)
create policy "utenti autenticati possono creare games"
on public.games
for insert
to authenticated
with check (true);

-- Nota: Se vuoi limitare a utenti specifici, puoi modificare le policy così:
-- using (auth.jwt() ->> 'email' = 'admin@my-tcg.it')

