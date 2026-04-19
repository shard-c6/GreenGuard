# 🌱 GreenGuard

**GreenGuard** is a premium, community-driven plant adoption platform that bridges the gap between NGOs, plant enthusiasts, and urban environments. It leverages modern AI, geospatial data, and immersive storytelling to make environmental conservation accessible and engaging.

---

## 🏛️ Project Architecture

The GreenGuard ecosystem is divided into three primary modules:

### 1. 🖥️ [Frontend](./frontend)
A high-performance web application built with **Next.js 16** and **React 19**. It features:
- **Premium Aesthetics**: Deep-emerald glassmorphism and atmospheric backgrounds.
- **Immersive Storytelling**: An animated landing page that guides users through the mission.
- **Role-Based Portals**: Specialized dashboards for Admins, NGOs, and Adopters.
- **Interactive Mapping**: Leaflet-based plant discovery with PostGIS integration.

### 2. ⚙️ [Backend](./backend)
A robust REST API built with **Node.js** and **Express**, integrated with **Supabase**.
- **Database**: PostgreSQL with PostGIS for location-based plant tracking.
- **Storage**: Supabase Storage for plant images and user reports.
- **Auth**: Secure JWT-based authentication with role-based access control (RBAC).
- **Security**: Rate limiting, CORS protection, and helmet.

### 3. 🌿 [Flora-Genius](./flora-genius)
A specialized module (Next.js) focused on AI-powered plant identification and care management.
- Integrates with external AI services for leaf diagnosis.
- Managed care plans for adopted plants.

---

## ✨ Key Features

- **Plant Adoption Flow**: NGOs post plants → Adopters apply → Approval workflow → Periodic growth reports.
- **Community Portal**: Social feed for NGOs to share updates and adopters to showcase their progress.
- **Geospatial Discovery**: Find plants available for adoption near you using real-time GPS data.
- **Admin Governance**: Robust NGO verification (Darpan ID) and platform monitoring.
- **Atmospheric UI**: A "wow-factor" design system with smooth animations and vibrant glassmorphism.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router), Node.js, Express
- **Language**: TypeScript (Strongly Typed)
- **Styling**: Tailwind CSS 4, Vanilla CSS (Design Tokens)
- **Database**: Supabase (PostgreSQL + PostGIS)
- **Animations**: Framer Motion
- **Maps**: Leaflet / React-Leaflet

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase Project

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd GreenGuard
   ```

2. **Setup Backend**:
   ```bash
   cd backend
   npm install
   cp .env.example .env # Configure your Supabase keys
   npm run dev
   ```

3. **Setup Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Setup Flora-Genius**:
   ```bash
   cd flora-genius
   npm install
   npm run dev
   ```

---

## 📄 Documentation

- [Project Report](./docs/PROJECT_REPORT.md) - Latest changes and technical difficulties.
- [Testing Guide](./docs/TESTING_GUIDE.md) - How to run and verify tests.
- [Technical Handover](./docs/TECHNICAL_HANDOVER.md) - Architectural deep-dive.

---

## 🛡️ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
