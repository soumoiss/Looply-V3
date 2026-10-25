-- Looply V3: private identity handoff, staging only.
-- No accounts are created and no production endpoint is updated.
-- Run with database owner against Neon project small-scene-81115187.
CREATE TABLE IF NOT EXISTS looply_migration.verified_identity_links (
  legacy_user_id uuid PRIMARY KEY
    REFERENCES looply_migration.auth_user_inventory(source_user_id)
    ON DELETE RESTRICT,
  neon_user_id uuid NOT NULL UNIQUE
    REFERENCES neon_auth."user"(id)
    ON DELETE RESTRICT,
  proof text NOT NULL DEFAULT 'verified_email'
    CHECK (proof = 'verified_email'),
  linked_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE looply_migration.verified_identity_links ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE looply_migration.verified_identity_links FROM PUBLIC, anonymous, authenticated;

-- This administrative invoker-only function allows one-to-one linking ONLY
-- when the same email was verified on the source and the target.
-- It deliberately never mutates legacy profiles or changes user IDs.
CREATE OR REPLACE FUNCTION looply_migration.link_verified_identity(p_neon_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog
AS $func$
DECLARE
  v_legacy_user_id uuid;
BEGIN
  IF p_neon_user_id IS NULL THEN
    RETURN false;
  END IF;

  SELECT legacy.source_user_id
    INTO v_legacy_user_id
    FROM looply_migration.auth_user_inventory AS legacy
    JOIN neon_auth."user" AS destination
      ON lower(btrim(legacy.email)) = lower(btrim(destination.email))
    JOIN looply_candidate.profiles AS profile
      ON profile.id = legacy.source_user_id
   WHERE destination.id = p_neon_user_id
     AND destination."emailVerified" = true
     AND legacy.email_confirmed = true
     AND legacy.email IS NOT NULL
     AND btrim(legacy.email) <> ''
     AND NOT EXISTS (
       SELECT 1
       FROM looply_migration.verified_identity_links AS occupied
       WHERE occupied.legacy_user_id = legacy.source_user_id
         AND occupied.neon_user_id <> p_neon_user_id
     );

  IF v_legacy_user_id IS NULL THEN
    RETURN false;
  END IF;

  INSERT INTO looply_migration.verified_identity_links (legacy_user_id, neon_user_id)
  VALUES (v_legacy_user_id, p_neon_user_id)
  ON CONFLICT DO NOTHING;

  RETURN EXISTS (
    SELECT 1
    FROM looply_migration.verified_identity_links
    WHERE legacy_user_id = v_legacy_user_id
      AND neon_user_id = p_neon_user_id
  );
END;
$func$;
REVOKE ALL ON FUNCTION looply_migration.link_verified_identity(uuid)
  FROM PUBLIC, anonymous, authenticated;

-- Operator-only readiness: aggregate counts, never identity details.
CREATE OR REPLACE VIEW looply_migration.identity_link_readiness
WITH (security_invoker = true)
AS
SELECT
  (SELECT count(*) FROM looply_migration.auth_user_inventory) AS legacy_accounts,
  (SELECT count(*) FROM neon_auth."user") AS neon_accounts,
  (SELECT count(*) FROM looply_migration.verified_identity_links) AS verified_links,
  (SELECT count(*) FROM looply_migration.auth_user_inventory AS source
    LEFT JOIN looply_migration.verified_identity_links AS link
      ON link.legacy_user_id = source.source_user_id
    WHERE link.legacy_user_id IS NULL) AS unmapped_legacy_accounts;
REVOKE ALL ON TABLE looply_migration.identity_link_readiness
  FROM PUBLIC, anonymous, authenticated;
