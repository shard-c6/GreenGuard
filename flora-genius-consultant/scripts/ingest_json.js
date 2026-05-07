require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function ingest() {
  const fileName = process.argv[2] || '../data/plant_data.json';
  const jsonPath = path.join(__dirname, fileName);
  
  if (!fs.existsSync(jsonPath)) {
    console.error('Error: plant_data.json not found in data/ directory.');
    return;
  }

  const plants = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`Starting ingestion for ${plants.length} plants...`);

  for (const plant of plants) {
    try {
      console.log(`Processing: ${plant.plant_name}...`);

      const content = `
        Plant Name: ${plant.plant_name}
        Scientific Name: ${plant.scientific_name}
        Description: ${plant.description}
        Medical Uses: ${plant.medical_uses}
        Treatment Methods: ${plant.treatment_methods}
        Care Instructions: ${plant.care_instructions}
      `.trim();

      // Generate Embedding
      const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
      const result = await model.embedContent(content);
      const embedding = result.embedding.values;

      // Insert into Supabase
      const { error } = await supabase.from('plant_knowledge').insert({
        plant_name: plant.plant_name,
        scientific_name: plant.scientific_name,
        content: content,
        embedding: embedding
      });

      if (error) throw error;

    } catch (err) {
      console.error(`Failed to ingest ${plant.plant_name}:`, err.message);
    }
  }

  console.log('Ingestion complete!');
}

ingest();
