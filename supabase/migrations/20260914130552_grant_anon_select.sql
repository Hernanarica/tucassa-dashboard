ALTER POLICY "table_banners_select" ON "tucassa"."table_banners" TO "anon", "authenticated";

ALTER POLICY "table_category_select" ON "tucassa"."table_category" TO "anon", "authenticated";

ALTER POLICY "table_houses_select" ON "tucassa"."table_houses" TO "anon", "authenticated";

REVOKE ALL ON SCHEMA "tucassa" FROM "anon";

GRANT USAGE ON SCHEMA "tucassa" TO "anon";

REVOKE ALL ON TABLE "tucassa"."table_banners" FROM "anon";

GRANT SELECT ON TABLE "tucassa"."table_banners" TO "anon";

REVOKE ALL ON TABLE "tucassa"."table_category" FROM "anon";

GRANT SELECT ON TABLE "tucassa"."table_category" TO "anon";

REVOKE ALL ON TABLE "tucassa"."table_houses" FROM "anon";

GRANT SELECT ON TABLE "tucassa"."table_houses" TO "anon";
