-- Aggiungi game "other" se non esiste
insert into public.games (slug, name) values
  ('other', 'Altri prodotti')
on conflict (slug) do nothing;

