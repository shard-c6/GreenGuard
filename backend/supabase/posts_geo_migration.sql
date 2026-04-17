-- ════════════════════════════════════════════════════════════════
-- Green Guard v2 — Posts Geospatial & Metadata Migration
-- This fixes the 400 Bad Request error on the map feature.
-- ════════════════════════════════════════════════════════════════

-- 1. Add post_type for classification (normal, plantation, etc.)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS post_type TEXT DEFAULT 'normal' CHECK (post_type IN ('normal', 'plantation'));

-- 2. Add latitude and longitude for precise positioning
ALTER TABLE posts ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- 3. Add PostGIS geography column for spatial queries
ALTER TABLE posts ADD COLUMN IF NOT EXISTS location GEOGRAPHY(Point, 4326);

-- 4. Add human-readable address
ALTER TABLE posts ADD COLUMN IF NOT EXISTS address TEXT;

-- 5. Create spatial index for performance
CREATE INDEX IF NOT EXISTS idx_posts_location ON posts USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_posts_post_type ON posts (post_type);

-- ════════════════════════════════════════════════════════════════
-- Note: Run this in the Supabase SQL Editor.
-- ════════════════════════════════════════════════════════════════
