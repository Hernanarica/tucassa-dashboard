-- Categorías del catálogo (tradicionales, minimalistas, etc.).
create table tucassa.table_category (
  id bigint generated always as identity primary key,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint table_category_name_key unique (name)
);

comment on table tucassa.table_category is 'Categorías de casas del catálogo.';
comment on column tucassa.table_category.id is 'Identificador interno.';
comment on column tucassa.table_category.name is 'Nombre visible de la categoría.';
comment on column tucassa.table_category.created_at is 'Fecha de alta.';
comment on column tucassa.table_category.updated_at is 'Última modificación.';

create trigger table_category_set_updated_at
before update on tucassa.table_category
for each row
execute function tucassa.set_updated_at();

alter table tucassa.table_category enable row level security;

create policy table_category_select
on tucassa.table_category
for select
to authenticated
using (true);

-- Dashboard admin: todos los autenticados pueden escribir (CMS de un solo tenant).
create policy table_category_insert
on tucassa.table_category
for insert
to authenticated
with check (true);

create policy table_category_update
on tucassa.table_category
for update
to authenticated
using (true)
with check (true);

create policy table_category_delete
on tucassa.table_category
for delete
to authenticated
using (true);

grant select, insert, update, delete on tucassa.table_category to authenticated, service_role;
grant usage, select on sequence tucassa.table_category_id_seq to authenticated, service_role;
