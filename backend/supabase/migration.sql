-- ════════════════════════════════════════════════════════════════
-- Green Guard v2 — Complete Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ════════════════════════════════════════════════════════════════

-- Enable PostGIS for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- ─── PROFILES ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'ngo', 'adopter')) DEFAULT 'adopter',
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  address TEXT,
  is_banned BOOLEAN DEFAULT false,
  banned_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── NGO PROFILES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ngo_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  org_name TEXT NOT NULL,
  registration_number TEXT,
  website TEXT,
  mission TEXT,
  address TEXT,
  onboarding_answers JSONB,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')) DEFAULT 'pending',
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── PLANTS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plant_name TEXT NOT NULL,
  species TEXT,
  description TEXT,
  image_urls TEXT[] DEFAULT '{}',
  location GEOGRAPHY(Point, 4326),
  address TEXT,
  planted_date DATE DEFAULT CURRENT_DATE,
  care_info JSONB,
  ai_profile JSONB,
  adoption_status TEXT NOT NULL CHECK (adoption_status IN ('available', 'pending', 'adopted')) DEFAULT 'available',
  adopted_by UUID REFERENCES profiles(id),
  adopted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Spatial index for nearby queries
CREATE INDEX IF NOT EXISTS idx_plants_location ON plants USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_plants_ngo_id ON plants (ngo_id);
CREATE INDEX IF NOT EXISTS idx_plants_adoption_status ON plants (adoption_status);

-- ─── ADOPTIONS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS adoptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  adopter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ngo_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  answers JSONB,
  review_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(plant_id, adopter_id) -- one application per user per plant
);

CREATE INDEX IF NOT EXISTS idx_adoptions_adopter_id ON adoptions (adopter_id);
CREATE INDEX IF NOT EXISTS idx_adoptions_ngo_id ON adoptions (ngo_id);
CREATE INDEX IF NOT EXISTS idx_adoptions_status ON adoptions (status);

-- ─── GROWTH REPORTS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS growth_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  adopter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  health_status TEXT DEFAULT 'healthy' CHECK (health_status IN ('healthy', 'needs_attention', 'critical', 'dead')),
  height_cm DECIMAL,
  notes TEXT,
  photo_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_growth_reports_plant_id ON growth_reports (plant_id);

-- ─── POSTS (Community Feed) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT,
  image_urls TEXT[] DEFAULT '{}',
  plant_id UUID REFERENCES plants(id),
  post_type TEXT DEFAULT 'normal',
  likes_count INT DEFAULT 0,
  bookmarks_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location GEOGRAPHY(Point, 4326),
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts (author_id);
CREATE INDEX IF NOT EXISTS idx_posts_location ON posts USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_posts_post_type ON posts (post_type);

