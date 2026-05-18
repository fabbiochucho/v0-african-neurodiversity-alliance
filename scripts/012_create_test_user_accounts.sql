-- Test User Accounts for ANDA Platform
-- These credentials are for testing purposes only
-- Each user type has a pre-created account for easy onboarding testing

-- Test Account 1: Parent/Caregiver
-- Email: parent.test@anda.africa
-- Password: TestParent2026!
-- Role: parent
-- Use case: Testing assessment, IEP generation, community forum, learning resources

-- Test Account 2: Neurodivergent Individual (Self-Advocate)
-- Email: advocate.test@anda.africa
-- Password: TestAdvocate2026!
-- Role: self_advocate
-- Use case: Testing self-assessment, progress tracking, community participation, advocacy

-- Test Account 3: Educator
-- Email: educator.test@anda.africa
-- Password: TestEducator2026!
-- Role: educator
-- Use case: Testing IEP insights, resource recommendations, learning platform

-- Test Account 4: Healthcare Practitioner
-- Email: practitioner.test@anda.africa
-- Password: TestPractitioner2026!
-- Role: practitioner
-- Use case: Testing IEP review, resource directory, research access

-- Test Account 5: Organization/Admin
-- Email: admin.test@anda.africa
-- Password: TestAdmin2026!
-- Role: admin
-- Use case: Testing admin dashboard, moderation, analytics, settings

-- Test Account 6: Moderator
-- Email: moderator.test@anda.africa
-- Password: TestModerator2026!
-- Role: moderator
-- Use case: Testing forum moderation, content review, community management

-- Test Account 7: Researcher
-- Email: researcher.test@anda.africa
-- Password: TestResearcher2026!
-- Role: researcher
-- Use case: Testing research access, data analysis, publication tracking

-- Test Account 8: Volunteer
-- Email: volunteer.test@anda.africa
-- Password: TestVolunteer2026!
-- Role: volunteer
-- Use case: Testing community support features, advocacy participation

-- Note: These test accounts should be created manually in Supabase Auth dashboard
-- OR using the Supabase admin API with the following command:

-- Example using Supabase Admin API (requires SUPABASE_SERVICE_ROLE_KEY):
/*
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token,
  phone,
  phone_confirmed_at,
  confirmation_sent_at,
  recovery_sent_at,
  email_change_sent_at,
  last_sign_in_at,
  phone_change_confirmation_token,
  phone_change_sent_at
) VALUES
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'parent.test@anda.africa',
  crypt('TestParent2026!', gen_salt('bf')),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Test","last_name":"Parent","role":"parent"}',
  now(),
  now(),
  '',
  '',
  '',
  NULL,
  NULL,
  now(),
  NULL,
  NULL,
  now(),
  '',
  NULL
);
*/

-- Instead, use this simpler approach:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add User"
-- 3. Enter email and password for each test account
-- 4. Then create corresponding profile records below:

-- Create test profiles (after users are created in Supabase Auth)
INSERT INTO public.profiles (id, first_name, last_name, email, role, created_at, updated_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'Test',
    'Parent',
    'parent.test@anda.africa',
    'parent',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'Test',
    'Advocate',
    'advocate.test@anda.africa',
    'self_advocate',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'Test',
    'Educator',
    'educator.test@anda.africa',
    'educator',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'Test',
    'Practitioner',
    'practitioner.test@anda.africa',
    'practitioner',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    'Test',
    'Admin',
    'admin.test@anda.africa',
    'admin',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000006',
    'Test',
    'Moderator',
    'moderator.test@anda.africa',
    'moderator',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000007',
    'Test',
    'Researcher',
    'researcher.test@anda.africa',
    'researcher',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000008',
    'Test',
    'Volunteer',
    'volunteer.test@anda.africa',
    'volunteer',
    now(),
    now()
  )
ON CONFLICT (email) DO NOTHING;

-- Grant SELECT permission to test accounts
GRANT SELECT ON public.profiles TO anon, authenticated;
