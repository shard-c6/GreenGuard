require('dotenv').config({ path: './.env' });
const { createClient } = require('@supabase/supabase-js');
const gemini = require('../src/services/gemini.service');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testHybrid() {
  const query = "What are the medical uses of Ficus Benghalensis?";
  const scientificName = "Ficus Benghalensis";

  console.log(`Testing Hybrid Search with query: "${query}"`);

  try {
    // 1. Get Embedding
    const queryEmbedding = await gemini.getEmbedding(query);

    // 2. Call Hybrid Search RPC
    const { data: contextChunks, error } = await supabase.rpc('hybrid_plant_search', {
      query_text: query,
      query_embedding: queryEmbedding,
      match_threshold: 0.1,
      match_count: 5
    });

    if (error) throw error;

    console.log(`\nFound ${contextChunks.length} results:`);
    contextChunks.forEach((c, i) => {
      console.log(`${i+1}. [Score: ${c.similarity.toFixed(4)}] ${c.scientific_name}: ${c.content.substring(0, 100)}...`);
    });

    if (contextChunks.length > 0) {
      console.log("\n✅ Hybrid Search Test Passed!");
    } else {
      console.log("\n❌ No results found. Check if the database has data.");
    }

  } catch (err) {
    console.error("Test Failed:", err);
  }
}

testHybrid();
