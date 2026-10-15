-- 048: "In their own words" records (record_type 'voice'), the person's or
-- their family's own words, reported in their own section of monthly and
-- quarterly reports. Stored as kind 'observation' with
-- fields { summary, speaker: 'learner' | 'family' }.

-- 1. Allow the new record_type in the table's check constraint (whatever
--    name it was given when created or last widened).
do $$
declare c text;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.learner_records'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%record_type%'
  loop
    execute format('alter table public.learner_records drop constraint %I', c);
  end loop;
end $$;

alter table public.learner_records
  add constraint learner_records_record_type_check check (record_type in (
    'support_profile', 'voice', 'diagnosis', 'school_assessment', 'existing_iep',
    'other_assessment', 'neurafiki_assessment', 'neurafiki_check_in'
  ));

-- 2. Owners may add 'voice' observations.
drop policy if exists "learner_records_insert_owner" on public.learner_records;
create policy "learner_records_insert_owner"
  on public.learner_records for insert
  with check (
    created_by = auth.uid()
    and kind in ('observation', 'professional_input')
    and record_type in ('support_profile', 'voice', 'diagnosis', 'school_assessment', 'existing_iep', 'other_assessment')
    and (kind = 'observation') = (record_type in ('support_profile', 'voice'))
    and (file_path is null or file_path like auth.uid()::text || '/%')
    and exists (
      select 1 from public.learner_profiles
      where learner_profiles.id = learner_records.learner_id
      and learner_profiles.user_id = auth.uid()
    )
  );

-- 3. Team members allowed to add observations may add 'voice' too.
drop policy if exists "learner_records_insert_team_observation" on public.learner_records;
create policy "learner_records_insert_team_observation" on public.learner_records for insert
  with check (
    created_by = auth.uid()
    and kind = 'observation'
    and record_type in ('support_profile', 'voice')
    and file_path is null
    and public.has_permission(learner_id, 'add_observation')
  );

-- Export split (owner decision, Oct 2026): every plan downloads its own data
-- as JSON (NDPA portability); Pro adds per-table CSV; Institutional adds the
-- support-team export.
-- gate:csv_export app-only: read-only, through the owner's own RLS.
