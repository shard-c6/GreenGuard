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

### 6. Conversational Context Loss

- **Problem**: Users had to re-identify or re-explain their plant in every message, as the AI only processed the current query.
- **Root Cause**: The initial implementation used `model.generateContent` which is stateless.
- **Resolution**: Transitioned to Gemini's `startChat` interface. Implemented a history parsing layer in `gemini.service.js` that maps frontend message objects into the required `user`/`model` parts array, enabling true multi-turn botanical consultations.

### 7. Flora-Genius AI Server Security Hardening (Issue #57)

- **Problem**: The endpoints `/api/consultant/identify` and `/api/consultant/expert` were exposed with zero authentication, rate limiting, or CORS restrictions, representing high API quota abuse, data tampering, and prompt injection risks.
- **Root Cause**: Rapid service prototyping prioritizing feature capability over standard API hardening practices.
- **Resolution**: Deployed multiple security layers:
  1. **JWT Authorization**: Created `auth.middleware.js` to decode Bearer tokens and verify user validity & ban flags directly against Supabase database profiles.
  2. **Rate Limiting & CORS**: Configured user-aware rate limiting (10 requests per 15 minutes keyed by authenticated user ID falling back to IP) and restricted CORS to validated `FRONTEND_URL` endpoints.
  3. **Strict Payload Limits**: Registered `helmet` security headers, defined a 1MB payload ceiling on JSON request bodies, and capped image file uploads at 5MB using `multer` constraints.
  4. **Stored XSS & Log Forgery Defenses**: Copied recursive XSS body sanitization middleware using `sanitize-html` and structured it via `Object.entries` & `Object.defineProperty` to completely bypass dynamic bracket-notation static analysis issues. Escaped control characters in all logs to mitigate log injection.
  5. **Prompt Injection Protections**: Hardened system and query templates in `gemini.service.js` by wrapping untrusted data in distinctive non-HTML banners and instructing Gemini to strictly ignore override directives.
  6. **Frontend Integration**: Enhanced frontend consultant service to automatically intercept and inject the client's `gg_token` into all outbound consultant API requests.

### 8. Secure Infrastructure, Docker, and SQL Functions (Issue #59)

- **Problem**: Development artifacts and backups were vulnerable to leaking inside Docker production builds (VULN-013), database functions using `SECURITY DEFINER` lacked proper search paths (VULN-014), and internal server stack traces leaked in non-production environments (VULN-017).
- **Resolutions**:
  1. **Docker Secrets Leak Prevention**: Upgraded both backend and AI microservice `.dockerignore` files to explicitly ignore `.env` files, tests, scripts, local scratch files, markdown docs, and git files.
  2. **Supabase Function Injection Fixes**: Patched all 8 `SECURITY DEFINER` SQL functions across the migrations (`migration.sql`, `comments_migration.sql`, `hybrid_search_migration.sql`) to specify `SET search_path = public` ensuring they lock searches to the public schema.
  3. **Error Handler Stack Leakage Mitigation**: Securely refactored `errorHandler.js` so that `err.message` is exclusively returned if the environment `NODE_ENV` is explicitly `'development'`, defaulting to a safe, generic `'Internal server error'` response otherwise.

## 📝 Lessons Learned

- **Key Prefix Sensitivity**: Always verify `AIza` prefixes for Google Cloud/Gemini keys.
- **Type Agnostic Functions**: When building RPC functions for AI, only return the minimum necessary data to avoid schema conflicts.
- **Environment Parity**: Always use `node scripts/ingest_json.js` to verify environment variables locally before pushing to production.
- **Defense in Depth**: Secure and isolate microservice architectures with modular validation, strict size limits, and role validations early in the development lifecycle to prevent compounding API quota abuse.
- **Static Analysis Compliance**: Avoid using dynamic bracket notations (`cleaned[key]`) and HTML-like delimiters (`<tag>`) inside JS templates to prevent prototype pollution and browser XSS false positives.


