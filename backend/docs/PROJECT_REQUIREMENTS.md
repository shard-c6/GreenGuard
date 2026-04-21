# Green Guard v2 — Project Requirements Document (PRD)

> **Version:** 2.1 | **Last Updated:** April 19, 2026
> **Backend Status:** ✅ Complete and optimized | **Frontend Status:** ✅ v2.1 Premium Active

---

## 1. Project Overview

**Green Guard** is a plant adoption platform connecting **NGOs** (who plant trees) with **Adopters** (who want to adopt and care for plants). The platform features geospatial plant discovery, an Instagram-like community feed, AI-powered plant identification, and a complete adoption workflow.

### Core Value Proposition
- NGOs post plants they've planted → Adopters discover and adopt them → Adopters submit growth reports → Community engagement through posts and follows

---

## 2. User Roles & Permissions

| Role | Who | Can Do | Cannot Do |
|------|-----|--------|-----------|
| **Admin** | Platform operators | Approve/reject NGOs, ban/unban users, view platform stats | Create plants, adopt, post |
| **NGO** | Environmental organizations | Post plants, manage adoption applications, create community posts, view dashboard | Adopt plants |
| **Adopter** | Regular users | Browse plants, apply to adopt, submit growth reports, like/bookmark/follow | Create plants, create posts, approve adoptions |

### Registration Flow
1. User registers as **NGO** or **Adopter** (not both)
2. NGOs start in `pending` status → Admin must approve before they can use the platform
3. Adopters are active immediately after registration

---

## 3. Feature Specifications

### 3.1 Authentication
| Feature | Details |
|---------|---------|
| **Registration** | Email + password + username + role selection (NGO/Adopter) |
| **Login** | Email + password → returns JWT access token + refresh token |
| **Password Reset** | Forgot password → email with magic link → reset form |
| **Profile Management** | Update display name, bio, phone, address, avatar |
| **Session** | JWT-based, tokens expire (use refresh token to renew) |

**Frontend Pages Needed:**
- Login page
- Register page (with role selector: NGO / Adopter)
- Forgot password page
- Reset password page (receives token from email link)
- Profile settings page

**API Endpoints:**
```
POST /api/auth/register       — { email, password, username, display_name, role, darpan_id?, onboarding_answers? }
POST /api/auth/login          — { email, password }
GET  /api/auth/me             — Returns current user profile
PUT  /api/auth/me             — { display_name?, bio?, phone?, address? }
POST /api/auth/forgot-password — { email }
POST /api/auth/reset-password  — { new_password }
POST /api/auth/logout
```

---

### 3.2 Admin Panel
| Feature | Details |
|---------|---------|
| **NGO Management** | View pending/approved/rejected NGOs, approve or reject |
| **User Management** | View all users, ban/unban by role |
| **Platform Stats** | Total adopters, approved NGOs, plants, adoptions |

**Frontend Pages Needed:**
- Admin dashboard (stats overview)
- NGO approval queue (list view with approve/reject buttons)
- User management table (with ban/unban actions)

**API Endpoints:**
```
GET   /api/admin/ngos                 — ?status=pending|approved|rejected
PATCH /api/admin/ngos/:id/approve
PATCH /api/admin/ngos/:id/reject      — { reason? }
GET   /api/admin/users                — ?role=ngo|adopter
PATCH /api/admin/users/:id/ban        — { reason? }
PATCH /api/admin/users/:id/unban
GET   /api/admin/stats
```

**Stats Response Shape:**
```json
{
  "total_adopters": 150,
  "total_approved_ngos": 12,
  "total_plants": 340,
  "total_adoptions": 87
}
```

---

### 3.3 NGO Dashboard
| Feature | Details |
|---------|---------|
| **Onboarding** | After approval, NGO fills in org details (name, registration number, mission, website) |
| **Dashboard** | Summary cards: total plants, total adopted, pending applications |
| **Applications** | List of adoption applications with adopter info, approve/reject actions |
| **Stats Chart** | Monthly planted vs adopted chart |
| **Plant Management** | Create, edit, delete plants (see 3.4) |

**Frontend Pages Needed:**
- NGO onboarding form (post-approval)
- NGO dashboard (summary cards + chart)
- Applications list (with approve/reject for each)

