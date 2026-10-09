-- 7 real papers (5 confirmed via the publisher/PMC page directly, 2 via
-- consistent secondary citations -- flagged verified=false for the latter
-- pending a direct spot-check) and 2 real active research initiatives.
insert into public.research_papers (title, authors, journal, year, summary, url, country_focus, verified)
select * from (values
  ('A Systematic Review of Research on Autism Spectrum Disorders in Sub-Saharan Africa', 'Amina Abubakar, Derrick Ssewanyana, Charles R. Newton', 'Behavioural Neurology', 2016, 'Reviewed 47 studies across Sub-Saharan Africa and found only one population-level prevalence study and no case-control risk-factor studies.', 'https://doi.org/10.1155/2016/3501910', 'Sub-Saharan Africa', true),
  ('Genetic Etiology of Autism Spectrum Disorder in the African Population: A Scoping Review', 'Olivier Hakizimana, Janvier Hitayezu, Jeanne P. Uyisenga, Hope Onohuean, Leonor Palmeira, Vincent Bours, Abdullateef Isiaka Alagbonsi, Annette Uwineza', 'Frontiers in Genetics', 2024, 'Scoping review of genetic research into autism spectrum disorder within African populations.', 'https://doi.org/10.3389/fgene.2024.1431093', 'Africa (continental)', true),
  ('The Unmasking of Autism in South Africa and Nigeria', 'Skye Nandi Adams', 'Neuropsychiatric Disease and Treatment', 2024, 'Examines how autism presents and is recognized ("unmasked") in South African and Nigerian contexts.', 'https://doi.org/10.2147/NDT.S461650', 'South Africa, Nigeria', true),
  ('The Prevalence of Attention-Deficit Hyperactivity Disorder and Its Associated Factors Among Children in Ethiopia, 2024: A Systematic Review and Meta-Analysis', 'Molla Azmeraw, Dessie Temesgen, Amare Kassaw, Alemu Birara Zemariam, Gashaw Kerebeh, Gebremeskel Kibret Abebe, Addis Wondmagegn Alamaw, Biruk Beletew Abate', 'Frontiers in Child and Adolescent Psychiatry', 2024, 'Meta-analysis finding a pooled ADHD prevalence of 14.2% among children in Ethiopia.', 'https://doi.org/10.3389/frcha.2024.1425841', 'Ethiopia', true),
  ('The Genetics of Autism Spectrum Disorder in an East African Familial Cohort', 'Islam Oguz Tuncay, Darlene DeVries, Ashlesha Gogate, Kiran Kaur, Ashwani Kumar, Chao Xing, Kimberly Goodspeed, Leah Seyoum-Tesfa, Maria H. Chahrour', 'Cell Genomics', 2023, 'First autism spectrum disorder genetics study conducted in an African population, studying Ethiopian, Eritrean, and Kenyan families.', 'https://doi.org/10.1016/j.xgen.2023.100322', 'Ethiopia, Eritrea, Kenya', true),
  ('Autism Spectrum Disorder in Sub-Saharan Africa: A Comprehensive Scoping Review', 'Lauren Franz, Chambers, von Isenburg, Petrus J. de Vries', 'Autism Research', 2017, 'Scoping review of 53 publications on autism spectrum disorder across Sub-Saharan Africa.', 'https://doi.org/10.1002/aur.1766', 'Sub-Saharan Africa', false),
  ('Caregiving for Autistic Children in Nigeria: Experiences and Challenges', 'Albright Obinna Azubuike, Precious Chidozie Azubuike, Ayobami Oyekunle Afape, Michael Obule Enyam, Temidayo Akinreni, et al.', 'Discover Mental Health', 2025, 'Qualitative study of 103 caregivers of autistic children in Cross River, Nigeria, on their experiences and challenges.', 'https://doi.org/10.1007/s44192-025-00159-9', 'Nigeria', false)
) as v (title, authors, journal, year, summary, url, country_focus, verified)
where not exists (select 1 from public.research_papers r where r.title = v.title);

insert into public.research_initiatives (name, institution, description, url, verified)
select * from (values
  ('Centre for Autism Research in Africa (CARA)', 'University of Cape Town', 'Research and clinical centre focused on autism research across Africa.', 'https://health.uct.ac.za/cara', true),
  ('H3Africa (Human Heredity and Health in Africa)', 'Pan-African consortium (NIH and Wellcome Trust funded)', 'Large pan-African genomics research consortium; not autism-specific, but includes neurodevelopmental disorder genomics work.', 'https://h3africa.org', true)
) as v (name, institution, description, url, verified)
where not exists (select 1 from public.research_initiatives r where r.name = v.name);
