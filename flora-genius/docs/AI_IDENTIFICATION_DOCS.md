# FloraGenius AI Plant Identification Documentation

This document outlines the technical architecture and configuration required for the AI-powered plant identification system in the FloraGenius project.

---

## 🏗 System Architecture

The identification process follows a high-performance "Bridge" architecture:

1.  **Frontend (Browser)**: The user uploads an image or sends a plant name via the ChatGPT-style interface.
2.  **API Bridge (Next.js)**: 
    *   The `src/app/api/identify/route.ts` receives the file.
    *   It uploads the raw binary to a **Supabase Storage** bucket named `flora-scans`.
    *   It retrieves a **Public URL** for that image.
3.  **Automation Layer (n8n)**:
    *   The Next.js bridge triggers an **n8n Webhook** (`/plant-detect`).
    *   **n8n** receives the Public URL and forwards it to the **PlantNet API**.
    *   **PlantNet** returns botanical candidates (species name, scientific name, score).
    *   **n8n** uses **Groq (Llama 3.1)** to structure the final results, adding CO2 absorption, oxygen impact, and botanical facts.
4.  **Persistence (Supabase DB)**:
    *   The API Bridge receives the final structured data from n8n.
    *   If the user is logged in, the scan is automatically saved to the GreenGuard `plants` table.

---

## 🛠 Setup Instructions

### 1. n8n Configuration
*   **Import Workflow**: Import the `greenguard (1).json` file into your local n8n instance.
*   **Webhook Path**: Ensure the Webhook node path is `/plant-detect`.
*   **Testing vs Active URL**:
    *   Use `http://localhost:5678/webhook-test/plant-detect` while the workflow is still inactive and you are testing from the editor.
    *   Use `http://localhost:5678/webhook/plant-detect` after the workflow is activated.
*   **Required n8n Setup**:
    *   **PlantNet**: Set `PLANTNET_API_KEY` in the n8n container environment. The workflow reads this via `$env.PLANTNET_API_KEY`.
    *   **Groq**: Reconnect the imported Groq credential in n8n after import. Credential IDs in the exported JSON are only placeholders from the original instance.
*   **Owner Login**: After a real user-management reset, self-hosted n8n should show the owner sign-up screen on first load. If you still see a login form, the previous owner record is still present in the persisted volume.

### 2. Environment Variables (`.env.local`)
Ensure the following variables are set in your FloraGenius project:

```env
# n8n Webhook
# Use webhook-test while iterating on an inactive workflow.
# Switch to webhook after activation.
N8N_WEBHOOK_URL=http://localhost:5678/webhook-test/plant-detect

# Supabase (Existing GreenGuard Credentials)
SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_KEY
```

---

## 📊 Data Mapping

The systems expects and returns the following JSON structure:

### Input (to n8n)
```json
{
  "type": "image",
  "input": "https://supabase-url.com/storage/v1/object/public/flora-scans/leaf.jpg"
}
```

### Output (from n8n)
```json
{
  "common_name": "Ghost Plant",
  "scientific_name": "Graptopetalum paraguayense",
  "confidence": 98,
  "co2": "High",
  "oxygen": "Moderate",
  "uses": "Ornamental, Air Purification",
  "fact": "Also known as Mother-of-Pearl plant due to its iridescent leaves."
}
```

---

## 🔒 Security Note
FloraGenius uses the **Supabase Service Role Key** on the backend to bypass RLS for automatic persistence. The client forwards the current `gg_token` to the Next.js bridge so authenticated scans can be linked to the signed-in GreenGuard user.
