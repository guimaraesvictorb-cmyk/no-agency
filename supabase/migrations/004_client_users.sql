-- ============================================================
-- 004_client_users.sql
-- Admin role + client user linking
-- Run in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. Helper function to read current user role without recursion
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$ SELECT role FROM public.profiles WHERE id = auth.uid() $$;

-- ============================================================
-- 2. Link a client company to a specific user login account
--    user_id = the auth.users.id of the client's portal login
-- ============================================================
ALTER TABLE clients ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS clients_user_id_idx ON clients(user_id) WHERE user_id IS NOT NULL;

-- ============================================================
-- 3. Update profiles RLS
--    Admins can see all profiles; users see own
-- ============================================================
DROP POLICY IF EXISTS "Users see own profile" ON profiles;
CREATE POLICY "Users see own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid() OR get_my_role() = 'admin');

DROP POLICY IF EXISTS "Users update own profile" ON profiles;
CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND get_my_role() != 'admin');

DROP POLICY IF EXISTS "Admin updates any profile" ON profiles;
CREATE POLICY "Admin updates any profile"
  ON profiles FOR UPDATE
  USING (get_my_role() = 'admin');

-- ============================================================
-- 4. Update clients RLS
--    admin sees all, manager sees own, viewer sees linked client
-- ============================================================
DROP POLICY IF EXISTS "Managers see own clients" ON clients;
DROP POLICY IF EXISTS "Managers manage own clients" ON clients;

CREATE POLICY "See clients"
  ON clients FOR SELECT
  USING (
    profile_id = auth.uid()
    OR user_id = auth.uid()
    OR get_my_role() = 'admin'
  );

CREATE POLICY "Manage clients"
  ON clients FOR ALL
  USING (profile_id = auth.uid() OR get_my_role() = 'admin')
  WITH CHECK (profile_id = auth.uid() OR get_my_role() = 'admin');

-- ============================================================
-- 5. Update posts RLS
-- ============================================================
DROP POLICY IF EXISTS "Managers see own clients posts" ON posts;
DROP POLICY IF EXISTS "Managers manage own posts" ON posts;

CREATE POLICY "See posts"
  ON posts FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients
      WHERE profile_id = auth.uid()
        OR user_id = auth.uid()
        OR get_my_role() = 'admin'
    )
  );

CREATE POLICY "Manage posts"
  ON posts FOR ALL
  USING (
    client_id IN (
      SELECT id FROM clients
      WHERE profile_id = auth.uid() OR get_my_role() = 'admin'
    )
  );

-- ============================================================
-- 6. Update dna_briefs RLS
-- ============================================================
DROP POLICY IF EXISTS "Managers see own briefs" ON dna_briefs;
DROP POLICY IF EXISTS "Managers manage own briefs" ON dna_briefs;

CREATE POLICY "See dna_briefs"
  ON dna_briefs FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients
      WHERE profile_id = auth.uid()
        OR user_id = auth.uid()
        OR get_my_role() = 'admin'
    )
  );

CREATE POLICY "Manage dna_briefs"
  ON dna_briefs FOR ALL
  USING (
    client_id IN (
      SELECT id FROM clients
      WHERE profile_id = auth.uid() OR get_my_role() = 'admin'
    )
  );

-- ============================================================
-- 7. Update nps_responses RLS (admin only for viewing)
-- ============================================================
DROP POLICY IF EXISTS "Managers see own nps" ON nps_responses;

CREATE POLICY "See nps_responses"
  ON nps_responses FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients
      WHERE profile_id = auth.uid()
    )
    OR get_my_role() = 'admin'
  );

-- ============================================================
-- 8. Update media_files RLS
-- ============================================================
DROP POLICY IF EXISTS "Managers see own media" ON media_files;
DROP POLICY IF EXISTS "Managers manage own media" ON media_files;

CREATE POLICY "See media_files"
  ON media_files FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients
      WHERE profile_id = auth.uid()
        OR user_id = auth.uid()
        OR get_my_role() = 'admin'
    )
  );

CREATE POLICY "Manage media_files"
  ON media_files FOR ALL
  USING (
    client_id IN (
      SELECT id FROM clients
      WHERE profile_id = auth.uid() OR get_my_role() = 'admin'
    )
  );

-- ============================================================
-- 9. Update approval_tokens RLS
-- ============================================================
DROP POLICY IF EXISTS "Managers see own tokens" ON approval_tokens;

CREATE POLICY "See approval_tokens"
  ON approval_tokens FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients
      WHERE profile_id = auth.uid()
        OR user_id = auth.uid()
        OR get_my_role() = 'admin'
    )
    OR (expires_at > NOW() AND used_at IS NULL)
  );

-- ============================================================
-- 10. Update post_batches RLS
-- ============================================================
DROP POLICY IF EXISTS "Managers see own batches" ON post_batches;

CREATE POLICY "See post_batches"
  ON post_batches FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients
      WHERE profile_id = auth.uid()
        OR user_id = auth.uid()
        OR get_my_role() = 'admin'
    )
  );

-- ============================================================
-- 11. Ensure Victor's account has admin role
-- ============================================================
UPDATE profiles SET role = 'admin'
WHERE email = 'guimaraes.victorb@gmail.com';

-- ============================================================
-- Done. Verify with:
-- SELECT id, email, role FROM profiles;
-- SELECT get_my_role();
-- ============================================================
