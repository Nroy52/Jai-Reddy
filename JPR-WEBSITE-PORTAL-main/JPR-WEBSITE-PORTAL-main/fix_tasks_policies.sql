-- Fix Tasks RLS Policies
-- This script adds the missing INSERT and UPDATE policies for the tasks table.

BEGIN;

-- 1. Ensure RLS is enabled
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users can view relevant tasks" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update relevant tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can view task comments" ON public.task_comments;
DROP POLICY IF EXISTS "Authenticated users can create task comments" ON public.task_comments;


-- 3. TASKS POLICIES

-- VIEW: Users can view tasks if they are assigned, created them, or are admins/high-level roles
CREATE POLICY "Users can view relevant tasks" ON public.tasks
  FOR SELECT USING (
    auth.uid() = assignee_user_id OR 
    auth.uid() = created_by_user_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('CEO', 'Admin', 'Super User', 'Managing Director', 'Partner', 'Director')
    )
  );

-- INSERT: Allow any authenticated user to create a task
CREATE POLICY "Authenticated users can create tasks" ON public.tasks
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- UPDATE: Allow users to update tasks they are involved in (assigned, created, or admin)
CREATE POLICY "Users can update relevant tasks" ON public.tasks
  FOR UPDATE USING (
    auth.uid() = assignee_user_id OR 
    auth.uid() = created_by_user_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('CEO', 'Admin', 'Super User', 'Managing Director', 'Partner', 'Director')
    )
  );


-- 4. TASK COMMENTS POLICIES

-- VIEW: Users can view comments if they can view the task
CREATE POLICY "Users can view task comments" ON public.task_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tasks
      WHERE id = task_comments.task_id
    )
  );

-- INSERT: Allow any authenticated user to create a task comment
CREATE POLICY "Authenticated users can create task comments" ON public.task_comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

COMMIT;
