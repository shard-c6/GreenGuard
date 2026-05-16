CREATE TABLE IF NOT EXISTS saved_plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  common_name TEXT,
  scientific_name TEXT,
  confidence NUMERIC,
  image_url TEXT,
  ai_consultation TEXT,
  plant_net_data JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_saved_plants_user_id ON saved_plants (user_id);

ALTER TABLE saved_plants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saved_plants_select_own" ON saved_plants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "saved_plants_insert_own" ON saved_plants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saved_plants_update_own" ON saved_plants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "saved_plants_delete_own" ON saved_plants FOR DELETE USING (auth.uid() = user_id);
