# Technical Handover & Improvements Log — GreenGuard v2

This document provides a comprehensive summary of the structural and architectural changes implemented to evolve GreenGuard from a basic prototype into a robust, community-driven portal.

---

## 1. Authentication & Identity System

### A. Backend Registration Flow
- **Change**: Switched from `.insert()` to `.upsert()` for the `public.profiles` table in the `register` endpoint.
- **Rationale**: Prevents a race condition where the Supabase Database Trigger (see below) might create a skeleton profile before the backend finishes, leading to "Duplicate Key" errors.
- **Impact**: Registration is now idempotent and highly stable.
- **File**: `backend/src/controllers/auth.controller.js`

### B. Supabase Auth-to-Public Sync
- **Change**: Implemented an PostgreSQL Trigger `on_auth_user_created` in the `auth.users` schema.
- **Detail**: The function `public.handle_new_user()` auto-syncs OAuth metadata (Google/Apple/Facebook) into our `public.profiles` table.
- **Safety**: Includes logic to skip email/password registrations to avoid conflicts with custom backend flows.
- **File**: `supabase/auth_trigger_migration.sql`

### C. Social Login UI (Locked)
- **Change**: Added Google, Apple, and Facebook login buttons to the `Login` and `Register` pages.
- **Detail**: Currently set to "Coming Soon" (faded out and disabled) until production API keys are configured in the Supabase Dashboard.
- **File**: `frontend/src/components/auth/SocialButtons.tsx`

---

## 2. Frontend: Modern Design System

### A. CSS Variable Engine
- **Change**: Created a unified design system using CSS variables (`--gg-*`).
- **Design Language**: Vibrant primary greens (`#10b981`), deep dark mode support, and glassmorphism.
- **File**: `frontend/src/app/globals.css`

### B. Role-Based Onboarding
- **Change**: Redesigned the registration page with a visual role selector (Plant Adopter vs. NGO).
- **Detail**: NGOs are automatically routed to a specialized onboarding flow after successful sign-up.
- **File**: `frontend/src/app/register/page.tsx`

### C. Responsive UI/UX
- **Change**: Implemented smooth transitions, hover effects, and a mobile-first dashboard layout.
- **File**: `frontend/src/components/layout/Navbar.tsx`

---

## 3. Backend: API Architecture

### A. Standardized Response Helpers
- **Change**: Added `utils/response.js` to ensure every API call returns a consistent JSON structure `{ success: boolean, data?: any, error?: { code, message } }`.
- **File**: `backend/src/utils/response.js`

### B. Advanced Logging & Debugging
- **Change**: Enhanced error logging in the `auth` controller to include full stack traces and specific error codes (e.g., `REGISTRATION_CRASH`).
- **File**: `backend/src/controllers/auth.controller.js`

---

## 4. Database: Schema & Extensions

### A. Spatial Support (PostGIS)
- **Change**: Enabled the `postgis` extension and added the `location` column (geography type) to the `plants` table.
- **Impact**: Enables "Nearby Plants" searches and distance-based filtering on the map.
- **File**: `supabase/schema.sql` (initial setup)

### B. NGO Infrastructure
- **Change**: Created the `ngo_profiles` table, linking it to `profiles` with an `approved_by` column for admin verification.
- **File**: `supabase/schema.sql`

---

## 5. Ongoing Quality & Testing

### A. Testing Guide
- **Change**: Created a 90-line testing manual covering unit tests, integration paths, and manual QA checklists.
- **File**: `docs/TESTING_GUIDE.md`

---
 
 ## 6. Infrastructure & DevOps
 
 ### A. Hugging Face Spaces Migration
 - **Change**: Migrated both the Main API and AI Consultant service to Hugging Face Spaces (Docker containerized).
 - **Rationale**: Provides free, stable, and persistent hosting for production-grade microservices.
 - **Architecture**: Decoupled the AI reasoning engine (Flora Genius) into an independent service to ensure zero-latency bottlenecks for the main application.
 
 ### B. Automated Deployment (CI/CD)
 - **Change**: Implemented GitHub Actions for automated deployment.
 - **Detail**: Every push to the `main` branch triggers a subtree split and push to the respective Hugging Face Spaces.
 - **File**: `.github/workflows/deploy-hf.yml`
 
 ### C. AI Image Processing Fix
 - **Change**: Integrated the `sharp` library into the AI service to handle WebP-to-JPEG conversion.
 - **Rationale**: Resolves compatibility issues with the PlantNet identification engine which only accepts standard image formats.
 - **File**: `flora-genius-consultant/src/services/plantnet.service.js`


## 🚀 Future Roadmap & Recommendations

### Frontend Team
1. **State Management**: Consider moving from `prop-drilling` to a robust Context-based auth provider (see `lib/auth.ts`).
2. **Infinite Scroll**: Implement `IntersectionObserver` for the community feed to handle large volumes of NGO posts.

### Backend Team
1. **Email Service**: Replace `email_confirm: true` with a real SMTP service (e.g., Resend or SendGrid) once the domain is ready.
2. **File Storage**: Ensure the Supabase Storage Buckets have correct RLS policies for `public` vs `private` plant images.
3. **n8n Integration**: Finalize the webhook listener for the AI Leaf Diagnosis feature.

---
*Created by: Antigravity AI*
*Last Updated: 2026-05-06*
