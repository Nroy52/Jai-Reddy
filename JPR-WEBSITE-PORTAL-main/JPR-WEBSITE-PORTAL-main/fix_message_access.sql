-- Fix message thread participant type and policies
-- We must DROP the policies first before altering the column type because Postgres
-- prevents altering columns that are used in active policy definitions.

BEGIN;

-- 1. Drop the policies that depend on 'participant_ids'
DROP POLICY IF EXISTS "Users can view threads they are in" ON public.message_threads;
DROP POLICY IF EXISTS "Users can view messages in their threads" ON public.messages;

-- 2. Now we can safely alter the column type to TEXT[]
-- We use USING to cast existing values if any exist
ALTER TABLE public.message_threads 
  ALTER COLUMN participant_ids TYPE TEXT[] USING participant_ids::TEXT[];

-- 3. Re-create the policies with the correct logic for TEXT[] comparisons

-- Fix Message Thread View Policy
CREATE POLICY "Users can view threads they are in" ON public.message_threads
  FOR SELECT USING (
    auth.uid()::text = ANY(participant_ids) OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('CEO', 'Admin', 'Super User', 'Managing Director')
    )
  );

-- Fix Messages View Policy
CREATE POLICY "Users can view messages in their threads" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.message_threads
      WHERE id = messages.thread_id 
      AND (
        auth.uid()::text = ANY(participant_ids) OR
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role IN ('CEO', 'Admin', 'Super User', 'Managing Director')
        )
      )
    )
  );

-- Ensure Insert is correct (these might not need changing, but good to ensure they act as expected)
DROP POLICY IF EXISTS "Authenticated users can create threads" ON public.message_threads;
CREATE POLICY "Authenticated users can create threads" ON public.message_threads
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert messages" ON public.messages;
CREATE POLICY "Users can insert messages" ON public.messages
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

COMMIT;
