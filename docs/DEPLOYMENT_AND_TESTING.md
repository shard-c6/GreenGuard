# GreenGuard Deployment & Testing Guide

This document provides everything needed to deploy, seed, and verify the GreenGuard platform in a production-ready environment.

---

## 🏗️ 1. Deployment Overview

### Prerequisites
- **Node.js**: v20 or higher
- **Supabase**: Access to a project (URL + Anon Key + Service Role Key)
- **Environment Variables**: Ensure `.env` files are configured in both `backend/` and `frontend/` directories.

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### AI Consultant Setup
```bash
cd flora-genius-consultant
npm install
npm run dev
```

---

## 🚀 2. Production Hosting (Hugging Face)

GreenGuard microservices are deployed on **Hugging Face Spaces** for high availability and free persistent hosting.

### API & AI Services
- **Backend API**: Deployed as a Docker container.
- **AI Consultant**: Decoupled service for RAG and image identification.

### Environment Requirements
Ensure the following Secrets are set in Hugging Face:
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `PORT` (Default: 7860)

---

---

## 📦 2. Data Seeding

To quickly populate the platform with high-fidelity test data (Admins, NGOs, Plants, and Posts), run the following command from the `backend` directory:

```bash
# Populate the database
node scripts/seed.js
```

### Seeded Test Accounts
| Role | Email | Password |
|:---|:---|:---|
| **Admin** | `admin@greenguard.com` | `@rrm$2026` |
| **Approved NGO** | `greenearth@ngo.org` | `Password123!` |
| **Pending NGO** | `rootsofhope@ngo.org` | `Password123!` |
| **Adopter** | `test_adopter@greenguard.com` | `Password123!` |

---

## 🧪 3. Testing Strategy

### A. Critical User Journeys (CUJs)
- **NGO Onboarding**: Register as NGO -> Submit Darpan ID -> Wait for Admin Approval.
- **Admin Verification**: Role-based access to the verification portal to approve/reject NGOs.
- **Plantation Mapping**: NGOs tagging location on social posts to show reforestation impact on the global map.
- **AI Identification**: Uploading leaf photos to identify species and health.

### B. Manual Verification Checklist
- [ ] **Auth Sync**: Verify registration automatically creates a Supabase profile row.
- [ ] **Role RLS**: Attempt to delete another user's post via API (Should fail with 403).
- [ ] **Map Layering**: Verify color-coded pins for available, pending, and adopted plants.

---

## 🛠️ 4. Maintenance
- **PostGIS**: Ensure the `location` column in `posts` and `plants` uses the `POINT` geography type.
- **Cleaning**: To clear test data, you can use the Supabase SQL editor or extend the `seed.js` script with a `clear()` function.

---
**Build Status: Production-Ready**
**Documentation Version: 1.2**
