-- ==============================
-- my-tcg.it  — schema iniziale
-- ==============================

-- ENUM utili
do $$ begin
  if not exists (select 1 from pg_type where typname = 'platform_enum') then
    create type platform_enum as enum ('Vinted', 'CardTrader', 'Wallapop');
  end if;
  if not exists (select 1 from pg_type where typname = 'product_status') then
    create type product_status as enum ('DISPONIBILE', 'VENDUTO');
  end if;
end $$;

-- TABELLE DI RIFERIMENTO
create table if not exists public.games (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,      -- 'pokemon' | 'yu-gi-oh' | 'one-piece'
  name       text not null,
  created_at timestamptz default now()
);

create table if not exists public.product_types (
  id    smallint primary key,
  slug  text unique not null,           -- 'raw' | 'graded' | 'sealed'
  name  text not null                   -- 'Carte RAW' | 'Carte Gradate' | 'Prodotti Sigillati'
);

-- PRODOTTI
create table if not exists public.products (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,            -- es. 'charizard-vmax-sv107-eng'
  name         text not null,                   -- 'Charizard VMAX'
  set_name     text,                            -- 'Shining Fates'
  code         text,                            -- 'SV107'
  language     text,                            -- 'ENG', 'ITA', 'JPN'
  condition    text,                            -- 'NM', 'LP', ...
  description  text,
  price_cents  integer not null check (price_cents >= 0),
  currency     text not null default 'EUR',
  status       product_status not null default 'DISPONIBILE',
  published    boolean not null default true,
  game_id      uuid not null references public.games(id) on delete restrict,
  type_id      smallint not null references public.product_types(id) on delete restrict,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create index if not exists idx_products_game on public.products(game_id);
create index if not exists idx_products_type on public.products(type_id);
create index if not exists idx_products_status on public.products(status);
create index if not exists idx_products_published on public.products(published);

-- IMMAGINI PRODOTTO
create table if not exists public.product_images (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url        text not null,
  alt        text,
  sort_order integer not null default 0
);
create index if not exists idx_product_images_product on public.product_images(product_id);

-- FEATURED (home "In evidenza oggi")
create table if not exists public.featured_products (
  product_id uuid primary key references public.products(id) on delete cascade,
  rank       integer not null default 0
);

-- RECENSIONI (se vuoi tenerle in DB invece che JSON locale)
create table if not exists public.reviews (
  id             uuid primary key default gen_random_uuid(),
  platform       platform_enum not null,
  rating         smallint not null check (rating between 1 and 5),
  author         text not null,
  review_date    date not null,
  title          text,
  text           text,
  screenshot_url text,
  published      boolean not null default true,
  created_at     timestamptz default now()
);
create index if not exists idx_reviews_platform on public.reviews(platform);
create index if not exists idx_reviews_published on public.reviews(published);
create index if not exists idx_reviews_date on public.reviews(review_date desc);

-- SETTINGS minimi per contatti/CTA (opzionale)
create table if not exists public.site_settings (
  key text primary key,
  val text not null
);

-- TRIGGER updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_products_updated on public.products;
create trigger trg_products_updated
before update on public.products
for each row execute function public.set_updated_at();

-- SEED DI BASE
insert into public.games (slug, name) values
  ('pokemon','Pokémon'),
  ('yu-gi-oh','Yu-Gi-Oh!'),
  ('one-piece','One Piece')
on conflict (slug) do nothing;

insert into public.product_types (id, slug, name) values
  (1,'raw','Carte RAW'),
  (2,'graded','Carte Gradate'),
  (3,'sealed','Prodotti Sigillati')
on conflict (id) do nothing;

-- NOTA: Vista v_featured rimossa per sicurezza
-- La vista non è utilizzata nel codice (getFeaturedProducts() usa query dirette alle tabelle)
-- Rimuoverla elimina il problema SECURITY DEFINER segnalato dal Security Advisor
-- Se necessario in futuro, può essere ricreata con: CREATE VIEW ... WITH (security_invoker = true) AS ...


