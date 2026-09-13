-- Políticas de storage. Los buckets se crean en config.toml (local)
-- y con INSERT en la migración (DML no entra en el diff declarativo).
-- Lectura pública. Escritura solo autenticada (upsert pide SELECT + INSERT + UPDATE).
create policy house_photos_select
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'house-photos');

create policy house_photos_insert
on storage.objects
for insert
to authenticated
with check (bucket_id = 'house-photos');

create policy house_photos_update
on storage.objects
for update
to authenticated
using (bucket_id = 'house-photos')
with check (bucket_id = 'house-photos');

create policy house_photos_delete
on storage.objects
for delete
to authenticated
using (bucket_id = 'house-photos');

create policy banner_photos_select
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'banner-photos');

create policy banner_photos_insert
on storage.objects
for insert
to authenticated
with check (bucket_id = 'banner-photos');

create policy banner_photos_update
on storage.objects
for update
to authenticated
using (bucket_id = 'banner-photos')
with check (bucket_id = 'banner-photos');

create policy banner_photos_delete
on storage.objects
for delete
to authenticated
using (bucket_id = 'banner-photos');
