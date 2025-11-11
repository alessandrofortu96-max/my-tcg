-- ==============================
-- my-tcg.it — Fix Security Issues (Alternativa)
-- ==============================
-- Se la migration principale non risolve il problema, prova questa versione alternativa
-- che verifica e corregge più aggressivamente il problema della vista

-- 1. Verifica lo stato attuale della vista
-- (Esegui questa query per vedere come è definita)
-- SELECT 
--   schemaname,
--   viewname,
--   viewowner,
--   definition
-- FROM pg_views
-- WHERE viewname = 'v_featured';

-- 2. Rimuovi completamente la vista e tutte le dipendenze
drop view if exists public.v_featured cascade;

-- 3. Se esistono ancora riferimenti, rimuovili manualmente
-- (Questo potrebbe non essere necessario, ma è utile come fallback)

-- 4. Ricrea la vista con il ruolo corrente (non con privilegi elevati)
-- Assicurati di essere connesso come utente 'postgres' o un ruolo senza privilegi speciali
create view public.v_featured
as
select 
  p.id,
  p.slug,
  p.name,
  p.set_name,
  p.code,
  p.language,
  p.condition,
  p.description,
  p.price_cents,
  p.currency,
  p.status,
  p.published,
  p.game_id,
  p.type_id,
  p.created_at,
  p.updated_at,
  fp.rank
from public.featured_products fp
inner join public.products p on p.id = fp.product_id
where p.published = true;

-- 5. Cambia il proprietario esplicitamente
alter view public.v_featured owner to postgres;

-- 6. Revoca tutti i privilegi esistenti e riconcedili esplicitamente
revoke all on public.v_featured from public;
revoke all on public.v_featured from anon;
revoke all on public.v_featured from authenticated;

-- 7. Concedi solo i permessi necessari
grant select on public.v_featured to anon;
grant select on public.v_featured to authenticated;

-- 8. Verifica che la vista non abbia SECURITY DEFINER
-- (PostgreSQL non ha un modo diretto per verificare, ma questa query aiuta)
-- SELECT 
--   n.nspname as schema,
--   c.relname as view_name,
--   pg_get_userbyid(c.relowner) as owner,
--   pg_get_viewdef(c.oid) as definition
-- FROM pg_class c
-- JOIN pg_namespace n ON n.oid = c.relnamespace
-- WHERE c.relkind = 'v' 
-- AND c.relname = 'v_featured'
-- AND n.nspname = 'public';

-- Nota finale:
-- Se il problema persiste, potrebbe essere necessario rimuovere completamente la vista
-- e usare direttamente la query nelle applicazioni invece di una vista.
-- In alternativa, contatta il supporto Supabase per verificare se c'è una configurazione
-- specifica del progetto che causa questo problema.

