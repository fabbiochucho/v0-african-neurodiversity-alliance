-- Seed Forum Categories and Discussion Starters
-- This script populates initial forum structure for ANDA community

-- Insert Forum Categories
INSERT INTO forum_categories (name, description, slug, icon, order_index) VALUES
  ('General Discussion', 'Open discussions about neurodiversity experiences, wins, and challenges', 'general-discussion', 'MessageCircle', 1),
  ('Parents & Caregivers', 'Support and practical advice for families and guardians', 'parents-caregivers', 'Heart', 2),
  ('Educators & Professionals', 'Resources and strategies for teachers and professionals', 'educators-professionals', 'Users', 3),
  ('ADHD Support', 'Experiences, strategies, and support for ADHD', 'adhd-support', 'Zap', 4),
  ('Autism Spectrum', 'Community for autistic individuals and families', 'autism-spectrum', 'Brain', 5),
  ('Learning Disabilities', 'Dyslexia, dyscalculia, and other learning differences', 'learning-disabilities', 'BookOpen', 6),
  ('Mental Health & Wellness', 'Anxiety, depression, and holistic wellbeing', 'mental-health', 'Heart', 7),
  ('Success Stories', 'Celebrate wins and share inspiring journeys', 'success-stories', 'Star', 8),
  ('Ask the Experts', 'Questions for psychologists, educators, and professionals', 'ask-experts', 'HelpCircle', 9),
  ('Local Communities', 'Regional groups for meetups and local support', 'local-communities', 'MapPin', 10)
ON CONFLICT DO NOTHING;

-- Get category IDs for initial threads
WITH cats AS (
  SELECT id, slug FROM forum_categories
)

-- Insert General Discussion Starter Thread
INSERT INTO forum_threads (category_id, user_id, title, slug, content, excerpt, status)
SELECT 
  c.id,
  '00000000-0000-0000-0000-000000000001'::uuid, -- System user
  'Welcome to ANDA Community! 🎉',
  'welcome-to-anda',
  'Hello and welcome to the ANDA community forum! This is a safe, inclusive space for neurodivergent individuals, families, educators, and professionals to connect, share experiences, and support each other.

Whether you''re newly diagnosed, advocating for a loved one, or working professionally in neurodiversity, you belong here.

**Guidelines:**
- Be respectful and kind
- Listen without judgment
- Share your authentic story
- Ask for help when you need it
- Celebrate small wins

Feel free to introduce yourself below! Tell us:
- Your name or how you''d like to be called
- Your neurodivergent journey (if you''d like to share)
- What brought you to ANDA
- One thing you''re hoping to find in this community

Looking forward to meeting you! 💜',
  'Welcome to the ANDA community forum! A safe space for neurodivergent individuals and families...',
  'published'
FROM cats WHERE slug = 'general-discussion'

ON CONFLICT DO NOTHING;

-- Insert Parent Support Starter
INSERT INTO forum_threads (category_id, user_id, title, slug, content, excerpt, status)
SELECT 
  c.id,
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Parent Tips: Supporting Your Neurodivergent Child at Home',
  'parent-tips-home-support',
  'This thread is for parents and caregivers to share practical strategies for supporting neurodivergent children at home.

**Share ideas about:**
- Daily routines and structures that work
- Sensory accommodations in the home
- Managing challenging moments with patience
- Celebrating your child''s unique strengths
- Self-care for caregivers

What''s one thing that has really helped your child? Start a discussion below! 👨‍👩‍👧‍👦',
  'Practical home support strategies for parents of neurodivergent children...',
  'published'
FROM cats WHERE slug = 'parents-caregivers'

ON CONFLICT DO NOTHING;

-- Insert Educator Resource Thread
INSERT INTO forum_threads (category_id, user_id, title, slug, content, excerpt, status)
SELECT 
  c.id,
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Classroom Accommodations: What Works in African Schools?',
  'classroom-accommodations',
  'Teachers and school professionals: let''s discuss practical accommodations that work in our educational context.

**Share experiences with:**
- Classroom environment modifications
- Testing and assignment accommodations
- Behavioral support strategies
- Working with limited resources
- Building inclusive classrooms
- Supporting diverse learning needs with cultural sensitivity

What has made the biggest difference in your classroom? 📚',
  'Practical classroom accommodations for neurodivergent students in African schools...',
  'published'
FROM cats WHERE slug = 'educators-professionals'

ON CONFLICT DO NOTHING;

-- Insert ADHD Support Thread
INSERT INTO forum_threads (category_id, user_id, title, slug, content, excerpt, status)
SELECT 
  c.id,
  '00000000-0000-0000-0000-000000000001'::uuid,
  'ADHD Time Management: Strategies That Actually Work',
  'adhd-time-management',
  'Living with ADHD often means time feels like a mystery. Let''s share strategies that actually help!

**What helps you manage time?**
- Task breakdown techniques
- Visual timers and reminders
- Breaking big projects into chunks
- Managing procrastination
- Building sustainable routines
- Technology tools that work for ADHD brains

Share your favorite time management hack! ⏰',
  'Real strategies for managing time with ADHD...',
  'published'
FROM cats WHERE slug = 'adhd-support'

ON CONFLICT DO NOTHING;

-- Insert Autism Spectrum Thread
INSERT INTO forum_threads (category_id, user_id, title, slug, content, excerpt, status)
SELECT 
  c.id,
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Autism and Sensory Sensitivities: Creating Safe Spaces',
  'autism-sensory-safety',
  'Sensory sensitivities are real, and creating safe spaces matters. Let''s discuss what helps.

**Share about:**
- Sensory triggers and how they affect you
- Environmental modifications that help
- Coping strategies for difficult moments
- Communication about your needs
- Finding joy in your sensory experience
- Navigating sensory challenges in daily life

What has made your space feel safer? 🏠',
  'Creating sensory-safe environments for autistic individuals...',
  'published'
FROM cats WHERE slug = 'autism-spectrum'

ON CONFLICT DO NOTHING;

-- Insert Mental Health Thread
INSERT INTO forum_threads (category_id, user_id, title, slug, content, excerpt, status)
SELECT 
  c.id,
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Anxiety with Neurodiversity: Supporting Mental Health',
  'anxiety-mental-health',
  'Many neurodivergent people experience anxiety. This thread is for support and shared strategies.

**Let''s talk about:**
- Anxiety symptoms and how they show up
- What triggers your anxiety
- Grounding and calming techniques
- When to seek professional help
- Self-compassion and self-care
- Building resilience

Remember: You''re not alone. 💜',
  'Supporting mental health while navigating neurodiversity...',
  'published'
FROM cats WHERE slug = 'mental-health-wellness'

ON CONFLICT DO NOTHING;

-- Insert Success Stories Thread
INSERT INTO forum_threads (category_id, user_id, title, slug, content, excerpt, status)
SELECT 
  c.id,
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Celebrate Your Wins! 🎉',
  'celebrate-wins',
  'No matter how small, every win matters. This is your space to celebrate!

**Share your victories:**
- Getting a diagnosis (finally understanding yourself!)
- Starting a new strategy that''s working
- Handling a challenge with grace
- Supporting someone you care about
- Making progress toward your goals
- Simply getting through a hard day
- Discovering a talent or strength
- Building a meaningful connection

What are you celebrating today? 🌟',
  'A space to celebrate achievements and wins, big and small...',
  'published'
FROM cats WHERE slug = 'success-stories'

ON CONFLICT DO NOTHING;
