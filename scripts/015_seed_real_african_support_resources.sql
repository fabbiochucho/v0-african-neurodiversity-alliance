-- Seeds the Find Support directory with real, web-verified African and
-- African-origin neurodiversity/autism organizations, replacing the
-- fabricated listings removed in 009_create_resources_table.sql.
--
-- `verified = true` is set only for organizations confirmed via their own
-- official website; entries found only through secondary/aggregator
-- listings, or with no confirmed official site, are left `verified = false`
-- so the directory doesn't overstate confidence. `rating`/`reviews` are left
-- at their table defaults (0) -- real values will populate once visitors
-- use the new "Rate" feature (scripts/014_create_resource_submissions_and_reviews.sql).

-- Guarded so re-running this script (no unique constraint on name) can't
-- duplicate rows. Column aliases on a plain VALUES list can't carry types
-- (that syntax only works for function-returning-record constructs), so
-- jsonb values are cast inline instead.
insert into public.resources (name, description, category, country, location, url, contact_info, specialties, verified)
select * from (values
  -- West Africa: Nigeria & Ghana
  ('Zeebah Foundation', 'Autism advocacy and family support organization.', 'support_group', 'Nigeria', 'Abuja', 'https://zeebahfoundation.com', '{"website": "https://zeebahfoundation.com"}'::jsonb, '["Autism"]'::jsonb, true),
  ('IKE Foundation for Autism', 'Autism support and advocacy organization.', 'support_group', 'Nigeria', 'Abuja', 'https://ikefoundationforautism.org', '{"website": "https://ikefoundationforautism.org"}'::jsonb, '["Autism"]'::jsonb, true),
  ('National Society for Autism Nigeria', 'National autism support and advocacy society.', 'support_group', 'Nigeria', 'Abuja', 'https://societyforautismnigeria.org', '{"website": "https://societyforautismnigeria.org"}'::jsonb, '["Autism"]'::jsonb, true),
  ('Patrick Speech and Languages Centre', 'Behavioural, occupational, and speech therapy centre for autistic children, established in 2006.', 'therapist', 'Nigeria', 'Ikeja/GRA, Lagos', 'https://pslcautism-ng.org', '{"phone": "+234 8180127108", "website": "https://pslcautism-ng.org"}'::jsonb, '["Autism", "Speech & Language Therapy", "Occupational Therapy"]'::jsonb, true),
  ('Autism Compassion Africa (ACA)', 'Autism support organization serving families across Lagos and Abuja.', 'support_group', 'Nigeria', 'Lagos & Abuja', 'https://www.autismcompassionafrica.org', '{"website": "https://www.autismcompassionafrica.org"}'::jsonb, '["Autism"]'::jsonb, true),
  ('Nature''s Sprout Academy', 'School for children with autism and other developmental needs.', 'school', 'Ghana', 'North Legon, Accra', 'https://www.nsa.edu.gh', '{"website": "https://www.nsa.edu.gh"}'::jsonb, '["Autism", "Education"]'::jsonb, true),
  ('Autism Awareness Care and Training (AACT)', 'Autism awareness, care, and training organization.', 'support_group', 'Ghana', 'Accra', 'https://aactgh.org', '{"website": "https://aactgh.org"}'::jsonb, '["Autism"]'::jsonb, true),
  ('Woodfield Manor Autism & Special Needs School', 'School serving children with autism and other special needs.', 'school', 'Ghana', 'Adenta, Accra', null, '{}'::jsonb, '["Autism", "Education"]'::jsonb, false),

  -- East Africa: Kenya, Uganda, Tanzania, Ethiopia
  ('Autism Society of Kenya', 'National autism support and advocacy society.', 'support_group', 'Kenya', 'Westlands, Nairobi', 'https://autismkenya.org', '{"phone": "+254 721 544995", "email": "info@autismkenya.org", "website": "https://autismkenya.org"}'::jsonb, '["Autism"]'::jsonb, true),
  ('Autism Support Center (Kenya)', 'Autism support organization based in Nairobi.', 'support_group', 'Kenya', 'Nairobi', 'https://autismcenterkenya.org', '{"email": "info@autismcenterkenya.or.ke", "website": "https://autismcenterkenya.org"}'::jsonb, '["Autism"]'::jsonb, true),
  ('The Autism Foundation International (T.A.F.I)', 'School for children with autism.', 'school', 'Kenya', 'Ongata Rongai, Kajiado County', 'https://thismytafi.org', '{"website": "https://thismytafi.org"}'::jsonb, '["Autism", "Education"]'::jsonb, true),
  ('Lala''s Daycare and Inclusive School', 'Inclusive daycare and school for children with autism and other developmental needs.', 'school', 'Uganda', 'Seguku, Wakiso', 'https://lalasinclusiveschool.com', '{"website": "https://lalasinclusiveschool.com"}'::jsonb, '["Autism", "Education"]'::jsonb, true),
  ('Dorna Centre Home for Autism', 'Healthcare and residential centre for autistic individuals.', 'healthcare', 'Uganda', 'Kampala', 'https://dornahomeforautism.org', '{"website": "https://dornahomeforautism.org"}'::jsonb, '["Autism"]'::jsonb, true),
  ('Nehemiah Autism Center', 'Autism care and healthcare centre.', 'healthcare', 'Ethiopia', 'Addis Ababa', null, '{"phone": "+251930012652", "email": "nehemiah.center@yahoo.com"}'::jsonb, '["Autism"]'::jsonb, false),
  ('Eye Opener Autism Center', 'Autism care and healthcare centre.', 'healthcare', 'Ethiopia', 'Addis Ababa', 'https://eyeopenerautism.org', '{"phone": "+251 988584089", "email": "info@eyeopnerautism.org", "website": "https://eyeopenerautism.org"}'::jsonb, '["Autism"]'::jsonb, true),
  ('World Federation Autistic Day Care Centre', 'Autism day care centre.', 'healthcare', 'Tanzania', 'Dar es Salaam', null, '{}'::jsonb, '["Autism"]'::jsonb, false),

  -- South Africa
  ('Autism South Africa', 'National autism support and advocacy organization.', 'support_group', 'South Africa', 'Gauteng', 'https://www.aut2know.co.za', '{"website": "https://www.aut2know.co.za"}'::jsonb, '["Autism"]'::jsonb, true),
  ('ADHASA', 'Attention Deficit and Hyperactivity Support Group of Southern Africa.', 'support_group', 'South Africa', 'Blairgowrie, Randburg, Johannesburg', 'https://www.adhasa.co.za', '{"phone": "011 888 7655", "email": "support@adhasa.co.za", "website": "https://www.adhasa.co.za"}'::jsonb, '["ADHD"]'::jsonb, true),
  ('Centre for Autism Research in Africa (CARA)', 'University of Cape Town research and clinical centre for autism.', 'healthcare', 'South Africa', 'Cape Town', 'https://health.uct.ac.za/cara', '{"website": "https://health.uct.ac.za/cara"}'::jsonb, '["Autism", "Research"]'::jsonb, true),
  ('Mindstretch School', 'School for children with autism and other learning needs.', 'school', 'South Africa', 'Cape Town', 'https://www.mindstretch.co.za', '{"website": "https://www.mindstretch.co.za"}'::jsonb, '["Autism", "Education"]'::jsonb, true),
  ('The Academy for Learning', 'School for children with special educational needs.', 'school', 'South Africa', 'Diep River, Cape Town', null, '{}'::jsonb, '["Education"]'::jsonb, false),
  ('Amazing K Academy', 'Therapy services for children with developmental needs.', 'therapist', 'South Africa', 'Northwold & Sharonlea, Gauteng', null, '{}'::jsonb, '["Autism"]'::jsonb, false),
  ('The Key School', 'School for children with special educational needs.', 'school', 'South Africa', 'Johannesburg', null, '{}'::jsonb, '["Education"]'::jsonb, false),
  ('Star Academy', 'Therapy services for children with developmental needs.', 'therapist', 'South Africa', 'Johannesburg', null, '{}'::jsonb, '["Autism"]'::jsonb, false),

  -- North Africa: Egypt & Morocco
  ('Egyptian Autistic Society', 'National autism support society.', 'support_group', 'Egypt', 'Degla, Maadi, Cairo', 'https://autismegypt.org', '{"phone": "+201061400805", "email": "autismegypt@yahoo.com", "website": "https://autismegypt.org"}'::jsonb, '["Autism"]'::jsonb, true),
  ('The Egyptian Advance Society for Persons with Autism and Other Disabilities (ADVANCE)', 'School and services for people with autism and other disabilities.', 'school', 'Egypt', 'New Maadi, Cairo', 'https://advance-society.org', '{"phone": "202-519-3721", "website": "https://advance-society.org"}'::jsonb, '["Autism", "Education"]'::jsonb, true),
  ('SOS Autisme Maroc', 'Autism support organization.', 'support_group', 'Morocco', 'Casablanca', 'https://sos-autisme.ma', '{"phone": "0522 59 06 97", "website": "https://sos-autisme.ma"}'::jsonb, '["Autism"]'::jsonb, true),
  ('EMPTA', 'Autism support organization.', 'support_group', 'Morocco', 'Oujda', 'https://empta.org', '{"phone": "0613998288", "email": "empta.autism@gmail.com", "website": "https://empta.org"}'::jsonb, '["Autism"]'::jsonb, true),
  ('Association Pinocchio', 'Autism support association.', 'support_group', 'Morocco', 'Rabat', null, '{"email": "ms.berrada@yahoo.fr"}'::jsonb, '["Autism"]'::jsonb, false)
) as v (name, description, category, country, location, url, contact_info, specialties, verified)
where not exists (select 1 from public.resources r where r.name = v.name);
