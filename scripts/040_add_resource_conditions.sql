-- Tags every Find Support directory entry with the conditions it supports
-- (vocabulary in lib/conditions.ts) so families can filter by condition, and
-- adds organisations beyond autism: ones covering neurodivergence broadly,
-- plus single-condition ones for ADHD, dyslexia, Down syndrome and cerebral
-- palsy.
--
-- Numbered 040 to stay clear of 028-03x, which the open audit PRs use.
--
-- Same verification rule as 015: `verified = true` only where the
-- organisation's own website was checked (October 2026) and showed current
-- contact details or activity. Entries known only from news, research papers
-- or third-party listings are `verified = false`.

alter table public.resources
  add column if not exists conditions text[] not null default '{}';

-- Lets the "Suggest a resource" form say which conditions an organisation
-- supports; reviewers copy it across when publishing.
alter table public.resource_submissions
  add column if not exists conditions text[] not null default '{}';

create index if not exists resources_conditions_idx on public.resources using gin (conditions);

-- Backfill 015's entries strictly from their published descriptions. Entries
-- describing only "special educational/developmental needs" stay untagged
-- rather than guessing which conditions they cover.
update public.resources set conditions = '{Autism}'
where name in (
  'Zeebah Foundation',
  'IKE Foundation for Autism',
  'National Society for Autism Nigeria',
  'Patrick Speech and Languages Centre',
  'Autism Compassion Africa (ACA)',
  'Nature''s Sprout Academy',
  'Autism Awareness Care and Training (AACT)',
  'Woodfield Manor Autism & Special Needs School',
  'Autism Society of Kenya',
  'Autism Support Center (Kenya)',
  'The Autism Foundation International (T.A.F.I)',
  'Lala''s Daycare and Inclusive School',
  'Dorna Centre Home for Autism',
  'Nehemiah Autism Center',
  'Eye Opener Autism Center',
  'World Federation Autistic Day Care Centre',
  'Autism South Africa',
  'Centre for Autism Research in Africa (CARA)',
  'Egyptian Autistic Society',
  'The Egyptian Advance Society for Persons with Autism and Other Disabilities (ADVANCE)',
  'SOS Autisme Maroc',
  'EMPTA',
  'Association Pinocchio'
);
update public.resources set conditions = '{ADHD}' where name = 'ADHASA';
update public.resources set conditions = '{Autism,"Learning differences"}' where name = 'Mindstretch School';
update public.resources set conditions = '{"Learning differences"}'
where name in ('The Academy for Learning', 'The Key School');

