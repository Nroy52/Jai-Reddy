-- Enable RLS for remaining tables
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_items ENABLE ROW LEVEL SECURITY;

-- POLICIES FOR VAULT ITEMS
DROP POLICY IF EXISTS "Users can view own vault items" ON public.vault_items;
CREATE POLICY "Users can view own vault items" ON public.vault_items
  FOR SELECT USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('CEO', 'Admin', 'Super User', 'Managing Director')
    )
  );

DROP POLICY IF EXISTS "Users can insert own vault items" ON public.vault_items;
CREATE POLICY "Users can insert own vault items" ON public.vault_items
  FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update own vault items" ON public.vault_items;
CREATE POLICY "Users can update own vault items" ON public.vault_items
  FOR UPDATE USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can delete own vault items" ON public.vault_items;
CREATE POLICY "Users can delete own vault items" ON public.vault_items
  FOR DELETE USING (auth.uid() = created_by);


-- POLICIES FOR PASSWORD ITEMS (Same as Vault)
DROP POLICY IF EXISTS "Users can view own password items" ON public.password_items;
CREATE POLICY "Users can view own password items" ON public.password_items
  FOR SELECT USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('CEO', 'Admin', 'Super User', 'Managing Director')
    )
  );

DROP POLICY IF EXISTS "Users can insert own password items" ON public.password_items;
CREATE POLICY "Users can insert own password items" ON public.password_items
  FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update own password items" ON public.password_items;
CREATE POLICY "Users can update own password items" ON public.password_items
  FOR UPDATE USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can delete own password items" ON public.password_items;
CREATE POLICY "Users can delete own password items" ON public.password_items
  FOR DELETE USING (auth.uid() = created_by);


-- POLICIES FOR MESSAGE THREADS
DROP POLICY IF EXISTS "Users can view threads they are in" ON public.message_threads;
CREATE POLICY "Users can view threads they are in" ON public.message_threads
  FOR SELECT USING (
    auth.uid() = ANY(participant_ids) OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('CEO', 'Admin', 'Super User', 'Managing Director')
    )
  );

DROP POLICY IF EXISTS "Authenticated users can create threads" ON public.message_threads;
CREATE POLICY "Authenticated users can create threads" ON public.message_threads
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');


-- POLICIES FOR MESSAGES
DROP POLICY IF EXISTS "Users can view messages in their threads" ON public.messages;
CREATE POLICY "Users can view messages in their threads" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.message_threads
      WHERE id = messages.thread_id 
      AND (
        auth.uid() = ANY(participant_ids) OR
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role IN ('CEO', 'Admin', 'Super User', 'Managing Director')
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can insert messages" ON public.messages;
CREATE POLICY "Users can insert messages" ON public.messages
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
