-- Create plant_knowledge table for vector search
CREATE TABLE IF NOT EXISTS plant_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_name TEXT,
  scientific_name TEXT,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS plant_knowledge_embedding_hnsw_idx
ON plant_knowledge
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

ALTER TABLE plant_knowledge ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "plant_knowledge_read_authenticated" ON plant_knowledge;
CREATE POLICY "plant_knowledge_read_authenticated" ON plant_knowledge
  FOR SELECT USING (auth.role() = 'authenticated');
