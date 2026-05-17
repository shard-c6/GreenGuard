# 🤝 Contributing to GreenGuard

Thank you for your interest in contributing to GreenGuard! As a platform combining advanced botanical AI (Flora Genius), live geospatial reforestation tracking, and premium UI aesthetics, we value high-quality, professional code and consistent standards.

By participating, you agree to uphold our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## 📂 Project Architecture

GreenGuard is structured as a Express/Next.js monorepo containing three core components:

*   **[frontend/](file:///Users/shard/projects/AI-ML/greeguard_complete/frontend)**: Next.js 16 + React 19 application powered by Tailwind CSS 4, Framer Motion 12, and Leaflet Maps.
*   **[backend/](file:///Users/shard/projects/AI-ML/greeguard_complete/backend)**: Node.js Express API server linking to Supabase + PostGIS database.
*   **[flora-genius-consultant/](file:///Users/shard/projects/AI-ML/greeguard_complete/flora-genius-consultant)**: Botanical AI Consultant RAG service employing Google Gemini 1.5 Flash and `pgvector` hybrid search.

---

## 🛠️ Getting Started

### 1. Fork & Clone
1. Fork the repository on GitHub.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/greeguard_complete.git
   cd greeguard_complete
   ```

### 2. Environment Variables
Copy `.env.example` to `.env` in the root of the relevant component directory (`backend/`, `frontend/`, and `flora-genius-consultant/`), and fill out the details.

### 3. Local Development Setup
Run each service in a separate terminal:
```bash
# Terminal 1: Backend API
cd backend && npm run dev

# Terminal 2: Next.js Frontend
cd frontend && npm run dev

# Terminal 3: AI Botanical Service
cd flora-genius-consultant && npm run dev
```

---

## 🎨 Standards & Guidelines

To maintain our highly polished codebase, please adhere to these guidelines:

### 1. Premium Visual Engine Guidelines (Frontend)
- **Glassmorphism & Style**: All new UI components must match our premium dark/atmospheric visual standard using Tailwind CSS 4 variables and HSL palettes (no plain/flat standard colors).
- **Transitions**: Leverage Framer Motion or smooth CSS transitions for animations.
- **Semantic Tags**: Always use standard HTML5 semantic elements (`<article>`, `<section>`, `<nav>`) and include unique IDs on interactive components.

### 2. Robust Backend & Database Rules
- **Type Agnostic Functions**: Keep Supabase RPC functions as type-agnostic as possible, retrieving only what is necessary (e.g. `content` and `similarity` for RAG).
- **Migration Protocol**: If altering DB schemas, use schema-based DDL scripts and test them in isolation.

### 3. Quality & Testing
- Before submitting a pull request, run local integration tests.
- Follow the [User Dashboard Testing Guide](TESTING_GUIDE.md) to manually verify the user registration, plant discovery, adoption request, and community feed interactions.

---

## 🚀 Branching & Committing

We enforce professional repository management workflows:

### 1. Branch Naming Standard
Create a descriptive branch for your work:
- Features: `feature/your-feature-name`
- Bugfixes: `bugfix/your-bugfix-name`
- Documentation: `docs/your-doc-name`
- Performance/Refactoring: `refactor/your-refactor-name`

### 2. Secure Commits (GPG/SSH Commit Signing)
To ensure repository security and prevent identity spoofing, **all commits must be cryptographically signed**. Commits without a green "Verified" badge will be blocked by repository rules.
- Follow our [Security Key Setup Guide](docs/SECURITY_KEY_SETUP.md) to set up either an SSH or GPG key for signing commits.
- Example config:
  ```bash
  git config --global commit.gpgsign true
  git config --global gpg.format ssh
  git config --global user.signingkey ~/.ssh/id_ed25519.pub
  ```

---

## 📝 Pull Request Workflow

1. **Synchronize**: Before committing, pull the latest changes from `origin/main`.
2. **Technical Log Update**: Document your activities in our [DAILY_LOG.md](DAILY_LOG.md).
3. **Commit**: Write descriptive commit messages, and ensure they are signed.
4. **Pull Request**:
   - Open a PR targeting the `main` branch.
   - Use our Pull Request Template (it will load automatically).
   - Describe what changed, link any related issues, and attach visual verification (screenshots/videos) for UI modifications.
5. **Review**: Maintain active engagement with reviewers. Once approved, the branch will be squashed and merged.

Thank you for contributing to GreenGuard's environmental mission! 🌿
