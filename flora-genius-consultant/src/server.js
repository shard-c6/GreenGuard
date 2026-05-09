require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const plantnet = require('./services/plantnet.service');
const gemini = require('./services/gemini.service');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Configuration
const PORT = process.env.PORT || 5002;
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Flora Genius AI is running!');
});


/**
 * Endpoint 1: Identify Plant via PlantNet
 */
app.post('/api/consultant/identify', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Image is required' });
    
    const identification = await plantnet.identifyPlant(req.file.buffer, req.file.originalname, req.file.mimetype);
    res.json({ success: true, data: identification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint 2: Expert Advice (RAG)
 */
app.post('/api/consultant/expert', async (req, res) => {
  const { scientificName, query } = req.body;
  if (!scientificName || !query) return res.status(400).json({ error: 'Scientific name and query are required' });

  try {
    // 1. Generate query expansions
    const expandedQueries = await gemini.expandQuery(query);
    const allQueries = [query, ...expandedQueries];
    
    // 2. Execute parallel searches
    const searchPromises = allQueries.map(async (q) => {
      try {
        const qEmbedding = await gemini.getEmbedding(q);
        const { data, error } = await supabase.rpc('hybrid_plant_search', {
          query_text: q,
          query_embedding: qEmbedding,
          match_threshold: 0.2,
          match_count: 3 // Reduced from 5 to manage context size across multiple queries
        });
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.error(`Search failed for variant "${q}":`, err.message);
        return [];
      }
    });
    
    const resultsArray = await Promise.all(searchPromises);
    
    // 3. Flatten and Deduplicate results
    const uniqueChunksMap = new Map();
    resultsArray.flat().forEach(chunk => {
      if (chunk && chunk.id) {
        uniqueChunksMap.set(chunk.id, chunk);
      } else if (chunk && chunk.content) {
        uniqueChunksMap.set(chunk.content.substring(0, 50), chunk); // Fallback deduplication
      }
    });
    
    const contextChunks = Array.from(uniqueChunksMap.values());

    // 3. Reranking / Context Preparation
    // Prioritize chunks that exactly match the scientific name provided by the identification service
    const sortedChunks = contextChunks.sort((a, b) => {
      const aMatch = a.scientific_name && a.scientific_name.toLowerCase() === scientificName.toLowerCase();
      const bMatch = b.scientific_name && b.scientific_name.toLowerCase() === scientificName.toLowerCase();
      return bMatch - aMatch;
    });

    const context = sortedChunks.map(c => c.content).join('\n\n');

    // 4. Ask Gemini
    const response = await gemini.askExpert(scientificName, context, query);
    
    res.json({ success: true, answer: response });
  } catch (error) {
    console.error('Expert API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Flora Genius Consultant running on http://localhost:${PORT}`);
});
