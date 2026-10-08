-- Seeds the Apps & Tools directory with real, web-verified apps and
-- assistive technology, replacing the fabricated featuredApps/assistiveTech
-- arrays previously hardcoded in app/apps-tools/page.tsx (invented download
-- counts, star ratings, and in one case a wrong platform list / wrong
-- developer name).
--
-- African-origin entries are deliberately few: research turned up very few
-- apps that are both (a) confirmed via an official source and (b) actually
-- neurodivergence-specific, rather than general disability-assistive-tech.
-- `rating`/`reviews` are left at their table defaults (0); real values
-- populate via the new "Rate" feature. `verified = true` only where
-- confirmed via the product/company's own official site or an app store
-- listing.

insert into public.apps_tools (name, developer, description, category, type, platforms, price, url, country_origin, features, verified)
select * from (values
  -- African-origin
  ('NASQ (Nigerian Autism Screening Questionnaire)', 'Bloom Buddy (with Autism Speaks)', 'Free online screening questionnaire helping Nigerian parents and caregivers identify early signs of autism in children.', 'learning', 'app', '["Web"]'::jsonb, 'Free', 'https://www.thebloombuddy.com/nasq', 'Nigeria', '[]'::jsonb, true),
  ('Visis', 'Vinsighte', 'AI app that scans and reads printed text aloud and identifies objects, colors, and surroundings for visually impaired users; deployed in Nigerian schools.', 'sensory', 'app', '["iOS", "Android"]'::jsonb, 'Unknown', 'https://www.vinsighte.com.ng/', 'Nigeria', '[]'::jsonb, true),
  ('Terp 360', 'Signvrse', 'AI-powered 3D avatar platform translating English and Swahili speech/text into Kenyan Sign Language in real time.', 'communication', 'app', '["Web"]'::jsonb, 'Unknown', 'https://signvrse.com/', 'Kenya', '[]'::jsonb, true),

  -- International: AAC / communication
  ('Proloquo2Go', 'AssistiveWare', 'Symbol-based AAC communication app for non-speaking individuals.', 'communication', 'app', '["iOS", "iPadOS", "macOS", "watchOS"]'::jsonb, '$249.99 one-time (Mac version $124.99)', 'https://www.assistiveware.com/products/proloquo2go', null, '["Offline Mode", "Voice Output", "Customizable"]'::jsonb, true),
  ('Avaz AAC', 'Avaz Inc.', 'AAC communication app with freemium access and a word-prediction based vocabulary system.', 'communication', 'app', '["iPad", "Android"]'::jsonb, 'Freemium; $99.99/year or $199.99-$299.99 lifetime', 'https://www.avazapp.com/', null, '[]'::jsonb, true),
  ('CoughDrop', 'CoughDrop, Inc.', 'Open-source AAC communication platform usable on web and mobile.', 'communication', 'app', '["Web", "iOS", "Android"]'::jsonb, '$9/month or $295 one-time lifetime license', 'https://www.coughdrop.com/', null, '[]'::jsonb, true),
  ('TouchChat HD', 'PRC-Saltillo', 'AAC communication app with customizable vocabulary sets.', 'communication', 'app', '["iPad", "iPhone", "Mac"]'::jsonb, '$149.99 base, $299.99 with WordPower vocabulary', 'https://touchchatapp.com/', null, '[]'::jsonb, true),
  ('LAMP Words for Life', 'PRC-Saltillo', 'AAC communication app built on motor-planning based language acquisition.', 'communication', 'app', '["iPad", "iPhone", "Mac"]'::jsonb, '$299.99 one-time (free 30-day trial via a separate Discover app)', 'https://www.aacapps.com/lamp', null, '[]'::jsonb, true),

  -- International: learning
  ('Otsimo', 'Otsimo', 'Autism-focused learning app with speech, cognitive, and motor-skill exercises for children.', 'learning', 'app', '["Android", "iOS"]'::jsonb, 'Free in Turkey; subscription roughly $10-$21/month elsewhere', 'https://otsimo.com/', null, '[]'::jsonb, true),
  ('ModMath', 'Dawn & Josh Denberg', 'Digital graph paper and math workbook for students with dysgraphia.', 'learning', 'app', '["iPad"]'::jsonb, 'First workbook free; ModMath Plus subscription $1.99-$59.99', 'https://modmath.com/', null, '[]'::jsonb, true),

  -- International: sensory
  ('Sensory App House', 'Sensory App House Ltd', 'Collection of sensory-friendly interactive apps for cause-and-effect play and visual stimulation.', 'sensory', 'app', '["iOS", "Android", "Web", "Windows", "Mac", "Apple TV", "Chromebook"]'::jsonb, 'Most titles free or $1.49-$4.99', 'https://www.sensoryapphouse.com/', null, '[]'::jsonb, true),

  -- International: social
  ('Social Story Creator & Library', 'Touch Autism', 'Create personalized social stories and visual supports.', 'social', 'app', '["iOS"]'::jsonb, 'Free app with in-app purchases; Educators edition $29.99', 'https://touchautism.com/app/social-story-creator/', null, '[]'::jsonb, true),

  -- International: wellness
  ('Calm Counter', 'Touch Autism', 'Visual and auditory tools for emotional regulation and calming.', 'wellness', 'app', '["iOS"]'::jsonb, 'Approximately $2.99', 'https://touchautism.com/app/calm-counter/', null, '[]'::jsonb, true),

  -- Assistive technology (generic, widely-available product categories)
  ('Noise-Cancelling Headphones', null, 'Reduce sensory overload with active noise cancellation; widely available from major audio brands.', 'sensory', 'assistive_tech', '[]'::jsonb, '$150-$400', null, null, '["Active Noise Cancellation", "Comfortable Fit", "Long Battery Life"]'::jsonb, false),
  ('Weighted Blankets', null, 'Provide deep pressure stimulation to support sleep and calm.', 'sensory', 'assistive_tech', '[]'::jsonb, '$50-$150', null, null, '["Various Weights", "Breathable Fabric", "Machine Washable"]'::jsonb, false),
  ('Fidget Tools', null, 'Tactile tools to support focus and self-regulation.', 'organization', 'assistive_tech', '[]'::jsonb, '$5-$30', null, null, '["Portable", "Quiet Operation", "Durable Materials"]'::jsonb, false),
  ('Visual Schedule Boards', null, 'Physical boards for creating visual schedules and daily routines.', 'organization', 'assistive_tech', '[]'::jsonb, '$25-$80', null, null, '["Magnetic", "Customizable", "Portable Options"]'::jsonb, false)
) as v (name, developer, description, category, type, platforms, price, url, country_origin, features, verified)
where not exists (select 1 from public.apps_tools r where r.name = v.name);
