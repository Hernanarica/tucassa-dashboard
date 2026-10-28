ALTER TABLE "tucassa"."table_houses"
  ADD COLUMN "price_label" text NOT NULL DEFAULT 'Desde';

COMMENT ON COLUMN "tucassa"."table_houses"."price_label" IS 'Etiqueta que se muestra sobre el precio en el sitio.';
