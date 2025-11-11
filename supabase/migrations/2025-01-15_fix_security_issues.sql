-- ==============================
-- my-tcg.it — Fix Security Issues
-- ==============================
-- Risolve i problemi di sicurezza segnalati da Supabase Security Advisor:
-- 1. Function search_path mutable
-- 2. Security definer view

-- 1. FIX: Function set_updated_at con search_path fisso
-- https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable
create or replace function public.set_updated_at()
returns trigger 
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- 2. FIX: Rimuovi vista v_featured con SECURITY DEFINER
-- https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view
-- 
-- Problema: Supabase rileva che la vista ha SECURITY DEFINER, che può essere un rischio di sicurezza.
-- 
-- Soluzione: Rimuovere completamente la vista poiché:
-- 1. Non è utilizzata nel codice dell'applicazione (getFeaturedProducts() usa query dirette)
-- 2. PostgreSQL 15+ supporta security_invoker, ma Supabase potrebbe non supportarlo correttamente
-- 3. È più sicuro usare query dirette che rispettano le RLS policies
--
-- Se in futuro serve la vista, ricreala con:
-- CREATE VIEW public.v_featured WITH (security_invoker = true) AS ...

-- Rimuovi completamente la vista esistente (CASCADE rimuove anche le dipendenze)
drop view if exists public.v_featured cascade;

-- Nota: La vista non viene ricreata perché:
-- - Non è utilizzata nel codice (getFeaturedProducts() fa query dirette alle tabelle)
-- - Rimuoverla elimina il problema di sicurezza
-- - Se necessario in futuro, può essere ricreata con la sintassi corretta per PostgreSQL 15+

-- Note:
-- - La funzione set_updated_at ora ha search_path fisso per sicurezza
-- - La vista v_featured è stata rimossa completamente (non era utilizzata nel codice)
-- - Le RLS policies sulla tabella products e featured_products gestiranno i permessi
-- 
-- ⚠️ IMPORTANTE: Leaked Password Protection
-- Per abilitare la protezione delle password compromesse, segui queste istruzioni:
-- 1. Vai su https://supabase.com/dashboard
-- 2. Seleziona il progetto
-- 3. Vai su Authentication > Password Security
-- 4. Abilita "Leaked Password Protection"
-- 5. Salva le modifiche
-- 
-- Vedi ENABLE_LEAKED_PASSWORD_PROTECTION.md per istruzioni dettagliate.

