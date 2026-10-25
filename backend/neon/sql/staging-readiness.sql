-- Looply V3 private staging gate. Returns aggregate counts only; never approves cutover.
-- Execute against Neon project small-scene-81115187, NOT Supabase production.
WITH src AS (
 SELECT count(*)::integer AS source_tables,
        coalesce(sum(source_row_count),0)::bigint AS source_rows
 FROM looply_migration.source_table_inventory
), restored AS (
 SELECT count(*)::integer AS restored_tables,
        count(*) FILTER(WHERE rowsecurity)::integer AS rls_tables
 FROM pg_tables WHERE schemaname='looply_candidate'
), verified AS (
 SELECT count(*) FILTER(WHERE content_matches)::integer AS matching_tables
 FROM looply_migration.verify_candidate_snapshot()
), constraints AS (
 SELECT count(*)::integer AS applied_constraints,
        count(*) FILTER(WHERE c.contype='f')::integer AS applied_foreign_keys
 FROM pg_constraint c
 JOIN pg_namespace n ON n.oid=c.connamespace
 WHERE n.nspname='looply_candidate'
), security AS (
 SELECT count(*)::integer AS public_grants
 FROM information_schema.role_table_grants
 WHERE table_schema IN ('looply_candidate','looply_auth_compat','looply_migration')
   AND grantee IN ('anonymous','authenticated')
)
SELECT current_database() AS database_name,
 src.source_tables,src.source_rows,restored.restored_tables,restored.rls_tables,
 verified.matching_tables,constraints.applied_constraints,constraints.applied_foreign_keys,
 identity.legacy_accounts,identity.neon_accounts,identity.verified_links,
 identity.unmapped_legacy_accounts,
 media.catalogued_objects,media.verified_sha256_receipts,
 media.verified_size_and_hash_records,media.inventoried_bytes,
 security.public_grants,
 (src.source_tables=56 AND src.source_tables=restored.restored_tables
  AND restored.restored_tables=verified.matching_tables
  AND restored.rls_tables=restored.restored_tables
  AND constraints.applied_constraints=291
  AND constraints.applied_foreign_keys=99
  AND security.public_grants=0) AS private_snapshot_integrity_passed,
 (identity.legacy_accounts>0 AND identity.unmapped_legacy_accounts=0
  AND identity.legacy_accounts=identity.verified_links
  AND identity.neon_accounts>=identity.verified_links) AS identity_link_gate,
 (media.catalogued_objects>0
  AND media.catalogued_objects=media.verified_size_and_hash_records
  AND media.catalogued_objects=media.verified_sha256_receipts) AS media_sha256_gate,
 false AS authorization_and_realtime_gate,
 false AS production_cutover_approved
FROM src CROSS JOIN restored CROSS JOIN verified
CROSS JOIN constraints CROSS JOIN security
CROSS JOIN looply_migration.identity_link_readiness identity
CROSS JOIN looply_migration.media_integrity_readiness media;
