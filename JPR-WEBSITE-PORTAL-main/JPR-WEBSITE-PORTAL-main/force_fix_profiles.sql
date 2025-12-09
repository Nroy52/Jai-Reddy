-- 1. Explicitly fix the Super User (You)
INSERT INTO public.profiles (id, email, name, role, status, signup_date, last_login)
SELECT id, email, 'Nithin Roy Dasu', 'Super User', 'approved', created_at, last_sign_in_at
FROM auth.users 
WHERE email = 'nithinroydasu@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'Super User', status = 'approved';

-- 2. Explicitly fix the Pending User (dnroy552)
-- We find the user ID from auth.users based on the email
INSERT INTO public.profiles (id, email, name, role, status, signup_date, last_login)
SELECT 
  id, 
  email, 
  'dnroy552', 
  'Staff', 
  'pending', 
  created_at, 
  last_sign_in_at
FROM auth.users 
WHERE email = 'dnroy552@gmail.com'
ON CONFLICT (id) DO NOTHING;

-- 3. Show the results (Run this and look at the "Results" tab in Supabase)
SELECT * FROM public.profiles;