**API Endpoints:**
```
POST /api/ngo/onboarding     — { org_name, registration_number, website, mission, address, darpan_id, onboarding_answers }
GET  /api/ngo/dashboard      — Returns { total_plants, total_adopted, pending_applications }
GET  /api/ngo/applications   — ?status=pending|approved|rejected
GET  /api/ngo/stats          — Returns { chart: [{month, planted, adopted}], totals: {...} }
```

---

### 3.4 Plant Management
| Feature | Details |
|---------|---------|
| **Create Plant** | NGO posts a plant with name, species, description, photos (max 3), GPS location, planted date |
| **Edit Plant** | NGO can edit own plants that are not yet adopted |
| **Delete Plant** | NGO can delete own plants only if status is `available` |
| **Browse Plants** | Paginated list with filters (status, NGO) |
| **Plant Detail** | Full info with NGO profile, images, location, care info |
| **Nearby Plants** | Radius search using user's GPS location (PostGIS) |
| **Map View** | All plants with color-coded markers by adoption status |

**Adoption Status Values:** `available` → `pending` → `adopted`

**Frontend Pages Needed:**
- Plant creation form (with image upload, map picker for location)
- Plant listing page (grid/list view with filters)
- Plant detail page (images, info, location map, adopt button)
- Nearby plants map (uses browser geolocation)
- NGO's "My Plants" management page

**API Endpoints:**
```
POST   /api/plants                        — multipart: plant_name, species, description, latitude, longitude, address, images[]
GET    /api/plants                        — ?status=available&ngo_id=xxx&page=1&limit=20
GET    /api/plants/:id
PUT    /api/plants/:id                    — { plant_name?, species?, description?, address? }
DELETE /api/plants/:id
GET    /api/plants/nearby                 — ?lat=19.076&lng=72.877&radius=10000 (Uses PostGIS ST_DistanceSphere)
GET    /api/plants/map
```

**Nearby Response Shape:**
```json
{
  "id": "uuid",
  "plant_name": "Neem Tree",
  "species": "Azadirachta indica",
  "adoption_status": "available",
  "distance_meters": 2340.5,
  "latitude": 19.076,
  "longitude": 72.877
}
```

**Map Marker Colors (suggested):**
| Status | Color | Meaning |
|--------|-------|---------|
| `available` | 🟢 Green | Open for adoption |
| `pending` | 🟡 Yellow | Application in review |
| `adopted` | 🔵 Blue | Already adopted |

---

### 3.5 Adoption Workflow

```
Adopter sees "available" plant
         ↓
Clicks "Adopt" → fills questionnaire → POST /adoptions/:plantId/apply
         ↓
Plant status → "pending"
NGO gets notification
         ↓
NGO reviews application
         ↓
    ┌─────────────┐
    │   APPROVE    │ → Plant status → "adopted"
    │              │ → All other applicants auto-rejected
    │              │ → Adopter gets notification
    └─────────────┘
    ┌─────────────┐
    │   REJECT     │ → If no more pending apps → plant → "available"
    │              │ → Adopter gets notification
    └─────────────┘
```

**Adoption Questions (suggested — team can customize):**
1. Why do you want to adopt this plant?
2. Do you have gardening experience? If yes, how long?
3. How will you care for the plant?
4. How far are you from the plant's location?

**Frontend Pages Needed:**
- Adoption application form (questionnaire)
- "My Adoptions" page for adopters (list with status badges)
- Adoption detail page

**API Endpoints:**
```
POST  /api/adoptions/:plantId/apply    — { answers: { question1: "...", ... } }
GET   /api/adoptions/my                — Adopter's applications
GET   /api/adoptions/:id               — Single application detail
PATCH /api/adoptions/:id/approve       — NGO only
PATCH /api/adoptions/:id/reject        — { review_notes? }, NGO only
```

---

### 3.6 Community Feed (Instagram-style)
| Feature | Details |
|---------|---------|
| **Posts** | NGOs create posts with text + images (max 5) |
| **Feed** | All users see posts, sorted by followed NGOs first, then by recency |
| **Likes** | Toggle like on any post |
| **Bookmarks** | Toggle bookmark to save posts |
| **Follows** | Follow/unfollow NGOs or users |

**Frontend Pages Needed:**
- Community feed page (infinite scroll or paginated)
- Post creation form (NGO only)
- Post detail page (full images, like/bookmark buttons)
- Bookmarked posts page

