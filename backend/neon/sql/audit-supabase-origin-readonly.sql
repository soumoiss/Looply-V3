-- Read-only checksum inventory for Looply V2 Supabase production.
-- Each SELECT shares one PostgreSQL statement snapshot for consistent comparison.
-- Never publish raw row values; only table names, counts and checksums.
-- Compare with looply_migration.source_table_inventory in the private Neon project.
SELECT 'app_settings' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."app_settings" r
UNION ALL
SELECT 'archive_media' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."archive_media" r
UNION ALL
SELECT 'archive_media_comment_recipients' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."archive_media_comment_recipients" r
UNION ALL
SELECT 'archive_media_commenters' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."archive_media_commenters" r
UNION ALL
SELECT 'archive_media_comments' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."archive_media_comments" r
UNION ALL
SELECT 'archive_media_likes' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."archive_media_likes" r
UNION ALL
SELECT 'archive_media_recipients' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."archive_media_recipients" r
UNION ALL
SELECT 'archived_card_reads' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."archived_card_reads" r
UNION ALL
SELECT 'archived_cards' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."archived_cards" r
UNION ALL
SELECT 'chat_media' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."chat_media" r
UNION ALL
SELECT 'chat_messages' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."chat_messages" r
UNION ALL
SELECT 'chat_notifications' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."chat_notifications" r
UNION ALL
SELECT 'chat_ttt_results' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."chat_ttt_results" r
UNION ALL
SELECT 'comment_media' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."comment_media" r
UNION ALL
SELECT 'comments' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."comments" r
UNION ALL
SELECT 'community_gallery_comment_recipients' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."community_gallery_comment_recipients" r
UNION ALL
SELECT 'community_gallery_comments' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."community_gallery_comments" r
UNION ALL
SELECT 'community_gallery_media' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."community_gallery_media" r
UNION ALL
SELECT 'community_gallery_media_commenters' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."community_gallery_media_commenters" r
UNION ALL
SELECT 'community_gallery_media_likes' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."community_gallery_media_likes" r
UNION ALL
SELECT 'community_gallery_media_recipients' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."community_gallery_media_recipients" r
UNION ALL
SELECT 'community_letters' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."community_letters" r
UNION ALL
SELECT 'conversation_favorites' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."conversation_favorites" r
UNION ALL
SELECT 'conversation_participants' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."conversation_participants" r
UNION ALL
SELECT 'conversations' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."conversations" r
UNION ALL
SELECT 'gallery_album_items' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."gallery_album_items" r
UNION ALL
SELECT 'gallery_albums' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."gallery_albums" r
UNION ALL
SELECT 'gallery_media_adjustments' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."gallery_media_adjustments" r
UNION ALL
SELECT 'gallery_media_descriptions' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."gallery_media_descriptions" r
UNION ALL
SELECT 'gallery_media_people' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."gallery_media_people" r
UNION ALL
SELECT 'gallery_private_items' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."gallery_private_items" r
UNION ALL
SELECT 'global_announcement_reads' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."global_announcement_reads" r
UNION ALL
SELECT 'global_announcements' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."global_announcements" r
UNION ALL
SELECT 'letter_event_notifications' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."letter_event_notifications" r
UNION ALL
SELECT 'letters' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."letters" r
UNION ALL
SELECT 'looply_content_moderation' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."looply_content_moderation" r
UNION ALL
SELECT 'looply_user_invites' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."looply_user_invites" r
UNION ALL
SELECT 'music_comments' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."music_comments" r
UNION ALL
SELECT 'music_dedications' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."music_dedications" r
UNION ALL
SELECT 'music_library' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."music_library" r
UNION ALL
SELECT 'music_page_comments' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."music_page_comments" r
UNION ALL
SELECT 'music_track_comments' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."music_track_comments" r
UNION ALL
SELECT 'notifications' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."notifications" r
UNION ALL
SELECT 'post_likes' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."post_likes" r
UNION ALL
SELECT 'post_media' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."post_media" r
UNION ALL
SELECT 'post_recipients' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."post_recipients" r
UNION ALL
SELECT 'posts' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."posts" r
UNION ALL
SELECT 'profiles' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."profiles" r
UNION ALL
SELECT 'push_subscriptions' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."push_subscriptions" r
UNION ALL
SELECT 'secret_messages' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."secret_messages" r
UNION ALL
SELECT 'stories' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."stories" r
UNION ALL
SELECT 'story_likes' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."story_likes" r
UNION ALL
SELECT 'story_media' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."story_media" r
UNION ALL
SELECT 'story_recipients' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."story_recipients" r
UNION ALL
SELECT 'story_replies' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."story_replies" r
UNION ALL
SELECT 'story_views' AS table_name, count(*)::bigint AS row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text,chr(10) ORDER BY to_jsonb(r)::text),'EMPTY')) AS content_md5
FROM public."story_views" r;
