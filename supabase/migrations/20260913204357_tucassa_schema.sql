SET local check_function_bodies = off;

CREATE SCHEMA "tucassa";

CREATE TABLE "tucassa"."table_category" (
  "id"         bigint                   GENERATED ALWAYS AS IDENTITY NOT NULL,
  "name"       text                     NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "table_category_name_key" UNIQUE (name),
  CONSTRAINT "table_category_pkey" PRIMARY KEY (id)
);

ALTER TABLE "tucassa"."table_category"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "tucassa"."table_houses" (
  "id"          bigint                   GENERATED ALWAYS AS IDENTITY NOT NULL,
  "category_id" bigint                   NOT NULL,
  "title"       text                     NOT NULL,
  "price"       numeric(12,2)            NOT NULL,
  "bedrooms"    integer                  NOT NULL,
  "bathrooms"   integer                  NOT NULL,
  "covered_sqm" numeric(8,2)             NOT NULL,
  "gallery_sqm" numeric(8,2)             NOT NULL DEFAULT 0,
  "photo_paths" text[]                   NOT NULL DEFAULT '{}'::text[],
  "created_at"  timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"  timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "table_houses_bathrooms_check" CHECK ((bathrooms >= 0)),
  CONSTRAINT "table_houses_bedrooms_check" CHECK ((bedrooms >= 0)),
  CONSTRAINT "table_houses_covered_sqm_check" CHECK ((covered_sqm >= (0)::numeric)),
  CONSTRAINT "table_houses_gallery_sqm_check" CHECK ((gallery_sqm >= (0)::numeric)),
  CONSTRAINT "table_houses_pkey" PRIMARY KEY (id),
  CONSTRAINT "table_houses_price_check" CHECK ((price >= (0)::numeric))
);

ALTER TABLE "tucassa"."table_houses"
  ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION tucassa.set_updated_at()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

ALTER TABLE "tucassa"."table_houses"
  ADD CONSTRAINT "table_houses_category_id_fkey" FOREIGN KEY (category_id) REFERENCES tucassa.table_category(id);

CREATE INDEX table_houses_category_id_idx ON tucassa.table_houses USING btree (category_id);

CREATE TRIGGER table_category_set_updated_at
  BEFORE UPDATE ON tucassa.table_category
  FOR EACH ROW
  EXECUTE FUNCTION tucassa.set_updated_at();

CREATE TRIGGER table_houses_set_updated_at
  BEFORE UPDATE ON tucassa.table_houses
  FOR EACH ROW
  EXECUTE FUNCTION tucassa.set_updated_at();

CREATE POLICY "banner_photos_delete" ON "storage"."objects"
  FOR DELETE
  TO "authenticated"
  USING ((bucket_id = 'banner-photos'::text));

CREATE POLICY "banner_photos_insert" ON "storage"."objects"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((bucket_id = 'banner-photos'::text));

CREATE POLICY "banner_photos_select" ON "storage"."objects"
  FOR SELECT
  TO "anon", "authenticated"
  USING ((bucket_id = 'banner-photos'::text));

CREATE POLICY "banner_photos_update" ON "storage"."objects"
  FOR UPDATE
  TO "authenticated"
  USING ((bucket_id = 'banner-photos'::text))
  WITH CHECK ((bucket_id = 'banner-photos'::text));

CREATE POLICY "house_photos_delete" ON "storage"."objects"
  FOR DELETE
  TO "authenticated"
  USING ((bucket_id = 'house-photos'::text));

CREATE POLICY "house_photos_insert" ON "storage"."objects"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((bucket_id = 'house-photos'::text));

CREATE POLICY "house_photos_select" ON "storage"."objects"
  FOR SELECT
  TO "anon", "authenticated"
  USING ((bucket_id = 'house-photos'::text));

CREATE POLICY "house_photos_update" ON "storage"."objects"
  FOR UPDATE
  TO "authenticated"
  USING ((bucket_id = 'house-photos'::text))
  WITH CHECK ((bucket_id = 'house-photos'::text));

CREATE POLICY "table_category_delete" ON "tucassa"."table_category"
  FOR DELETE
  TO "authenticated"
  USING (true);

CREATE POLICY "table_category_insert" ON "tucassa"."table_category"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (true);

