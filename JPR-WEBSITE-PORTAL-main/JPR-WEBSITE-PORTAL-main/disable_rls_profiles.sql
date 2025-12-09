-- TEMPORARILY DISABLE RLS on profiles to identify if permissions are the blocker
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Verify the data exists
SELECT * FROM public.profiles;
