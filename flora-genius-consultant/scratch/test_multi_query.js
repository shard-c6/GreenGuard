require('dotenv').config({ path: '../.env' });
const gemini = require('../src/services/gemini.service');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testMultiQuery() {
  console.log("=== Testing Multi-Query RAG Expansion ===\n");
  
  const testQuery = "My plant looks sick, the leaves have dark spots and are falling off.";
  console.log(`Original Query: "${testQuery}"\n`);
  
  try {
    // 1. Test Expansion
    console.log("1. Generating Query Expansions...");
    const expandedQueries = await gemini.expandQuery(testQuery);
    console.log("   Expansions generated:");
    expandedQueries.forEach((q, i) => console.log(`   [${i+1}] ${q}`));
    
    if (expandedQueries.length === 0) {
      console.error("   ❌ Failed to generate expansions.");
      return;
    }
    
    // 2. Test Parallel Search
    console.log("\n2. Executing Parallel Searches...");
    const allQueries = [testQuery, ...expandedQueries];
    
    const searchPromises = allQueries.map(async (q) => {
      const qEmbedding = await gemini.getEmbedding(q);
      const { data, error } = await supabase.rpc('hybrid_plant_search', {
        query_text: q,
        query_embedding: qEmbedding,
        match_threshold: 0.2,
        match_count: 3
      });
      if (error) throw error;
      return { query: q, results: data || [] };
    });
    
    const resultsArray = await Promise.all(searchPromises);
    
    let totalResults = 0;
    resultsArray.forEach(res => {
      console.log(`   -> Query "${res.query}" yielded ${res.results.length} chunks.`);
      totalResults += res.results.length;
    });
    
    // 3. Test Deduplication
    console.log("\n3. Testing Deduplication...");
    const uniqueChunksMap = new Map();
    resultsArray.flatMap(r => r.results).forEach(chunk => {
      if (chunk && chunk.id) {
        uniqueChunksMap.set(chunk.id, chunk);
      } else if (chunk && chunk.content) {
        uniqueChunksMap.set(chunk.content.substring(0, 50), chunk);
      }
    });
    
    const uniqueCount = uniqueChunksMap.size;
    console.log(`   Total raw chunks: ${totalResults}`);
    console.log(`   Unique chunks after deduplication: ${uniqueCount}`);
    
    if (uniqueCount < totalResults && uniqueCount > 0) {
      console.log("   ✅ Deduplication works correctly.");
    } else if (uniqueCount === totalResults) {
      console.log("   ⚠️ All chunks were unique (or deduplication failed).");
    }
    
    console.log("\n=== Test Completed Successfully ===");

  } catch (error) {
    console.error("Test failed:", error);
  }
}

testMultiQuery();
