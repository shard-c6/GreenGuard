# 🌱 GreenGuard — Premium Plant Adoption Ecosystem

**GreenGuard** is a high-end, community-driven digital platform designed to revolutionize urban afforestation. By bridging the gap between NGOs and passionate adopters, GreenGuard transforms environmental conservation into an immersive, social, and AI-enhanced journey.

---

## 🌟 The Vision

In an era of rapid urbanization, GreenGuard provides the digital infrastructure needed to nurture green spaces. Our platform doesn't just list plants; it tells their stories through dynamic backgrounds, interactive mapping, and community-driven progress tracking.

---

## 🏛️ Ecosystem Architecture

The project is architected as a cohesive multi-module system:

### 1. 🖥️ [Frontend](./frontend) (The Experience)
A state-of-the-art web application built for speed and immersion.
- **Framework**: Next.js 16 (App Router) & React 19.
- **Visual Engine**: Custom **Atmospheric Background** system and **Glassmorphism 2.0** styling.
- **Storytelling**: Scroll-triggered narrative landing page using Framer Motion.
- **Geospatial**: Leaflet-powered plant discovery map.

### 2. ⚙️ [Backend](./backend) (The Engine)
A robust, secure REST API handling complex workflows and geospatial data.
- **Runtime**: Node.js & Express.
- **Database**: PostgreSQL with **PostGIS** for high-precision location tracking.
- **Security**: JWT-based RBAC (Role-Based Access Control) for Admins, NGOs, and Adopters.
- **Storage**: Integrated Supabase storage for high-resolution plant assets and growth reports.

### 3. 🌿 [Flora-Genius](./flora-genius) (The Brain)
An AI-specialized module focused on plant health and identification.
- **AI ID**: Computer vision-based plant identification via n8n/Groq/PlantNet.
- **Health Monitoring**: AI-assisted diagnosis for submitted growth reports.

---

## ✨ Premium Features

- **🛡️ Rigorous NGO Verification**: Multi-step onboarding with **Darpan ID** validation and impact questionnaires.
- **🗺️ PostGIS Discovery**: Find plants available for adoption near your precise location with real-time distance calculations.
- **📸 Growth Timeline**: Track your plant's journey from sapling to tree with health metrics and image history.
- **💬 Social Feed**: An Instagram-style community portal for sharing updates, liking, and bookmarking milestones.
- **🔔 Smart Notifications**: Real-time alerts for adoption approvals, application reviews, and community engagement.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4, Framer Motion, Axios |
| **Backend** | Node.js, Express, Supabase, PostGIS |
| **Mapping** | Leaflet, React-Leaflet, OpenStreetMap |
| **AI/ML** | n8n Webhooks, Groq, PlantNet API |
| **DevOps** | Railway (API), Vercel (Frontend), Supabase (DB/Auth/Storage) |

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/RishabhHatlunkar/GreenGuard.git
cd GreenGuard
```

### 2. Configure Environment Variables
Each module requires its own `.env` file based on the provided `.env.example` templates.
- **Backend**: Needs `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `JWT_SECRET`, and `DATABASE_URL`.
- **Frontend**: Needs `NEXT_PUBLIC_API_BASE_URL`.

### 3. Start Development Servers

**Terminal 1: Backend**
```bash
cd backend && npm install && npm run dev
```

**Terminal 2: Frontend**
```bash
cd frontend && npm install && npm run dev
```

**Terminal 3: Flora-Genius**
```bash
cd flora-genius && npm install && npm run dev
```

---

## 📄 Documentation Library

- [**Frontend Overview**](./frontend/docs/FRONTEND_OVERVIEW.md) — Tech stack and component guide.
- [**Project Requirements (PRD)**](./backend/docs/PROJECT_REQUIREMENTS.md) — API specs and feature roadmap.
- [**Testing Guide**](./docs/TESTING_GUIDE.md) — Quality assurance and manual testing flows.

---

## 🛡️ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
