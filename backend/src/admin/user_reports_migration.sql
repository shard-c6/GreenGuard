-- ════════════════════════════════════════════════════════════════
-- Green Guard — User Reports Migration
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ════════════════════════════════════════════════════════════════

-- ─── USER REPORTS (Malicious Activity) ─────────────────────────
CREATE TABLE IF NOT EXISTS user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'fake_ngo', 'misinformation', 'inappropriate_content', 'other')),
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'resolved', 'dismissed')) DEFAULT 'pending',
  admin_notes TEXT,
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  CHECK (reporter_id != reported_user_id) -- can't report yourself
);

CREATE INDEX IF NOT EXISTS idx_user_reports_status ON user_reports (status);
CREATE INDEX IF NOT EXISTS idx_user_reports_reported ON user_reports (reported_user_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reporter ON user_reports (reporter_id);

-- ─── USER REPORTS RLS ──────────────────────────────────────────
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;

-- Users can insert their own reports
CREATE POLICY "user_reports_insert_own" ON user_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Users can see their own reports
CREATE POLICY "user_reports_select_own" ON user_reports FOR SELECT
  USING (auth.uid() = reporter_id);
