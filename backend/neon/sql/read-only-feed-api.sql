-- Looply V3 read-only feed; STAGING ONLY.
-- This is a deliberately narrow port of the original post visibility rules.
-- Backend-only moderation/recipient reads; no direct client access to them.
CREATE OR REPLACE FUNCTION public.v3_can_view_post(p_post_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path=pg_catalog AS $$
 SELECT (SELECT public.looply_legacy_uid()) IS NOT NULL
  AND EXISTS(
   SELECT 1 FROM looply_candidate.posts p
   WHERE p.id=p_post_id
    AND NOT EXISTS(
       SELECT 1 FROM looply_candidate.looply_content_moderation m
       WHERE m.content_type='post' AND m.content_id=p.id)
    AND (
     p.visibility='public'
     OR p.author_id=(SELECT public.looply_legacy_uid())
     OR (p.visibility='selected' AND EXISTS(
       SELECT 1 FROM looply_candidate.post_recipients r
       WHERE r.post_id=p.id
        AND r.recipient_id=(SELECT public.looply_legacy_uid())
     ))
    )
  );
$$;
REVOKE ALL ON FUNCTION public.v3_can_view_post(uuid) FROM PUBLIC, anonymous;
GRANT EXECUTE ON FUNCTION public.v3_can_view_post(uuid) TO authenticated;

GRANT SELECT ON TABLE looply_candidate.posts TO authenticated;
CREATE POLICY v3_posts_visible_for_verified_users
 ON looply_candidate.posts FOR SELECT TO authenticated
 USING (public.v3_can_view_post(id));

CREATE OR REPLACE VIEW public.v3_feed_posts WITH (security_invoker=true) AS
 SELECT p.id,p.author_id,p.body,p.visibility,p.created_at,p.updated_at,p.external_url
 FROM looply_candidate.posts p
 WHERE public.v3_can_view_post(p.id);
REVOKE ALL ON TABLE public.v3_feed_posts FROM PUBLIC, anonymous;
GRANT SELECT ON TABLE public.v3_feed_posts TO authenticated;
COMMENT ON VIEW public.v3_feed_posts IS
 'Read-only V3 post feed; membership checked through legacy account linkage and per-post visibility, with moderation exclusion.';
