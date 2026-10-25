-- Looply V3 isolated staging readiness: aggregate checks only, no personal records.
-- Run against the private Neon migration project; NOT against Supabase production.
WITH src AS (
  SELECT count(*)::integer AS source_tables,
         coalesce(sum(source_row_count),0)::bigint AS source_rows
  FROM looply_migration.source_table_inventory
),
restored AS (
  SELECT count(*)::integer AS restored_tables,
         count(*) FILTER (WHERE rowsecurity)::integer AS rls_tables
  FROM pg_tables WHERE schemaname='looply_candidate'
),
verified AS (
  SELECT count(*)::integer AS verified_tables,
         count(*) FILTER (WHERE content_matches)::integer AS matching_tables
  FROM looply_migration.verify_candidate_snapshot()
),
identity AS (
  SELECT (SELECT count(*) FROM looply_migration.auth_user_inventory)::integer AS inventoried_users,
         (SELECT count(*) FROM neon_auth."user")::integer AS neon_users
),
media AS (
  SELECT count(*)::integer AS catalogued_objects,
         count(*) FILTER (WHERE target_verified)::integer AS verified_objects
  FROM looply_migration.storage_object_inventory
),
security AS (
  SELECT count(*)::integer AS exposed_grants
  FROM information_schema.role_table_grants
  WHERE table_schema='looply_candidate'
    AND grantee IN ('anonymous','authenticated')
)
SELECT current_database() AS database_name,
  src.source_tables, src.source_rows,
  restored.restored_tables, restored.rls_tables,
  verified.matching_tables,
  identity.inventoried_users, identity.neon_users,
  media.catalogued_objects, media.verified_objects,
  security.exposed_grants,
  (src.source_tables=restored.restored_tables
   AND restored.restored_tables=verified.matching_tables
   AND restored.rls_tables=restored.restored_tables
   AND security.exposed_grants=0) AS private_snapshot_integrity_passed,
  (identity.inventoried_users>0 AND identity.neon_users>=identity.inventoried_users) AS identity_count_gate,
  (media.catalogued_objects=media.verified_objects) AS media_count_gate,
  false AS production_cutover_approved
FROM src CROSS JOIN restored CROSS JOIN verified CROSS JOIN identity
  CROSS JOIN media CROSS JOIN security;
