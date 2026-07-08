-- Routr AI Database Schema (idempotent)

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Departments
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  color TEXT DEFAULT '#71717a',
  description TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tickets
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL DEFAULT 'Unknown',
  client_email TEXT NOT NULL DEFAULT 'unknown@example.com',
  company TEXT DEFAULT 'Unknown',
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  category TEXT,
  priority TEXT CHECK (priority IN ('Critical', 'High', 'Medium', 'Low')),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  sentiment TEXT CHECK (sentiment IN ('Positive', 'Neutral', 'Negative', 'Frustrated')),
  is_read BOOLEAN DEFAULT FALSE,
  is_ai_analyzed BOOLEAN DEFAULT FALSE,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'import', 'simulator', 'playground')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Ticket Analysis
CREATE TABLE IF NOT EXISTS ticket_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  category TEXT,
  priority TEXT,
  department TEXT,
  sentiment TEXT,
  confidence NUMERIC(5,2),
  summary TEXT,
  reasoning TEXT,
  suggested_reply TEXT,
  suggested_action TEXT,
  estimated_resolution TEXT,
  model_used TEXT,
  raw_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Routing Rules
CREATE TABLE IF NOT EXISTS routing_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  priority_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category)
);

-- Activities
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ticket Notes
CREATE TABLE IF NOT EXISTS ticket_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  groq_api_key TEXT,
  ai_model TEXT DEFAULT 'llama-3.3-70b-versatile',
  notification_prefs JSONB DEFAULT '{"email": true, "critical": true, "resolved": false}',
  ai_prefs JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_ticket_id ON activities(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_analysis_ticket_id ON ticket_analysis(ticket_id);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE routing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Departments policies
DROP POLICY IF EXISTS "Users manage own departments" ON departments;
CREATE POLICY "Users manage own departments" ON departments FOR ALL USING (auth.uid() = user_id);

-- Tickets policies
DROP POLICY IF EXISTS "Users manage own tickets" ON tickets;
CREATE POLICY "Users manage own tickets" ON tickets FOR ALL USING (auth.uid() = user_id);

-- Ticket analysis policies
DROP POLICY IF EXISTS "Users view own ticket analysis" ON ticket_analysis;
CREATE POLICY "Users view own ticket analysis" ON ticket_analysis FOR SELECT
  USING (EXISTS (SELECT 1 FROM tickets t WHERE t.id = ticket_id AND t.user_id = auth.uid()));
DROP POLICY IF EXISTS "Users insert own ticket analysis" ON ticket_analysis;
CREATE POLICY "Users insert own ticket analysis" ON ticket_analysis FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM tickets t WHERE t.id = ticket_id AND t.user_id = auth.uid()));

-- Routing rules policies
DROP POLICY IF EXISTS "Users manage own routing rules" ON routing_rules;
CREATE POLICY "Users manage own routing rules" ON routing_rules FOR ALL USING (auth.uid() = user_id);

-- Activities policies
DROP POLICY IF EXISTS "Users manage own activities" ON activities;
CREATE POLICY "Users manage own activities" ON activities FOR ALL USING (auth.uid() = user_id);

-- Ticket notes policies
DROP POLICY IF EXISTS "Users manage own notes" ON ticket_notes;
CREATE POLICY "Users manage own notes" ON ticket_notes FOR ALL USING (auth.uid() = user_id);

-- Settings policies
DROP POLICY IF EXISTS "Users manage own settings" ON settings;
CREATE POLICY "Users manage own settings" ON settings FOR ALL USING (auth.uid() = user_id);

-- New user trigger function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Disabled automatic setup here because some Supabase auth sign-up flows
  -- fail when the trigger performs inserts under strict RLS behavior.
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Avatar upload" ON storage.objects;
CREATE POLICY "Avatar upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
DROP POLICY IF EXISTS "Avatar read" ON storage.objects;
CREATE POLICY "Avatar read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
DROP POLICY IF EXISTS "Avatar update" ON storage.objects;
CREATE POLICY "Avatar update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