-- ─── LIKES ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS likes (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

-- ─── BOOKMARKS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookmarks (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

-- ─── FOLLOWS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS follows (
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id) -- can't follow yourself
);

-- ─── NOTIFICATIONS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications (user_id, is_read);


-- ════════════════════════════════════════════════════════════════
-- DATABASE FUNCTIONS (RPCs called by the backend)
-- ════════════════════════════════════════════════════════════════

-- Nearby plants search using PostGIS
CREATE OR REPLACE FUNCTION nearby_plants(user_lat DOUBLE PRECISION, user_lng DOUBLE PRECISION, radius_meters INT DEFAULT 10000)
RETURNS TABLE (
  id UUID,
  ngo_id UUID,
  plant_name TEXT,
  species TEXT,
  image_urls TEXT[],
  adoption_status TEXT,
  adopted_by UUID,
  address TEXT,
  distance_meters DOUBLE PRECISION,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.ngo_id,
    p.plant_name,
    p.species,
    p.image_urls,
    p.adoption_status,
    p.adopted_by,
    p.address,
    ST_Distance(p.location, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography) AS distance_meters,
    ST_Y(p.location::geometry) AS latitude,
    ST_X(p.location::geometry) AS longitude
  FROM plants p
  WHERE ST_DWithin(
    p.location,
    ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
    radius_meters
  )
  ORDER BY distance_meters;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Increment/Decrement counters for likes and bookmarks
CREATE OR REPLACE FUNCTION increment_likes(p_post_id UUID) RETURNS VOID AS $$
BEGIN
  UPDATE posts SET likes_count = likes_count + 1 WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_likes(p_post_id UUID) RETURNS VOID AS $$
BEGIN
  UPDATE posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_bookmarks(p_post_id UUID) RETURNS VOID AS $$
BEGIN
  UPDATE posts SET bookmarks_count = bookmarks_count + 1 WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_bookmarks(p_post_id UUID) RETURNS VOID AS $$
BEGIN
  UPDATE posts SET bookmarks_count = GREATEST(0, bookmarks_count - 1) WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ngo_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE adoptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ─── PROFILES RLS ───────────────────────────────────────────────
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ─── NGO PROFILES RLS ──────────────────────────────────────────
CREATE POLICY "ngo_profiles_select_all" ON ngo_profiles FOR SELECT USING (true);
CREATE POLICY "ngo_profiles_update_own" ON ngo_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "ngo_profiles_insert_own" ON ngo_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ─── PLANTS RLS ─────────────────────────────────────────────────
CREATE POLICY "plants_select_all" ON plants FOR SELECT USING (true);
CREATE POLICY "plants_insert_ngo" ON plants FOR INSERT WITH CHECK (auth.uid() = ngo_id);
CREATE POLICY "plants_update_ngo" ON plants FOR UPDATE USING (auth.uid() = ngo_id);
CREATE POLICY "plants_delete_ngo" ON plants FOR DELETE USING (auth.uid() = ngo_id);

-- ─── ADOPTIONS RLS ──────────────────────────────────────────────
CREATE POLICY "adoptions_select_involved" ON adoptions FOR SELECT USING (
  auth.uid() = adopter_id OR auth.uid() = ngo_id
);
CREATE POLICY "adoptions_insert_adopter" ON adoptions FOR INSERT WITH CHECK (auth.uid() = adopter_id);
CREATE POLICY "adoptions_update_ngo" ON adoptions FOR UPDATE USING (auth.uid() = ngo_id);

-- ─── GROWTH REPORTS RLS ─────────────────────────────────────────
CREATE POLICY "reports_select_all" ON growth_reports FOR SELECT USING (true);
CREATE POLICY "reports_insert_adopter" ON growth_reports FOR INSERT WITH CHECK (auth.uid() = adopter_id);

-- ─── POSTS RLS ──────────────────────────────────────────────────
CREATE POLICY "posts_select_all" ON posts FOR SELECT USING (true);
CREATE POLICY "posts_insert_author" ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "posts_delete_author" ON posts FOR DELETE USING (auth.uid() = author_id);

-- ─── LIKES RLS ──────────────────────────────────────────────────
CREATE POLICY "likes_select_own" ON likes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "likes_insert_own" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_delete_own" ON likes FOR DELETE USING (auth.uid() = user_id);

-- ─── BOOKMARKS RLS ──────────────────────────────────────────────
CREATE POLICY "bookmarks_select_own" ON bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bookmarks_insert_own" ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bookmarks_delete_own" ON bookmarks FOR DELETE USING (auth.uid() = user_id);

-- ─── FOLLOWS RLS ────────────────────────────────────────────────
CREATE POLICY "follows_select_all" ON follows FOR SELECT USING (true);
CREATE POLICY "follows_insert_own" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows_delete_own" ON follows FOR DELETE USING (auth.uid() = follower_id);

-- ─── NOTIFICATIONS RLS ─────────────────────────────────────────
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE USING (auth.uid() = user_id);


-- ════════════════════════════════════════════════════════════════
-- STORAGE BUCKETS
-- Run these separately if the SQL editor does not support storage commands.
-- Otherwise, create buckets manually in Dashboard → Storage → New Bucket:
--   1. plant-images (public)
--   2. post-images  (public)
--   3. report-images (public)
--   4. avatars (public)
-- ════════════════════════════════════════════════════════════════
-- INSERT INTO storage.buckets (id, name, public) VALUES ('plant-images', 'plant-images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('post-images', 'post-images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('report-images', 'report-images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policies (allow authenticated uploads, public reads)
-- CREATE POLICY "storage_public_read" ON storage.objects FOR SELECT USING (bucket_id IN ('plant-images', 'post-images', 'report-images', 'avatars'));
-- CREATE POLICY "storage_auth_upload" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND bucket_id IN ('plant-images', 'post-images', 'report-images', 'avatars'));
-- CREATE POLICY "storage_auth_delete" ON storage.objects FOR DELETE USING (auth.uid() = owner AND bucket_id IN ('plant-images', 'post-images', 'report-images', 'avatars'));
