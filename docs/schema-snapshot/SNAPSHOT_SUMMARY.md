# Supabase Database Schema Snapshot Summary

**Snapshot Date & Time:** 16/9/2026, 11:11:32 pm (2026-09-16 17:41:32 UTC)  
**Project Ref:** `eopmwvdmgzxoaxqqfsdq` (GreenGuard)  
**Total rows across all captured tables:** 10,256

---

## 1. Tables & Row Counts

### Public Schema (18 tables)

| Table Name | Row Count |
| :--- | ---: |
| `adoptions` | 3 |
| `bookmarks` | 0 |
| `comments` | 2 |
| `follows` | 3 |
| `geography_columns` | 2 |
| `geometry_columns` | 0 |
| `growth_reports` | 0 |
| `likes` | 0 |
| `ngo_profiles` | 11 |
| `notifications` | 6 |
| `plant_knowledge` | 1,652 |
| `plants` | 3 |
| `posts` | 8 |
| `profiles` | 29 |
| `saved_plants` | 1 |
| `spatial_ref_sys` | 8,500 |
| `user_plants` | 3 |
| `user_reports` | 0 |

### Other Schemas

| Schema.Table | Row Count |
| :--- | ---: |
| `auth.users` | 29 |
| `storage.objects` | 4 |

---

## 2. `plant_knowledge` Column Specification

Total Columns: **7**

