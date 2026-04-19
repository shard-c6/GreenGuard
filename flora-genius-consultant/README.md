# Flora Genius Consultant Microservice

The **Flora Genius Consultant** is a specialized AI microservice within the GreenGuard ecosystem. It provides high-fidelity botanical identification and expert consultation services using a Retrieval-Augmented Generation (RAG) architecture.

## 🚀 Overview

This microservice acts as the "Botanical Brain" of GreenGuard. It handles complex AI tasks that are offloaded from the main frontend to ensure high performance and scalability.

- **Frontend**: Next.js (Vercel)
- **Backend**: Node.js/Express (Railway)
- **Database**: Supabase + pgvector
- **AI Models**: Gemini 1.5 Flash (Reasoning) & Gemini-Embedding-001 (Vectorization)

## 🏗️ Architecture: RAG (Retrieval-Augmented Generation)

Unlike standard AI chatbots, Flora Genius uses a **RAG** system to provide accurate, data-driven advice:
1. **Embedding**: User queries are converted into 768-dimensional vectors.
2. **Vector Search**: The system searches a Supabase `pgvector` database for the most relevant botanical data from 130+ Indian medicinal plants.
3. **Augmentation**: The retrieved data is injected into the Gemini prompt as context.
4. **Generation**: Gemini generates a structured, expert report based *only* on the verified botanical data.

## 🛠️ API Endpoints

### `POST /api/consultant/identify`
Identifies a plant from an image URL using the PlantNet API and returns a specialized botanical summary.

### `POST /api/consultant/expert`
Provides a detailed expert consultation.
- **Input**: `{ "message": "Query string" }`
- **Output**: Structured AI response with botanical context.

## 📦 Local Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env` file with:
   - `GEMINI_API_KEY`: Google AI Studio key.
   - `SUPABASE_URL`: Your Supabase project URL.
   - `SUPABASE_SERVICE_ROLE_KEY`: Secret service role key.
   - `PLANTNET_API_KEY`: PlantNet API key.

3. **Ingest Data**:
   ```bash
   node scripts/ingest_json.js
   ```

4. **Run Server**:
   ```bash
   npm run dev
   ```

## ☁️ Deployment

- **Hosting**: Railway (Auto-deploys from `main` branch).
- **Root Directory**: Set to `/flora-genius-consultant` in Railway settings.
- **Port**: 8080 (Configurable via `PORT` env var).
