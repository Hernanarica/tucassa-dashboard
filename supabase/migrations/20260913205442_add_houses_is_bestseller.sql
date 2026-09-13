ALTER TABLE "tucassa"."table_houses"
  ADD COLUMN "is_bestseller" boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN "tucassa"."table_houses"."is_bestseller" IS 'Más vendida (elegida en el sitio).';
