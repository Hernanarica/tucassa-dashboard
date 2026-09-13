CREATE TABLE "tucassa"."table_banners" (
  "id"         bigint                   GENERATED ALWAYS AS IDENTITY NOT NULL,
  "section"    text                     NOT NULL,
  "sort_order" integer                  NOT NULL DEFAULT 0,
  "photo_path" text                     NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "table_banners_pkey" PRIMARY KEY (id),
  CONSTRAINT "table_banners_section_check"
    CHECK ((section = ANY (ARRAY['home'::text, 'traditional'::text, 'minimalist'::text, 'cabin'::text, 'deliveries'::text, 'contact'::text]))),
  CONSTRAINT "table_banners_section_sort_key" UNIQUE (section, sort_order),
  CONSTRAINT "table_banners_sort_order_check" CHECK ((((section = 'home'::text) AND ((sort_order >= 0) AND (sort_order <= 2))) OR ((section <> 'home'::text) AND (sort_order = 0))))
);

ALTER TABLE "tucassa"."table_banners"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX table_banners_section_idx ON tucassa.table_banners USING btree (section);

CREATE TRIGGER table_banners_set_updated_at
  BEFORE UPDATE ON tucassa.table_banners
  FOR EACH ROW
  EXECUTE FUNCTION tucassa.set_updated_at();

CREATE POLICY "table_banners_delete" ON "tucassa"."table_banners"
  FOR DELETE
  TO "authenticated"
  USING (true);

CREATE POLICY "table_banners_insert" ON "tucassa"."table_banners"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (true);

CREATE POLICY "table_banners_select" ON "tucassa"."table_banners"
  FOR SELECT
  TO "authenticated"
  USING (true);

CREATE POLICY "table_banners_update" ON "tucassa"."table_banners"
  FOR UPDATE
  TO "authenticated"
  USING (true)
  WITH CHECK (true);

COMMENT ON COLUMN "tucassa"."table_banners"."created_at" IS 'Fecha de alta.';

COMMENT ON COLUMN "tucassa"."table_banners"."id" IS 'Identificador interno.';

COMMENT ON COLUMN "tucassa"."table_banners"."photo_path" IS 'Path de la foto en el bucket banner-photos.';

COMMENT ON COLUMN "tucassa"."table_banners"."section" IS 'Sección del sitio: home, tradicionales, minimalistas, cabañas, entregas o contacto.';

COMMENT ON COLUMN "tucassa"."table_banners"."sort_order" IS 'Orden en el carrusel. Home 0 a 2; el resto 0.';

COMMENT ON COLUMN "tucassa"."table_banners"."updated_at" IS 'Última modificación.';

COMMENT ON SCHEMA "tucassa" IS 'Dominio del catálogo Tu Cassa: categorías, casas y banners.';

COMMENT ON TABLE "tucassa"."table_banners" IS 'Banners de cada sección del sitio.';

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "tucassa"."table_banners" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "tucassa"."table_banners" TO "postgres";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "tucassa"."table_banners" TO "service_role";

GRANT USAGE, SELECT ON SEQUENCE "tucassa"."table_banners_id_seq" TO "authenticated", "service_role";