| Column Name | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` |
| `plant_name` | `text` | YES | `null` |
| `scientific_name` | `text` | YES | `null` |
| `content` | `text` | YES | `null` |
| `embedding` | `USER-DEFINED` (vector) | YES | `null` |
| `metadata` | `jsonb` | YES | `null` |
| `fts` | `tsvector` | YES | `null` |

---

## 3. Enabled Postgres Extensions

Total Enabled Extensions: **8**

| Extension Name | Version | Description / Comment |
| :--- | :--- | :--- |
| `pg_stat_statements` | 1.11 | track planning and execution statistics of all SQL statements executed |
| `pg_trgm` | 1.6 | text similarity measurement and index searching based on trigrams |
| `pgcrypto` | 1.3 | cryptographic functions |
| `plpgsql` | 1.0 | PL/pgSQL procedural language |
| `postgis` | 3.3.7 | PostGIS geometry and geography spatial types and functions |
| `supabase_vault` | 0.3.1 | Supabase Vault Extension |
| `uuid-ossp` | 1.1 | generate universally unique identifiers (UUIDs) |
| `vector` | 0.8.0 | vector data type and ivfflat and hnsw access methods |

---

## 4. Storage Buckets

Total Buckets Found: **5**

| Bucket ID / Name | Public | Created At |
| :--- | :--- | :--- |
| `avatars` | `true` | 2026-03-14T19:56:10.309Z |
| `flora-scans` | `true` | 2026-04-10T18:39:27.069Z |
| `plant-images` | `true` | 2026-03-14T19:55:17.798Z |
| `post-images` | `true` | 2026-03-14T19:55:36.106Z |
| `report-images` | `true` | 2026-03-14T19:55:50.786Z |

---

## 5. RLS Policies Count per Table

Total RLS Policies: **43**

| Table Name | Policy Count |
| :--- | :--- |
| `adoptions` | 3 |
| `bookmarks` | 3 |
| `comments` | 3 |
| `follows` | 3 |
| `growth_reports` | 2 |
| `likes` | 3 |
| `ngo_profiles` | 3 |
| `notifications` | 2 |
| `plant_knowledge` | 1 |
| `plants` | 4 |
| `posts` | 3 |
| `profiles` | 3 |
| `saved_plants` | 4 |
| `user_plants` | 4 |
| `user_reports` | 2 |

---

## 6. Indexes

Total Indexes: **41**

| Table | Index Name | Definition |
| :--- | :--- | :--- |
| `adoptions` | `adoptions_pkey` | `CREATE UNIQUE INDEX adoptions_pkey ON public.adoptions USING btree (id)` |
| `adoptions` | `adoptions_plant_id_adopter_id_key` | `CREATE UNIQUE INDEX adoptions_plant_id_adopter_id_key ON public.adoptions USING btree (plant_id, adopter_id)` |
| `adoptions` | `idx_adoptions_adopter_id` | `CREATE INDEX idx_adoptions_adopter_id ON public.adoptions USING btree (adopter_id)` |
| `adoptions` | `idx_adoptions_ngo_id` | `CREATE INDEX idx_adoptions_ngo_id ON public.adoptions USING btree (ngo_id)` |
| `adoptions` | `idx_adoptions_status` | `CREATE INDEX idx_adoptions_status ON public.adoptions USING btree (status)` |
| `bookmarks` | `bookmarks_pkey` | `CREATE UNIQUE INDEX bookmarks_pkey ON public.bookmarks USING btree (user_id, post_id)` |
| `comments` | `comments_pkey` | `CREATE UNIQUE INDEX comments_pkey ON public.comments USING btree (id)` |
| `comments` | `idx_comments_post_id` | `CREATE INDEX idx_comments_post_id ON public.comments USING btree (post_id)` |
| `comments` | `idx_comments_user_id` | `CREATE INDEX idx_comments_user_id ON public.comments USING btree (user_id)` |
| `follows` | `follows_pkey` | `CREATE UNIQUE INDEX follows_pkey ON public.follows USING btree (follower_id, following_id)` |
| `growth_reports` | `growth_reports_pkey` | `CREATE UNIQUE INDEX growth_reports_pkey ON public.growth_reports USING btree (id)` |
| `growth_reports` | `idx_growth_reports_plant_id` | `CREATE INDEX idx_growth_reports_plant_id ON public.growth_reports USING btree (plant_id)` |
| `likes` | `likes_pkey` | `CREATE UNIQUE INDEX likes_pkey ON public.likes USING btree (user_id, post_id)` |
| `ngo_profiles` | `ngo_profiles_pkey` | `CREATE UNIQUE INDEX ngo_profiles_pkey ON public.ngo_profiles USING btree (id)` |
| `notifications` | `idx_notifications_is_read` | `CREATE INDEX idx_notifications_is_read ON public.notifications USING btree (user_id, is_read)` |
| `notifications` | `idx_notifications_user_id` | `CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id)` |
| `notifications` | `notifications_pkey` | `CREATE UNIQUE INDEX notifications_pkey ON public.notifications USING btree (id)` |
| `plant_knowledge` | `idx_plant_knowledge_fts` | `CREATE INDEX idx_plant_knowledge_fts ON public.plant_knowledge USING gin (fts)` |
| `plant_knowledge` | `plant_knowledge_pkey` | `CREATE UNIQUE INDEX plant_knowledge_pkey ON public.plant_knowledge USING btree (id)` |
| `plants` | `idx_plants_adoption_status` | `CREATE INDEX idx_plants_adoption_status ON public.plants USING btree (adoption_status)` |
| `plants` | `idx_plants_location` | `CREATE INDEX idx_plants_location ON public.plants USING gist (location)` |
| `plants` | `idx_plants_ngo_id` | `CREATE INDEX idx_plants_ngo_id ON public.plants USING btree (ngo_id)` |
| `plants` | `plants_pkey` | `CREATE UNIQUE INDEX plants_pkey ON public.plants USING btree (id)` |
| `posts` | `idx_posts_author_id` | `CREATE INDEX idx_posts_author_id ON public.posts USING btree (author_id)` |
| `posts` | `idx_posts_location` | `CREATE INDEX idx_posts_location ON public.posts USING gist (location)` |
| `posts` | `idx_posts_post_type` | `CREATE INDEX idx_posts_post_type ON public.posts USING btree (post_type)` |
| `posts` | `posts_pkey` | `CREATE UNIQUE INDEX posts_pkey ON public.posts USING btree (id)` |
| `profiles` | `profiles_email_key` | `CREATE UNIQUE INDEX profiles_email_key ON public.profiles USING btree (email)` |
| `profiles` | `profiles_pkey` | `CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id)` |
| `profiles` | `profiles_username_key` | `CREATE UNIQUE INDEX profiles_username_key ON public.profiles USING btree (username)` |
| `saved_plants` | `idx_saved_plants_user_id` | `CREATE INDEX idx_saved_plants_user_id ON public.saved_plants USING btree (user_id)` |
| `saved_plants` | `saved_plants_pkey` | `CREATE UNIQUE INDEX saved_plants_pkey ON public.saved_plants USING btree (id)` |
| `spatial_ref_sys` | `spatial_ref_sys_pkey` | `CREATE UNIQUE INDEX spatial_ref_sys_pkey ON public.spatial_ref_sys USING btree (srid)` |
| `user_plants` | `idx_user_plants_plant_id` | `CREATE INDEX idx_user_plants_plant_id ON public.user_plants USING btree (plant_id)` |
| `user_plants` | `idx_user_plants_user_id` | `CREATE INDEX idx_user_plants_user_id ON public.user_plants USING btree (user_id)` |
| `user_plants` | `user_plants_pkey` | `CREATE UNIQUE INDEX user_plants_pkey ON public.user_plants USING btree (id)` |
| `user_plants` | `user_plants_user_id_plant_id_key` | `CREATE UNIQUE INDEX user_plants_user_id_plant_id_key ON public.user_plants USING btree (user_id, plant_id)` |
| `user_reports` | `idx_user_reports_reported` | `CREATE INDEX idx_user_reports_reported ON public.user_reports USING btree (reported_user_id)` |
| `user_reports` | `idx_user_reports_reporter` | `CREATE INDEX idx_user_reports_reporter ON public.user_reports USING btree (reporter_id)` |
| `user_reports` | `idx_user_reports_status` | `CREATE INDEX idx_user_reports_status ON public.user_reports USING btree (status)` |
| `user_reports` | `user_reports_pkey` | `CREATE UNIQUE INDEX user_reports_pkey ON public.user_reports USING btree (id)` |

---

## 7. Constraints

Total Constraints: **59** (12 CHECK, 27 FOREIGN KEY, 16 PRIMARY KEY, 4 UNIQUE)

| Table | Constraint Name | Type | Definition | References |
| :--- | :--- | :--- | :--- | :--- |
| `adoptions` | `adoptions_status_check` | CHECK | `CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text]))` |  |
| `adoptions` | `adoptions_adopter_id_fkey` | FOREIGN KEY | `FOREIGN KEY (adopter_id) REFERENCES profiles(id) ON DELETE CASCADE` | `profiles` |
| `adoptions` | `adoptions_ngo_id_fkey` | FOREIGN KEY | `FOREIGN KEY (ngo_id) REFERENCES profiles(id) ON DELETE CASCADE` | `profiles` |
| `adoptions` | `adoptions_plant_id_fkey` | FOREIGN KEY | `FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE` | `plants` |
| `adoptions` | `adoptions_pkey` | PRIMARY KEY | `PRIMARY KEY (id)` |  |
| `adoptions` | `adoptions_plant_id_adopter_id_key` | UNIQUE | `UNIQUE (plant_id, adopter_id)` |  |
| `bookmarks` | `bookmarks_post_id_fkey` | FOREIGN KEY | `FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE` | `posts` |
| `bookmarks` | `bookmarks_user_id_fkey` | FOREIGN KEY | `FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE` | `profiles` |
| `bookmarks` | `bookmarks_pkey` | PRIMARY KEY | `PRIMARY KEY (user_id, post_id)` |  |
| `comments` | `comments_content_check` | CHECK | `CHECK (char_length(content) > 0 AND char_length(content) <= 1000)` |  |
| `comments` | `comments_post_id_fkey` | FOREIGN KEY | `FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE` | `posts` |
| `comments` | `comments_user_id_fkey` | FOREIGN KEY | `FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE` | `profiles` |
| `comments` | `comments_pkey` | PRIMARY KEY | `PRIMARY KEY (id)` |  |
| `follows` | `follows_check` | CHECK | `CHECK (follower_id <> following_id)` |  |
| `follows` | `follows_follower_id_fkey` | FOREIGN KEY | `FOREIGN KEY (follower_id) REFERENCES profiles(id) ON DELETE CASCADE` | `profiles` |
| `follows` | `follows_following_id_fkey` | FOREIGN KEY | `FOREIGN KEY (following_id) REFERENCES profiles(id) ON DELETE CASCADE` | `profiles` |
| `follows` | `follows_pkey` | PRIMARY KEY | `PRIMARY KEY (follower_id, following_id)` |  |
| `growth_reports` | `growth_reports_health_status_check` | CHECK | `CHECK (health_status = ANY (ARRAY['healthy'::text, 'needs_attention'::text, 'critical'::text, 'dead'::text]))` |  |
| `growth_reports` | `growth_reports_adopter_id_fkey` | FOREIGN KEY | `FOREIGN KEY (adopter_id) REFERENCES profiles(id) ON DELETE CASCADE` | `profiles` |
| `growth_reports` | `growth_reports_plant_id_fkey` | FOREIGN KEY | `FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE` | `plants` |
| `growth_reports` | `growth_reports_pkey` | PRIMARY KEY | `PRIMARY KEY (id)` |  |
| `likes` | `likes_post_id_fkey` | FOREIGN KEY | `FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE` | `posts` |
| `likes` | `likes_user_id_fkey` | FOREIGN KEY | `FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE` | `profiles` |
| `likes` | `likes_pkey` | PRIMARY KEY | `PRIMARY KEY (user_id, post_id)` |  |
| `ngo_profiles` | `ngo_profiles_status_check` | CHECK | `CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'suspended'::text]))` |  |
| `ngo_profiles` | `ngo_profiles_approved_by_fkey` | FOREIGN KEY | `FOREIGN KEY (approved_by) REFERENCES profiles(id)` | `profiles` |
| `ngo_profiles` | `ngo_profiles_id_fkey` | FOREIGN KEY | `FOREIGN KEY (id) REFERENCES profiles(id) ON DELETE CASCADE` | `profiles` |
| `ngo_profiles` | `ngo_profiles_pkey` | PRIMARY KEY | `PRIMARY KEY (id)` |  |
| `notifications` | `notifications_user_id_fkey` | FOREIGN KEY | `FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE` | `profiles` |
| `notifications` | `notifications_pkey` | PRIMARY KEY | `PRIMARY KEY (id)` |  |
| `plant_knowledge` | `plant_knowledge_pkey` | PRIMARY KEY | `PRIMARY KEY (id)` |  |
| `plants` | `plants_adoption_status_check` | CHECK | `CHECK (adoption_status = ANY (ARRAY['available'::text, 'pending'::text, 'adopted'::text]))` |  |
| `plants` | `plants_adopted_by_fkey` | FOREIGN KEY | `FOREIGN KEY (adopted_by) REFERENCES profiles(id)` | `profiles` |
| `plants` | `plants_ngo_id_fkey` | FOREIGN KEY | `FOREIGN KEY (ngo_id) REFERENCES profiles(id) ON DELETE CASCADE` | `profiles` |
| `plants` | `plants_pkey` | PRIMARY KEY | `PRIMARY KEY (id)` |  |
| `posts` | `posts_post_type_check` | CHECK | `CHECK (post_type = ANY (ARRAY['normal'::text, 'plantation'::text]))` |  |
| `posts` | `posts_author_id_fkey` | FOREIGN KEY | `FOREIGN KEY (author_id) REFERENCES profiles(id) ON DELETE CASCADE` | `profiles` |
| `posts` | `posts_plant_id_fkey` | FOREIGN KEY | `FOREIGN KEY (plant_id) REFERENCES plants(id)` | `plants` |
| `posts` | `posts_pkey` | PRIMARY KEY | `PRIMARY KEY (id)` |  |
| `profiles` | `profiles_role_check` | CHECK | `CHECK (role = ANY (ARRAY['admin'::text, 'ngo'::text, 'adopter'::text]))` |  |
| `profiles` | `profiles_id_fkey` | FOREIGN KEY | `FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE` | `users` |
| `profiles` | `profiles_pkey` | PRIMARY KEY | `PRIMARY KEY (id)` |  |
| `profiles` | `profiles_email_key` | UNIQUE | `UNIQUE (email)` |  |
| `profiles` | `profiles_username_key` | UNIQUE | `UNIQUE (username)` |  |
| `saved_plants` | `saved_plants_user_id_fkey` | FOREIGN KEY | `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE` | `users` |
| `saved_plants` | `saved_plants_pkey` | PRIMARY KEY | `PRIMARY KEY (id)` |  |
| `spatial_ref_sys` | `spatial_ref_sys_srid_check` | CHECK | `CHECK (srid > 0 AND srid <= 998999)` |  |
| `spatial_ref_sys` | `spatial_ref_sys_pkey` | PRIMARY KEY | `PRIMARY KEY (srid)` |  |
| `user_plants` | `user_plants_plant_id_fkey` | FOREIGN KEY | `FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE` | `plants` |
| `user_plants` | `user_plants_user_id_fkey` | FOREIGN KEY | `FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE` | `profiles` |
| `user_plants` | `user_plants_pkey` | PRIMARY KEY | `PRIMARY KEY (id)` |  |
| `user_plants` | `user_plants_user_id_plant_id_key` | UNIQUE | `UNIQUE (user_id, plant_id)` |  |
| `user_reports` | `user_reports_check` | CHECK | `CHECK (reporter_id <> reported_user_id)` |  |
| `user_reports` | `user_reports_reason_check` | CHECK | `CHECK (reason = ANY (ARRAY['spam'::text, 'harassment'::text, 'fake_ngo'::text, 'misinformation'::text, 'inappropriate_content'::text, 'other'::text]))` |  |
| `user_reports` | `user_reports_status_check` | CHECK | `CHECK (status = ANY (ARRAY['pending'::text, 'resolved'::text, 'dismissed'::text]))` |  |
| `user_reports` | `user_reports_reported_user_id_fkey` | FOREIGN KEY | `FOREIGN KEY (reported_user_id) REFERENCES profiles(id) ON DELETE CASCADE` | `profiles` |
| `user_reports` | `user_reports_reporter_id_fkey` | FOREIGN KEY | `FOREIGN KEY (reporter_id) REFERENCES profiles(id) ON DELETE CASCADE` | `profiles` |
| `user_reports` | `user_reports_resolved_by_fkey` | FOREIGN KEY | `FOREIGN KEY (resolved_by) REFERENCES profiles(id)` | `profiles` |
| `user_reports` | `user_reports_pkey` | PRIMARY KEY | `PRIMARY KEY (id)` |  |

---

## 8. Functions

Total Functions: **904**

| Function Name | Routine Type | Return Type |
| :--- | :--- | :--- |
| `_postgis_deprecate` | FUNCTION | `void` |
| `_postgis_index_extent` | FUNCTION | `USER-DEFINED` |
| `_postgis_join_selectivity` | FUNCTION | `double precision` |
| `_postgis_pgsql_version` | FUNCTION | `text` |
| `_postgis_scripts_pgsql_version` | FUNCTION | `text` |
| `_postgis_selectivity` | FUNCTION | `double precision` |
| `_postgis_stats` | FUNCTION | `text` |
| `_st_3ddfullywithin` | FUNCTION | `boolean` |
| `_st_3ddwithin` | FUNCTION | `boolean` |
| `_st_3dintersects` | FUNCTION | `boolean` |
| `_st_asgml` | FUNCTION | `text` |
| `_st_asx3d` | FUNCTION | `text` |
| `_st_bestsrid` | FUNCTION | `integer` |
| `_st_bestsrid` | FUNCTION | `integer` |
| `_st_contains` | FUNCTION | `boolean` |
| `_st_containsproperly` | FUNCTION | `boolean` |
| `_st_coveredby` | FUNCTION | `boolean` |
| `_st_coveredby` | FUNCTION | `boolean` |
| `_st_covers` | FUNCTION | `boolean` |
| `_st_covers` | FUNCTION | `boolean` |
| `_st_crosses` | FUNCTION | `boolean` |
| `_st_dfullywithin` | FUNCTION | `boolean` |
| `_st_distancetree` | FUNCTION | `double precision` |
| `_st_distancetree` | FUNCTION | `double precision` |
| `_st_distanceuncached` | FUNCTION | `double precision` |
| `_st_distanceuncached` | FUNCTION | `double precision` |
| `_st_distanceuncached` | FUNCTION | `double precision` |
| `_st_dwithin` | FUNCTION | `boolean` |
| `_st_dwithin` | FUNCTION | `boolean` |
| `_st_dwithinuncached` | FUNCTION | `boolean` |
| `_st_dwithinuncached` | FUNCTION | `boolean` |
| `_st_equals` | FUNCTION | `boolean` |
| `_st_expand` | FUNCTION | `USER-DEFINED` |
| `_st_geomfromgml` | FUNCTION | `USER-DEFINED` |
| `_st_intersects` | FUNCTION | `boolean` |
| `_st_linecrossingdirection` | FUNCTION | `integer` |
| `_st_longestline` | FUNCTION | `USER-DEFINED` |
| `_st_maxdistance` | FUNCTION | `double precision` |
| `_st_orderingequals` | FUNCTION | `boolean` |
| `_st_overlaps` | FUNCTION | `boolean` |
| `_st_pointoutside` | FUNCTION | `USER-DEFINED` |
| `_st_sortablehash` | FUNCTION | `bigint` |
| `_st_touches` | FUNCTION | `boolean` |
| `_st_voronoi` | FUNCTION | `USER-DEFINED` |
| `_st_within` | FUNCTION | `boolean` |
| `addauth` | FUNCTION | `boolean` |
| `addgeometrycolumn` | FUNCTION | `text` |
| `addgeometrycolumn` | FUNCTION | `text` |
| `addgeometrycolumn` | FUNCTION | `text` |
| `array_to_halfvec` | FUNCTION | `USER-DEFINED` |
| `array_to_halfvec` | FUNCTION | `USER-DEFINED` |
| `array_to_halfvec` | FUNCTION | `USER-DEFINED` |
| `array_to_halfvec` | FUNCTION | `USER-DEFINED` |
| `array_to_sparsevec` | FUNCTION | `USER-DEFINED` |
| `array_to_sparsevec` | FUNCTION | `USER-DEFINED` |
| `array_to_sparsevec` | FUNCTION | `USER-DEFINED` |
| `array_to_sparsevec` | FUNCTION | `USER-DEFINED` |
| `array_to_vector` | FUNCTION | `USER-DEFINED` |
| `array_to_vector` | FUNCTION | `USER-DEFINED` |
| `array_to_vector` | FUNCTION | `USER-DEFINED` |
| `array_to_vector` | FUNCTION | `USER-DEFINED` |
| `avg` | null | `USER-DEFINED` |
| `avg` | null | `USER-DEFINED` |
| `binary_quantize` | FUNCTION | `bit` |
| `binary_quantize` | FUNCTION | `bit` |
| `box` | FUNCTION | `box` |
| `box` | FUNCTION | `box` |
| `box2d` | FUNCTION | `USER-DEFINED` |
| `box2d` | FUNCTION | `USER-DEFINED` |
| `box2d_in` | FUNCTION | `USER-DEFINED` |
| `box2d_out` | FUNCTION | `cstring` |
| `box2df_in` | FUNCTION | `USER-DEFINED` |
| `box2df_out` | FUNCTION | `cstring` |
| `box3d` | FUNCTION | `USER-DEFINED` |
| `box3d` | FUNCTION | `USER-DEFINED` |
| `box3d_in` | FUNCTION | `USER-DEFINED` |
| `box3d_out` | FUNCTION | `cstring` |
| `box3dtobox` | FUNCTION | `box` |
| `bytea` | FUNCTION | `bytea` |
| `bytea` | FUNCTION | `bytea` |
| `checkauth` | FUNCTION | `integer` |
| `checkauth` | FUNCTION | `integer` |
| `checkauthtrigger` | FUNCTION | `trigger` |
| `contains_2d` | FUNCTION | `boolean` |
| `contains_2d` | FUNCTION | `boolean` |
| `contains_2d` | FUNCTION | `boolean` |
| `cosine_distance` | FUNCTION | `double precision` |
| `cosine_distance` | FUNCTION | `double precision` |
| `cosine_distance` | FUNCTION | `double precision` |
| `decrement_bookmarks` | FUNCTION | `void` |
| `decrement_comments` | FUNCTION | `void` |
| `decrement_likes` | FUNCTION | `void` |
| `disablelongtransactions` | FUNCTION | `text` |
| `dropgeometrycolumn` | FUNCTION | `text` |
| `dropgeometrycolumn` | FUNCTION | `text` |
| `dropgeometrycolumn` | FUNCTION | `text` |
| `dropgeometrytable` | FUNCTION | `text` |
| `dropgeometrytable` | FUNCTION | `text` |
| `dropgeometrytable` | FUNCTION | `text` |
| `enablelongtransactions` | FUNCTION | `text` |
| `equals` | FUNCTION | `boolean` |
| `find_srid` | FUNCTION | `integer` |
| `geog_brin_inclusion_add_value` | FUNCTION | `boolean` |
| `geography` | FUNCTION | `USER-DEFINED` |
| `geography` | FUNCTION | `USER-DEFINED` |
| `geography` | FUNCTION | `USER-DEFINED` |
| `geography_analyze` | FUNCTION | `boolean` |
| `geography_cmp` | FUNCTION | `integer` |
| `geography_distance_knn` | FUNCTION | `double precision` |
| `geography_eq` | FUNCTION | `boolean` |
| `geography_ge` | FUNCTION | `boolean` |
| `geography_gist_compress` | FUNCTION | `internal` |
| `geography_gist_consistent` | FUNCTION | `boolean` |
| `geography_gist_decompress` | FUNCTION | `internal` |
| `geography_gist_distance` | FUNCTION | `double precision` |
| `geography_gist_penalty` | FUNCTION | `internal` |
| `geography_gist_picksplit` | FUNCTION | `internal` |
| `geography_gist_same` | FUNCTION | `internal` |
| `geography_gist_union` | FUNCTION | `internal` |
| `geography_gt` | FUNCTION | `boolean` |
| `geography_in` | FUNCTION | `USER-DEFINED` |
| `geography_le` | FUNCTION | `boolean` |
| `geography_lt` | FUNCTION | `boolean` |
| `geography_out` | FUNCTION | `cstring` |
| `geography_overlaps` | FUNCTION | `boolean` |
| `geography_recv` | FUNCTION | `USER-DEFINED` |
| `geography_send` | FUNCTION | `bytea` |
| `geography_spgist_choose_nd` | FUNCTION | `void` |
| `geography_spgist_compress_nd` | FUNCTION | `internal` |
| `geography_spgist_config_nd` | FUNCTION | `void` |
| `geography_spgist_inner_consistent_nd` | FUNCTION | `void` |
| `geography_spgist_leaf_consistent_nd` | FUNCTION | `boolean` |
| `geography_spgist_picksplit_nd` | FUNCTION | `void` |
| `geography_typmod_in` | FUNCTION | `integer` |
| `geography_typmod_out` | FUNCTION | `cstring` |
| `geom2d_brin_inclusion_add_value` | FUNCTION | `boolean` |
| `geom3d_brin_inclusion_add_value` | FUNCTION | `boolean` |
| `geom4d_brin_inclusion_add_value` | FUNCTION | `boolean` |
| `geometry` | FUNCTION | `USER-DEFINED` |
| `geometry` | FUNCTION | `USER-DEFINED` |
| `geometry` | FUNCTION | `USER-DEFINED` |
| `geometry` | FUNCTION | `USER-DEFINED` |
| `geometry` | FUNCTION | `USER-DEFINED` |
| `geometry` | FUNCTION | `USER-DEFINED` |
| `geometry` | FUNCTION | `USER-DEFINED` |
| `geometry` | FUNCTION | `USER-DEFINED` |
| `geometry` | FUNCTION | `USER-DEFINED` |
| `geometry_above` | FUNCTION | `boolean` |
| `geometry_analyze` | FUNCTION | `boolean` |
| `geometry_below` | FUNCTION | `boolean` |
| `geometry_cmp` | FUNCTION | `integer` |
| `geometry_contained_3d` | FUNCTION | `boolean` |
| `geometry_contains` | FUNCTION | `boolean` |
| `geometry_contains_3d` | FUNCTION | `boolean` |
| `geometry_contains_nd` | FUNCTION | `boolean` |
| `geometry_distance_box` | FUNCTION | `double precision` |
| `geometry_distance_centroid` | FUNCTION | `double precision` |
| `geometry_distance_centroid_nd` | FUNCTION | `double precision` |
| `geometry_distance_cpa` | FUNCTION | `double precision` |
| `geometry_eq` | FUNCTION | `boolean` |
| `geometry_ge` | FUNCTION | `boolean` |
| `geometry_gist_compress_2d` | FUNCTION | `internal` |
| `geometry_gist_compress_nd` | FUNCTION | `internal` |
| `geometry_gist_consistent_2d` | FUNCTION | `boolean` |
| `geometry_gist_consistent_nd` | FUNCTION | `boolean` |
| `geometry_gist_decompress_2d` | FUNCTION | `internal` |
| `geometry_gist_decompress_nd` | FUNCTION | `internal` |
| `geometry_gist_distance_2d` | FUNCTION | `double precision` |
| `geometry_gist_distance_nd` | FUNCTION | `double precision` |
| `geometry_gist_penalty_2d` | FUNCTION | `internal` |
| `geometry_gist_penalty_nd` | FUNCTION | `internal` |
| `geometry_gist_picksplit_2d` | FUNCTION | `internal` |
| `geometry_gist_picksplit_nd` | FUNCTION | `internal` |
| `geometry_gist_same_2d` | FUNCTION | `internal` |
| `geometry_gist_same_nd` | FUNCTION | `internal` |
| `geometry_gist_sortsupport_2d` | FUNCTION | `void` |
| `geometry_gist_union_2d` | FUNCTION | `internal` |
| `geometry_gist_union_nd` | FUNCTION | `internal` |
| `geometry_gt` | FUNCTION | `boolean` |
| `geometry_hash` | FUNCTION | `integer` |
| `geometry_in` | FUNCTION | `USER-DEFINED` |
| `geometry_le` | FUNCTION | `boolean` |
| `geometry_left` | FUNCTION | `boolean` |
| `geometry_lt` | FUNCTION | `boolean` |
| `geometry_out` | FUNCTION | `cstring` |
| `geometry_overabove` | FUNCTION | `boolean` |
| `geometry_overbelow` | FUNCTION | `boolean` |
| `geometry_overlaps` | FUNCTION | `boolean` |
| `geometry_overlaps_3d` | FUNCTION | `boolean` |
| `geometry_overlaps_nd` | FUNCTION | `boolean` |
| `geometry_overleft` | FUNCTION | `boolean` |
| `geometry_overright` | FUNCTION | `boolean` |
| `geometry_recv` | FUNCTION | `USER-DEFINED` |
| `geometry_right` | FUNCTION | `boolean` |
| `geometry_same` | FUNCTION | `boolean` |
| `geometry_same_3d` | FUNCTION | `boolean` |
| `geometry_same_nd` | FUNCTION | `boolean` |
| `geometry_send` | FUNCTION | `bytea` |
| `geometry_sortsupport` | FUNCTION | `void` |
| `geometry_spgist_choose_2d` | FUNCTION | `void` |
| `geometry_spgist_choose_3d` | FUNCTION | `void` |
| `geometry_spgist_choose_nd` | FUNCTION | `void` |
| `geometry_spgist_compress_2d` | FUNCTION | `internal` |
| `geometry_spgist_compress_3d` | FUNCTION | `internal` |
| `geometry_spgist_compress_nd` | FUNCTION | `internal` |
| `geometry_spgist_config_2d` | FUNCTION | `void` |
| `geometry_spgist_config_3d` | FUNCTION | `void` |
| `geometry_spgist_config_nd` | FUNCTION | `void` |
| `geometry_spgist_inner_consistent_2d` | FUNCTION | `void` |
| `geometry_spgist_inner_consistent_3d` | FUNCTION | `void` |
| `geometry_spgist_inner_consistent_nd` | FUNCTION | `void` |
| `geometry_spgist_leaf_consistent_2d` | FUNCTION | `boolean` |
| `geometry_spgist_leaf_consistent_3d` | FUNCTION | `boolean` |
| `geometry_spgist_leaf_consistent_nd` | FUNCTION | `boolean` |
| `geometry_spgist_picksplit_2d` | FUNCTION | `void` |
| `geometry_spgist_picksplit_3d` | FUNCTION | `void` |
| `geometry_spgist_picksplit_nd` | FUNCTION | `void` |
| `geometry_typmod_in` | FUNCTION | `integer` |
| `geometry_typmod_out` | FUNCTION | `cstring` |
| `geometry_within` | FUNCTION | `boolean` |
| `geometry_within_nd` | FUNCTION | `boolean` |
| `geometrytype` | FUNCTION | `text` |
| `geometrytype` | FUNCTION | `text` |
| `geomfromewkb` | FUNCTION | `USER-DEFINED` |
| `geomfromewkt` | FUNCTION | `USER-DEFINED` |
| `get_proj4_from_srid` | FUNCTION | `text` |
| `gettransactionid` | FUNCTION | `xid` |
| `gidx_in` | FUNCTION | `USER-DEFINED` |
| `gidx_out` | FUNCTION | `cstring` |
| `gin_extract_query_trgm` | FUNCTION | `internal` |
| `gin_extract_value_trgm` | FUNCTION | `internal` |
| `gin_trgm_consistent` | FUNCTION | `boolean` |
| `gin_trgm_triconsistent` | FUNCTION | `"char"` |
| `gserialized_gist_joinsel_2d` | FUNCTION | `double precision` |
| `gserialized_gist_joinsel_nd` | FUNCTION | `double precision` |
| `gserialized_gist_sel_2d` | FUNCTION | `double precision` |
| `gserialized_gist_sel_nd` | FUNCTION | `double precision` |
| `gtrgm_compress` | FUNCTION | `internal` |
| `gtrgm_consistent` | FUNCTION | `boolean` |
| `gtrgm_decompress` | FUNCTION | `internal` |
| `gtrgm_distance` | FUNCTION | `double precision` |
| `gtrgm_in` | FUNCTION | `USER-DEFINED` |
| `gtrgm_options` | FUNCTION | `void` |
| `gtrgm_out` | FUNCTION | `cstring` |
| `gtrgm_penalty` | FUNCTION | `internal` |
| `gtrgm_picksplit` | FUNCTION | `internal` |
| `gtrgm_same` | FUNCTION | `internal` |
| `gtrgm_union` | FUNCTION | `USER-DEFINED` |
| `halfvec` | FUNCTION | `USER-DEFINED` |
| `halfvec_accum` | FUNCTION | `ARRAY` |
| `halfvec_add` | FUNCTION | `USER-DEFINED` |
| `halfvec_avg` | FUNCTION | `USER-DEFINED` |
| `halfvec_cmp` | FUNCTION | `integer` |
| `halfvec_combine` | FUNCTION | `ARRAY` |
| `halfvec_concat` | FUNCTION | `USER-DEFINED` |
| `halfvec_eq` | FUNCTION | `boolean` |
| `halfvec_ge` | FUNCTION | `boolean` |
| `halfvec_gt` | FUNCTION | `boolean` |
| `halfvec_in` | FUNCTION | `USER-DEFINED` |
| `halfvec_l2_squared_distance` | FUNCTION | `double precision` |
| `halfvec_le` | FUNCTION | `boolean` |
| `halfvec_lt` | FUNCTION | `boolean` |
| `halfvec_mul` | FUNCTION | `USER-DEFINED` |
| `halfvec_ne` | FUNCTION | `boolean` |
| `halfvec_negative_inner_product` | FUNCTION | `double precision` |
| `halfvec_out` | FUNCTION | `cstring` |
| `halfvec_recv` | FUNCTION | `USER-DEFINED` |
| `halfvec_send` | FUNCTION | `bytea` |
| `halfvec_spherical_distance` | FUNCTION | `double precision` |
| `halfvec_sub` | FUNCTION | `USER-DEFINED` |
| `halfvec_to_float4` | FUNCTION | `ARRAY` |
| `halfvec_to_sparsevec` | FUNCTION | `USER-DEFINED` |
| `halfvec_to_vector` | FUNCTION | `USER-DEFINED` |
| `halfvec_typmod_in` | FUNCTION | `integer` |
| `hamming_distance` | FUNCTION | `double precision` |
| `handle_new_user` | FUNCTION | `trigger` |
| `hnsw_bit_support` | FUNCTION | `internal` |
| `hnsw_halfvec_support` | FUNCTION | `internal` |
| `hnsw_sparsevec_support` | FUNCTION | `internal` |
| `hnswhandler` | FUNCTION | `index_am_handler` |
| `hybrid_plant_search` | FUNCTION | `record` |
| `increment_bookmarks` | FUNCTION | `void` |
| `increment_comments` | FUNCTION | `void` |
| `increment_likes` | FUNCTION | `void` |
| `inner_product` | FUNCTION | `double precision` |
| `inner_product` | FUNCTION | `double precision` |
| `inner_product` | FUNCTION | `double precision` |
| `is_contained_2d` | FUNCTION | `boolean` |
| `is_contained_2d` | FUNCTION | `boolean` |
| `is_contained_2d` | FUNCTION | `boolean` |
| `ivfflat_bit_support` | FUNCTION | `internal` |
| `ivfflat_halfvec_support` | FUNCTION | `internal` |
| `ivfflathandler` | FUNCTION | `index_am_handler` |
| `jaccard_distance` | FUNCTION | `double precision` |
| `json` | FUNCTION | `json` |
| `jsonb` | FUNCTION | `jsonb` |
| `l1_distance` | FUNCTION | `double precision` |
| `l1_distance` | FUNCTION | `double precision` |
| `l1_distance` | FUNCTION | `double precision` |
| `l2_distance` | FUNCTION | `double precision` |
| `l2_distance` | FUNCTION | `double precision` |
| `l2_distance` | FUNCTION | `double precision` |
| `l2_norm` | FUNCTION | `double precision` |
| `l2_norm` | FUNCTION | `double precision` |
| `l2_normalize` | FUNCTION | `USER-DEFINED` |
| `l2_normalize` | FUNCTION | `USER-DEFINED` |
| `l2_normalize` | FUNCTION | `USER-DEFINED` |
| `lockrow` | FUNCTION | `integer` |
| `lockrow` | FUNCTION | `integer` |
| `lockrow` | FUNCTION | `integer` |
| `lockrow` | FUNCTION | `integer` |
| `longtransactionsenabled` | FUNCTION | `boolean` |
| `match_plant_knowledge` | FUNCTION | `record` |
| `nearby_plants` | FUNCTION | `record` |
| `nearby_plants` | FUNCTION | `record` |
| `overlaps_2d` | FUNCTION | `boolean` |
| `overlaps_2d` | FUNCTION | `boolean` |
| `overlaps_2d` | FUNCTION | `boolean` |
| `overlaps_geog` | FUNCTION | `boolean` |
| `overlaps_geog` | FUNCTION | `boolean` |
| `overlaps_geog` | FUNCTION | `boolean` |
| `overlaps_nd` | FUNCTION | `boolean` |
| `overlaps_nd` | FUNCTION | `boolean` |
| `overlaps_nd` | FUNCTION | `boolean` |
| `path` | FUNCTION | `path` |
| `pgis_asflatgeobuf_finalfn` | FUNCTION | `bytea` |
| `pgis_asflatgeobuf_transfn` | FUNCTION | `internal` |
| `pgis_asflatgeobuf_transfn` | FUNCTION | `internal` |
| `pgis_asflatgeobuf_transfn` | FUNCTION | `internal` |
| `pgis_asgeobuf_finalfn` | FUNCTION | `bytea` |
| `pgis_asgeobuf_transfn` | FUNCTION | `internal` |
| `pgis_asgeobuf_transfn` | FUNCTION | `internal` |
| `pgis_asmvt_combinefn` | FUNCTION | `internal` |
| `pgis_asmvt_deserialfn` | FUNCTION | `internal` |
| `pgis_asmvt_finalfn` | FUNCTION | `bytea` |
| `pgis_asmvt_serialfn` | FUNCTION | `bytea` |
| `pgis_asmvt_transfn` | FUNCTION | `internal` |
| `pgis_asmvt_transfn` | FUNCTION | `internal` |
| `pgis_asmvt_transfn` | FUNCTION | `internal` |
| `pgis_asmvt_transfn` | FUNCTION | `internal` |
| `pgis_asmvt_transfn` | FUNCTION | `internal` |
| `pgis_geometry_accum_transfn` | FUNCTION | `internal` |
| `pgis_geometry_accum_transfn` | FUNCTION | `internal` |
| `pgis_geometry_accum_transfn` | FUNCTION | `internal` |
| `pgis_geometry_clusterintersecting_finalfn` | FUNCTION | `ARRAY` |
| `pgis_geometry_clusterwithin_finalfn` | FUNCTION | `ARRAY` |
| `pgis_geometry_collect_finalfn` | FUNCTION | `USER-DEFINED` |
| `pgis_geometry_makeline_finalfn` | FUNCTION | `USER-DEFINED` |
| `pgis_geometry_polygonize_finalfn` | FUNCTION | `USER-DEFINED` |
| `pgis_geometry_union_parallel_combinefn` | FUNCTION | `internal` |
| `pgis_geometry_union_parallel_deserialfn` | FUNCTION | `internal` |
| `pgis_geometry_union_parallel_finalfn` | FUNCTION | `USER-DEFINED` |
| `pgis_geometry_union_parallel_serialfn` | FUNCTION | `bytea` |
| `pgis_geometry_union_parallel_transfn` | FUNCTION | `internal` |
| `pgis_geometry_union_parallel_transfn` | FUNCTION | `internal` |
| `point` | FUNCTION | `point` |
| `polygon` | FUNCTION | `polygon` |
| `populate_geometry_columns` | FUNCTION | `integer` |
| `populate_geometry_columns` | FUNCTION | `text` |
| `postgis_addbbox` | FUNCTION | `USER-DEFINED` |
| `postgis_cache_bbox` | FUNCTION | `trigger` |
| `postgis_constraint_dims` | FUNCTION | `integer` |
| `postgis_constraint_srid` | FUNCTION | `integer` |
| `postgis_constraint_type` | FUNCTION | `character varying` |
| `postgis_dropbbox` | FUNCTION | `USER-DEFINED` |
| `postgis_extensions_upgrade` | FUNCTION | `text` |
| `postgis_full_version` | FUNCTION | `text` |
| `postgis_geos_noop` | FUNCTION | `USER-DEFINED` |
| `postgis_geos_version` | FUNCTION | `text` |
| `postgis_getbbox` | FUNCTION | `USER-DEFINED` |
| `postgis_hasbbox` | FUNCTION | `boolean` |
| `postgis_index_supportfn` | FUNCTION | `internal` |
| `postgis_lib_build_date` | FUNCTION | `text` |
| `postgis_lib_revision` | FUNCTION | `text` |
| `postgis_lib_version` | FUNCTION | `text` |
| `postgis_libjson_version` | FUNCTION | `text` |
| `postgis_liblwgeom_version` | FUNCTION | `text` |
| `postgis_libprotobuf_version` | FUNCTION | `text` |
| `postgis_libxml_version` | FUNCTION | `text` |
| `postgis_noop` | FUNCTION | `USER-DEFINED` |
| `postgis_proj_version` | FUNCTION | `text` |
| `postgis_scripts_build_date` | FUNCTION | `text` |
| `postgis_scripts_installed` | FUNCTION | `text` |
| `postgis_scripts_released` | FUNCTION | `text` |
| `postgis_svn_version` | FUNCTION | `text` |
| `postgis_transform_geometry` | FUNCTION | `USER-DEFINED` |
| `postgis_type_name` | FUNCTION | `character varying` |
| `postgis_typmod_dims` | FUNCTION | `integer` |
| `postgis_typmod_srid` | FUNCTION | `integer` |
| `postgis_typmod_type` | FUNCTION | `text` |
| `postgis_version` | FUNCTION | `text` |
| `postgis_wagyu_version` | FUNCTION | `text` |
| `set_limit` | FUNCTION | `real` |
| `show_limit` | FUNCTION | `real` |
| `show_trgm` | FUNCTION | `ARRAY` |
| `similarity` | FUNCTION | `real` |
| `similarity_dist` | FUNCTION | `real` |
| `similarity_op` | FUNCTION | `boolean` |
| `sparsevec` | FUNCTION | `USER-DEFINED` |
| `sparsevec_cmp` | FUNCTION | `integer` |
| `sparsevec_eq` | FUNCTION | `boolean` |
| `sparsevec_ge` | FUNCTION | `boolean` |
| `sparsevec_gt` | FUNCTION | `boolean` |
| `sparsevec_in` | FUNCTION | `USER-DEFINED` |
| `sparsevec_l2_squared_distance` | FUNCTION | `double precision` |
| `sparsevec_le` | FUNCTION | `boolean` |
| `sparsevec_lt` | FUNCTION | `boolean` |
| `sparsevec_ne` | FUNCTION | `boolean` |
| `sparsevec_negative_inner_product` | FUNCTION | `double precision` |
| `sparsevec_out` | FUNCTION | `cstring` |
| `sparsevec_recv` | FUNCTION | `USER-DEFINED` |
| `sparsevec_send` | FUNCTION | `bytea` |
| `sparsevec_to_halfvec` | FUNCTION | `USER-DEFINED` |
| `sparsevec_to_vector` | FUNCTION | `USER-DEFINED` |
| `sparsevec_typmod_in` | FUNCTION | `integer` |
| `spheroid_in` | FUNCTION | `USER-DEFINED` |
| `spheroid_out` | FUNCTION | `cstring` |
| `st_3dclosestpoint` | FUNCTION | `USER-DEFINED` |
| `st_3ddfullywithin` | FUNCTION | `boolean` |
| `st_3ddistance` | FUNCTION | `double precision` |
| `st_3ddwithin` | FUNCTION | `boolean` |
| `st_3dextent` | null | `USER-DEFINED` |
| `st_3dintersects` | FUNCTION | `boolean` |
| `st_3dlength` | FUNCTION | `double precision` |
| `st_3dlineinterpolatepoint` | FUNCTION | `USER-DEFINED` |
| `st_3dlongestline` | FUNCTION | `USER-DEFINED` |
| `st_3dmakebox` | FUNCTION | `USER-DEFINED` |
| `st_3dmaxdistance` | FUNCTION | `double precision` |
| `st_3dperimeter` | FUNCTION | `double precision` |
| `st_3dshortestline` | FUNCTION | `USER-DEFINED` |
| `st_addmeasure` | FUNCTION | `USER-DEFINED` |
| `st_addpoint` | FUNCTION | `USER-DEFINED` |
| `st_addpoint` | FUNCTION | `USER-DEFINED` |
| `st_affine` | FUNCTION | `USER-DEFINED` |
| `st_affine` | FUNCTION | `USER-DEFINED` |
| `st_angle` | FUNCTION | `double precision` |
| `st_angle` | FUNCTION | `double precision` |
| `st_area` | FUNCTION | `double precision` |
| `st_area` | FUNCTION | `double precision` |
| `st_area` | FUNCTION | `double precision` |
| `st_area2d` | FUNCTION | `double precision` |
| `st_asbinary` | FUNCTION | `bytea` |
| `st_asbinary` | FUNCTION | `bytea` |
| `st_asbinary` | FUNCTION | `bytea` |
| `st_asbinary` | FUNCTION | `bytea` |
| `st_asencodedpolyline` | FUNCTION | `text` |
| `st_asewkb` | FUNCTION | `bytea` |
| `st_asewkb` | FUNCTION | `bytea` |
| `st_asewkt` | FUNCTION | `text` |
| `st_asewkt` | FUNCTION | `text` |
| `st_asewkt` | FUNCTION | `text` |
| `st_asewkt` | FUNCTION | `text` |
| `st_asewkt` | FUNCTION | `text` |
| `st_asflatgeobuf` | null | `bytea` |
| `st_asflatgeobuf` | null | `bytea` |
| `st_asflatgeobuf` | null | `bytea` |
| `st_asgeobuf` | null | `bytea` |
| `st_asgeobuf` | null | `bytea` |
| `st_asgeojson` | FUNCTION | `text` |
| `st_asgeojson` | FUNCTION | `text` |
| `st_asgeojson` | FUNCTION | `text` |
| `st_asgeojson` | FUNCTION | `text` |
| `st_asgml` | FUNCTION | `text` |
| `st_asgml` | FUNCTION | `text` |
| `st_asgml` | FUNCTION | `text` |
| `st_asgml` | FUNCTION | `text` |
| `st_asgml` | FUNCTION | `text` |
| `st_ashexewkb` | FUNCTION | `text` |
| `st_ashexewkb` | FUNCTION | `text` |
| `st_askml` | FUNCTION | `text` |
| `st_askml` | FUNCTION | `text` |
| `st_askml` | FUNCTION | `text` |
| `st_aslatlontext` | FUNCTION | `text` |
| `st_asmarc21` | FUNCTION | `text` |
| `st_asmvt` | null | `bytea` |
| `st_asmvt` | null | `bytea` |
| `st_asmvt` | null | `bytea` |
| `st_asmvt` | null | `bytea` |
| `st_asmvt` | null | `bytea` |
| `st_asmvtgeom` | FUNCTION | `USER-DEFINED` |
| `st_assvg` | FUNCTION | `text` |
| `st_assvg` | FUNCTION | `text` |
| `st_assvg` | FUNCTION | `text` |
| `st_astext` | FUNCTION | `text` |
| `st_astext` | FUNCTION | `text` |
| `st_astext` | FUNCTION | `text` |
| `st_astext` | FUNCTION | `text` |
| `st_astext` | FUNCTION | `text` |
| `st_astwkb` | FUNCTION | `bytea` |
| `st_astwkb` | FUNCTION | `bytea` |
| `st_asx3d` | FUNCTION | `text` |
| `st_azimuth` | FUNCTION | `double precision` |
| `st_azimuth` | FUNCTION | `double precision` |
| `st_bdmpolyfromtext` | FUNCTION | `USER-DEFINED` |
| `st_bdpolyfromtext` | FUNCTION | `USER-DEFINED` |
| `st_boundary` | FUNCTION | `USER-DEFINED` |
| `st_boundingdiagonal` | FUNCTION | `USER-DEFINED` |
| `st_box2dfromgeohash` | FUNCTION | `USER-DEFINED` |
| `st_buffer` | FUNCTION | `USER-DEFINED` |
| `st_buffer` | FUNCTION | `USER-DEFINED` |
| `st_buffer` | FUNCTION | `USER-DEFINED` |
| `st_buffer` | FUNCTION | `USER-DEFINED` |
| `st_buffer` | FUNCTION | `USER-DEFINED` |
| `st_buffer` | FUNCTION | `USER-DEFINED` |
| `st_buffer` | FUNCTION | `USER-DEFINED` |
| `st_buffer` | FUNCTION | `USER-DEFINED` |
| `st_buildarea` | FUNCTION | `USER-DEFINED` |
| `st_centroid` | FUNCTION | `USER-DEFINED` |
| `st_centroid` | FUNCTION | `USER-DEFINED` |
| `st_centroid` | FUNCTION | `USER-DEFINED` |
| `st_chaikinsmoothing` | FUNCTION | `USER-DEFINED` |
| `st_cleangeometry` | FUNCTION | `USER-DEFINED` |
| `st_clipbybox2d` | FUNCTION | `USER-DEFINED` |
| `st_closestpoint` | FUNCTION | `USER-DEFINED` |
| `st_closestpointofapproach` | FUNCTION | `double precision` |
| `st_clusterdbscan` | null | `integer` |
| `st_clusterintersecting` | FUNCTION | `ARRAY` |
| `st_clusterintersecting` | null | `ARRAY` |
| `st_clusterkmeans` | null | `integer` |
| `st_clusterwithin` | FUNCTION | `ARRAY` |
| `st_clusterwithin` | null | `ARRAY` |
| `st_collect` | null | `USER-DEFINED` |
| `st_collect` | FUNCTION | `USER-DEFINED` |
| `st_collect` | FUNCTION | `USER-DEFINED` |
| `st_collectionextract` | FUNCTION | `USER-DEFINED` |
| `st_collectionextract` | FUNCTION | `USER-DEFINED` |
| `st_collectionhomogenize` | FUNCTION | `USER-DEFINED` |
| `st_combinebbox` | FUNCTION | `USER-DEFINED` |
| `st_combinebbox` | FUNCTION | `USER-DEFINED` |
| `st_combinebbox` | FUNCTION | `USER-DEFINED` |
| `st_concavehull` | FUNCTION | `USER-DEFINED` |
| `st_contains` | FUNCTION | `boolean` |
| `st_containsproperly` | FUNCTION | `boolean` |
| `st_convexhull` | FUNCTION | `USER-DEFINED` |
| `st_coorddim` | FUNCTION | `smallint` |
| `st_coveredby` | FUNCTION | `boolean` |
| `st_coveredby` | FUNCTION | `boolean` |
| `st_coveredby` | FUNCTION | `boolean` |
| `st_covers` | FUNCTION | `boolean` |
| `st_covers` | FUNCTION | `boolean` |
| `st_covers` | FUNCTION | `boolean` |
| `st_cpawithin` | FUNCTION | `boolean` |
| `st_crosses` | FUNCTION | `boolean` |
| `st_curvetoline` | FUNCTION | `USER-DEFINED` |
| `st_delaunaytriangles` | FUNCTION | `USER-DEFINED` |
| `st_dfullywithin` | FUNCTION | `boolean` |
| `st_difference` | FUNCTION | `USER-DEFINED` |
| `st_dimension` | FUNCTION | `integer` |
| `st_disjoint` | FUNCTION | `boolean` |
| `st_distance` | FUNCTION | `double precision` |
| `st_distance` | FUNCTION | `double precision` |
| `st_distance` | FUNCTION | `double precision` |
| `st_distancecpa` | FUNCTION | `double precision` |
| `st_distancesphere` | FUNCTION | `double precision` |
| `st_distancesphere` | FUNCTION | `double precision` |
| `st_distancespheroid` | FUNCTION | `double precision` |
| `st_distancespheroid` | FUNCTION | `double precision` |
| `st_dump` | FUNCTION | `USER-DEFINED` |
| `st_dumppoints` | FUNCTION | `USER-DEFINED` |
| `st_dumprings` | FUNCTION | `USER-DEFINED` |
| `st_dumpsegments` | FUNCTION | `USER-DEFINED` |
| `st_dwithin` | FUNCTION | `boolean` |
| `st_dwithin` | FUNCTION | `boolean` |
| `st_dwithin` | FUNCTION | `boolean` |
| `st_endpoint` | FUNCTION | `USER-DEFINED` |
| `st_envelope` | FUNCTION | `USER-DEFINED` |
| `st_equals` | FUNCTION | `boolean` |
| `st_estimatedextent` | FUNCTION | `USER-DEFINED` |
| `st_estimatedextent` | FUNCTION | `USER-DEFINED` |
| `st_estimatedextent` | FUNCTION | `USER-DEFINED` |
| `st_expand` | FUNCTION | `USER-DEFINED` |
| `st_expand` | FUNCTION | `USER-DEFINED` |
| `st_expand` | FUNCTION | `USER-DEFINED` |
| `st_expand` | FUNCTION | `USER-DEFINED` |
| `st_expand` | FUNCTION | `USER-DEFINED` |
| `st_expand` | FUNCTION | `USER-DEFINED` |
| `st_extent` | null | `USER-DEFINED` |
| `st_exteriorring` | FUNCTION | `USER-DEFINED` |
| `st_filterbym` | FUNCTION | `USER-DEFINED` |
| `st_findextent` | FUNCTION | `USER-DEFINED` |
| `st_findextent` | FUNCTION | `USER-DEFINED` |
| `st_flipcoordinates` | FUNCTION | `USER-DEFINED` |
| `st_force2d` | FUNCTION | `USER-DEFINED` |
| `st_force3d` | FUNCTION | `USER-DEFINED` |
| `st_force3dm` | FUNCTION | `USER-DEFINED` |
| `st_force3dz` | FUNCTION | `USER-DEFINED` |
| `st_force4d` | FUNCTION | `USER-DEFINED` |
| `st_forcecollection` | FUNCTION | `USER-DEFINED` |
| `st_forcecurve` | FUNCTION | `USER-DEFINED` |
| `st_forcepolygonccw` | FUNCTION | `USER-DEFINED` |
| `st_forcepolygoncw` | FUNCTION | `USER-DEFINED` |
| `st_forcerhr` | FUNCTION | `USER-DEFINED` |
| `st_forcesfs` | FUNCTION | `USER-DEFINED` |
| `st_forcesfs` | FUNCTION | `USER-DEFINED` |
| `st_frechetdistance` | FUNCTION | `double precision` |
| `st_fromflatgeobuf` | FUNCTION | `anyelement` |
| `st_fromflatgeobuftotable` | FUNCTION | `void` |
| `st_generatepoints` | FUNCTION | `USER-DEFINED` |
| `st_generatepoints` | FUNCTION | `USER-DEFINED` |
| `st_geogfromtext` | FUNCTION | `USER-DEFINED` |
| `st_geogfromwkb` | FUNCTION | `USER-DEFINED` |
| `st_geographyfromtext` | FUNCTION | `USER-DEFINED` |
| `st_geohash` | FUNCTION | `text` |
| `st_geohash` | FUNCTION | `text` |
| `st_geomcollfromtext` | FUNCTION | `USER-DEFINED` |
| `st_geomcollfromtext` | FUNCTION | `USER-DEFINED` |
| `st_geomcollfromwkb` | FUNCTION | `USER-DEFINED` |
| `st_geomcollfromwkb` | FUNCTION | `USER-DEFINED` |
| `st_geometricmedian` | FUNCTION | `USER-DEFINED` |
| `st_geometryfromtext` | FUNCTION | `USER-DEFINED` |
| `st_geometryfromtext` | FUNCTION | `USER-DEFINED` |
| `st_geometryn` | FUNCTION | `USER-DEFINED` |
| `st_geometrytype` | FUNCTION | `text` |
| `st_geomfromewkb` | FUNCTION | `USER-DEFINED` |
| `st_geomfromewkt` | FUNCTION | `USER-DEFINED` |
| `st_geomfromgeohash` | FUNCTION | `USER-DEFINED` |
| `st_geomfromgeojson` | FUNCTION | `USER-DEFINED` |
| `st_geomfromgeojson` | FUNCTION | `USER-DEFINED` |
| `st_geomfromgeojson` | FUNCTION | `USER-DEFINED` |
| `st_geomfromgml` | FUNCTION | `USER-DEFINED` |
| `st_geomfromgml` | FUNCTION | `USER-DEFINED` |
| `st_geomfromkml` | FUNCTION | `USER-DEFINED` |
| `st_geomfrommarc21` | FUNCTION | `USER-DEFINED` |
| `st_geomfromtext` | FUNCTION | `USER-DEFINED` |
| `st_geomfromtext` | FUNCTION | `USER-DEFINED` |
| `st_geomfromtwkb` | FUNCTION | `USER-DEFINED` |
| `st_geomfromwkb` | FUNCTION | `USER-DEFINED` |
| `st_geomfromwkb` | FUNCTION | `USER-DEFINED` |
| `st_gmltosql` | FUNCTION | `USER-DEFINED` |
| `st_gmltosql` | FUNCTION | `USER-DEFINED` |
| `st_hasarc` | FUNCTION | `boolean` |
| `st_hausdorffdistance` | FUNCTION | `double precision` |
| `st_hausdorffdistance` | FUNCTION | `double precision` |
| `st_hexagon` | FUNCTION | `USER-DEFINED` |
| `st_hexagongrid` | FUNCTION | `record` |
| `st_interiorringn` | FUNCTION | `USER-DEFINED` |
| `st_interpolatepoint` | FUNCTION | `double precision` |
| `st_intersection` | FUNCTION | `USER-DEFINED` |
| `st_intersection` | FUNCTION | `USER-DEFINED` |
| `st_intersection` | FUNCTION | `USER-DEFINED` |
| `st_intersects` | FUNCTION | `boolean` |
| `st_intersects` | FUNCTION | `boolean` |
| `st_intersects` | FUNCTION | `boolean` |
| `st_isclosed` | FUNCTION | `boolean` |
| `st_iscollection` | FUNCTION | `boolean` |
| `st_isempty` | FUNCTION | `boolean` |
| `st_ispolygonccw` | FUNCTION | `boolean` |
| `st_ispolygoncw` | FUNCTION | `boolean` |
| `st_isring` | FUNCTION | `boolean` |
| `st_issimple` | FUNCTION | `boolean` |
| `st_isvalid` | FUNCTION | `boolean` |
| `st_isvalid` | FUNCTION | `boolean` |
| `st_isvaliddetail` | FUNCTION | `USER-DEFINED` |
| `st_isvalidreason` | FUNCTION | `text` |
| `st_isvalidreason` | FUNCTION | `text` |
| `st_isvalidtrajectory` | FUNCTION | `boolean` |
| `st_length` | FUNCTION | `double precision` |
| `st_length` | FUNCTION | `double precision` |
| `st_length` | FUNCTION | `double precision` |
| `st_length2d` | FUNCTION | `double precision` |
| `st_length2dspheroid` | FUNCTION | `double precision` |
| `st_lengthspheroid` | FUNCTION | `double precision` |
| `st_letters` | FUNCTION | `USER-DEFINED` |
| `st_linecrossingdirection` | FUNCTION | `integer` |
| `st_linefromencodedpolyline` | FUNCTION | `USER-DEFINED` |
| `st_linefrommultipoint` | FUNCTION | `USER-DEFINED` |
| `st_linefromtext` | FUNCTION | `USER-DEFINED` |
| `st_linefromtext` | FUNCTION | `USER-DEFINED` |
| `st_linefromwkb` | FUNCTION | `USER-DEFINED` |
| `st_linefromwkb` | FUNCTION | `USER-DEFINED` |
| `st_lineinterpolatepoint` | FUNCTION | `USER-DEFINED` |
| `st_lineinterpolatepoints` | FUNCTION | `USER-DEFINED` |
| `st_linelocatepoint` | FUNCTION | `double precision` |
| `st_linemerge` | FUNCTION | `USER-DEFINED` |
| `st_linemerge` | FUNCTION | `USER-DEFINED` |
| `st_linestringfromwkb` | FUNCTION | `USER-DEFINED` |
| `st_linestringfromwkb` | FUNCTION | `USER-DEFINED` |
| `st_linesubstring` | FUNCTION | `USER-DEFINED` |
| `st_linetocurve` | FUNCTION | `USER-DEFINED` |
| `st_locatealong` | FUNCTION | `USER-DEFINED` |
| `st_locatebetween` | FUNCTION | `USER-DEFINED` |
| `st_locatebetweenelevations` | FUNCTION | `USER-DEFINED` |
| `st_longestline` | FUNCTION | `USER-DEFINED` |
| `st_m` | FUNCTION | `double precision` |
| `st_makebox2d` | FUNCTION | `USER-DEFINED` |
| `st_makeenvelope` | FUNCTION | `USER-DEFINED` |
| `st_makeline` | null | `USER-DEFINED` |
| `st_makeline` | FUNCTION | `USER-DEFINED` |
| `st_makeline` | FUNCTION | `USER-DEFINED` |
| `st_makepoint` | FUNCTION | `USER-DEFINED` |
| `st_makepoint` | FUNCTION | `USER-DEFINED` |
| `st_makepoint` | FUNCTION | `USER-DEFINED` |
| `st_makepointm` | FUNCTION | `USER-DEFINED` |
| `st_makepolygon` | FUNCTION | `USER-DEFINED` |
| `st_makepolygon` | FUNCTION | `USER-DEFINED` |
| `st_makevalid` | FUNCTION | `USER-DEFINED` |
| `st_makevalid` | FUNCTION | `USER-DEFINED` |
| `st_maxdistance` | FUNCTION | `double precision` |
| `st_maximuminscribedcircle` | FUNCTION | `record` |
| `st_memcollect` | null | `USER-DEFINED` |
| `st_memsize` | FUNCTION | `integer` |
| `st_memunion` | null | `USER-DEFINED` |
| `st_minimumboundingcircle` | FUNCTION | `USER-DEFINED` |
| `st_minimumboundingradius` | FUNCTION | `record` |
| `st_minimumclearance` | FUNCTION | `double precision` |
| `st_minimumclearanceline` | FUNCTION | `USER-DEFINED` |
| `st_mlinefromtext` | FUNCTION | `USER-DEFINED` |
| `st_mlinefromtext` | FUNCTION | `USER-DEFINED` |
| `st_mlinefromwkb` | FUNCTION | `USER-DEFINED` |
| `st_mlinefromwkb` | FUNCTION | `USER-DEFINED` |
| `st_mpointfromtext` | FUNCTION | `USER-DEFINED` |
| `st_mpointfromtext` | FUNCTION | `USER-DEFINED` |
| `st_mpointfromwkb` | FUNCTION | `USER-DEFINED` |
| `st_mpointfromwkb` | FUNCTION | `USER-DEFINED` |
| `st_mpolyfromtext` | FUNCTION | `USER-DEFINED` |
| `st_mpolyfromtext` | FUNCTION | `USER-DEFINED` |
| `st_mpolyfromwkb` | FUNCTION | `USER-DEFINED` |
| `st_mpolyfromwkb` | FUNCTION | `USER-DEFINED` |
| `st_multi` | FUNCTION | `USER-DEFINED` |
| `st_multilinefromwkb` | FUNCTION | `USER-DEFINED` |
| `st_multilinestringfromtext` | FUNCTION | `USER-DEFINED` |
| `st_multilinestringfromtext` | FUNCTION | `USER-DEFINED` |
| `st_multipointfromtext` | FUNCTION | `USER-DEFINED` |
| `st_multipointfromwkb` | FUNCTION | `USER-DEFINED` |
| `st_multipointfromwkb` | FUNCTION | `USER-DEFINED` |
| `st_multipolyfromwkb` | FUNCTION | `USER-DEFINED` |
| `st_multipolyfromwkb` | FUNCTION | `USER-DEFINED` |
| `st_multipolygonfromtext` | FUNCTION | `USER-DEFINED` |
| `st_multipolygonfromtext` | FUNCTION | `USER-DEFINED` |
| `st_ndims` | FUNCTION | `smallint` |
| `st_node` | FUNCTION | `USER-DEFINED` |
| `st_normalize` | FUNCTION | `USER-DEFINED` |
| `st_npoints` | FUNCTION | `integer` |
| `st_nrings` | FUNCTION | `integer` |
| `st_numgeometries` | FUNCTION | `integer` |
| `st_numinteriorring` | FUNCTION | `integer` |
| `st_numinteriorrings` | FUNCTION | `integer` |
| `st_numpatches` | FUNCTION | `integer` |
| `st_numpoints` | FUNCTION | `integer` |
| `st_offsetcurve` | FUNCTION | `USER-DEFINED` |
| `st_orderingequals` | FUNCTION | `boolean` |
| `st_orientedenvelope` | FUNCTION | `USER-DEFINED` |
| `st_overlaps` | FUNCTION | `boolean` |
| `st_patchn` | FUNCTION | `USER-DEFINED` |
| `st_perimeter` | FUNCTION | `double precision` |
| `st_perimeter` | FUNCTION | `double precision` |
| `st_perimeter2d` | FUNCTION | `double precision` |
| `st_point` | FUNCTION | `USER-DEFINED` |
| `st_point` | FUNCTION | `USER-DEFINED` |
| `st_pointfromgeohash` | FUNCTION | `USER-DEFINED` |
| `st_pointfromtext` | FUNCTION | `USER-DEFINED` |
| `st_pointfromtext` | FUNCTION | `USER-DEFINED` |
| `st_pointfromwkb` | FUNCTION | `USER-DEFINED` |
| `st_pointfromwkb` | FUNCTION | `USER-DEFINED` |
| `st_pointinsidecircle` | FUNCTION | `boolean` |
| `st_pointm` | FUNCTION | `USER-DEFINED` |
| `st_pointn` | FUNCTION | `USER-DEFINED` |
| `st_pointonsurface` | FUNCTION | `USER-DEFINED` |
| `st_points` | FUNCTION | `USER-DEFINED` |
| `st_pointz` | FUNCTION | `USER-DEFINED` |
| `st_pointzm` | FUNCTION | `USER-DEFINED` |
| `st_polyfromtext` | FUNCTION | `USER-DEFINED` |
| `st_polyfromtext` | FUNCTION | `USER-DEFINED` |
| `st_polyfromwkb` | FUNCTION | `USER-DEFINED` |
| `st_polyfromwkb` | FUNCTION | `USER-DEFINED` |
| `st_polygon` | FUNCTION | `USER-DEFINED` |
| `st_polygonfromtext` | FUNCTION | `USER-DEFINED` |
| `st_polygonfromtext` | FUNCTION | `USER-DEFINED` |
| `st_polygonfromwkb` | FUNCTION | `USER-DEFINED` |
| `st_polygonfromwkb` | FUNCTION | `USER-DEFINED` |
| `st_polygonize` | FUNCTION | `USER-DEFINED` |
| `st_polygonize` | null | `USER-DEFINED` |
| `st_project` | FUNCTION | `USER-DEFINED` |
| `st_quantizecoordinates` | FUNCTION | `USER-DEFINED` |
| `st_reduceprecision` | FUNCTION | `USER-DEFINED` |
| `st_relate` | FUNCTION | `boolean` |
| `st_relate` | FUNCTION | `text` |
| `st_relate` | FUNCTION | `text` |
| `st_relatematch` | FUNCTION | `boolean` |
| `st_removepoint` | FUNCTION | `USER-DEFINED` |
| `st_removerepeatedpoints` | FUNCTION | `USER-DEFINED` |
| `st_reverse` | FUNCTION | `USER-DEFINED` |
| `st_rotate` | FUNCTION | `USER-DEFINED` |
| `st_rotate` | FUNCTION | `USER-DEFINED` |
| `st_rotate` | FUNCTION | `USER-DEFINED` |
| `st_rotatex` | FUNCTION | `USER-DEFINED` |
| `st_rotatey` | FUNCTION | `USER-DEFINED` |
| `st_rotatez` | FUNCTION | `USER-DEFINED` |
| `st_scale` | FUNCTION | `USER-DEFINED` |
| `st_scale` | FUNCTION | `USER-DEFINED` |
| `st_scale` | FUNCTION | `USER-DEFINED` |
| `st_scale` | FUNCTION | `USER-DEFINED` |
| `st_scroll` | FUNCTION | `USER-DEFINED` |
| `st_segmentize` | FUNCTION | `USER-DEFINED` |
| `st_segmentize` | FUNCTION | `USER-DEFINED` |
| `st_seteffectivearea` | FUNCTION | `USER-DEFINED` |
| `st_setpoint` | FUNCTION | `USER-DEFINED` |
| `st_setsrid` | FUNCTION | `USER-DEFINED` |
| `st_setsrid` | FUNCTION | `USER-DEFINED` |
| `st_sharedpaths` | FUNCTION | `USER-DEFINED` |
| `st_shiftlongitude` | FUNCTION | `USER-DEFINED` |
| `st_shortestline` | FUNCTION | `USER-DEFINED` |
| `st_simplify` | FUNCTION | `USER-DEFINED` |
| `st_simplify` | FUNCTION | `USER-DEFINED` |
| `st_simplifypolygonhull` | FUNCTION | `USER-DEFINED` |
| `st_simplifypreservetopology` | FUNCTION | `USER-DEFINED` |
| `st_simplifyvw` | FUNCTION | `USER-DEFINED` |
| `st_snap` | FUNCTION | `USER-DEFINED` |
| `st_snaptogrid` | FUNCTION | `USER-DEFINED` |
| `st_snaptogrid` | FUNCTION | `USER-DEFINED` |
| `st_snaptogrid` | FUNCTION | `USER-DEFINED` |
| `st_snaptogrid` | FUNCTION | `USER-DEFINED` |
| `st_split` | FUNCTION | `USER-DEFINED` |
| `st_square` | FUNCTION | `USER-DEFINED` |
| `st_squaregrid` | FUNCTION | `record` |
| `st_srid` | FUNCTION | `integer` |
| `st_srid` | FUNCTION | `integer` |
| `st_startpoint` | FUNCTION | `USER-DEFINED` |
| `st_subdivide` | FUNCTION | `USER-DEFINED` |
| `st_summary` | FUNCTION | `text` |
| `st_summary` | FUNCTION | `text` |
| `st_swapordinates` | FUNCTION | `USER-DEFINED` |
| `st_symdifference` | FUNCTION | `USER-DEFINED` |
| `st_symmetricdifference` | FUNCTION | `USER-DEFINED` |
| `st_tileenvelope` | FUNCTION | `USER-DEFINED` |
| `st_touches` | FUNCTION | `boolean` |
| `st_transform` | FUNCTION | `USER-DEFINED` |
| `st_transform` | FUNCTION | `USER-DEFINED` |
| `st_transform` | FUNCTION | `USER-DEFINED` |
| `st_transform` | FUNCTION | `USER-DEFINED` |
| `st_translate` | FUNCTION | `USER-DEFINED` |
| `st_translate` | FUNCTION | `USER-DEFINED` |
| `st_transscale` | FUNCTION | `USER-DEFINED` |
| `st_triangulatepolygon` | FUNCTION | `USER-DEFINED` |
| `st_unaryunion` | FUNCTION | `USER-DEFINED` |
| `st_union` | FUNCTION | `USER-DEFINED` |
| `st_union` | null | `USER-DEFINED` |
| `st_union` | null | `USER-DEFINED` |
| `st_union` | FUNCTION | `USER-DEFINED` |
| `st_union` | FUNCTION | `USER-DEFINED` |
| `st_voronoilines` | FUNCTION | `USER-DEFINED` |
| `st_voronoipolygons` | FUNCTION | `USER-DEFINED` |
| `st_within` | FUNCTION | `boolean` |
| `st_wkbtosql` | FUNCTION | `USER-DEFINED` |
| `st_wkttosql` | FUNCTION | `USER-DEFINED` |
| `st_wrapx` | FUNCTION | `USER-DEFINED` |
| `st_x` | FUNCTION | `double precision` |
| `st_xmax` | FUNCTION | `double precision` |
| `st_xmin` | FUNCTION | `double precision` |
| `st_y` | FUNCTION | `double precision` |
| `st_ymax` | FUNCTION | `double precision` |
| `st_ymin` | FUNCTION | `double precision` |
| `st_z` | FUNCTION | `double precision` |
| `st_zmax` | FUNCTION | `double precision` |
| `st_zmflag` | FUNCTION | `smallint` |
| `st_zmin` | FUNCTION | `double precision` |
| `strict_word_similarity` | FUNCTION | `real` |
| `strict_word_similarity_commutator_op` | FUNCTION | `boolean` |
| `strict_word_similarity_dist_commutator_op` | FUNCTION | `real` |
| `strict_word_similarity_dist_op` | FUNCTION | `real` |
| `strict_word_similarity_op` | FUNCTION | `boolean` |
| `subvector` | FUNCTION | `USER-DEFINED` |
| `subvector` | FUNCTION | `USER-DEFINED` |
| `sum` | null | `USER-DEFINED` |
| `sum` | null | `USER-DEFINED` |
| `text` | FUNCTION | `text` |
| `unlockrows` | FUNCTION | `integer` |
| `updategeometrysrid` | FUNCTION | `text` |
| `updategeometrysrid` | FUNCTION | `text` |
| `updategeometrysrid` | FUNCTION | `text` |
| `vector` | FUNCTION | `USER-DEFINED` |
| `vector_accum` | FUNCTION | `ARRAY` |
| `vector_add` | FUNCTION | `USER-DEFINED` |
| `vector_avg` | FUNCTION | `USER-DEFINED` |
| `vector_cmp` | FUNCTION | `integer` |
| `vector_combine` | FUNCTION | `ARRAY` |
| `vector_concat` | FUNCTION | `USER-DEFINED` |
| `vector_dims` | FUNCTION | `integer` |
| `vector_dims` | FUNCTION | `integer` |
| `vector_eq` | FUNCTION | `boolean` |
| `vector_ge` | FUNCTION | `boolean` |
| `vector_gt` | FUNCTION | `boolean` |
| `vector_in` | FUNCTION | `USER-DEFINED` |
| `vector_l2_squared_distance` | FUNCTION | `double precision` |
| `vector_le` | FUNCTION | `boolean` |
| `vector_lt` | FUNCTION | `boolean` |
| `vector_mul` | FUNCTION | `USER-DEFINED` |
| `vector_ne` | FUNCTION | `boolean` |
| `vector_negative_inner_product` | FUNCTION | `double precision` |
| `vector_norm` | FUNCTION | `double precision` |
| `vector_out` | FUNCTION | `cstring` |
| `vector_recv` | FUNCTION | `USER-DEFINED` |
| `vector_send` | FUNCTION | `bytea` |
| `vector_spherical_distance` | FUNCTION | `double precision` |
| `vector_sub` | FUNCTION | `USER-DEFINED` |
| `vector_to_float4` | FUNCTION | `ARRAY` |
| `vector_to_halfvec` | FUNCTION | `USER-DEFINED` |
| `vector_to_sparsevec` | FUNCTION | `USER-DEFINED` |
| `vector_typmod_in` | FUNCTION | `integer` |
| `word_similarity` | FUNCTION | `real` |
| `word_similarity_commutator_op` | FUNCTION | `boolean` |
| `word_similarity_dist_commutator_op` | FUNCTION | `real` |
| `word_similarity_dist_op` | FUNCTION | `real` |
| `word_similarity_op` | FUNCTION | `boolean` |

> Full function definitions are in `09_functions.json`.

---

## 9. Triggers

Total Triggers: **0**

_No triggers found._

