-- Slots fijos de banners. Cada sección tiene su propia copia de la foto.
insert into tucassa.table_banners (section, sort_order, photo_path)
values
  ('home', 0, 'home-0-tradicional.webp'),
  ('home', 1, 'home-1-minimalista.webp'),
  ('home', 2, 'home-2-cabana.webp'),
  ('traditional', 0, 'traditional.webp'),
  ('minimalist', 0, 'minimalist.webp'),
  ('cabin', 0, 'cabin.webp'),
  ('deliveries', 0, 'deliveries.webp'),
  ('contact', 0, 'contact.webp');
