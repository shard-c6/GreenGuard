# Flora Genius Consultant Microservice
> **Role**: The Botanical Intelligence Engine of GreenGuard

The **Flora Genius Consultant** is a high-performance AI microservice designed to provide expert botanical consultation. It utilizes a **Retrieval-Augmented Generation (RAG)** architecture to deliver verified, data-driven insights about Indian medicinal plants.

## 🚀 Key Features

- **High-Fidelity Identification**: Integrates with PlantNet API for professional-grade plant recognition.
- **RAG-Powered Expert Advice**: Leverages Google Gemini 1.5 Flash and `pgvector` to answer complex queries based on a curated knowledge base of 130+ species.
- **Contextual Intelligence**: Analyzes soil requirements, medicinal uses, and growth patterns in real-time.

## 🏗️ Technical Architecture

- **Runtime**: Node.js & Express
- **AI Engine**: Google Gemini 1.5 Flash (LLM) & Gemini-Embedding-001 (Vectors)
- **Vector Store**: Supabase with `pgvector` extension
- **RAG Flow**:
    1. **Vectorization**: User queries are embedded into 768-dimensional vectors.
    2. **Semantic Search**: Performs a similarity search in Supabase for the most relevant botanical facts.
    3. **Augmented Prompting**: Injects retrieved context into the AI prompt for grounded, hallucination-free responses.

## 🛠️ API Reference

### `POST /api/consultant/identify`
- **Method**: Multipart Form Data
- **Field**: `image` (File)
- **Returns**: PlantNet identification results + botanical summary.

### `POST /api/consultant/expert`
- **Body**: `{ "scientificName": "...", "query": "..." }`
- **Returns**: Structured markdown response from the expert engine.

## 📦 Local Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Create a `.env` file with:
   - `GEMINI_API_KEY`: Google AI Studio key.
   - `SUPABASE_URL`: Supabase project URL.
   - `SUPABASE_SERVICE_ROLE_KEY`: Service role key for vector search.
   - `PLANTNET_API_KEY`: PlantNet API key.

3. **Data Ingestion**:
   ```bash
   node scripts/ingest_json.js
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   # Defaults to Port 5002
   ```

## ☁️ Deployment

- **Hosting**: Railway
- **Config**: Root Directory set to `/flora-genius-consultant`.

---
*Developed for the GreenGuard Ecosystem | 2026*