**API Endpoints:**
```
POST   /api/posts                      — multipart: content, images[], plant_id?
GET    /api/posts                      — Feed (paginated)
GET    /api/posts/:id
DELETE /api/posts/:id
POST   /api/posts/:id/like             — Toggle (like/unlike)
POST   /api/posts/:id/bookmark         — Toggle (bookmark/unbookmark)
GET    /api/posts/bookmarks            — User's saved posts
```

**Feed Response includes:**
```json
{
  "id": "uuid",
  "content": "We planted 50 trees today!",
  "image_urls": ["https://..."],
  "likes_count": 23,
  "bookmarks_count": 5,
  "is_liked": true,
  "is_bookmarked": false,
  "profiles": {
    "username": "GreenNGO",
    "display_name": "Green NGO",
    "avatar_url": "https://..."
  },
  "created_at": "2026-03-20T10:30:00Z"
}
```

---

### 3.7 User Profiles & Social
| Feature | Details |
|---------|---------|
| **Public Profile** | View any user's profile with counts (followers, following, plants, posts) |
| **Follow System** | Follow/unfollow any user |
| **User's Content** | See a user's posts and plants on their profile |

**Frontend Pages Needed:**
- Public profile page (avatar, bio, stats, follow button)
- Followers / following list modals
- Profile tabs: Posts | Plants (if NGO)

**API Endpoints:**
```
GET    /api/profiles/:userId              — Profile with counts + is_following
GET    /api/profiles/:userId/posts
GET    /api/profiles/:userId/plants
POST   /api/profiles/:userId/follow
DELETE /api/profiles/:userId/follow
GET    /api/profiles/:userId/followers
GET    /api/profiles/:userId/following
```

---

### 3.8 Growth Reports
| Feature | Details |
|---------|---------|
| **Submit Report** | Adopter submits health status, height, notes, photos for adopted plant |
| **Report History** | View all reports for a specific plant (timeline view) |
| **My Reports** | Adopter sees their submitted reports |

**Health Status Values:** `healthy`, `needs_attention`, `critical`, `dead`

**Frontend Pages Needed:**
- Report submission form (image upload, health dropdown, height input)
- Plant report timeline page
- "My Reports" list

**API Endpoints:**
```
POST /api/reports                      — multipart: plant_id, health_status, height_cm, notes, photos[]
GET  /api/reports/my
GET  /api/reports/plant/:plantId
```

---

### 3.9 Notifications
| Feature | Details |
|---------|---------|
| **Types** | adoption_approved, adoption_rejected, new_application |
| **Display** | Bell icon with unread count badge |
| **Actions** | Mark single or all as read |

**Frontend Components Needed:**
- Notification bell icon with badge (unread count)
- Notification dropdown/page (list of notifications)
- Mark as read on click

**API Endpoints:**
```
GET   /api/notifications                — Paginated list
GET   /api/notifications/unread-count   — { unread_count: 5 }
PATCH /api/notifications/read-all
PATCH /api/notifications/:id/read
```

**Polling Strategy:** Call `/unread-count` every 30 seconds for the bell badge.

---

### 3.10 AI Plant Identification
| Feature | Details |
|---------|---------|
| **Identify** | Upload a plant photo → AI returns species, care info, geographic occurrence |
| **Status** | Check if AI service is configured |
| **Integration** | Via n8n webhook → PlantNet + Groq (flora-genius module) |

**Frontend Page Needed:**
- Plant identifier page (upload image → show results)
- Integrate into plant creation form (auto-fill species)

**API Endpoints:**
```
POST /api/ai/identify     — multipart: image (single file)
GET  /api/ai/status       — { available: true/false }
GET  /api/posts/map       — Returns all plantations for global mapping
```

---

## 4. Technical Specifications

### 4.1 API Standards
| Spec | Value |
|------|-------|
| Base URL (local) | `http://localhost:5000/api` |
| Auth | Bearer JWT in `Authorization` header |
| Request Body | JSON or `multipart/form-data` (for file uploads) |
| Response Format | `{ success, data, meta?, error? }` |
| Pagination | `?page=1&limit=20` (max 50 per page) |
| Rate Limits | 100 req/15min (general), 20/15min (auth), 10/15min (AI) |