-- Guarded like 015 so re-running can't duplicate rows.
insert into public.resources (name, description, category, country, location, url, contact_info, specialties, conditions, verified)
select * from (values
  -- Organisations covering neurodivergence broadly
  ('Neurodiversity Centre',
   'Assessments, therapy, coaching and training across the lifespan for autism, ADHD, dyslexia, dysgraphia, dyscalculia, OCD, coordination differences and sensory processing. Branches across the Western Cape and KwaZulu-Natal.',
   'healthcare', 'South Africa', 'Western Cape & KwaZulu-Natal (12 branches)', 'https://neurodiversitycentre.co.za',
   '{"phone": "+27 21 975 0376", "email": "hello@neurodiversitycentre.co.za", "website": "https://neurodiversitycentre.co.za"}'::jsonb,
   '["Assessments", "Therapy", "Training", "Support Groups"]'::jsonb,
   '{"All neurodivergent",Autism,ADHD,Dyslexia,Dysgraphia,Dyscalculia,"Dyspraxia (DCD)",OCD,"Sensory processing"}'::text[], true),
  ('Neurodiversity Foundation',
   'Non-profit providing early neurodevelopmental screening and support for children in underserved rural communities, and training local teachers to support their families.',
   'support_group', 'South Africa', 'Cape Town & Breede Valley', 'https://neurodiversity.org.za',
   '{"phone": "+27 76 529 5287", "email": "info@neurodiversity.org.za", "website": "https://neurodiversity.org.za"}'::jsonb,
   '["Screening", "Teacher Training"]'::jsonb,
   '{"All neurodivergent",Autism,ADHD,"Learning differences","Sensory processing"}'::text[], true),
  ('Centre for Early Development, Learning and Care (CEDLAC)',
   'One-stop centre for assessment, special education and speech, occupational, play, sensory and behavioural therapy for children with developmental conditions.',
   'school', 'Nigeria', 'Ashi, Ibadan', null,
   '{}'::jsonb,
   '["Assessments", "Education", "Therapy"]'::jsonb,
   '{Autism,"Intellectual disability","Down syndrome","Cerebral palsy"}'::text[], false),

  -- ADHD, dyslexia and learning differences
  ('SADAG ADHD Helpline',
   'Toll-free ADHD helpline run by the South African Depression and Anxiety Group, 8am to 8pm.',
   'support_group', 'South Africa', 'National (toll-free)', 'https://www.sadag.org',
   '{"phone": "0800 55 44 33", "website": "https://www.sadag.org"}'::jsonb,
   '["Helpline"]'::jsonb,
   '{ADHD}'::text[], true),
  ('Dyslexia Organisation Kenya',
   'Dyslexia screening and cognitive assessments with reports for parents, a school for learners with dyslexia, and training for parents and teachers.',
   'school', 'Kenya', 'Old Namanga Road, Upper Milimani, Kitengela', 'https://www.dyslexiakenya.org',
   '{"phone": "+254 722 390 952", "email": "info@dyslexiakenya.org", "website": "https://www.dyslexiakenya.org"}'::jsonb,
   '["Screening & Assessments", "Education", "Teacher Training"]'::jsonb,
   '{Dyslexia,"Learning differences"}'::text[], true),
  ('Dyslexia Africa',
   'One-to-one Davis programmes for dyslexia, maths difficulties and attention and focus, from age 5.',
   'therapist', 'Kenya', 'Westlands, Nairobi', 'https://www.dyslexia-africa.com',
   '{"phone": "+254 721 492217", "email": "info@dyslexia-africa.com", "website": "https://www.dyslexia-africa.com"}'::jsonb,
   '["One-to-one Programmes"]'::jsonb,
   '{Dyslexia,Dyscalculia,ADHD}'::text[], true),
  ('Africa Dyslexia Organisation',
   'Non-profit raising dyslexia awareness across Africa.',
   'support_group', 'Ghana', 'Accra', 'https://www.facebook.com/africadyslexiaorg/',
   '{"website": "https://www.facebook.com/africadyslexiaorg/"}'::jsonb,
   '["Awareness"]'::jsonb,
   '{Dyslexia}'::text[], false),

  -- Down syndrome and cerebral palsy
  ('Down Syndrome Foundation Nigeria',
   'Non-profit (est. 2001) providing a helpline, resources for parents, caregivers and educators, and advocacy for people with Down syndrome.',
   'support_group', 'Nigeria', 'Iju, Fagba, Lagos', 'https://downsyndrome.org.ng',
   '{"phone": "+234 803 228 5545", "email": "hello@downsyndrome.org.ng", "website": "https://downsyndrome.org.ng"}'::jsonb,
   '["Helpline", "Family Support", "Advocacy"]'::jsonb,
   '{"Down syndrome"}'::text[], true),
  ('Cerebral Palsy Society of Kenya',
   'Parent-founded society providing therapy, medical, educational and counselling services for people with cerebral palsy.',
   'support_group', 'Kenya', 'Old Donholm Estate, Nairobi', 'https://www.cpsk.or.ke',
   '{"phone": "+254 708 829682", "email": "info@cpsk.or.ke", "website": "https://www.cpsk.or.ke"}'::jsonb,
   '["Therapy", "Counselling", "Education"]'::jsonb,
   '{"Cerebral palsy"}'::text[], true),
  ('Cerebral Palsy Centre Lagos',
   'Therapy, specialised and residential care for children with severe cerebral palsy, with respite for their families.',
   'healthcare', 'Nigeria', 'Lakowe, Ibeju-Lekki, Lagos', 'https://cpcenter.com.ng',
   '{"phone": "+234 803 348 2792", "email": "info@cpcenter.com.ng", "website": "https://cpcenter.com.ng"}'::jsonb,
   '["Therapy", "Residential Care", "Respite"]'::jsonb,
   '{"Cerebral palsy"}'::text[], true),

  -- Disability-wide
  ('Able Child Africa',
   'UK charity working in Kenya for over 15 years through local partners on inclusive education, livelihoods and parent support for children and young people with disabilities.',
   'support_group', 'Kenya', 'Kenya (through local partners)', 'https://ablechildafrica.org/where-we-work/kenya/',
   '{"website": "https://ablechildafrica.org/where-we-work/kenya/"}'::jsonb,
   '["Inclusive Education", "Family Support"]'::jsonb,
   '{"Disabilities (general)"}'::text[], true),
  ('Special Needs Initiative for Growth',
   'NGO supporting education, vocational training and employment for people with disabilities, including Down syndrome, autism and cerebral palsy.',
   'support_group', 'Nigeria', null, 'https://zeroproject.org/view/organization/7b3b2e32-9304-eb11-a813-000d3ab9bc3d',
   '{"website": "https://zeroproject.org/view/organization/7b3b2e32-9304-eb11-a813-000d3ab9bc3d"}'::jsonb,
   '["Vocational Training", "Employment"]'::jsonb,
   '{Autism,"Down syndrome","Cerebral palsy","Disabilities (general)"}'::text[], false),

  -- Autism, outside the 015 list
  ('Autism Help Foundation',
   'Foundation supporting people with neurodevelopmental conditions and their families in rural northern Ghana, including autism awareness walks.',
   'support_group', 'Ghana', 'Northern & Upper West regions', 'https://amoafowaa.com/tag/autism-help-foundation/',
   '{"website": "https://amoafowaa.com/tag/autism-help-foundation/"}'::jsonb,
   '["Awareness", "Family Support"]'::jsonb,
   '{Autism}'::text[], false),
  ('Joy Center for Children with Autism',
   'Parent-led autism centre providing educational and behavioural support.',
   'school', 'Ethiopia', 'Addis Ababa', 'https://www.globalgiving.org/projects/build-an-autism-center-for-500-ethiopian-children-joy/',
   '{"website": "https://www.globalgiving.org/projects/build-an-autism-center-for-500-ethiopian-children-joy/"}'::jsonb,
   '["Education"]'::jsonb,
   '{Autism}'::text[], false)
) as v(name, description, category, country, location, url, contact_info, specialties, conditions, verified)
where not exists (select 1 from public.resources r where r.name = v.name);
