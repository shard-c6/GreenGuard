# 🌱 GreenGuard — Premium Botanical Identification & Adoption Ecosystem

**GreenGuard** is a state-of-the-art environmental platform designed to bridge the gap between Non-Governmental Organizations (NGOs) and nature enthusiasts. The platform facilitates the adoption of trees and plants, provides real-time botanical intelligence through a RAG-based AI system, and fosters a community dedicated to reforestation and plant care.

---

## 🌍 Live Links
- **Frontend (Web App)**: [https://greenguard.vercel.app](https://greenguard.vercel.app)
- **Backend API**: [https://green-guard-api.up.railway.app](https://green-guard-api.up.railway.app)

---

## 📖 What is GreenGuard?

Despite the global push for reforestation, urban populations often find it difficult to contribute meaningfully or track the progress of planted saplings. Conversely, NGOs struggle with post-plantation care and consistent funding/adoption for their projects. GreenGuard provides a triple-layered solution:

1. **Direct Adoption Pipeline**: A seamless workflow for adopters to select, apply for, and manage plant adoptions from verified NGOs via interactive maps.
2. **Botanical Intelligence (Flora Genius)**: A specialized AI microservice that uses Retrieval-Augmented Generation (RAG) to provide expert, grounded advice on 130+ Indian medicinal plants.
3. **Community & Accountability**: An Instagram-style social feed combined with a growth reporting system ensures transparency and long-term care for every adopted plant.

---

## ✨ New Additions & Features

- **🧠 Flora Genius Consultant (RAG AI)**: A standalone microservice utilizing Google Gemini for reasoning and embeddings, combined with Supabase `pgvector` for high-speed semantic retrieval. It provides instant plant identification and expert consultation grounded in verified botanical data.
- **🎨 Premium Visual Engine**: Implementation of a high-end design system using Tailwind CSS 4, featuring **Glassmorphism 2.0** and immersive **Atmospheric Backgrounds** that react to page states.
- **🗺️ Geospatial Discovery**: Integrated PostGIS to enable radius-based searches, allowing users to discover adoption opportunities in their immediate vicinity on a live interactive map.
- **🛡️ Secure NGO Verification**: Multi-step onboarding with Darpan ID validation and an admin approval workflow to ensure authenticity.
- **💬 Social Engine**: High-performance social wall for sharing plantation updates, care tips, and success stories with like, bookmark, and follow functionalities.

---

## 🛠️ Technology Stack

The project is architected as a cohesive multi-module system:

### 1. 🖥️ Frontend Engine
- **Framework**: Next.js 16 (App Router), React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 (Custom CSS Variables, Glassmorphism)
- **Animations**: Framer Motion
- **Mapping**: Leaflet, React-Leaflet
- **Data Fetching**: Axios

### 2. ⚙️ Core Backend
- **Runtime**: Node.js, Express.js
- **Database**: PostgreSQL with PostGIS (for spatial tracking) hosted on Supabase
- **Security & Auth**: Supabase Auth (JWT-based RBAC for Admins, NGOs, and Adopters)
- **Storage**: Supabase Storage for high-resolution images

### 3. 🌿 Flora Genius Microservice (AI)
- **LLM Engine**: Google Gemini (1.5 Flash)
- **Vector Database**: Supabase `pgvector`
- **Architecture**: Retrieval-Augmented Generation (RAG)

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/RishabhHatlunkar/GreenGuard.git
cd GreenGuard
```

### 2. Configure Environment Variables
Each module requires its own `.env` file based on the provided templates.
- **Backend**: Needs `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `JWT_SECRET`, `DATABASE_URL`, and `FRONTEND_URL`.
- **Frontend**: Needs `NEXT_PUBLIC_API_BASE_URL` (points to local or production API).
- **Flora-Genius**: Needs API keys for Gemini and Supabase config.

### 3. Start Development Servers

You will need to run the services in parallel:

**Terminal 1: Backend**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2: Frontend**
```bash
cd frontend
npm install
npm run dev
```

**Terminal 3: Flora-Genius Consultant**
```bash
cd flora-genius-consultant
npm install
npm run dev
```

---

## 📄 Documentation Library

For a deeper dive into the architecture and API specs, please refer to the following documents:
- [**Project Report**](./docs/PROJECT_REPORT.md) — Comprehensive overview of the ecosystem.
- [**Frontend Overview**](./frontend/docs/FRONTEND_OVERVIEW.md) — Tech stack, integration guide, and component structure.
- [**Project Requirements (PRD)**](./backend/docs/PROJECT_REQUIREMENTS.md) — API specifications, roles, and feature roadmap.
- [**Technical Handover**](./docs/TECHNICAL_HANDOVER.md) — Architectural improvements and database schema extensions.
- [**Testing Guide**](./docs/DEPLOYMENT_AND_TESTING.md) — Deployment, data seeding, and manual testing flows.

---

## 🛡️ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
