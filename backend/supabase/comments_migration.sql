-- ════════════════════════════════════════════════════════════════
-- Green Guard v2 — Comments Feature Migration
-- Run this in Supabase SQL Editor AFTER the main migration.sql
-- ════════════════════════════════════════════════════════════════

-- ─── COMMENTS TABLE ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 1000),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments (post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments (user_id);

-- Add comments_count to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS comments_count INT DEFAULT 0;

-- Counter RPCs
CREATE OR REPLACE FUNCTION increment_comments(p_post_id UUID) RETURNS VOID AS $$
BEGIN
  UPDATE posts SET comments_count = comments_count + 1 WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION decrement_comments(p_post_id UUID) RETURNS VOID AS $$
BEGIN
  UPDATE posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ─── COMMENTS RLS ──────────────────────────────────────────────
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments_select_all" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_insert_auth" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_delete_own" ON comments FOR DELETE USING (auth.uid() = user_id);
