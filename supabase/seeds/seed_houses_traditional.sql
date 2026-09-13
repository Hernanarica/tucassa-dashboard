-- Viviendas tradicionales (catálogo del sitio).
insert into tucassa.table_houses (
  category_id,
  title,
  price,
  bedrooms,
  bathrooms,
  covered_sqm,
  gallery_sqm,
  is_bestseller
)
select
  category.id,
  house.title,
  house.price,
  house.bedrooms,
  house.bathrooms,
  house.covered_sqm,
  house.gallery_sqm,
  house.is_bestseller
from tucassa.table_category as category
cross join (
  values
    ('Vivienda Tradicional 1', 17980000, 2, 1, 36, 15, false),
    ('Vivienda Tradicional 2', 18780000, 2, 1, 42, 15, false),
    ('Vivienda Tradicional 3', 19920000, 3, 1, 52, 18, false),
    ('Vivienda Tradicional 4', 22590000, 3, 1, 70, 25, true),
    ('Vivienda Tradicional 5', 29860000, 4, 2, 84, 35, false),
    ('Vivienda Tradicional 6', 29760000, 4, 2, 105, 0, false),
    ('Vivienda Tradicional 7', 19680000, 3, 1, 57, 11, true),
    ('Vivienda Tradicional 8', 19970000, 3, 1, 59, 19, false),
    ('Vivienda Tradicional 9', 22890000, 3, 1, 72, 20, true)
) as house (
  title,
  price,
  bedrooms,
  bathrooms,
  covered_sqm,
  gallery_sqm,
  is_bestseller
)
where category.name = 'Tradicionales';
