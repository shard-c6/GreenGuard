-- ════════════════════════════════════════════════════════════════
-- Issue #37 — Smart Alerts: plant care intervals & user garden rows
-- Run in Supabase SQL Editor (or psql against your project database)
-- ════════════════════════════════════════════════════════════════

-- Care interval defaults at the plant catalog level
ALTER TABLE plants
  ADD COLUMN IF NOT EXISTS watering_interval_days INTEGER;

ALTER TABLE plants
  ADD COLUMN IF NOT EXISTS fertilization_interval_days INTEGER;

COMMENT ON COLUMN plants.watering_interval_days IS 'Suggested days between waterings';
COMMENT ON COLUMN plants.fertilization_interval_days IS 'Suggested days between fertilizing';

-- Per-adopter tracking for "My Garden" smart alerts
CREATE TABLE IF NOT EXISTS user_plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  last_watered_at TIMESTAMPTZ,
  last_fertilized_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, plant_id)
);

CREATE INDEX IF NOT EXISTS idx_user_plants_user_id ON user_plants (user_id);
CREATE INDEX IF NOT EXISTS idx_user_plants_plant_id ON user_plants (plant_id);

-- Seed rows for existing adopted plants (one row per adopter + plant)
INSERT INTO user_plants (user_id, plant_id, last_watered_at, last_fertilized_at)
SELECT p.adopted_by, p.id, NULL, NULL
FROM plants p
WHERE p.adoption_status = 'adopted'
  AND p.adopted_by IS NOT NULL
ON CONFLICT (user_id, plant_id) DO NOTHING;

ALTER TABLE user_plants ENABLE ROW LEVEL SECURITY;

-- Policies: users see and maintain only their garden rows
DROP POLICY IF EXISTS "user_plants_select_own" ON user_plants;
CREATE POLICY "user_plants_select_own" ON user_plants
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_plants_insert_own" ON user_plants;
CREATE POLICY "user_plants_insert_own" ON user_plants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_plants_update_own" ON user_plants;
CREATE POLICY "user_plants_update_own" ON user_plants
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_plants_delete_own" ON user_plants;
CREATE POLICY "user_plants_delete_own" ON user_plants
  FOR DELETE USING (auth.uid() = user_id);
