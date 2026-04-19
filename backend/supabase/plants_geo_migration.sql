-- ════════════════════════════════════════════════════════════════
-- Green Guard v2 — Plants Geospatial & Metadata Migration
-- This adds latitude and longitude columns to the plants table
-- and populates them from the existing location column.
-- ════════════════════════════════════════════════════════════════

-- 1. Add latitude and longitude columns
ALTER TABLE plants ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE plants ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- 2. Populate columns from existing location (geometry) data
UPDATE plants 
SET 
  latitude = ST_Y(location::geometry),
  longitude = ST_X(location::geometry)
WHERE location IS NOT NULL;

-- ════════════════════════════════════════════════════════════════
-- Note: Run this in the Supabase SQL Editor.
-- ════════════════════════════════════════════════════════════════
