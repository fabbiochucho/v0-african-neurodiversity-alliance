-- Seeds Learning with 10 real, web-verified learning resources (4
-- African-origin, 6 international). verified = true only where confirmed
-- via the provider's own official page.
insert into public.learning_resources (title, provider, description, format, price, platform, url, country_origin, verified)
select * from (values
  -- African-origin
  ('Special Needs Teacher Education Diploma (Autism / Learning Disabilities tracks)', 'Kenya Institute of Special Education (KISE)', 'Two-year diploma training special-needs teachers, including autism and learning disabilities tracks, offered via distance learning at regional centers.', 'training', 'Unknown', 'KISE regional centers / distance learning', 'https://kise.ac.ke/training-programs', 'Kenya', true),
  ('Disability Inclusion in Education: Building Systems of Support', 'University of Cape Town', 'Roughly 14-hour course on building inclusive education systems for learners with disabilities, taught by Judith McKenzie.', 'course', 'Free', 'Coursera', 'https://www.coursera.org/learn/disability-inclusion-education', 'South Africa', true),
  ('Autism: All You Need to Know About Autism', 'Amazing K', 'Introductory course on autism fundamentals for parents and caregivers in South Africa.', 'course', 'Unknown', 'Udemy', 'https://amazingk.co.za/training', 'South Africa', true),
  ('Monthly Autism Trainings (ABCs of Autism, PECS, Toilet Training)', 'Autism Compassion Africa', 'Free monthly webinar series covering practical autism support topics for families.', 'webinar', 'Free', 'Autism Compassion Africa (online)', 'https://autismcompassionafrica.org/services', 'Nigeria', false),

  -- International
  ('Understanding Autism', 'University of Kent', 'Four-week introductory course on autism, roughly 3 hours per week, free to audit.', 'course', 'Free to audit', 'FutureLearn', 'https://www.futurelearn.com/courses/autism', null, true),
  ('Autism and Education', 'University of Bath', 'Course on supporting autistic learners in educational settings, free to audit.', 'course', 'Free to audit', 'FutureLearn', 'https://www.futurelearn.com/courses/autism-education', null, true),
  ('Understanding ADHD', 'The Open University', 'Twelve-hour free course on ADHD with a free completion certificate.', 'course', 'Free', 'OpenLearn', 'https://www.open.edu/openlearn/health-sports-psychology/understanding-adhd', null, true),
  ('Autism Friendly Training', 'Autism Speaks', 'Self-paced training badge for businesses and professionals on creating autism-friendly environments, under 30 minutes.', 'training', 'Free', 'Autism Speaks (online)', 'https://www.autismspeaks.org/autism-friendly-training', null, true),
  ('Many Faces of Autism', 'Autism Certification Center', 'Free introductory course on autism, part of a certification pathway partnered with Autism Speaks.', 'course', 'Free', 'Autism Certification Center', 'https://autismcertificationcenter.org', null, true),
  ('Autism Internet Modules', 'OCALI (Ohio Center for Autism and Low Incidence)', 'Free library of training modules on autism and related disabilities for educators and caregivers.', 'training', 'Free', 'Autism Internet Modules (online)', 'https://www.autisminternetmodules.org', null, true)
) as v (title, provider, description, format, price, platform, url, country_origin, verified)
where not exists (select 1 from public.learning_resources r where r.title = v.title);
