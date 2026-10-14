-- Round 3, PR I, brief §40-41: per-learner localisation. Used only to
-- adjust labels and terminology (e.g. "IEP" vs "Support Plan"); no legal
-- or compliance meaning. Owners already update their own learner rows
-- (learner_profiles_update_own); these are plain descriptive columns.
alter table public.learner_profiles
  add column if not exists region text check (char_length(region) <= 100),
  add column if not exists language text not null default 'en' check (language in ('en')),
  add column if not exists education_context text not null default 'other'
    check (education_context in ('nigeria_inclusive', 'kenya_cbc', 'south_africa_sias', 'uk_ehcp', 'us_idea_504', 'other'));
