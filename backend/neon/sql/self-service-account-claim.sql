-- Looply V3 self-service migration claim, only for email-verified Neon sessions.
-- This does not accept a user ID/email argument; JWT is validated by Neon Data API.
-- Caller is permitted only to claim *its own* verified legacy identity.
CREATE OR REPLACE FUNCTION public.v3_claim_legacy_profile()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
DECLARE
  new_id uuid;
  old_id uuid;
BEGIN
  new_id := auth.uid();
  IF new_id IS NULL THEN RETURN false; END IF;
  SELECT inventory.source_user_id INTO old_id
  FROM neon_auth."user" AS registered
  JOIN looply_migration.auth_user_inventory AS inventory
    ON lower(btrim(registered.email)) = lower(btrim(inventory.email))
  JOIN looply_candidate.profiles AS profile ON profile.id = inventory.source_user_id
  WHERE registered.id = new_id
    AND registered."emailVerified" = true
    AND inventory.email_confirmed = true
    AND inventory.email IS NOT NULL
    AND btrim(inventory.email) <> '';
  IF old_id IS NULL THEN RETURN false; END IF;
  INSERT INTO looply_migration.verified_identity_links(legacy_user_id,neon_user_id)
    VALUES(old_id,new_id) ON CONFLICT DO NOTHING;
  RETURN EXISTS (
    SELECT 1 FROM looply_migration.verified_identity_links
     WHERE legacy_user_id=old_id AND neon_user_id=new_id
  );
END;
$$;
REVOKE ALL ON FUNCTION public.v3_claim_legacy_profile() FROM PUBLIC, anonymous;
GRANT EXECUTE ON FUNCTION public.v3_claim_legacy_profile() TO authenticated;
COMMENT ON FUNCTION public.v3_claim_legacy_profile() IS
 'Allows only JWT-authenticated verified Neon email owners to claim their matching legacy profile. Returns false otherwise.';
