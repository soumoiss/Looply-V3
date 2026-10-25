-- Looply V3: translate authenticated Neon UUID into the validated legacy profile UUID.
-- Never accept a client-supplied legacy identity; the caller identity comes from
-- Neon Data API's verified JWT via auth.uid().
-- This is for the ISOLATED Neon branch only. No old Supabase runtime dependency.
CREATE OR REPLACE FUNCTION public.looply_legacy_uid()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
 SELECT links.legacy_user_id
 FROM looply_migration.verified_identity_links AS links
 WHERE links.neon_user_id = auth.uid()
 LIMIT 1
$$;
REVOKE ALL ON FUNCTION public.looply_legacy_uid() FROM PUBLIC, anonymous;
GRANT EXECUTE ON FUNCTION public.looply_legacy_uid() TO authenticated;
COMMENT ON FUNCTION public.looply_legacy_uid()
 IS 'Returns only the authenticated Neon account''s verified linked legacy UUID; NULL if unsigned or unmapped.';
