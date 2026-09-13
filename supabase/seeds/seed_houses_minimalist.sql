-- Viviendas minimalistas. El YAML no trae baños: bathrooms = 0.
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
    ('Vivienda Minimalista 1', 22680000, 3, 0, 52, 18, true),
    ('Vivienda Minimalista 2', 23780000, 3, 0, 62, 22, false),
    ('Vivienda Minimalista 3', 24980000, 3, 0, 70, 25, false),
    ('Vivienda Minimalista 4', 33550000, 4, 0, 105, 0, true)
) as house (
  title,
  price,
  bedrooms,
  bathrooms,
  covered_sqm,
  gallery_sqm,
  is_bestseller
)
where category.name = 'Minimalistas';
