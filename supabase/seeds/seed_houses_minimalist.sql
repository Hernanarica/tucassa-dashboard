-- Viviendas minimalistas. El YAML no trae baños: bathrooms = 0.
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
      'Vivienda Minimalista 1',
      22680000,
      3,
      0,
      52,
      18,
      true,
      array[
        'minimalista-1-1200.webp',
        'minimalista-1-render-1400.webp',
        'minimalista-1-plano-1400.webp',
        'minimalista-1-real-1-1400.webp'
      ]::text[]
    ),
    (
      'Vivienda Minimalista 2',
      23780000,
      3,
      0,
      62,
      22,
      false,
      array[
        'minimalista-2-1200.webp',
        'minimalista-2-render-1400.webp',
        'minimalista-2-plano-1400.webp',
        'minimalista-2-real-1-1400.webp'
      ]::text[]
    ),
    (
      'Vivienda Minimalista 3',
      24980000,
      3,
      0,
      70,
      25,
      false,
      array[
        'minimalista-3-1200.webp',
        'minimalista-3-render-1400.webp',
        'minimalista-3-plano-1400.webp'
      ]::text[]
    ),
    (
      'Vivienda Minimalista 4',
      33550000,
      4,
      0,
      105,
      0,
      true,
      array[
        'minimalista-4-1200.webp',
        'minimalista-4-render-1400.webp',
        'minimalista-4-plano-1400.webp'
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
where category.name = 'Minimalistas';
