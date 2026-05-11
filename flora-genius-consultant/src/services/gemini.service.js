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
async function askExpert(plantName, context, query, history = []) {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured');

  const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

  const systemPrompt = `
    You are "Flora Genius", the most advanced premium AI botanical consultant specialized in Indian plants.
    
    Current Plant Focus: ${plantName}
    
    CRITICAL INSTRUCTIONS FOR FORMATTING:
    - Use Markdown exclusively for structure.
    - Always start with a brief, warm greeting on the first interaction.
    - Use clear ### Headers for different sections (e.g., ### 🧪 Medical Profile, ### 🛠️ Treatment Methods, ### 🌿 Care Guide).
    - Use **bold** for emphasis and bullet points for lists.
    - If the expert data contains specific details, integrate them seamlessly.
    - If you are using general knowledge, add a subtle note at the end.
    - Keep the tone professional, scientific, yet accessible.
    
    EXPERT DATA FOR CONTEXT:
    ${context}
  `;

  const formattedHistory = [
    { role: 'user', parts: [{ text: systemPrompt }] },
    { role: 'model', parts: [{ text: 'Acknowledged. I am Flora Genius. How can I assist you with this plant today?' }] }
  ];

  if (history && Array.isArray(history) && history.length > 0) {
    history.forEach(msg => {
      formattedHistory.push({
        role: msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.content || msg.parts?.[0]?.text || '' }]
      });
    });
  }

  const chat = model.startChat({
    history: formattedHistory,
  });

  const result = await chat.sendMessage(query);
  return result.response.text();
}

/**
 * Expands a user query into 3 distinct variations to improve search recall.
 */
async function expandQuery(query) {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured');

  const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

  const prompt = `
    You are an expert botanical search assistant. Your task is to take a user's plant-related query and generate 3 alternative versions of it.
    The goal is to catch different synonyms, perspectives, or technical terms that might be present in a botanical database.
    
    Original Query: "${query}"
    
    CRITICAL INSTRUCTIONS:
    - Output ONLY a valid JSON array of 3 strings.
    - Do not include markdown formatting like \`\`\`json.
    - Do not include any explanations.
    
    Example Output:
    ["alternative query 1", "alternative query 2", "alternative query 3"]
  `;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    // Clean up potential markdown formatting if the LLM ignores instructions
    text = text.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
    
    const variants = JSON.parse(text);
    if (!Array.isArray(variants)) throw new Error("Invalid format returned by LLM");
    return variants.slice(0, 3);
  } catch (error) {
    console.error("Query expansion failed, falling back to original query:", error);
    return []; // Return empty array on failure, we'll still use the original query
  }
}

module.exports = { getEmbedding, askExpert, expandQuery };
