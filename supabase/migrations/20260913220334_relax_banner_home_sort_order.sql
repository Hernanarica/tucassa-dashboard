ALTER TABLE "tucassa"."table_banners"
  DROP CONSTRAINT "table_banners_sort_order_check";

ALTER TABLE "tucassa"."table_banners"
  ADD CONSTRAINT "table_banners_sort_order_check"
    CHECK ((((section = 'home'::text) AND ((sort_order >= 0) AND (sort_order <= 99))) OR ((section <> 'home'::text) AND (sort_order = 0))));

COMMENT ON COLUMN "tucassa"."table_banners"."sort_order" IS 'Orden en el carrusel. Home 0 a 2 al guardar; valores mayores son temporales al reordenar. El resto 0.';
