# 📊 GreenGuard Project Report — v2.1 (April 2026)

## 🌟 Executive Summary
The April 2026 development cycle for GreenGuard focused on transitioning from a functional prototype to a premium, production-ready digital ecosystem. Key priorities included **Visual Immersion**, **NGO Trust & Safety**, and **PostGIS Geospatial Accuracy**.

---

## 🚀 Key Technical Milestones

### 1. Premium Visual Identity (Frontend)
- **Atmospheric Background Engine**: Developed a multi-layered CSS background system (`AtmosphericBackground.tsx`) that uses dynamic gradients and hardware-accelerated filters to create an immersive environment.
- **Glassmorphism 2.0**: Implemented a refined glassmorphism system using Tailwind CSS 4, focusing on high-refraction borders and deep background blurs (`backdrop-blur-xl`).
- **Storytelling Landing Page**: Created the `AnimatedStory` module to engage users with scroll-based animations (Framer Motion) that explain the "Adopt, Care, Grow" loop.

### 2. NGO Trust & Safety (Full Stack)
- **Darpan ID Verification**: Integrated Darpan ID fields in the registration and onboarding flows to ensure NGO authenticity.
- **Impact Questionnaires**: Added custom onboarding questions to evaluate NGO capacity and mission alignment.
- **Role-Based Workflows**: Refined the transition from `adopter` to `ngo` role through a formal admin approval queue.

### 3. Geospatial Excellence (Backend)
- **PostGIS Integration**: Resolved critical geospatial query errors by implementing `ST_DistanceSphere` in the `getNearbyPlants` controller.
- **Global Mapping**: Added dedicated endpoints for mapping massive plantation datasets across the social feed and plant discovery modules.

### 4. Flora Genius AI Consultant (Microservice)
- **RAG Architecture**: Built a Retrieval-Augmented Generation system using Gemini 1.5 Flash and `pgvector` to provide expert botanical advice based on a dataset of 130+ medicinal plants.
- **Railway Deployment**: Offloaded heavy AI processing to a specialized Node.js microservice hosted on Railway, linked via a secure Vercel-to-Railway API bridge.
- **Dynamic Identification**: Integrated the PlantNet API into the AI workflow, allowing users to move seamlessly from photo identification to expert consultation.

---

## 🛠️ Technical Difficulties & Solutions

| Difficulty | Solution |
|------------|----------|
| **400 Bad Request on Map Queries** | Validated coordinate types and replaced standard distance logic with PostGIS-specific spatial functions. |
| **Expert API 401/400 Errors** | Resolved key format typos (AIza prefix) and verified service role permissions for Supabase-to-Railway communication. |
| **SQL Type Mismatches** | Refactored Supabase RPC functions to be type-agnostic (removing ID column requirements) to avoid UUID/BigInt conflicts. |
| **Performance in Atmospheric UI** | Used `will-change` CSS properties and optimized SVG filter layers to maintain 60FPS on mobile devices. |
| **Auth State Syncing** | Implemented a robust `AuthProvider` with interceptors in `api.ts` to handle JWT expiration and auto-redirects seamlessly. |
| **NGO Data Integrity** | Added strict validation schemas (Zod/Joi) for `darpan_id` and org registration numbers. |

---

## 📅 Roadmap: The Road Ahead
- [x] **Flora Genius Live**: RAG-powered expert consultant (Completed).
- [ ] **PWA Support**: Enabling offline access for map-based plantation discovery.
- [ ] **Email Automation**: Migration from Supabase default email to professional SMTP (Resend/SendGrid).
- [ ] **Direct Messaging**: Enabling secure communication between NGOs and potential adopters.
- [ ] **Gamification**: Introducing eco-points for consistent growth reporting.

---

*Authored by Antigravity | GreenGuard Lead AI Architect*

