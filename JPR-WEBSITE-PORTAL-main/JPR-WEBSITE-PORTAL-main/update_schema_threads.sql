ALTER TABLE public.message_threads
ADD COLUMN type TEXT CHECK (type IN ('individual', 'team', 'all')) DEFAULT 'individual',
ADD COLUMN recipient_id TEXT; -- Can be user ID (for individual) or team tag (for team)

-- Also relax participant_ids to allow text IDs if needed (Supabase arrays are typed, so UUID[] is strict)
-- If we want to support "1", "2" in participant_ids, we need TEXT[]
ALTER TABLE public.message_threads
ALTER COLUMN participant_ids TYPE TEXT[];