CREATE POLICY "table_category_select" ON "tucassa"."table_category"
  FOR SELECT
  TO "authenticated"
  USING (true);

CREATE POLICY "table_category_update" ON "tucassa"."table_category"
  FOR UPDATE
  TO "authenticated"
  USING (true)
  WITH CHECK (true);

CREATE POLICY "table_houses_delete" ON "tucassa"."table_houses"
  FOR DELETE
  TO "authenticated"
  USING (true);

CREATE POLICY "table_houses_insert" ON "tucassa"."table_houses"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (true);

CREATE POLICY "table_houses_select" ON "tucassa"."table_houses"
  FOR SELECT
  TO "authenticated"
  USING (true);

CREATE POLICY "table_houses_update" ON "tucassa"."table_houses"
  FOR UPDATE
  TO "authenticated"
  USING (true)
  WITH CHECK (true);

COMMENT ON COLUMN "tucassa"."table_category"."created_at" IS 'Fecha de alta.';

COMMENT ON COLUMN "tucassa"."table_category"."id" IS 'Identificador interno.';

COMMENT ON COLUMN "tucassa"."table_category"."name" IS 'Nombre visible de la categoría.';

COMMENT ON COLUMN "tucassa"."table_category"."updated_at" IS 'Última modificación.';

COMMENT ON COLUMN "tucassa"."table_houses"."bathrooms" IS 'Cantidad de baños.';

COMMENT ON COLUMN "tucassa"."table_houses"."bedrooms" IS 'Cantidad de dormitorios.';

COMMENT ON COLUMN "tucassa"."table_houses"."category_id" IS 'Categoría a la que pertenece la casa.';

COMMENT ON COLUMN "tucassa"."table_houses"."covered_sqm" IS 'Metros cuadrados cubiertos.';

COMMENT ON COLUMN "tucassa"."table_houses"."created_at" IS 'Fecha de alta.';

COMMENT ON COLUMN "tucassa"."table_houses"."gallery_sqm" IS 'Metros cuadrados de galería / cobertura.';

COMMENT ON COLUMN "tucassa"."table_houses"."id" IS 'Identificador interno.';

COMMENT ON COLUMN "tucassa"."table_houses"."photo_paths" IS 'Paths de fotos en el bucket house-photos.';

COMMENT ON COLUMN "tucassa"."table_houses"."price" IS 'Precio de lista.';

COMMENT ON COLUMN "tucassa"."table_houses"."title" IS 'Título o nombre del modelo.';

COMMENT ON COLUMN "tucassa"."table_houses"."updated_at" IS 'Última modificación.';

COMMENT ON FUNCTION "tucassa"."set_updated_at"() IS 'Mantiene updated_at al actualizar una fila.';

COMMENT ON SCHEMA "tucassa" IS 'Dominio del catálogo Tu Cassa: categorías y casas.';

COMMENT ON TABLE "tucassa"."table_category" IS 'Categorías de casas del catálogo.';

COMMENT ON TABLE "tucassa"."table_houses" IS 'Casas del catálogo.';

GRANT EXECUTE ON FUNCTION "tucassa"."set_updated_at"() TO "postgres";

GRANT USAGE ON SCHEMA "tucassa" TO "authenticated";

GRANT CREATE, USAGE ON SCHEMA "tucassa" TO "postgres";

GRANT USAGE ON SCHEMA "tucassa" TO "service_role";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "tucassa"."table_category" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "tucassa"."table_category" TO "postgres";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "tucassa"."table_category" TO "service_role";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "tucassa"."table_houses" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "tucassa"."table_houses" TO "postgres";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "tucassa"."table_houses" TO "service_role";

GRANT USAGE, SELECT ON SEQUENCE "tucassa"."table_category_id_seq" TO "authenticated", "service_role";

GRANT USAGE, SELECT ON SEQUENCE "tucassa"."table_houses_id_seq" TO "authenticated", "service_role";

-- DML: los buckets no entran en el diff declarativo.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'house-photos',
    'house-photos',
    true,
    10485760,
    ARRAY['image/png', 'image/jpeg', 'image/webp']
  ),
  (
    'banner-photos',
    'banner-photos',
    true,
    10485760,
    ARRAY['image/png', 'image/jpeg', 'image/webp']
  )
ON CONFLICT (id) DO NOTHING;
