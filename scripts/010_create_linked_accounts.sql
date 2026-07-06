-- Phase 1 cross-app integration: optional link between this app's user and a
-- user in the sibling app (Alliance <-> Neu Rafiki). Rows here are always
-- user-initiated and revocable (status -> 'revoked'), never auto-created.
--
-- remote_app would always be 'neurafiki' for rows created by this repo
-- (this repo IS alliance), but the CHECK constraint stays symmetric/generic
-- so it matches the identical table defined in the sibling repo.
--
-- uuid_generate_v4() (rather than this repo's usual gen_random_uuid()) is
-- used here to match the shared contract text exactly; Supabase projects
-- have the uuid-ossp extension available by default, but this guard makes
-- the migration runnable standalone regardless.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.linked_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  local_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  remote_app TEXT NOT NULL CHECK (remote_app IN ('alliance', 'neurafiki')),
  remote_user_id UUID NOT NULL,
  remote_email TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'revoked')),
  scopes TEXT[] NOT NULL DEFAULT '{}',
  consent_version TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  UNIQUE(local_user_id, remote_app, remote_user_id)
);
ALTER TABLE public.linked_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "linked_accounts_select_own" ON public.linked_accounts FOR SELECT USING (auth.uid() = local_user_id);
CREATE POLICY "linked_accounts_insert_own" ON public.linked_accounts FOR INSERT WITH CHECK (auth.uid() = local_user_id);
CREATE POLICY "linked_accounts_update_own" ON public.linked_accounts FOR UPDATE USING (auth.uid() = local_user_id) WITH CHECK (auth.uid() = local_user_id);
