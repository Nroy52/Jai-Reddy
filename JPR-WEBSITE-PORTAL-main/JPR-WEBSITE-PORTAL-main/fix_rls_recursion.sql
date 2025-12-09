-- Create a secure function to get the current user's role
-- This bypasses RLS recursively because it is SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;

-- Fix PROFILES policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    get_my_role() IN ('CEO', 'Admin', 'Super User', 'Managing Director')
  );

-- Fix VAULT_ITEMS policies
DROP POLICY IF EXISTS "Users can view own vault items" ON public.vault_items;
CREATE POLICY "Users can view own vault items" ON public.vault_items
  FOR SELECT USING (
    auth.uid() = created_by OR
    get_my_role() IN ('CEO', 'Admin', 'Super User', 'Managing Director')
  );
  
-- Fix PASSWORD_ITEMS policies
DROP POLICY IF EXISTS "Users can view own password items" ON public.password_items;
CREATE POLICY "Users can view own password items" ON public.password_items
  FOR SELECT USING (
    auth.uid() = created_by OR
    get_my_role() IN ('CEO', 'Admin', 'Super User', 'Managing Director')
  );

-- Fix TASKS policies
DROP POLICY IF EXISTS "Users can view relevant tasks" ON public.tasks;
CREATE POLICY "Users can view relevant tasks" ON public.tasks
  FOR SELECT USING (
    auth.uid() = assignee_user_id OR 
    auth.uid() = created_by_user_id OR
    get_my_role() IN ('CEO', 'Admin', 'Super User', 'Managing Director', 'Partner')
  );

-- Fix MESSAGE_THREADS policies
DROP POLICY IF EXISTS "Users can view threads they are in" ON public.message_threads;
CREATE POLICY "Users can view threads they are in" ON public.message_threads
  FOR SELECT USING (
    auth.uid() = ANY(participant_ids) OR
    get_my_role() IN ('CEO', 'Admin', 'Super User', 'Managing Director')
  );

-- Fix MESSAGES policies
DROP POLICY IF EXISTS "Users can view messages in their threads" ON public.messages;
CREATE POLICY "Users can view messages in their threads" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.message_threads
      WHERE id = messages.thread_id 
      AND (
        auth.uid() = ANY(participant_ids) OR
        get_my_role() IN ('CEO', 'Admin', 'Super User', 'Managing Director')
      )
    )
  );
