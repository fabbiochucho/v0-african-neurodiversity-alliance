-- Public support directory, replacing the hardcoded mockResources array
-- previously used by app/directory/page.tsx.
create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text not null default 'support_group', -- school | therapist | support_group | healthcare | caregiver
  country text,
  location text,
  url text,
  contact_info jsonb default '{}', -- { phone?, email?, website? }
  specialties jsonb default '[]',
  rating numeric(3, 1) default 0,
  reviews integer default 0,
  verified boolean default false,
  is_published boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.resources enable row level security;

-- The directory is a public marketing feature - anyone (including signed-out
-- visitors) can browse published resources.
create policy "resources_select_published"
  on public.resources for select
  using (is_published = true);

-- Seed with the resources previously hardcoded in app/directory/page.tsx.
insert into public.resources
  (name, description, category, country, location, url, contact_info, specialties, rating, reviews, verified, is_published)
values
  (
    'Autism Support Center Lagos',
    'Comprehensive support services for individuals with autism and their families. Offering therapy, educational programs, and community support.',
    'support_group',
    'Nigeria',
    'Lagos, Nigeria',
    'www.autismsupportlagos.org',
    '{"phone": "+234 801 234 5678", "email": "info@autismsupportlagos.org", "website": "www.autismsupportlagos.org"}',
    '["Autism", "Family Support", "Early Intervention"]',
    4.8,
    127,
    true,
    true
  ),
  (
    'Dr. Amina Hassan - Child Psychologist',
    'Experienced child psychologist specializing in neurodevelopmental disorders. Provides assessment, therapy, and family counseling services.',
    'therapist',
    'Kenya',
    'Nairobi, Kenya',
    null,
    '{"phone": "+254 700 123 456", "email": "dr.hassan@childpsychke.com"}',
    '["ADHD", "Autism", "Behavioral Therapy"]',
    4.9,
    89,
    true,
    true
  ),
  (
    'Inclusive Learning Academy',
    'Private school with specialized programs for neurodivergent learners. Small class sizes and individualized learning plans.',
    'school',
    'South Africa',
    'Cape Town, South Africa',
    'www.inclusivelearning.co.za',
    '{"phone": "+27 21 123 4567", "email": "admissions@inclusivelearning.co.za", "website": "www.inclusivelearning.co.za"}',
    '["Inclusive Education", "Dyslexia Support", "Special Needs"]',
    4.7,
    156,
    true,
    true
  ),
  (
    'ADHD Parents Network Ghana',
    'Support network for parents of children with ADHD. Monthly meetings, resources, and advocacy for better services.',
    'support_group',
    'Ghana',
    'Accra, Ghana',
    'www.adhdparentsgh.org',
    '{"email": "contact@adhdparentsgh.org", "website": "www.adhdparentsgh.org"}',
    '["ADHD", "Parent Support", "Advocacy"]',
    4.6,
    73,
    false,
    true
  ),
  (
    'Neurodevelopment Clinic Cairo',
    'Medical clinic specializing in neurodevelopmental assessments and early intervention services.',
    'healthcare',
    'Egypt',
    'Cairo, Egypt',
    null,
    '{"phone": "+20 2 1234 5678", "email": "info@neuroclinic-cairo.com"}',
    '["Diagnosis", "Autism", "ADHD", "Developmental Delays"]',
    4.5,
    94,
    true,
    true
  ),
  (
    'Sarah Okafor - Special Needs Caregiver',
    'Certified caregiver with 8 years experience supporting individuals with autism and other neurodivergent conditions.',
    'caregiver',
    'Nigeria',
    'Abuja, Nigeria',
    null,
    '{"phone": "+234 803 456 7890", "email": "sarah.okafor@caregivers.ng"}',
    '["Autism Care", "Behavioral Support", "Daily Living Skills"]',
    4.9,
    42,
    true,
    true
  )
on conflict do nothing;
