-- Restored tier features, round 2 (PR E). Depends on scripts/032
-- (public.tier_allows).

-- ---- Roster screening --------------------------------------------------------
-- 'quick'     : the 5-question ANDA check-in answered by the learner's owner
--               (educator/caregiver). Stores the answers and the areas
--               answered "often". No score, no cut-off, not a diagnosis.
-- 'neurafiki' : areas taken from a completed Neu Rafiki in-depth assessment
--               via the existing federation import (Premium+).
create table if not exists public.screenings (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.learner_profiles(id) on delete cascade,
  screened_by uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('quick', 'neurafiki')),
  answers jsonb,
  areas text[] not null default '{}',
  source_note text check (char_length(source_note) <= 200),
  created_at timestamp with time zone not null default now()
);

create index if not exists idx_screenings_learner on public.screenings(learner_id, created_at desc);

alter table public.screenings enable row level security;

create policy "screenings_select_owner"
  on public.screenings for select
  using (
    exists (
      select 1 from public.learner_profiles
      where learner_profiles.id = screenings.learner_id
      and learner_profiles.user_id = auth.uid()
    )
  );

create policy "screenings_insert_owner"
  on public.screenings for insert
  with check (
    screened_by = auth.uid()
    and exists (
      select 1 from public.learner_profiles
      where learner_profiles.id = screenings.learner_id
      and learner_profiles.user_id = auth.uid()
    )
    and (
      (kind = 'quick'
        and public.tier_allows(auth.uid(), 'free') -- gate:screening
      )
      or (kind = 'neurafiki'
        and public.tier_allows(auth.uid(), 'premium') -- gate:screening_in_depth
      )
    )
  );

create policy "screenings_delete_owner"
  on public.screenings for delete
  using (screened_by = auth.uid());

-- ---- Custom branding ------------------------------------------------------------
create table if not exists public.branding_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  org_name text check (char_length(org_name) <= 120),
  accent_color text check (accent_color ~ '^#[0-9a-fA-F]{6}$'),
  logo_path text,
  updated_at timestamp with time zone not null default now()
);

alter table public.branding_settings enable row level security;

create policy "branding_select_own"
  on public.branding_settings for select
  using (user_id = auth.uid());

create policy "branding_insert_own"
  on public.branding_settings for insert
  with check (
    user_id = auth.uid()
    and public.tier_allows(auth.uid(), 'pro') -- gate:branding
    and (logo_path is null or logo_path like auth.uid()::text || '/%')
  );

-- Every column here is the user's own presentation setting (no payment or
-- ownership fields); the check pins the row to its owner, their own logo
-- folder, and a current Pro+ plan.
create policy "branding_update_own"
  on public.branding_settings for update
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and public.tier_allows(auth.uid(), 'pro')
    and (logo_path is null or logo_path like auth.uid()::text || '/%')
  );

create policy "branding_delete_own"
  on public.branding_settings for delete
  using (user_id = auth.uid());

-- Logo bucket: public read (logos appear in report emails), owner-only
-- write into their own <user_id>/ folder, PNG/JPEG/WebP only (no SVG),
-- 512 KB max.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('branding', 'branding', true, 524288, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

create policy "branding_objects_insert_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'branding'
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.tier_allows(auth.uid(), 'pro')
  );

create policy "branding_objects_update_own"
  on storage.objects for update to authenticated
  using (bucket_id = 'branding' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (
    bucket_id = 'branding'
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.tier_allows(auth.uid(), 'pro')
  );

create policy "branding_objects_delete_own"
  on storage.objects for delete to authenticated
  using (bucket_id = 'branding' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---- Features with no insert of their own to gate --------------------------
-- gate:team_dashboard app-only: it only reads rows RLS already shows the owner.
-- gate:data_export app-only: read-only, through the owner's own RLS.
-- gate:bulk_enrollment app-only: each row is an ordinary learner_profiles
--   insert, already capped per tier by scripts/032's trigger.
