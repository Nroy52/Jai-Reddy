-- 1. Create or Replace the helper function for strict role checking
-- SECURITY DEFINER allows this function to read the profiles table even if RLS would block it
CREATE OR REPLACE FUNCTION public.is_super_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'Super User'
  );
$$;

-- 2. Grant permissions
GRANT EXECUTE ON FUNCTION public.is_super_user() TO authenticated;

-- 3. Update Policy for PROFILES (SELECT)
-- Allow users to see themselves, AND Super Users to see everyone
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
-- We combine logic to avoid multiple policies conflicting
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT
USING (
  auth.uid() = id -- Can see self
  OR
  is_super_user() -- Super User can see all
);

-- 4. Update Policy for PROFILES (UPDATE)
-- Only Super Users can update profiles (to approve/deny users or change roles)
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE
USING (
  is_super_user() -- Only Super User can initiate update
)
WITH CHECK (
  is_super_user() -- Only Super User can save update
);

-- 5. Update Policy for PROFILES (INSERT)
-- Usually handled by triggers, but if we allow manual insert
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
CREATE POLICY "profiles_insert_policy" ON public.profiles
FOR INSERT
WITH CHECK (
  auth.uid() = id -- Users can create their own profile (on signup)
  OR
  is_super_user() -- Super User can create profiles
);
