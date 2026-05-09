const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const DATA_FILE = path.join(__dirname, '../data/plant_data.json');

async function generateData() {
  console.log("=== GreenGuard Automated Data Expansion Engine ===");
  
  // 1. Load existing data to avoid duplicates
  let existingPlants = [];
  if (fs.existsSync(DATA_FILE)) {
    try {
      existingPlants = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      console.log(`Currently loaded: ${existingPlants.length} plants.`);
    } catch (e) {
      console.error("Could not parse existing plant_data.json, starting fresh.");
    }
  }
  
  const existingNames = new Set(existingPlants.map(p => p.plant_name.toLowerCase()));
  
    const categories = [
      "Rare South American Medicinal Herbs",
      "Desert Succulents and Cacti",
      "Carnivorous Plants",
      "Asian Culinary and Medicinal Herbs",
      "African Shrubs and Trees",
      "European Alpine Plants",
      "Tropical Rainforest Epiphytes",
      "Australian Native Flora",
      "Poisonous Plants with Historical Uses"
    ];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    // 2. Define the prompt for Gemini
    // We request a batch of 50 to avoid timeout/context limits per request.
    const prompt = `
      You are an expert botanist database builder. Your task is to generate a JSON array containing 50 highly detailed botanical entries.
      
      SCOPE: Provide a diverse mix of plants specifically from this category: "${randomCategory}".
      
      CRITICAL INSTRUCTIONS:
      - Return ONLY a valid JSON array of objects.
      - Do NOT include any of these plants (they are already in our database): ${Array.from(existingNames).slice(0, 300).join(', ')}... Try to find unique, lesser-known but validated global species.
      
      Each object MUST have the exact following keys:
      {
        "plant_name": "Common name of the plant",
        "scientific_name": "Scientific binomial name",
        "description": "A 2-3 sentence overview of the plant's origin and physical characteristics.",
        "medical_uses": "Known medicinal properties (or 'None primarily used' if it's strictly an ornamental houseplant).",
        "treatment_methods": "How it is prepared or used medically (or 'N/A' for ornamentals).",
        "care_instructions": "Light, water, and soil requirements."
      }
    `;
  
    console.log("\nGenerating a batch of 50 new plants via Gemini 1.5 Flash... (This may take 30-60 seconds)");
    
    let newPlants = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-flash-latest',
          generationConfig: { responseMimeType: "application/json" }
        });
        const result = await model.generateContent(prompt);
        
        let text = result.response.text().trim();
      // Clean markdown if present
      text = text.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
      
      newPlants = JSON.parse(text);
      
      if (!Array.isArray(newPlants)) {
        throw new Error("API did not return a JSON array.");
      }
      
      console.log(`\n✅ Successfully generated ${newPlants.length} new plant entries!`);
      break; // Success, exit loop
    } catch (e) {
      console.error(`Attempt ${attempt} failed: ${e.message}`);
      if (attempt === 3) {
        console.error("All 3 attempts failed.");
        return;
      }
      console.log("Retrying in 2 seconds...");
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
    
    // 3. Deduplicate against existing one more time just in case
    let addedCount = 0;
    for (const p of newPlants) {
      if (!existingNames.has(p.plant_name.toLowerCase())) {
        existingPlants.push(p);
        existingNames.add(p.plant_name.toLowerCase());
        addedCount++;
      }
    }
    
    // 4. Save back to file
    fs.writeFileSync(DATA_FILE, JSON.stringify(existingPlants, null, 2));
    console.log(`Appended ${addedCount} unique plants. New Total: ${existingPlants.length} plants.`);
    console.log("\nRun this script again to generate more, or run 'node ingest_json.js' to push to Supabase.");
    
}

generateData();
