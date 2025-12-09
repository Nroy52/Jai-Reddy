-- Grant Super User privileges to the admin email
UPDATE public.profiles
SET 
  role = 'Super User',
  status = 'approved'
WHERE email = 'nithinroydasu@gmail.com';

-- If for some reason the profile doesn't exist yet (unlikely), insert it linked to the auth user
INSERT INTO public.profiles (id, email, name, role, status, signup_date, last_login)
SELECT 
  id, 
  email, 
  'Super User',
  'Super User', 
  'approved',
  created_at,
  last_sign_in_at
FROM auth.users 
WHERE email = 'nithinroydasu@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'Super User', status = 'approved';
