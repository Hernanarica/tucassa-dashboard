-- Schema de dominio del dashboard. Expuesto en la Data API.
create schema if not exists tucassa;

grant usage on schema tucassa to anon, authenticated, service_role;

-- Actualiza updated_at en cada UPDATE. Invoker: solo la usa el trigger.
create or replace function tucassa.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on schema tucassa is 'Dominio del catálogo Tu Cassa: categorías, casas y banners.';
comment on function tucassa.set_updated_at() is 'Mantiene updated_at al actualizar una fila.';
