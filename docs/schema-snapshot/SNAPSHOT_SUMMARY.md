# Supabase Database Schema Snapshot Summary

**Snapshot Date & Time:** 2026-09-15 17:14:28 IST (2026-09-15 11:44:28 UTC)  
**Project Ref:** `eopmwvdmgzxoaxqqfsdq` (GreenGuard)

---

## 1. Tables & Row Counts (Public Schema)

Total Tables Found: **16**

| Table Name | Row Count |
| :--- | :--- |
| `adoptions` | 0 |
| `bookmarks` | 0 |
| `comments` | 0 |
| `follows` | 0 |
| `growth_reports` | 0 |
| `likes` | 0 |
| `ngo_profiles` | 0 |
| `notifications` | 0 |
| `plant_knowledge` | 0 |
| `plants` | 0 |
| `posts` | 0 |
| `profiles` | 0 |
| `saved_plants` | 0 |
| `spatial_ref_sys` | 0 |
| `user_plants` | 0 |
| `user_reports` | 0 |

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
