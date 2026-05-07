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
    // 1. Generate embedding for the user query
    const queryEmbedding = await gemini.getEmbedding(query);

    // 2. Search Supabase for relevant context
    // We filter by similarity and also prioritize the specific plant if scientificName is provided
    const { data: contextChunks, error: searchError } = await supabase.rpc('match_plant_knowledge', {
      query_embedding: queryEmbedding,
      match_threshold: 0.3,
      match_count: 5
    });

    if (searchError) throw searchError;

    const context = contextChunks.map(c => c.content).join('\n\n');

    // 3. Ask Gemini
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
