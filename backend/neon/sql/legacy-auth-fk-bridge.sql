-- Staging-only compatibility bridge: references legacy auth UUIDs, NOT live Neon Auth accounts.
-- Do not expose this schema or treat FK validation as proof users can log in.
CREATE SCHEMA IF NOT EXISTS looply_auth_compat;
REVOKE ALL ON SCHEMA looply_auth_compat FROM PUBLIC, anonymous, authenticated;

CREATE TABLE IF NOT EXISTS looply_auth_compat.legacy_principals (
  id uuid PRIMARY KEY REFERENCES looply_migration.auth_user_inventory(source_user_id) ON DELETE RESTRICT
);
ALTER TABLE looply_auth_compat.legacy_principals ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE looply_auth_compat.legacy_principals FROM PUBLIC, anonymous, authenticated;

INSERT INTO looply_auth_compat.legacy_principals (id)
SELECT source_user_id FROM looply_migration.auth_user_inventory
ON CONFLICT (id) DO NOTHING;

-- Original ON DELETE CASCADE behavior preserved in the isolated candidate schema.
-- This is a relational compatibility structure, not a real auth.users replacement.
ALTER TABLE looply_candidate.profiles
  ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id) REFERENCES looply_auth_compat.legacy_principals(id) ON DELETE CASCADE;

ALTER TABLE looply_candidate.archived_card_reads
  ADD CONSTRAINT archived_card_reads_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES looply_auth_compat.legacy_principals(id) ON DELETE CASCADE;

ALTER TABLE looply_candidate.letter_event_notifications
  ADD CONSTRAINT letter_event_notifications_recipient_id_fkey
  FOREIGN KEY (recipient_id) REFERENCES looply_auth_compat.legacy_principals(id) ON DELETE CASCADE;

ALTER TABLE looply_candidate.letter_event_notifications
  ADD CONSTRAINT letter_event_notifications_sender_id_fkey
  FOREIGN KEY (sender_id) REFERENCES looply_auth_compat.legacy_principals(id) ON DELETE CASCADE;

ALTER TABLE looply_candidate.looply_user_invites
  ADD CONSTRAINT looply_user_invites_invited_by_fkey
  FOREIGN KEY (invited_by) REFERENCES looply_auth_compat.legacy_principals(id) ON DELETE CASCADE;
