-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Users table (Public Profile)
-- Note: Supabase handles auth.users automatically. This table extends that data.
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'Guest',
  team_tag TEXT,
  status TEXT DEFAULT 'pending',
  signup_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Create policy to allow admins/CEOs to view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('CEO', 'Admin', 'Super User', 'Managing Director')
    )
  );

-- Create Contacts table
CREATE TABLE public.contacts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT,
  department TEXT,
  org TEXT,
  phone TEXT,
  tags TEXT[],
  notes TEXT,
  ftu_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS for contacts
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view contacts
CREATE POLICY "Authenticated users can view contacts" ON public.contacts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert contacts
CREATE POLICY "Authenticated users can insert contacts" ON public.contacts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create Tasks table
CREATE TABLE public.tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('Backlog', 'Doing', 'Blocked', 'Done')),
  priority TEXT CHECK (priority IN ('Low', 'Med', 'High', 'Critical')),
  due_date DATE,
  assignee_user_id UUID REFERENCES auth.users(id), -- Ideally references profiles(id) or auth.users(id)
  created_by_user_id UUID REFERENCES auth.users(id),
  ftu_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Allow users to view tasks they created or are assigned to, or if they are admin/CEO
CREATE POLICY "Users can view relevant tasks" ON public.tasks
  FOR SELECT USING (
    auth.uid() = assignee_user_id OR 
    auth.uid() = created_by_user_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('CEO', 'Admin', 'Super User', 'Managing Director', 'Partner')
    )
  );

-- Create Task Comments table
CREATE TABLE public.task_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  author_user_id UUID REFERENCES auth.users(id),
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for task comments
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- Allow users to view comments on tasks they can see
CREATE POLICY "Users can view task comments" ON public.task_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tasks
      WHERE id = task_comments.task_id
    )
  );

-- Create Messages/Threads table (Simplified for now)
CREATE TABLE public.message_threads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT,
  participant_ids UUID[], -- Array of user IDs
  linked_task_id UUID REFERENCES public.tasks(id),
  ftu_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  thread_id UUID REFERENCES public.message_threads(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id),
  text TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Vault Items table
CREATE TABLE public.vault_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('doc', 'note')),
  value TEXT,
  tags TEXT[],
  ftu_id TEXT,
  sensitivity TEXT CHECK (sensitivity IN ('Low', 'Medium', 'High')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create Password Items table
CREATE TABLE public.password_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  username TEXT,
  url TEXT,
  password_enc TEXT, -- Encrypted password
  tags TEXT[],
  ftu_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- SEED DATA INSERTION (Example for Contacts - Users need to exist first in Auth)
-- Since we cannot easily seed auth.users via SQL without admin API, we will focus on seeding data that doesn't strictly require foreign key constraints if we make them optional or use placeholders.
-- However, for a real Supabase setup, you usually create users via the Auth API first.

-- Below is an example of how to insert the contacts from seed.ts
-- Note: We are generating new UUIDs for them since the seed.ts uses simple string IDs like 'c1'.

INSERT INTO public.contacts (name, email, role, department, org, phone, tags, notes, ftu_id, created_at)
VALUES
('Dr (Maj) Jai Prathap Reddy', 'ceo@raghava.ai', 'CEO', 'Executive', 'Raghava AI', '+1-555-0001', ARRAY['Leadership', 'Strategy'], 'Founder and CEO', NULL, '2024-01-15T10:00:00Z'),
('Sarah Williams', 'director1@raghava.ai', 'Director', 'Clinical', 'Raghava AI', '+1-555-0002', ARRAY['Clinical', 'Healthcare'], NULL, 'F1.T1.U1', '2024-01-16T10:00:00Z'),
('Michael Chen', 'director2@raghava.ai', 'Director', 'Operations', 'Raghava AI', '+1-555-0003', ARRAY['Operations', 'Logistics'], NULL, NULL, '2024-01-17T10:00:00Z'),
('Jane Admin', 'admin@raghava.ai', 'Admin', 'Administration', 'Raghava AI', '+1-555-0004', ARRAY['Admin', 'HR'], NULL, NULL, '2024-01-18T10:00:00Z'),
('Robert Thompson', 'robert.t@advisor.com', 'Director', 'Advisory', 'Strategic Partners', '+1-555-1001', ARRAY['Advisor', 'Finance', 'Strategy'], NULL, 'F2.T2.U4', '2024-01-20T10:00:00Z'),
('Emily Rodriguez', 'emily.r@legal.com', 'Director', 'Legal', 'Legal Services Inc', '+1-555-1002', ARRAY['Legal', 'Compliance'], NULL, NULL, '2024-01-22T10:00:00Z'),
('James Wilson', 'james.w@tech.com', 'Staff', 'Technology', 'Tech Innovations', '+1-555-1003', ARRAY['Technology', 'Software'], NULL, NULL, '2024-01-24T10:00:00Z'),
('Lisa Anderson', 'lisa.a@finance.com', 'Admin', 'Finance', 'Financial Partners', '+1-555-1004', ARRAY['Finance', 'Accounting'], NULL, 'F2.T1.U2', '2024-01-26T10:00:00Z'),
('Christopher Martin', 'chris.m@marketing.com', 'Staff', 'Marketing', 'Brand Agency', '+1-555-1005', ARRAY['Marketing', 'Branding'], NULL, NULL, '2024-01-28T10:00:00Z'),
('Amanda White', 'amanda.w@hr.com', 'Admin', 'HR', 'People First', '+1-555-1006', ARRAY['HR', 'Recruiting'], NULL, NULL, '2024-02-01T10:00:00Z');

-- Insert Vault Items
INSERT INTO public.vault_items (title, type, value, tags, ftu_id, sensitivity, created_at)
VALUES
('Strategic Plan 2024', 'doc', 'Q1 2024 Strategic Initiatives...', ARRAY['Strategy', 'Planning'], 'F10.T1', 'High', '2024-01-15T10:00:00Z'),
('Clinical Guidelines', 'doc', 'Updated clinical protocols...', ARRAY['Clinical', 'Healthcare'], 'F1.T1', 'Medium', '2024-02-01T10:00:00Z'),
('Financial Summary Q1', 'note', 'Revenue: $2.5M, Expenses: $1.8M...', ARRAY['Finance', 'Reports'], 'F2.T1', 'High', '2024-03-01T10:00:00Z'),
('Meeting Notes - Leadership', 'note', 'Action items from leadership meeting...', ARRAY['Meetings', 'Leadership'], NULL, 'Low', '2024-03-05T10:00:00Z'),
('Patient Safety Protocol', 'doc', 'Emergency response procedures...', ARRAY['Clinical', 'Safety'], 'F1.T7', 'Medium', '2024-02-15T10:00:00Z'),
('HR Policies', 'doc', 'Employee handbook and policies...', ARRAY['HR', 'Policies'], NULL, 'Low', '2024-01-20T10:00:00Z');

