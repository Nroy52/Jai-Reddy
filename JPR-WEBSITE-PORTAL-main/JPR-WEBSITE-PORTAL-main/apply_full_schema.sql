-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT CHECK (role IN (
    'Super User', 'CEO', 'Director', 'Admin', 'Staff',
    'IT Team', 'Family and Friends',
    'CPDP Manager', 'CPDP TCO', 'CPDP Staff',
    'CPDP Patients', 'CPDP Training', 'CPDP Network'
  )),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Keep existing columns if they exist to avoid data loss during migration
  email TEXT,
  name TEXT,
  team_tag TEXT,
  status TEXT DEFAULT 'pending',
  signup_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- 2. TASKS
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo',
  focus TEXT,
  topic TEXT,
  unit TEXT,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Support existing columns
  priority TEXT,
  assignee_user_id UUID,
  created_by_user_id UUID,
  ftu_id TEXT,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- 3. MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user UUID REFERENCES public.profiles(id),
  to_user UUID REFERENCES public.profiles(id),
  subject TEXT,
  body TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Support existing
  thread_id UUID,
  sender_id UUID,
  text TEXT,
  timestamp TIMESTAMPTZ
);

-- 4. VAULT ITEMS
CREATE TABLE IF NOT EXISTS public.vault_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  title TEXT,
  storage_path TEXT,
  file_size BIGINT,
  file_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Support existing
  type TEXT,
  value TEXT,
  tags TEXT[],
  ftu_id TEXT,
  sensitivity TEXT,
  created_by UUID
);

-- 5. KPI FOCUS SCORES (New)
CREATE TABLE IF NOT EXISTS public.kpi_focus_scores (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  focus TEXT NOT NULL, 
  score NUMERIC,
  meta JSONB
);

-- ENABLE RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_focus_scores ENABLE ROW LEVEL SECURITY;

-- POLICIES

-- PROFILES
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);

-- TASKS
DROP POLICY IF EXISTS "tasks_select_own" ON public.tasks;
CREATE POLICY "tasks_select_own" ON public.tasks FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "tasks_modify_own" ON public.tasks;
CREATE POLICY "tasks_modify_own" ON public.tasks FOR ALL USING (auth.uid() = user_id);

-- VAULT
DROP POLICY IF EXISTS "vault_select_own" ON public.vault_items;
CREATE POLICY "vault_select_own" ON public.vault_items FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "vault_modify_own" ON public.vault_items;
CREATE POLICY "vault_modify_own" ON public.vault_items FOR ALL USING (auth.uid() = user_id);

-- MESSAGES
DROP POLICY IF EXISTS "messages_select" ON public.messages;
CREATE POLICY "messages_select" ON public.messages FOR SELECT USING (auth.uid() = from_user OR auth.uid() = to_user);

DROP POLICY IF EXISTS "messages_insert" ON public.messages;
CREATE POLICY "messages_insert" ON public.messages FOR INSERT WITH CHECK (auth.uid() = from_user);

-- KPIS
DROP POLICY IF EXISTS "kpi_read_all" ON public.kpi_focus_scores;
CREATE POLICY "kpi_read_all" ON public.kpi_focus_scores FOR SELECT USING (auth.role() = 'authenticated');
