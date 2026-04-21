const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Generates an embedding vector for a given text.
 */
async function getEmbedding(text) {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured');
  
  const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

/**
 * Generates an expert response based on retrieved plant data and user query.
 */
async function askExpert(plantName, context, query) {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured');

  const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

  const systemPrompt = `
    You are "Flora Genius", the most advanced premium AI botanical consultant specialized in Indian plants.
    
    Current Plant Focus: ${plantName}
    
    CRITICAL INSTRUCTIONS FOR FORMATTING:
    - Use Markdown exclusively for structure.
    - Always start with a brief, warm greeting.
    - Use clear ### Headers for different sections (e.g., ### 🧪 Medical Profile, ### 🛠️ Treatment Methods, ### 🌿 Care Guide).
    - Use **bold** for emphasis and bullet points for lists.
    - If the expert data contains specific details, integrate them seamlessly.
    - If you are using general knowledge, add a subtle note at the end.
    - Keep the tone professional, scientific, yet accessible.
    
    EXPERT DATA FOR CONTEXT:
    ${context}
    
    Answer the following user query about ${plantName} using the structure above.
  `;

  const result = await model.generateContent([systemPrompt, query]);
  return result.response.text();
}

module.exports = { getEmbedding, askExpert };
