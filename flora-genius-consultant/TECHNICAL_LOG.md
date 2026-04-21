# Technical Implementation Log: Flora Genius Integration

This document chronicles the technical challenges and solutions encountered during the development and deployment of the Flora Genius Consultant microservice.

## ⚠️ Challenges & Resolutions

### 1. API Key Format Discrepancies
- **Problem**: The Gemini API key was initially failing in the Railway environment with a `400 Bad Request: API key not valid` error.
- **Root Cause**: A subtle typo in the key string where a capital `I` was replaced by a lowercase `L`, and the common misunderstanding that Gemini keys must start with the `AIza` prefix.
- **Resolution**: Verified the key prefix and manually re-entered the variable in Railway to ensure no hidden spaces or character substitutions occurred during copy-pasting.

### 2. SQL Function Return Type Mismatch
- **Problem**: The Supabase RPC call `match_plant_knowledge` failed with `Returned type uuid does not match expected type bigint`.
- **Root Cause**: The database schema used `UUID` for primary keys, while the initial SQL function was hardcoded to return `BIGINT`.
- **Resolution**: Refactored the SQL function to be type-agnostic by removing the `id` column from the `RETURNS TABLE` definition, as the AI only requires the `content` and `similarity` columns for the RAG process.

### 3. Missing Schema Columns
- **Problem**: Runtime error `column pk.metadata does not exist`.
- **Root Cause**: The RAG search was attempting to retrieve a `metadata` column that existed in the development plan but was missing from the actual production table.
- **Resolution**: Ran an `ALTER TABLE` migration to add the `metadata` column and updated the function to handle the existing schema correctly.

### 4. Railway Monorepo Configuration
- **Problem**: Railway was attempting to build the entire GreenGuard monorepo instead of just the microservice, leading to build failures.
- **Root Cause**: Incorrect **Root Directory** setting in Railway.
- **Resolution**: Configured the Railway Service to use `/flora-genius-consultant` as the root directory, ensuring only the microservice's `package.json` and dependencies were processed.

### 5. Supabase Function Permissions
- **Problem**: Initial 500 errors when calling the database from Railway.
- **Root Cause**: The microservice was using an `ANON_KEY` which did not have permissions to execute the `pgvector` similarity search.
- **Resolution**: Switched to the `SERVICE_ROLE_KEY` for backend-to-backend communication, providing the necessary elevated permissions for the RAG search.

## 📝 Lessons Learned
- **Key Prefix Sensitivity**: Always verify `AIza` prefixes for Google Cloud/Gemini keys.
- **Type Agnostic Functions**: When building RPC functions for AI, only return the minimum necessary data to avoid schema conflicts.
- **Environment Parity**: Always use `node scripts/ingest_json.js` to verify environment variables locally before pushing to production.
