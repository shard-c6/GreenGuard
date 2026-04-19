require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function list() {
  // Try v1 instead of v1beta
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log("Checking model accessibility with v1...");
  try {
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' }, { apiVersion: 'v1' });
    const result = await model.embedContent("test");
    console.log("v1: text-embedding-004 works!");
  } catch (e) {
    console.error("v1: text-embedding-004 failed:", e.message);
  }
}

list();
