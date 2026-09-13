-- Cabañas del catálogo del sitio.
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
    ('Cabaña 1', 18320000, 2, 1, 30, 15, true),
    ('Cabaña 2', 19860000, 2, 1, 42, 15, false),
    ('Cabaña 3', 20980000, 3, 1, 52, 18, false),
    ('Cabaña 4', 23760000, 3, 1, 70, 25, true)
) as house (
  title,
  price,
  bedrooms,
  bathrooms,
  covered_sqm,
  gallery_sqm,
  is_bestseller
)
where category.name = 'Cabañas';
