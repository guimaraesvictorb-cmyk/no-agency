-- ============================================================
-- 003_security_hardening.sql
-- Additional security hardening for No Agency database
-- Run this in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. Revoke default public schema CREATE privilege
--    Prevents any authenticated/anon user from creating objects
-- ============================================================
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;

-- Re-grant only to authenticated role (Supabase default)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO service_role;

-- ============================================================
-- 2. Profile INSERT policy (needed for auth.users trigger)
-- ============================================================
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- ============================================================
-- 3. Explicit DELETE protection on critical tables
--    Even though FOR ALL covers DELETE, being explicit documents intent
-- ============================================================

-- Prevent profile deletion via API (only via auth dashboard)
DROP POLICY IF EXISTS "No direct profile deletion" ON profiles;
CREATE POLICY "No direct profile deletion"
  ON profiles FOR DELETE
  USING (false);

-- Approval tokens: only managers can delete their own clients' tokens
DROP POLICY IF EXISTS "Managers delete own tokens" ON approval_tokens;
CREATE POLICY "Managers delete own tokens"
  ON approval_tokens FOR DELETE
  USING (
    client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid())
  );

-- ============================================================
-- 4. Approval token: prevent enumeration
--    The public SELECT policy should only expose non-sensitive fields
--    We use a SECURITY DEFINER function to validate tokens safely
-- ============================================================
CREATE OR REPLACE FUNCTION public.validate_approval_token(p_token_hash TEXT)
RETURNS TABLE(batch_id UUID, client_id UUID, expires_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
    SELECT at.batch_id, at.client_id, at.expires_at
    FROM approval_tokens at
    WHERE at.token_hash = p_token_hash
      AND at.expires_at > NOW()
      AND at.used_at IS NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.validate_approval_token(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validate_approval_token(TEXT) TO anon, authenticated;

-- ============================================================
-- 5. Data integrity constraints
-- ============================================================
ALTER TABLE posts
  ADD CONSTRAINT IF NOT EXISTS posts_caption_not_empty
  CHECK (length(trim(caption)) > 0);

ALTER TABLE clients
  ADD CONSTRAINT IF NOT EXISTS clients_name_not_empty
  CHECK (length(trim(name)) > 0);

ALTER TABLE dna_briefs
  ADD CONSTRAINT IF NOT EXISTS dna_briefs_company_not_empty
  CHECK (length(trim(company_name)) > 0);

ALTER TABLE nps_responses
  ADD CONSTRAINT IF NOT EXISTS nps_score_range
  CHECK (score BETWEEN 0 AND 10);

-- ============================================================
-- 6. Audit: track who last modified sensitive rows
-- ============================================================
ALTER TABLE posts ADD COLUMN IF NOT EXISTS last_modified_by UUID REFERENCES auth.users(id);
ALTER TABLE dna_briefs ADD COLUMN IF NOT EXISTS last_modified_by UUID REFERENCES auth.users(id);

CREATE OR REPLACE FUNCTION public.stamp_modified_by()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.last_modified_by = auth.uid();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS posts_stamp_modified ON posts;
CREATE TRIGGER posts_stamp_modified
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION public.stamp_modified_by();

DROP TRIGGER IF EXISTS dna_briefs_stamp_modified ON dna_briefs;
CREATE TRIGGER dna_briefs_stamp_modified
  BEFORE UPDATE ON dna_briefs
  FOR EACH ROW EXECUTE FUNCTION public.stamp_modified_by();

-- ============================================================
-- 7. Brute-force protection: rate limit login attempts via DB
--    Store failed attempts and block after threshold
-- ============================================================
CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier  TEXT NOT NULL,           -- ip:email hash
  attempts    INT  NOT NULL DEFAULT 1,
  blocked_until TIMESTAMPTZ,
  last_attempt  TIMESTAMPTZ DEFAULT NOW(),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS auth_rate_limits_identifier_idx
  ON auth_rate_limits(identifier);

ALTER TABLE auth_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service_role (our backend) can read/write this table
CREATE POLICY "Service role only"
  ON auth_rate_limits FOR ALL
  USING (false)
  WITH CHECK (false);

-- ============================================================
-- 8. Enable pgsodium extension for encryption at rest (if available)
-- ============================================================
-- CREATE EXTENSION IF NOT EXISTS pgsodium;  -- Uncomment if available in your Supabase plan

-- ============================================================
-- 9. Ensure pg_stat_statements is disabled for production
--    (prevents query fingerprinting attacks)
-- ============================================================
-- This is managed at the server level by Supabase — no action needed.

-- ============================================================
-- Done. Run: SELECT * FROM pg_policies WHERE schemaname = 'public';
-- to verify all policies are in place.
-- ============================================================