### 4.2 Frontend Tech Stack (Recommended)
| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 14+ (App Router) | Framework |
| React | 18+ | UI library |
| Tailwind CSS | v4 (latest) | Styling |
| React-Leaflet | latest | Maps (OpenStreetMap) |
| Supabase JS | v2 | Auth state management on frontend |
| Axios or Fetch | — | API calls |

### 4.3 Frontend Auth Integration

The frontend should use `@supabase/supabase-js` for auth state management:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    // Store session.access_token for API calls
    localStorage.setItem('token', session.access_token);
  } else {
    localStorage.removeItem('token');
  }
});

// Use token for API calls
fetch('/api/plants', {
  headers: { Authorization: `Bearer ${token}` }
});
```

### 4.4 File Upload Format

For endpoints that accept images, use `multipart/form-data`:

```javascript
const formData = new FormData();
formData.append('plant_name', 'Neem Tree');
formData.append('latitude', 19.076);
formData.append('images', file1);
formData.append('images', file2);

fetch('/api/plants', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: formData, // NO Content-Type header — browser sets it automatically
});
```

### 4.5 Map Integration

Use **React-Leaflet** with **OpenStreetMap** tiles (free, no API key needed):

```javascript
// Tile URL: https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
// Fetch markers: GET /api/plants/map
// Nearby search: GET /api/plants/nearby?lat=19.076&lng=72.877&radius=10000
```

---

## 5. Pages Checklist for Frontend Team

| # | Page | Priority | Role |
|---|------|:--------:|------|
| 1 | Landing Page | 🔴 High | Public |
| 2 | Login | 🔴 High | Public |
| 3 | Register (with role selector) | 🔴 High | Public |
| 4 | Forgot / Reset Password | 🟡 Medium | Public |
| 5 | Plant Listing (browse) | 🔴 High | All |
| 6 | Plant Detail | 🔴 High | All |
| 7 | Nearby Plants Map | 🔴 High | All |
| 8 | Community Feed | 🔴 High | All |
| 9 | Post Detail | 🟡 Medium | All |
| 10 | User Profile | 🟡 Medium | All |
| 11 | NGO Dashboard | 🔴 High | NGO |
| 12 | Plant Creation Form | 🔴 High | NGO |
| 13 | Application Management | 🔴 High | NGO |
| 14 | Post Creation Form | 🟡 Medium | NGO |
| 15 | My Adoptions | 🔴 High | Adopter |
| 16 | Adoption Application Form | 🔴 High | Adopter |
| 17 | Growth Report Form | 🟡 Medium | Adopter |
| 18 | My Reports | 🟢 Low | Adopter |
| 19 | Bookmarked Posts | 🟢 Low | All |
| 20 | Plant Identifier (AI) | 🟢 Low | All |
| 21 | Admin Dashboard | 🟡 Medium | Admin |
| 22 | NGO Approval Queue | 🟡 Medium | Admin |
| 23 | User Management | 🟢 Low | Admin |
| 24 | Profile Settings | 🟡 Medium | All |
| 25 | Notification Center | 🟡 Medium | All |
| 26 | NGO Onboarding Form | 🟡 Medium | NGO |

---

## 6. Deployment & Environment

| Service | Platform | URL |
|---------|----------|-----|
| Backend API | Railway | `https://green-guard-api.up.railway.app` (TBD) |
| Frontend | Vercel | `https://greenguard.vercel.app` (TBD) |
| Database | Supabase | `https://eopmwvdmgzxoaxqqfsdq.supabase.co` |
| AI Workflow | n8n | Self-hosted or n8n Cloud |

### CORS Configuration
Backend allows requests from the frontend URL set in `.env` (`FRONTEND_URL`). Update this when deploying.

---

## 7. Open Items & Future Scope

| Item | Status | Notes |
|------|--------|-------|
| n8n AI workflow | ✅ Active | flora-genius module fully integrated |
| GitHub/Google OAuth | 🟡 In Progress | Auth middleware support added |
| User Reporting | 🟡 In Progress | admin/resolveReport endpoints pending |
| Push notifications | 📋 Planned | Via service worker / FCM |
| Direct messages | 📋 Future | User-to-user chat |
| Plant search/filter | 📋 Planned | By name, species, distance |
| Image optimization | 📋 Planned | Compress before upload |
| Email notifications | 📋 Future | Supabase handles password reset emails already |
| PWA support | 📋 Future | For mobile-like experience |
