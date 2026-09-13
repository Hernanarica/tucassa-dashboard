-- Cabañas del catálogo del sitio.
insert into tucassa.table_houses (
  category_id,
  title,
  price,
  bedrooms,
  bathrooms,
  covered_sqm,
  gallery_sqm,
  is_bestseller,
  photo_paths
)
select
  category.id,
  house.title,
  house.price,
  house.bedrooms,
  house.bathrooms,
  house.covered_sqm,
  house.gallery_sqm,
  house.is_bestseller,
  house.photo_paths
from tucassa.table_category as category
cross join (
  values
    (
      'Cabaña 1',
      18320000,
      2,
      1,
      30,
      15,
      true,
      array[
        'cabania-1-1200.webp',
        'cabania-1-render-1400.webp',
        'cabania-1-plano-1400.webp',
        'cabania-1-real-1-1400.webp'
      ]::text[]
    ),
    (
      'Cabaña 2',
      19860000,
      2,
      1,
      42,
      15,
      false,
      array[
        'cabania-2-1200.webp',
        'cabania-2-render-1400.webp',
        'cabania-2-plano-1400.webp',
        'cabania-2-real-1-1400.webp'
      ]::text[]
    ),
    (
      'Cabaña 3',
      20980000,
      3,
      1,
      52,
      18,
      false,
      array[
        'cabania-3-1200.webp',
        'cabania-3-render-1400.webp',
        'cabania-3-plano-1400.webp',
        'cabania-3-real-1-1400.webp'
      ]::text[]
    ),
    (
      'Cabaña 4',
      23760000,
      3,
      1,
      70,
      25,
      true,
      array[
        'cabania-4-1200.webp',
        'cabania-4-render-1400.webp',
        'cabania-4-plano-1400.webp',
        'cabania-4-real-1-1400.webp'
      ]::text[]
    )
) as house (
  title,
  price,
  bedrooms,
  bathrooms,
  covered_sqm,
  gallery_sqm,
  is_bestseller,
  photo_paths
)
where category.name = 'Cabañas';
