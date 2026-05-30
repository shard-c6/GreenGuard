# 🚀 Getting Started — Developer Onboarding Guide

Welcome to the GreenGuard repository! Follow this comprehensive manual to configure your local development environment, set up the Supabase database, and run all core microservices.

---

## 📂 System Architecture

GreenGuard is structured as an decoupled monorepo containing three core components:

*   📂 **`frontend/`**: A Next.js 16 + React 19 web application employing Tailwind CSS 4, Framer Motion, and interactive Leaflet map layers.
*   📂 **`backend/`**: A Node.js Express API server linking to Supabase PostgreSQL, handling authentication, NGO validation, and community feeds.
*   📂 **`flora-genius-consultant/`**: A botanical RAG-reasoning engine powered by Google Gemini 1.5 Flash, PlantNet API, and a local Redis cache.

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed on your machine:
*   [Node.js](https://nodejs.org) (v20+ recommended)
*   [Git](https://git-scm.com/) (configured with SSH or GPG for commit signing)
*   A [Supabase](https://supabase.com) Account (for database hosting)
*   A [Gemini API Key](https://aistudio.google.com/) (for AI reasoning)
*   A [PlantNet API Key](https://my.plantnet.org/) (for botanical identification)
*   A [Redis](https://redis.io) Instance (local or cloud-hosted, optional but recommended for AI caching)

---

## 🏁 Step-by-Step Installation

### Step 1. Clone the Repository
Clone your fork of the repository locally and navigate to the project root:
```bash
git clone https://github.com/YOUR_USERNAME/greeguard_complete.git
cd greeguard_complete
```

---

### Step 2. Configure Environment Variables

Create a `.env` file in the root of **each** of the three component directories. Refer to the specific parameter tables below:

#### 1. Frontend Environment (`frontend/.env`)
| Key | Example Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-proj.supabase.co` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...` | Supabase Anonymous Key |
| `NEXT_PUBLIC_CONSULTANT_API_URL` | `http://localhost:5002` | Local AI Consultant URL |
| `NEXT_PUBLIC_CONSULTANT_API_KEY` | `your-secure-secret-key` | Shared API key matching AI service config |

#### 2. Backend Environment (`backend/.env`)
| Key | Example Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5001` | Server execution port |
| `SUPABASE_URL` | `https://your-proj.supabase.co` | Your Supabase Project URL |
| `SUPABASE_ANON_KEY` | `eyJhbGciOi...` | Supabase Anonymous Key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOi...` | Supabase Service Role Key (Keep secret!) |
| `ADMIN_EMAIL` | `admin@greenguard.in` | Default system administrator email |
| `ADMIN_PASSWORD` | `SecurePass123!` | Default system administrator password |

#### 3. AI Consultant Environment (`flora-genius-consultant/.env`)
| Key | Example Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5002` | AI microservice port |
| `SUPABASE_URL` | `https://your-proj.supabase.co` | Your Supabase Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOi...` | Supabase Service Role Key |
| `GEMINI_API_KEY` | `AIzaSy...` | Google Gemini API Key |
| `PLANTNET_API_KEY` | `2b10...` | PlantNet API Key |
| `MICROSERVICE_API_KEY` | `your-secure-secret-key` | Matches frontend request authorization key |
| `REDIS_URL` | `redis://localhost:6379` | Optional Redis cache URL |

---

### Step 3. Set Up the Supabase Database

1. Log in to your [Supabase Console](https://supabase.com).
2. Create a new project or select an existing one.
3. Open the **SQL Editor** from the left panel and click **New Query**.
4. Copy and paste the contents of these migration files in order, executing each:
   *   📄 [migration.sql](file:///Users/shard/projects/AI-ML/greeguard_complete/backend/supabase/migration.sql) *(Enables PostGIS, sets up tables, indexes, and RLS)*
   *   📄 [auth_trigger_migration.sql](file:///Users/shard/projects/AI-ML/greeguard_complete/backend/supabase/auth_trigger_migration.sql) *(Syncs Supabase Auth metadata to public profiles)*
   *   📄 [hybrid_search_migration.sql](file:///Users/shard/projects/AI-ML/greeguard_complete/backend/supabase/hybrid_search_migration.sql) *(Enables pgvector and configures the RAG search function)*
5. Under **Storage** in the left menu, create four **public** buckets:
   *   `plant-images`
   *   `post-images`
   *   `report-images`
   *   `avatars`

---

### Step 4. Run the Production-Level Database Seeder

Run the seeder from the `backend/` directory to pre-populate your database with a default Admin, three NGOs (Approved, Pending, and Rejected status), five Adopters, fifteen plants, five adoption applications, and community feed posts:

```bash
cd backend
npm install
npm run seed
```

---

### Step 5. Boot Up the Microservices

For local development, spin up each microservice inside a separate terminal window:

```bash
# Terminal 1: Backend Express Server (Runs on port 5001)
cd backend
npm run dev

# Terminal 2: Next.js Frontend (Runs on port 3000)
cd frontend
npm install
npm run dev

# Terminal 3: AI Botanical Consultant (Runs on port 5002)
cd flora-genius-consultant
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to verify that the frontend web page loads successfully!

---

## 🔒 Contributor Protocol

To maintain a secure and standardized codebase, all contributors must adhere to the following checklist before pushing to GitHub:

### 1. Cryptographically Signed Commits
We enforce signed commits to verify authorship and prevent identity spoofing. 
* Refer to the [Security Key Setup Guide](docs/SECURITY_KEY_SETUP.md) for configuring GPG or SSH signature verification keys.
* Enable automated signing globally:
  ```bash
  git config --global commit.gpgsign true
  git config --global gpg.format ssh
  git config --global user.signingkey ~/.ssh/id_ed25519.pub
  ```

### 2. Linting & Formatting Check
Run automated static checks before submitting a PR:
```bash
# Frontend Checks
cd frontend
npm run lint

# Backend Checks
cd backend
npm run lint
```

### 3. Integrated Daily Log Updates
After finishing a core feature or resolving an issue, make a quick entry inside our tracking log at [DAILY_LOG.md](DAILY_LOG.md) detailing:
* Component updated
* Fix/Feature description
* Verification tests conducted

---
> [!IMPORTANT]
> Keep your private service keys and authentication tokens out of any files committed to version control. Always maintain keys inside `.env` configurations listed under `.gitignore`.
