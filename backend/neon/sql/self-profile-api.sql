-- Looply V3: minimal authenticated self-profile view for Neon Data API.
-- Do not enable broader table access before porting the 157 original RLS policies.
-- Private candidate schema is deliberately not in Data API db_schemas.
GRANT USAGE ON SCHEMA looply_candidate TO authenticated;
GRANT SELECT ON TABLE looply_candidate.profiles TO authenticated;
CREATE POLICY looply_v3_own_profile_read
 ON looply_candidate.profiles
 FOR SELECT TO authenticated
 USING (id = (SELECT public.looply_legacy_uid()));
CREATE OR REPLACE VIEW public.v3_self_profile
 WITH (security_invoker=true)
AS SELECT id,username,display_name,bio,theme,avatar_path
 FROM looply_candidate.profiles
 WHERE id = (SELECT public.looply_legacy_uid());
REVOKE ALL ON TABLE public.v3_self_profile FROM PUBLIC, anonymous;
GRANT SELECT ON TABLE public.v3_self_profile TO authenticated;
COMMENT ON VIEW public.v3_self_profile IS
 'Looply V3 read-only self profile, filtered by server-validated Neon Auth identity mapping.';
