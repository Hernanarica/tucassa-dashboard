-- Banners por sección del sitio. Las fotos viven en el bucket banner-photos.
create table tucassa.table_banners (
  id bigint generated always as identity primary key,
  section text not null,
  sort_order integer not null default 0,
  photo_path text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint table_banners_section_check check (
    section in (
      'home',
      'traditional',
      'minimalist',
      'cabin',
      'deliveries',
      'contact'
    )
  ),
  constraint table_banners_sort_order_check check (
    (section = 'home' and sort_order between 0 and 99)
    or (section <> 'home' and sort_order = 0)
  ),
  constraint table_banners_section_sort_key unique (section, sort_order)
);

comment on table tucassa.table_banners is 'Banners de cada sección del sitio.';
comment on column tucassa.table_banners.id is 'Identificador interno.';
comment on column tucassa.table_banners.section is 'Sección del sitio: home, tradicionales, minimalistas, cabañas, entregas o contacto.';
comment on column tucassa.table_banners.sort_order is 'Orden en el carrusel. Home 0 a 2 al guardar; valores mayores son temporales al reordenar. El resto 0.';
comment on column tucassa.table_banners.photo_path is 'Path de la foto en el bucket banner-photos.';
comment on column tucassa.table_banners.created_at is 'Fecha de alta.';
comment on column tucassa.table_banners.updated_at is 'Última modificación.';

create index table_banners_section_idx on tucassa.table_banners (section);

create trigger table_banners_set_updated_at
before update on tucassa.table_banners
for each row
execute function tucassa.set_updated_at();

alter table tucassa.table_banners enable row level security;

create policy table_banners_select
on tucassa.table_banners
for select
to anon, authenticated
using (true);

create policy table_banners_insert
on tucassa.table_banners
for insert
to authenticated
with check (true);

create policy table_banners_update
on tucassa.table_banners
for update
to authenticated
using (true)
with check (true);

create policy table_banners_delete
on tucassa.table_banners
for delete
to authenticated
using (true);

grant select on tucassa.table_banners to anon;
grant select, insert, update, delete on tucassa.table_banners to authenticated, service_role;
grant usage, select on sequence tucassa.table_banners_id_seq to authenticated, service_role;
