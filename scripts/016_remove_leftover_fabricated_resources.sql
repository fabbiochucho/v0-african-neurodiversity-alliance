-- The fabricated placeholder orgs originally written in
-- 009_create_resources_table.sql (removed from that file's INSERT before it
-- was believed to have reached production) were in fact already live in the
-- `anda` Supabase project's public.resources table, complete with invented
-- ratings/review counts. Discovered while seeding real orgs in
-- 015_seed_real_african_support_resources.sql. Removing them here.
delete from public.resources
where name in (
  'ADHD Parents Network Ghana',
  'Autism Support Center Lagos',
  'Dr. Amina Hassan - Child Psychologist',
  'Inclusive Learning Academy',
  'Neurodevelopment Clinic Cairo',
  'Sarah Okafor - Special Needs Caregiver'
);
