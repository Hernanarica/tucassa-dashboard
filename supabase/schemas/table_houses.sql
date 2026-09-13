-- Casas del catálogo. Las fotos viven en el bucket house-photos.
create table tucassa.table_houses (
  id bigint generated always as identity primary key,
  category_id bigint not null references tucassa.table_category (id),
  title text not null,
  price numeric(12, 2) not null,
  bedrooms integer not null,
  bathrooms integer not null,
  covered_sqm numeric(8, 2) not null,
  gallery_sqm numeric(8, 2) not null default 0,
  photo_paths text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_bestseller boolean not null default false,
  constraint table_houses_price_check check (price >= 0),
  constraint table_houses_bedrooms_check check (bedrooms >= 0),
  constraint table_houses_bathrooms_check check (bathrooms >= 0),
  constraint table_houses_covered_sqm_check check (covered_sqm >= 0),
  constraint table_houses_gallery_sqm_check check (gallery_sqm >= 0)
);

comment on table tucassa.table_houses is 'Casas del catálogo.';
comment on column tucassa.table_houses.id is 'Identificador interno.';
comment on column tucassa.table_houses.category_id is 'Categoría a la que pertenece la casa.';
comment on column tucassa.table_houses.title is 'Título o nombre del modelo.';
comment on column tucassa.table_houses.price is 'Precio de lista.';
comment on column tucassa.table_houses.bedrooms is 'Cantidad de dormitorios.';
comment on column tucassa.table_houses.bathrooms is 'Cantidad de baños.';
comment on column tucassa.table_houses.covered_sqm is 'Metros cuadrados cubiertos.';
comment on column tucassa.table_houses.gallery_sqm is 'Metros cuadrados de galería / cobertura.';
comment on column tucassa.table_houses.photo_paths is 'Paths de fotos en el bucket house-photos.';
comment on column tucassa.table_houses.created_at is 'Fecha de alta.';
comment on column tucassa.table_houses.updated_at is 'Última modificación.';
comment on column tucassa.table_houses.is_bestseller is 'Más vendida (elegida en el sitio).';

create index table_houses_category_id_idx on tucassa.table_houses (category_id);

create trigger table_houses_set_updated_at
before update on tucassa.table_houses
for each row
execute function tucassa.set_updated_at();

alter table tucassa.table_houses enable row level security;

create policy table_houses_select
on tucassa.table_houses
for select
to authenticated
using (true);

create policy table_houses_insert
on tucassa.table_houses
for insert
to authenticated
with check (true);

create policy table_houses_update
on tucassa.table_houses
for update
to authenticated
using (true)
with check (true);

create policy table_houses_delete
on tucassa.table_houses
for delete
to authenticated
using (true);

grant select, insert, update, delete on tucassa.table_houses to authenticated, service_role;
grant usage, select on sequence tucassa.table_houses_id_seq to authenticated, service_role;
