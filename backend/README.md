# 🌱 Green Guard v2 — Backend API

REST API backend for the Green Guard plant adoption platform. Built with **Node.js + Express**, **Supabase** (PostgreSQL + PostGIS + Auth + Storage), and **n8n** for AI workflows.

> **Base URL (local):** `http://localhost:5000`
> **Health Check:** `GET /api/health`

---

## Table of Contents

- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Authentication](#authentication)
- [API Testing Guide (Postman)](#api-testing-guide-postman)
- [API Reference](#api-reference)
- [Tech Stack](#tech-stack)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [Deployment](#deployment)

---

## Quick Start

### Prerequisites
- **Node.js** v18+ and npm
- **Supabase** account ([supabase.com](https://supabase.com))
- **Postman** for API testing

### Setup Steps

```bash
# 1. Clone and install
git clone <repo-url>
cd green-guard-backend
npm install

# 2. Configure environment
cp .env.example .env
# Fill in your Supabase credentials (see Environment Variables section)

# 3. Set up Supabase database
# Dashboard → SQL Editor → New Query → paste supabase/migration.sql → Run

# 4. Create storage buckets (Dashboard → Storage → New Bucket, all PUBLIC)
#   • plant-images
#   • post-images
#   • report-images
#   • avatars

# 5. Seed admin account
node scripts/seed-admin.js

# 6. Start server
npm run dev
```

Server starts at `http://localhost:5000`. Verify with `GET /api/health`.

---

## Project Structure

```
green-guard-backend/
├── app.js                              # Express app entry point
├── server.js                           # Server bootstrap
├── package.json
├── .env.example                        # Environment template
├── scripts/
│   └── seed-admin.js                   # Admin account seeder
├── supabase/
│   └── migration.sql                   # Full DB schema + RLS + PostGIS
├── src/
│   ├── config/
│   │   ├── env.js                      # Centralized config with validation
│   │   └── supabase.js                 # Supabase client (anon + admin)
│   ├── middleware/
│   │   ├── auth.middleware.js           # JWT verification + profile load
│   │   ├── role.middleware.js           # Role-based access control
│   │   ├── rateLimiter.js              # Rate limiting (general/auth/AI)
│   │   ├── validate.js                 # Request validation
│   │   ├── errorHandler.js             # Global error handler
│   │   └── upload.js                   # Multer file upload config
│   ├── controllers/                    # 10 controller modules
│   ├── routes/                         # 10 route modules
│   ├── validators/                     # Request validators
│   ├── services/
│   │   ├── notification.service.js     # In-app notification creation
│   │   └── storage.service.js          # Supabase Storage upload/delete
│   └── utils/
│       ├── response.js                 # Standardized JSON responses
│       └── pagination.js               # Pagination helper
└── tests/                              # Test files
```

---

## Authentication

All protected routes require a **Bearer token** in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

### Getting a Token

1. **Register** → `POST /api/auth/register` — returns `session.access_token`
2. **Login** → `POST /api/auth/login` — returns `session.access_token`

### User Roles

| Role | Description | Can Do |
|------|-------------|--------|
| `admin` | Platform administrator | Approve/reject NGOs, ban users, view stats |
| `ngo` | Non-governmental org | Post plants, manage adoptions, create posts |
| `adopter` | Plant adopter | Browse plants, apply to adopt, submit reports |

---

## API Testing Guide (Postman)

### Step 0: Import Setup
1. Open Postman → create a new Collection called **"Green Guard v2"**
2. Set a collection-level variable: `base_url` = `http://localhost:5000`
3. For each token, create variables: `admin_token`, `ngo_token`, `adopter_token`

### Step 1: Register Users

**Register NGO:**
```http
POST {{base_url}}/api/auth/register
Content-Type: application/json

{
  "email": "testngo@gmail.com",
  "password": "test1234",
  "username": "TestNGO",
  "display_name": "Test NGO Organization",
  "role": "ngo"
}
```
→ Save `session.access_token` as `ngo_token`

**Register Adopter:**
```http
POST {{base_url}}/api/auth/register
Content-Type: application/json

{
  "email": "testadopter@gmail.com",
  "password": "test1234",
  "username": "TestAdopter",
  "display_name": "Test Adopter",
  "role": "adopter"
}
```
→ Save `session.access_token` as `adopter_token`

### Step 2: Login as Admin

```http
POST {{base_url}}/api/auth/login
Content-Type: application/json

{
  "email": "admin@greenguard.com",
  "password": "@rrm$2026"
}
```
→ Save `session.access_token` as `admin_token`

### Step 3: Approve NGO (Admin)

First, get pending NGOs:
```http
GET {{base_url}}/api/admin/ngos?status=pending
Authorization: Bearer {{admin_token}}
```

Then approve using the `id` from the response:
```http
PATCH {{base_url}}/api/admin/ngos/<ngo_id>/approve
Authorization: Bearer {{admin_token}}
```

### Step 4: Create a Plant (NGO)

```http
POST {{base_url}}/api/plants
Authorization: Bearer {{ngo_token}}
Content-Type: multipart/form-data

Form fields:
  plant_name: "Neem Tree"
  species: "Azadirachta indica"
  description: "A healthy neem tree near the city park"
  latitude: 19.076
  longitude: 72.877
  address: "Andheri, Mumbai"
  images: <attach .jpg or .png file>
```

### Step 5: Browse & Apply for Adoption (Adopter)

List available plants:
```http
GET {{base_url}}/api/plants?status=available
Authorization: Bearer {{adopter_token}}
```

Apply for a plant:
```http
POST {{base_url}}/api/adoptions/<plant_id>/apply
Authorization: Bearer {{adopter_token}}
Content-Type: application/json

{
  "answers": {
    "why_adopt": "I want to contribute to urban greenery",
    "experience": "2 years hobby gardening",
    "care_plan": "Daily watering, weekly soil check"
  }
}
```

### Step 6: Approve Adoption (NGO)

Check applications:
```http
GET {{base_url}}/api/ngo/applications
Authorization: Bearer {{ngo_token}}
```

Approve:
```http
PATCH {{base_url}}/api/adoptions/<adoption_id>/approve
Authorization: Bearer {{ngo_token}}
```

### Step 7: Community Features

**Create post (NGO):**
```http
POST {{base_url}}/api/posts
Authorization: Bearer {{ngo_token}}
Content-Type: multipart/form-data

Form fields:
  content: "We just planted 50 new trees in the Mumbai area! 🌳"
  images: <attach image>
```

**Like a post:**
```http
POST {{base_url}}/api/posts/<post_id>/like
Authorization: Bearer {{adopter_token}}
```

**Follow an NGO:**
```http
POST {{base_url}}/api/profiles/<ngo_user_id>/follow
Authorization: Bearer {{adopter_token}}
```

### Step 8: Growth Reports (Adopter)

```http
POST {{base_url}}/api/reports
Authorization: Bearer {{adopter_token}}
Content-Type: multipart/form-data

Form fields:
  plant_id: <adopted_plant_id>
  health_status: "healthy"
  height_cm: 45
  notes: "New leaves sprouting, looking great!"
  photos: <attach image>
```

### Step 9: Notifications

```http
GET {{base_url}}/api/notifications
Authorization: Bearer {{adopter_token}}

GET {{base_url}}/api/notifications/unread-count
Authorization: Bearer {{adopter_token}}

PATCH {{base_url}}/api/notifications/read-all
Authorization: Bearer {{adopter_token}}
```

### Step 10: Additional Routes

```http
# Profile
GET {{base_url}}/api/auth/me                        # Current user
PUT {{base_url}}/api/auth/me                        # Update profile

# Password reset
POST {{base_url}}/api/auth/forgot-password          # Send reset email
POST {{base_url}}/api/auth/reset-password            # Reset with new password

# Nearby Plants (PostGIS)
GET {{base_url}}/api/plants/nearby?lat=19.076&lng=72.877&radius=10000

# Map Data
GET {{base_url}}/api/plants/map

# Platform Stats (Admin)
GET {{base_url}}/api/admin/stats

# NGO Dashboard
GET {{base_url}}/api/ngo/dashboard
GET {{base_url}}/api/ngo/stats

# AI Identification
GET {{base_url}}/api/ai/status
POST {{base_url}}/api/ai/identify                    # form-data: image file
```

---

## API Reference

### Response Format

All endpoints return consistent JSON:

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 }
}
```

**Error:**
```json
{
  "success": false,
  "error": { "code": "UNAUTHORIZED", "message": "Invalid or expired token" }
}
```

### Endpoint Table

| Method | Endpoint | Auth | Role | Description |
|--------|----------|:----:|------|-------------|
| | **Auth** | | | |
| POST | `/api/auth/register` | ❌ | — | Register (NGO or Adopter) |
| POST | `/api/auth/login` | ❌ | — | Login, returns JWT |
| GET | `/api/auth/me` | ✅ | — | Current user profile |
| PUT | `/api/auth/me` | ✅ | — | Update profile fields |
| POST | `/api/auth/forgot-password` | ❌ | — | Send password reset email |
| POST | `/api/auth/reset-password` | ✅ | — | Set new password |
| POST | `/api/auth/logout` | ✅ | — | Sign out |
| | **Admin** | | | |
| GET | `/api/admin/ngos` | ✅ | admin | List NGOs (`?status=pending`) |
| PATCH | `/api/admin/ngos/:id/approve` | ✅ | admin | Approve NGO registration |
| PATCH | `/api/admin/ngos/:id/reject` | ✅ | admin | Reject NGO registration |
| GET | `/api/admin/users` | ✅ | admin | List users (`?role=ngo`) |
| PATCH | `/api/admin/users/:id/ban` | ✅ | admin | Ban a user |
| PATCH | `/api/admin/users/:id/unban` | ✅ | admin | Unban a user |
| GET | `/api/admin/stats` | ✅ | admin | Platform-wide statistics |
| | **NGO** | | | |
| POST | `/api/ngo/onboarding` | ✅ | ngo | Submit org details |
| GET | `/api/ngo/dashboard` | ✅ | ngo | Dashboard summary |
| GET | `/api/ngo/applications` | ✅ | ngo | Adoption applications |
| GET | `/api/ngo/stats` | ✅ | ngo | Monthly planted/adopted chart |
| | **Plants** | | | |
| POST | `/api/plants` | ✅ | ngo | Create plant (multipart) |
| GET | `/api/plants` | ✅ | — | List plants (paginated) |
| GET | `/api/plants/:id` | ✅ | — | Single plant detail |
| PUT | `/api/plants/:id` | ✅ | ngo | Update own plant |
| DELETE | `/api/plants/:id` | ✅ | ngo | Delete own plant |
| GET | `/api/plants/nearby` | ✅ | — | PostGIS radius search |
| GET | `/api/plants/map` | ✅ | — | All plants for map |
| | **Adoptions** | | | |
| POST | `/api/adoptions/:plantId/apply` | ✅ | adopter | Apply to adopt |
| GET | `/api/adoptions/my` | ✅ | adopter | My applications |
| GET | `/api/adoptions/:id` | ✅ | — | Application detail |
| PATCH | `/api/adoptions/:id/approve` | ✅ | ngo | Approve application |
| PATCH | `/api/adoptions/:id/reject` | ✅ | ngo | Reject application |
| | **Posts** | | | |
| POST | `/api/posts` | ✅ | ngo | Create community post |
| GET | `/api/posts` | ✅ | — | Feed (follows first) |
| GET | `/api/posts/:id` | ✅ | — | Single post |
| DELETE | `/api/posts/:id` | ✅ | ngo | Delete own post |
| POST | `/api/posts/:id/like` | ✅ | — | Toggle like |
| POST | `/api/posts/:id/bookmark` | ✅ | — | Toggle bookmark |
| GET | `/api/posts/bookmarks` | ✅ | — | Bookmarked posts |
| | **Profiles** | | | |
| GET | `/api/profiles/:userId` | ✅ | — | View user profile |
| GET | `/api/profiles/:userId/posts` | ✅ | — | User's posts |
| GET | `/api/profiles/:userId/plants` | ✅ | — | User's plants |
| POST | `/api/profiles/:userId/follow` | ✅ | — | Follow user |
| DELETE | `/api/profiles/:userId/follow` | ✅ | — | Unfollow user |
| GET | `/api/profiles/:userId/followers` | ✅ | — | Follower list |
| GET | `/api/profiles/:userId/following` | ✅ | — | Following list |
| | **Reports** | | | |
| POST | `/api/reports` | ✅ | adopter | Submit growth report |
| GET | `/api/reports/my` | ✅ | adopter | My reports |
| GET | `/api/reports/plant/:plantId` | ✅ | — | Reports for a plant |
| | **Notifications** | | | |
| GET | `/api/notifications` | ✅ | — | List (paginated) |
| GET | `/api/notifications/unread-count` | ✅ | — | Unread badge count |
| PATCH | `/api/notifications/read-all` | ✅ | — | Mark all as read |
| PATCH | `/api/notifications/:id/read` | ✅ | — | Mark one as read |
| | **AI** | | | |
| POST | `/api/ai/identify` | ✅ | — | Identify plant image |
| GET | `/api/ai/status` | ✅ | — | AI service status |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18+ + Express 4.x |
| Database | Supabase (PostgreSQL 15 + PostGIS) |
| Auth | Supabase Auth (email/password, JWT) |
| File Storage | Supabase Storage |
| AI Workflow | PlantNet + Gemini via n8n webhook |
| Rate Limiting | express-rate-limit |
| Validation | express-validator |
| Security | helmet, cors, RLS policies |
| Deployment | Railway |

---

## Environment Variables

See [`.env.example`](.env.example) for all variables:

| Variable | Required | Description |
|----------|:--------:|-------------|
| `PORT` | ❌ | Server port (default: 5000) |
| `NODE_ENV` | ❌ | `development` / `production` |
| `SUPABASE_URL` | ✅ | Supabase project URL |
| `SUPABASE_ANON_KEY` | ✅ | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key (**secret**) |
| `N8N_WEBHOOK_URL` | ❌ | n8n webhook for AI identification |
| `FRONTEND_URL` | ❌ | Frontend URL for CORS (default: `http://localhost:3000`) |
| `ADMIN_EMAIL` | ❌ | Admin seed email |
| `ADMIN_PASSWORD` | ❌ | Admin seed password |
| `ADMIN_USERNAME` | ❌ | Admin seed username |

---

## Database Schema

See [`supabase/migration.sql`](supabase/migration.sql) for the complete schema. Key tables:

| Table | Purpose |
|-------|---------|
| `profiles` | User data (linked to `auth.users`) |
| `ngo_profiles` | NGO-specific data + approval status |
| `plants` | Plant listings with PostGIS location |
| `adoptions` | Adoption applications + workflow |
| `growth_reports` | Adopter-submitted plant health reports |
| `posts` | Community feed posts |
| `likes` / `bookmarks` | Post interactions |
| `follows` | User follow relationships |
| `notifications` | In-app notifications |

---

## Deployment

### Railway

1. Push to GitHub
2. Connect repo to [Railway](https://railway.app)
3. Set environment variables in Railway dashboard
4. Deploy — Railway auto-detects Node.js

### Important Notes
- The `service_role` key must **never** be exposed to the frontend
- All file uploads use memory storage (no disk needed — Railway compatible)
- PostGIS extension must be enabled in Supabase (handled by migration)

---

## License

MIT
