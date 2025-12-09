-- Relax constraints to allow legacy/demo IDs (e.g. '1', '2') alongside UUIDs
-- This is useful during the transition from local demo data to Supabase

ALTER TABLE public.tasks 
  DROP CONSTRAINT tasks_assignee_user_id_fkey,
  DROP CONSTRAINT tasks_created_by_user_id_fkey;

ALTER TABLE public.tasks
  ALTER COLUMN assignee_user_id TYPE TEXT,
  ALTER COLUMN created_by_user_id TYPE TEXT;

ALTER TABLE public.task_comments
  DROP CONSTRAINT task_comments_author_user_id_fkey;

ALTER TABLE public.task_comments
  ALTER COLUMN author_user_id TYPE TEXT;

ALTER TABLE public.contacts
  DROP CONSTRAINT contacts_created_by_fkey;

ALTER TABLE public.contacts
  ALTER COLUMN created_by TYPE TEXT;

ALTER TABLE public.vault_items
  DROP CONSTRAINT vault_items_created_by_fkey;

ALTER TABLE public.vault_items
  ALTER COLUMN created_by TYPE TEXT;

ALTER TABLE public.password_items
  DROP CONSTRAINT password_items_created_by_fkey;

ALTER TABLE public.password_items
  ALTER COLUMN created_by TYPE TEXT;

ALTER TABLE public.messages
  DROP CONSTRAINT messages_sender_id_fkey;

ALTER TABLE public.messages
  ALTER COLUMN sender_id TYPE TEXT;
