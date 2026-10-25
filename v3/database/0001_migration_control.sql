-- Looply V3 migration control only; no user data, no credentials.
-- Applied and verified on Neon project wispy-mountain-71258224 on 2026-10-25.
create schema if not exists migration_control;

create table if not exists migration_control.checkpoints (
  id text primary key,
  status text not null check (status in ('pending', 'running', 'verified', 'blocked')),
  details jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into migration_control.checkpoints (id, status, details)
values
  ('source_git_snapshot', 'verified', '{"source_commit":"d96527dd71a28aa3efb535615fe827dfaacba5d9","source_files":338}'::jsonb),
  ('database_export', 'pending', '{}'::jsonb),
  ('auth_migration', 'pending', '{}'::jsonb),
  ('private_media_copy', 'pending', '{}'::jsonb),
  ('frontend_cutover', 'blocked', '{}'::jsonb)
on conflict (id) do nothing;
