-- Round 3, PR F: using ANDA without Neu Rafiki (brief §7, §12, §44).
--
-- One append-only table for everything known about a learner that isn't a
-- goal or a check-in rating, each row tagged with a DATA KIND so the UI
-- can always say where information came from, and never mix them up:
--   observation        -- from family/carers/the user (support profile)
--   professional_input -- an existing diagnosis, school assessment or IEP
--   assessment         -- a Neu Rafiki assessment summary (imported, PR I)
--   check_in           -- a Neu Rafiki check-in summary (federation POST)
-- AI-generated text is never stored here (see the IEP plan items, PR H).
--
-- Rows are append-only: editing a support profile inserts a new version;
-- the newest row of a record_type is the current one.

create table if not exists public.learner_records (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.learner_profiles(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  kind text not null check (kind in ('observation', 'professional_input', 'assessment', 'check_in')),
  record_type text not null check (record_type in (
    'support_profile', 'diagnosis', 'school_assessment', 'existing_iep', 'other_assessment',
    'neurafiki_assessment', 'neurafiki_check_in'
  )),
  title text check (char_length(title) <= 300),
  record_date date,
  author text check (char_length(author) <= 200),
  fields jsonb not null default '{}',
  file_path text,
  created_at timestamp with time zone not null default now()
);

create index if not exists idx_learner_records_learner on public.learner_records(learner_id, created_at desc);

alter table public.learner_records enable row level security;

create policy "learner_records_select_owner"
  on public.learner_records for select
  using (
    exists (
      select 1 from public.learner_profiles
      where learner_profiles.id = learner_records.learner_id
      and learner_profiles.user_id = auth.uid()
    )
  );

-- Users may add only their own observations and professional input, on
-- their own learners, with files only in their own folder.
-- 'assessment' and 'check_in' rows come only from server routes.
create policy "learner_records_insert_owner"
  on public.learner_records for insert
  with check (
    created_by = auth.uid()
    and kind in ('observation', 'professional_input')
    and record_type in ('support_profile', 'diagnosis', 'school_assessment', 'existing_iep', 'other_assessment')
    and (kind = 'observation') = (record_type = 'support_profile')
    and (file_path is null or file_path like auth.uid()::text || '/%')
    and exists (
      select 1 from public.learner_profiles
      where learner_profiles.id = learner_records.learner_id
      and learner_profiles.user_id = auth.uid()
    )
  );

create policy "learner_records_delete_owner"
  on public.learner_records for delete
  using (
    exists (
      select 1 from public.learner_profiles
      where learner_profiles.id = learner_records.learner_id
      and learner_profiles.user_id = auth.uid()
    )
  );

-- Private bucket for uploaded assessment documents: owner-only read and
-- write under <user_id>/..., PDF and images only, 10 MB max. Files are
-- served through short-lived signed URLs.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('learner-files', 'learner-files', false, 10485760, array['application/pdf', 'image/png', 'image/jpeg'])
on conflict (id) do nothing;

create policy "learner_files_select_own"
  on storage.objects for select to authenticated
  using (bucket_id = 'learner-files' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "learner_files_insert_own"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'learner-files' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "learner_files_delete_own"
  on storage.objects for delete to authenticated
  using (bucket_id = 'learner-files' and (storage.foldername(name))[1] = auth.uid()::text);
