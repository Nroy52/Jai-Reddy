-- FIX VAULT TABLE COLUMNS (COMPLETE)
-- Run this in the Supabase SQL Editor

-- 1. Ensure 'vault' bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('vault', 'vault', FALSE)
ON CONFLICT (id) DO NOTHING;

-- 2. FIX TABLE STRUCTURE: Add ALL missing columns
-- This accounts for user_id, file_size, file_type, storage_path, etc.
ALTER TABLE public.vault_items 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS storage_path TEXT,
ADD COLUMN IF NOT EXISTS file_size BIGINT,
ADD COLUMN IF NOT EXISTS file_type TEXT;

-- 3. Storage Policies (Re-applying to be safe)
DROP POLICY IF EXISTS "Vault Upload" ON storage.objects;
CREATE POLICY "Vault Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'vault' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Vault Select" ON storage.objects;
CREATE POLICY "Vault Select"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'vault' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Vault Delete" ON storage.objects;
CREATE POLICY "Vault Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'vault' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Database Policies
ALTER TABLE public.vault_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vault_items_select" ON public.vault_items;
CREATE POLICY "vault_items_select" ON public.vault_items
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "vault_items_insert" ON public.vault_items;
CREATE POLICY "vault_items_insert" ON public.vault_items
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "vault_items_delete" ON public.vault_items;
CREATE POLICY "vault_items_delete" ON public.vault_items
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 5. Grant permissions and refresh caching (by notifying)
GRANT ALL ON public.vault_items TO authenticated;
NOTIFY pgrst, 'reload config';
