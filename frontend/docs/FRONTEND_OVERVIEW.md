# Green Guard — Frontend Overview & Integration Guide

> **Stack**: Next.js 15 (App Router) · TypeScript · Axios · Tailwind CSS · Leaflet Maps
> **Backend Base URL**: `http://localhost:5000/api` (configurable via `.env.local`)

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [How the Frontend Works](#2-how-the-frontend-works)
3. [Authentication Flow](#3-authentication-flow)
4. [API Service Layer](#4-api-service-layer)
5. [Data Types](#5-data-types)
6. [Pages & Routes](#6-pages--routes)
7. [Key Components](#7-key-components)
8. [State Management & Hooks](#8-state-management--hooks)
9. [Frontend ↔ Backend Integration Guide](#9-frontend--backend-integration-guide)
10. [Running Locally](#10-running-locally)
11. [Environment Variables](#11-environment-variables)
12. [Roles & Permissions](#12-roles--permissions)

---

## 1. Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Redirects to /plants or /login
│   ├── layout.tsx          # Root layout with providers
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   ├── plants/             # Public plant listing & detail
│   │   └── [id]/
│   │       └── adopt/      # Adoption application form
│   ├── feed/               # Community post feed
│   │   └── [id]/           # Single post detail
│   ├── map/                # Interactive map of plants
│   ├── profile/
│   │   ├── [id]/           # Public user profile
│   │   └── settings/       # Edit own profile (auth required)
│   ├── dashboard/
│   │   ├── adoptions/      # Adopter's adoption history
│   │   ├── reports/        # Growth report list & creation
│   │   ├── bookmarks/      # Saved bookmarked posts
│   │   ├── ngo/            # NGO dashboard & applications
│   │   └── admin/          # Admin user & NGO management
│   ├── notifications/      # Notification centre
│   ├── ai-identifier/      # AI plant identification tool
│   └── ngo/onboarding/     # NGO registration form
│
├── components/             # Reusable UI components
│   ├── Navbar.tsx
│   └── ui/                 # Badge, Skeleton, EmptyState …
│
├── hooks/                  # Custom React hooks
│   └── useFeed.ts          # Infinite-scroll feed hook
│
├── lib/
│   └── auth.tsx            # AuthContext + useAuth hook
│
├── services/
│   └── api.ts              # All Axios API calls (grouped by domain)
│
└── types/
    └── index.ts            # All TypeScript interfaces & enums
```

---

## 2. How the Frontend Works

### Page Rendering

The app uses **Next.js App Router** with two rendering modes:

| Mode | Pages | Why |
|------|-------|-----|
| **Static** (pre-rendered) | Login, Register, Plants list, Feed, Map, Dashboard shells | Fast first load; SSR not needed |
| **Dynamic** (server-rendered on demand) | `/feed/[id]`, `/plants/[id]`, `/profile/[id]`, `/plants/[id]/adopt` | Content changes per request |

All pages marked `'use client'` fetch their data inside `useEffect` hooks after the component mounts, using the `api.ts` service layer.

### Request Lifecycle

```
User Action
    │
    ▼
React Component (page.tsx)
    │  calls
    ▼
api.ts service function  ──────► Axios instance
                                       │  adds Authorization: Bearer <token>
                                       ▼
                                  Backend API (localhost:5000)
                                       │
                                       ▼
                                  JSON response
    ▲
    │  setStateUpdate
React Component updates UI
```

### Auth Guard

Pages that require login check `useAuth()` and redirect to `/login` if the user is not authenticated. The `AuthContext` (`src/lib/auth.tsx`) is the global source of truth for the current user.

---

## 3. Authentication Flow

### Login
1. User submits `{ email, password }` on `/login`.
2. `authApi.login()` posts to `POST /api/auth/login`.
3. Backend returns `{ token, user }`.
4. Token stored in `localStorage` under key `gg_token`.
5. User object stored in `AuthContext` state.

### Register
1. User fills `{ email, password, username, display_name, role }` on `/register`.
2. `authApi.register()` posts to `POST /api/auth/register`.
3. On success, same token & user flow as login.

### Logout
1. `authApi.logout()` calls `POST /api/auth/logout` (clears server session).
2. Token removed from `localStorage`.
3. User state cleared; redirect to `/login`.

### Token Lifecycle
- The Axios **request interceptor** in `api.ts` reads `gg_token` from `localStorage` and attaches it as `Authorization: Bearer <token>` to **every outgoing request** automatically.
- **No manual token handling is needed in any page component.**

### Password Reset Flow
1. `/forgot-password` → `POST /api/auth/forgot-password` sends reset email.
2. User clicks link in email → `/reset-password?token=…`
3. `POST /api/auth/reset-password` with `{ new_password }` resets the password.

---

## 4. API Service Layer

All backend calls live in **`src/services/api.ts`**. They are grouped into domain-specific objects:

| Export | Domain | Key Methods |
|--------|--------|-------------|
| `authApi` | Authentication | `login`, `register`, `logout`, `updateProfile` |
| `plantsApi` | Plants | `getPlants`, `getPlant`, `createPlant`, `getMapPlants` |
| `adoptionsApi` | Adoptions | `apply`, `getMyAdoptions`, `approve`, `reject` |
| `reportsApi` | Growth Reports | `getMyReports`, `createReport` |
| `feedApi` | Social Feed | `getFeed`, `getPost`, `toggleLike`, `toggleBookmark`, `addComment` |
| `usersApi` | Profiles | `getUser`, `follow`, `unfollow`, `getFollowers`, `getFollowing` |
| `notificationsApi` | Notifications | `getNotifications`, `markRead`, `markAllRead` |
| `adminApi` | Admin | `getStats`, `getUsers`, `banUser`, `unbanUser`, `getNgos` |
| `ngoApi` | NGO Dashboard | `getDashboard`, `getNgoStats`, `getApplications` |
| `ngoOnboardingApi` | NGO Onboarding | `submit` |
| `aiApi` | AI Plant ID | `identify`, `getStatus` |

### How to Add a New API Call

```typescript
// In src/services/api.ts, add to the relevant group:
export const myApi = {
  doSomething: (id: string) =>
    api.get<ApiResponse<MyType>>(`/my-endpoint/${id}`),
};
```

Then in your component:
```typescript
import { myApi } from '@/services/api';

const res = await myApi.doSomething(id);
const data = res.data.data; // typed as MyType
```

---

## 5. Data Types

All TypeScript interfaces live in **`src/types/index.ts`**.

### Core Entities

| Type | Key Fields |
|------|-----------|
| `User` | `id`, `email`, `fullName`, `username`, `display_name`, `role`, `avatar`, `bio`, `followersCount`, `followingCount` |
| `Plant` | `id`, `plant_name`, `species`, `description`, `category`, `status`, `images[]`, `latitude`, `longitude`, `ngo` |
| `Adoption` | `id`, `plantId`, `plant`, `adopter`, `status`, `answers`, `reviewNotes` |
| `GrowthReport` | `id`, `plantId`, `plant`, `health`, `notes`, `images[]` |
| `Post` | `id`, `author`, `content`, `images[]`, `plant?`, `likesCount`, `commentsCount`, `isLiked`, `isBookmarked` |
| `Notification` | `id`, `type`, `title`, `message`, `link?`, `isRead` |

### Response Wrappers

Every API response is wrapped in one of:
```typescript
// Single item
ApiResponse<T> = { success: boolean; data: T; message?: string }

// Paginated list
PaginatedResponse<T> = { success: boolean; data: T[]; total: number; page: number; totalPages: number }
```

### Enums

```typescript
UserRole        = 'admin' | 'ngo' | 'adopter'
PlantStatus     = 'available' | 'pending' | 'adopted'
PlantCategory   = 'tree' | 'shrub' | 'flower' | 'herb' | 'succulent' | 'indoor' | 'outdoor'
PlantHealth     = 'healthy' | 'needs_attention' | 'critical' | 'dead'
AdoptionStatus  = 'pending' | 'approved' | 'rejected' | 'cancelled'
```

---

## 6. Pages & Routes

| Route | Auth Required | Role | Description |
|-------|:---:|:---:|-------------|
| `/login` | ✗ | — | Email/password login |
| `/register` | ✗ | — | User registration with role selection |
| `/forgot-password` | ✗ | — | Request password reset email |
| `/reset-password` | ✗ | — | Set new password using token |
| `/plants` | ✗ | — | Browse all available plants |
| `/plants/[id]` | ✗ | — | Plant detail page with adoption button |
| `/plants/[id]/adopt` | ✓ | adopter | Adoption application form |
| `/map` | ✗ | — | Leaflet map showing plant locations |
| `/feed` | ✗ | — | Community post feed with infinite scroll |
| `/feed/[id]` | ✗ | — | Individual post with comments |
| `/feed/new` | ✓ | all | Create a new post |
| `/profile/[id]` | ✗ | — | Public user profile + followers/following modal |
| `/profile/settings` | ✓ | all | Edit own display name, bio, phone, address |
| `/notifications` | ✓ | all | Notification centre |
| `/ai-identifier` | ✓ | all | AI-powered plant identification |
| `/ngo/onboarding` | ✓ | adopter | Apply to become an NGO |
| `/dashboard` | ✓ | all | Role-based dashboard redirect |
| `/dashboard/adoptions` | ✓ | adopter | My adoption applications |
| `/dashboard/reports` | ✓ | adopter | My growth reports |
| `/dashboard/reports/new` | ✓ | adopter | Submit a new growth report |
| `/dashboard/bookmarks` | ✓ | all | Saved bookmarked posts |
| `/dashboard/ngo` | ✓ | ngo | NGO overview: stats, applications, plants |
| `/dashboard/ngo/plants/new` | ✓ | ngo | Register a new plant |
| `/dashboard/admin` | ✓ | admin | Platform-wide statistics |
| `/dashboard/admin/users` | ✓ | admin | Ban / unban users |
| `/dashboard/admin/approvals` | ✓ | admin | Approve / reject NGO applications |

---

## 7. Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `Navbar` | `components/Navbar.tsx` | Top navigation with role-aware links, notification badge |
| `Badge` | `components/ui/Badge.tsx` | Status chips for plants, adoptions, health |
| `Skeleton` | `components/ui/Skeleton.tsx` | Loading placeholders |
| `EmptyState` | `components/ui/EmptyState.tsx` | Empty list fallback with icon and message |

---

## 8. State Management & Hooks

### AuthContext (`src/lib/auth.tsx`)

The only global state is the **current user**. Every component that needs auth info calls:

```typescript
const { user, isAuthenticated, login, logout, updateUser } = useAuth();
```

### useFeed (`src/hooks/useFeed.ts`)

Custom hook managing the community feed with infinite-scroll pagination:

```typescript
const { posts, loading, loadingMore, lastPostRef, toggleLike, toggleBookmark } = useFeed();
```

- `lastPostRef` — ref callback for the sentinel DOM element that triggers loading the next page using `IntersectionObserver`.
- `toggleLike` / `toggleBookmark` — call `feedApi.toggleLike` / `feedApi.toggleBookmark` (single `POST` endpoints that toggle the state server-side).

---

## 9. Frontend ↔ Backend Integration Guide

### Prerequisites

| Tool | Min Version |
|------|-------------|
| Node.js | 18+ |
| npm | 9+ |

### Step 1 — Configure the Backend

The backend must expose a REST API on **`http://localhost:5000`**.

Required environment variables in the **backend** `.env`:
```
PORT=5000
FRONTEND_URL=http://localhost:3000   # for CORS
DATABASE_URL=...                     # Supabase / PostgreSQL connection string
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
JWT_SECRET=...
```

Start the backend:
```bash
cd <your-backend-folder>
npm install
npm run dev
# → Server running on http://localhost:5000
```

Verify it is responding:
```bash
curl http://localhost:5000/api/admin/stats
# Expected: 401 Unauthorized  (backend is up, auth required)
```

### Step 2 — Configure the Frontend

`.env.local` in `c:/Green_guard` (already configured):
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

> **No changes needed** — the Axios instance in `api.ts` reads this variable automatically.

### Step 3 — Start the Frontend

```bash
cd c:\Green_guard
npm install
npm run dev
# → Frontend running on http://localhost:3000
```

### Step 4 — Test Key Flows

Open `http://localhost:3000` in Chrome with **DevTools → Network tab open**.

| # | Action | Expected API Call | Expected Response |
|---|--------|------------------|-------------------|
| 1 | Register as Adopter | `POST /api/auth/register` `{ email, password, username, display_name, role: "adopter" }` | `201` with `{ token, user }` |
| 2 | Login | `POST /api/auth/login` `{ email, password }` | `200` with `{ token, user }` |
| 3 | Browse plants | `GET /api/plants?page=1&limit=12` | `200` paginated plant list |
| 4 | View plant | `GET /api/plants/:id` | `200` single plant object |
| 5 | Apply for adoption | `POST /api/adoptions/:plantId/apply` `{ answers: {...} }` | `201` adoption created |
| 6 | View feed | `GET /api/posts?page=1` | `200` paginated post list |
| 7 | Like a post | `POST /api/posts/:id/like` | `200` like toggled |
| 8 | View map | `GET /api/plants/map` | `200` array of lat/lng plant data |
| 9 | Logout | `POST /api/auth/logout` | `200` |
| 10 | NGO: view dashboard | `GET /api/ngo/dashboard` + `GET /api/ngo/stats` | `200` stats + dashboard data |

### Step 5 — Troubleshoot CORS

If the browser console shows `Access-Control-Allow-Origin` errors:

1. Ensure the backend has `FRONTEND_URL=http://localhost:3000` in its `.env`.
2. Confirm the backend CORS middleware includes `http://localhost:3000` as an allowed origin.
3. Restart the backend after any `.env` change.

### Step 6 — Troubleshoot JWT / 401 Errors

1. Open DevTools → Application → Local Storage → check key `gg_token` exists.
2. Paste the token at [jwt.io](https://jwt.io) to inspect expiry.
3. If expired, log in again to get a fresh token.

---

## 10. Running Locally

### Both servers running together

**Terminal 1 — Backend:**
```bash
cd <backend-folder>
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd c:\Green_guard
npm run dev
```

Open: [`http://localhost:3000`](http://localhost:3000)

### Production Build Check
```bash
cd c:\Green_guard
npm run build
# Exit code 0 = no TypeScript errors, all pages compiled
```

---

## 11. Environment Variables

| Variable | Required | Default | Description |
|----------|:--------:|---------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | ✓ | `http://localhost:5000/api` | Backend REST API base URL |

> Variables prefixed with `NEXT_PUBLIC_` are embedded in the browser bundle. **Never put secrets here.**

---

## 12. Roles & Permissions

Green Guard has three user roles, each unlocking different pages and API endpoints:

| Role | Can Do |
|------|--------|
| `adopter` | Browse plants, apply to adopt, write growth reports, interact with the community feed, apply to become an NGO |
| `ngo` | Everything an adopter can do + Create/manage plants, view & approve/reject adoption applications, view NGO stats |
| `admin` | Everything + View platform stats, ban/unban users, approve/reject NGO applications |

Role is set at registration and stored in the JWT payload. The backend validates role on protected routes. The frontend reads `user.role` from `AuthContext` to conditionally render UI elements.

---

*Last updated: March 2026 | Green Guard v2*
