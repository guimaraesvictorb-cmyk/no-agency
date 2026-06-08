-- ============================================
-- No Agency — Initial Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES (extends auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'manager' CHECK (role IN ('admin', 'manager', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- CLIENTS
-- ============================================
CREATE TABLE clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  status TEXT NOT NULL DEFAULT 'onboarding' CHECK (status IN ('active', 'onboarding', 'paused', 'churned')),
  plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'growth', 'pro')),
  onboarding_completed_at TIMESTAMPTZ,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers see own clients"
  ON clients FOR ALL USING (profile_id = auth.uid());

-- ============================================
-- DNA BRIEFS
-- ============================================
CREATE TABLE dna_briefs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  -- Block 1
  company_name TEXT NOT NULL,
  segment TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  differentials TEXT NOT NULL DEFAULT '',
  -- Block 2
  ideal_client_age TEXT DEFAULT '',
  ideal_client_gender TEXT DEFAULT '',
  ideal_client_pain TEXT DEFAULT '',
  ideal_client_dream TEXT DEFAULT '',
  -- Block 3
  tone_adjectives TEXT[] DEFAULT '{}',
  tone_avoid TEXT DEFAULT '',
  tone_example TEXT DEFAULT '',
  -- Block 4
  posting_days TEXT[] DEFAULT '{}',
  posting_frequency INTEGER DEFAULT 3,
  platform TEXT DEFAULT 'instagram_facebook' CHECK (platform IN ('instagram', 'facebook', 'instagram_facebook')),
  content_themes TEXT[] DEFAULT '{}',
  ai_notes TEXT,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE dna_briefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers see briefs for own clients"
  ON dna_briefs FOR ALL USING (
    client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid())
  );

-- ============================================
-- SOCIAL CONNECTIONS
-- ============================================
CREATE TABLE social_connections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook', 'instagram_facebook')),
  page_id TEXT NOT NULL,
  page_name TEXT NOT NULL,
  access_token_encrypted TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  connected_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE social_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers see social connections for own clients"
  ON social_connections FOR ALL USING (
    client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid())
  );

-- ============================================
-- POST BATCHES
-- ============================================
CREATE TABLE post_batches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  week_reference TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent_for_approval', 'approved', 'published')),
  approval_sent_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  posts_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE post_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers see batches for own clients"
  ON post_batches FOR ALL USING (
    client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid())
  );

-- ============================================
-- POSTS
-- ============================================
CREATE TABLE posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  batch_id UUID REFERENCES post_batches(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'generated', 'sent_for_approval', 'approved', 'rejected',
    'scheduled', 'published', 'auto_approved'
  )),
  platform TEXT NOT NULL DEFAULT 'instagram_facebook' CHECK (platform IN ('instagram', 'facebook', 'instagram_facebook')),
  caption TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  image_prompt TEXT,
  scheduled_for TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  rejection_reason TEXT,
  ai_generation_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers see posts for own clients"
  ON posts FOR ALL USING (
    client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid())
  );

-- ============================================
-- APPROVAL TOKENS
-- ============================================
CREATE TABLE approval_tokens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  batch_id UUID REFERENCES post_batches(id) ON DELETE CASCADE NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE approval_tokens ENABLE ROW LEVEL SECURITY;

-- Public read for approval flow (checked by token_hash)
CREATE POLICY "Public can read valid tokens"
  ON approval_tokens FOR SELECT USING (
    expires_at > NOW() AND used_at IS NULL
  );

CREATE POLICY "Managers manage own client tokens"
  ON approval_tokens FOR ALL USING (
    client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid())
  );

-- ============================================
-- NPS RESPONSES
-- ============================================
CREATE TABLE nps_responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 10),
  category TEXT GENERATED ALWAYS AS (
    CASE
      WHEN score >= 9 THEN 'promoter'
      WHEN score >= 7 THEN 'passive'
      ELSE 'detractor'
    END
  ) STORED,
  trigger TEXT NOT NULL CHECK (trigger IN ('onboarding', 'post_approval', 'monthly')),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE nps_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers see NPS for own clients"
  ON nps_responses FOR ALL USING (
    client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid())
  );

-- ============================================
-- MEDIA FILES
-- ============================================
CREATE TABLE media_files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  tags TEXT[] DEFAULT '{}',
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers see media for own clients"
  ON media_files FOR ALL USING (
    client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid())
  );

-- ============================================
-- REPORTS
-- ============================================
CREATE TABLE reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  week_reference TEXT NOT NULL,
  metrics JSONB NOT NULL DEFAULT '{}',
  ai_insights TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers see reports for own clients"
  ON reports FOR ALL USING (
    client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid())
  );

-- ============================================
-- TRIGGERS: updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER dna_briefs_updated_at BEFORE UPDATE ON dna_briefs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_clients_profile_id ON clients(profile_id);
CREATE INDEX idx_posts_client_id ON posts(client_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_scheduled ON posts(scheduled_for) WHERE scheduled_for IS NOT NULL;
CREATE INDEX idx_nps_client_id ON nps_responses(client_id);
CREATE INDEX idx_approval_tokens_hash ON approval_tokens(token_hash);
