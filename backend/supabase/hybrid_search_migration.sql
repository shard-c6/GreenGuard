-- ════════════════════════════════════════════════════════════════
-- Advanced RAG: Hybrid Search Implementation
-- ════════════════════════════════════════════════════════════════

-- 1. Enable pg_trgm for better text matching if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Add a generated column for full-text search to plant_knowledge
-- This combines name, scientific name, and the actual content
ALTER TABLE public.plant_knowledge 
ADD COLUMN IF NOT EXISTS fts tsvector GENERATED ALWAYS AS (
  to_tsvector('english', coalesce(plant_name, '') || ' ' || coalesce(scientific_name, '') || ' ' || coalesce(content, ''))
) STORED;

-- 3. Create a GIN index for fast keyword lookups
CREATE INDEX IF NOT EXISTS idx_plant_knowledge_fts ON public.plant_knowledge USING GIN (fts);

-- 4. Create the Hybrid Search RPC
-- This uses Reciprocal Rank Fusion (RRF) to combine Vector and Keyword results
CREATE OR REPLACE FUNCTION hybrid_plant_search(
  query_text TEXT,
  query_embedding VECTOR(768),
  match_count INT DEFAULT 5,
  match_threshold FLOAT DEFAULT 0.2
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  scientific_name TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  WITH semantic_search AS (
    SELECT 
      pk.id, 
      pk.content, 
      pk.scientific_name,
      1 - (pk.embedding <=> query_embedding) AS score,
      ROW_NUMBER() OVER (ORDER BY pk.embedding <=> query_embedding) as rank
    FROM public.plant_knowledge pk
    WHERE 1 - (pk.embedding <=> query_embedding) > match_threshold
    LIMIT match_count * 2
  ),
  keyword_search AS (
    SELECT 
      pk.id, 
      pk.content, 
      pk.scientific_name,
      ts_rank_cd(pk.fts, websearch_to_tsquery('english', query_text)) AS score,
      ROW_NUMBER() OVER (ORDER BY ts_rank_cd(pk.fts, websearch_to_tsquery('english', query_text)) DESC) as rank
    FROM public.plant_knowledge pk
    WHERE pk.fts @@ websearch_to_tsquery('english', query_text)
    LIMIT match_count * 2
  )
  SELECT 
    COALESCE(s.id, k.id) as id,
    COALESCE(s.content, k.content) as content,
    COALESCE(s.scientific_name, k.scientific_name) as scientific_name,
    (
      COALESCE(1.0::FLOAT8 / (60 + s.rank)::FLOAT8, 0.0::FLOAT8) + 
      COALESCE(1.0::FLOAT8 / (60 + k.rank)::FLOAT8, 0.0::FLOAT8)
    )::FLOAT8 AS similarity
  FROM semantic_search s
  FULL OUTER JOIN keyword_search k ON s.id = k.id
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
