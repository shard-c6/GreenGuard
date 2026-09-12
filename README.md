<div align="center">

# 🌱 GreenGuard

**A plant adoption and community platform for environmental NGOs.**

Built so that trees planted in a drive do not become trees nobody waters afterwards —
by connecting each plant to a person who lives near it.

[![CI](https://github.com/shard-c6/GreenGuard/actions/workflows/ci.yml/badge.svg)](https://github.com/shard-c6/GreenGuard/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Roadmap](https://img.shields.io/badge/roadmap-Phase_0-blue)](./docs/AUDIT_AND_ROADMAP.md)

</div>

---

> [!WARNING]
> **The hosted platform is currently down.** The Supabase project is paused, so the API and
> AI services return errors. Restoration is tracked in
> [Phase 0](https://github.com/shard-c6/GreenGuard/milestone/1) — start at #188.
>
> Known defects are catalogued with file references in
> [`docs/AUDIT_AND_ROADMAP.md`](./docs/AUDIT_AND_ROADMAP.md). Read it before building on this.

---

## Why this exists

A professor's colleagues run tree plantation drives in Hyderabad and Mumbai. Planting is the easy
part — survival is the hard part. Their idea was that every planted tree should be **adopted by
someone who lives close enough to actually care for it**, and that those adopters should be able
to find each other, share progress, and get real horticultural help.

GreenGuard is the platform for that: NGOs register plants with a location, nearby people adopt
them, and adopters post growth updates to a shared feed. An AI consultant answers plant-care
questions grounded in a curated botanical corpus.

Originally built as a semester-four social service internship project at VIT Mumbai. It is now
being taken toward production use by the NGO.

## Status

| | |
| :--- | :--- |
| **Platform** | 🔴 Down — Supabase paused, see Phase 0 |
| **Botanical corpus** | **588 knowledge entries across 458 unique species** |
| **Test coverage** | None yet — tracked in #212 |
| **Production readiness** | Pre-alpha. Do not point real users at this yet. |

## Architecture

Three deployable services plus a managed database.

| Service | Stack | Responsibility |
| :--- | :--- | :--- |
| [`frontend/`](./frontend) | Next.js 16, React 19, Tailwind 4, Leaflet | User-facing app; also proxies AI calls server-side so the AI key never reaches the browser |
| [`backend/`](./backend) | Express 5, Supabase JS | REST API — auth, plants, adoptions, feed, NGO onboarding, admin, moderation |
| [`flora-genius-consultant/`](./flora-genius-consultant) | Express 5, Gemini, PlantNet, Redis | AI microservice — plant identification and RAG-grounded consultation |
| Supabase | Postgres 17 + PostGIS + pgvector | Single source of truth: data, auth, storage, RLS |

**Data model:** `profiles` → `ngo_profiles` → `plants` → `adoptions` → `growth_reports`, with a
social layer (`posts`, `likes`, `bookmarks`, `comments`, `follows`) and moderation
(`user_reports`). Access is enforced by Postgres row-level security.

**Retrieval:** the consultant combines pgvector semantic search with Postgres full-text search,
fused by Reciprocal Rank Fusion, over a curated corpus of Indian plants.

## Getting started

> [!NOTE]
> The setup guide is being rewritten and verified against a clean machine as part of Phase 0
> (#201). Until that lands, expect gaps.

```bash
git clone https://github.com/shard-c6/GreenGuard.git
cd GreenGuard
```

Copy `.env.example` in each service directory and fill it in, then:

```bash
cd backend && npm install && npm run dev                  # :5000
cd frontend && npm install && npm run dev                 # :3000
cd flora-genius-consultant && npm install && npm run dev   # :5002
```

Full instructions: [`docs/GETTING_STARTED.md`](./docs/GETTING_STARTED.md)

## Documentation

| Document | What it covers |
| :--- | :--- |
| [AUDIT_AND_ROADMAP.md](./docs/AUDIT_AND_ROADMAP.md) | **Start here.** Honest defect audit with file references, plus the six-phase plan |
| [PHASE0_PLAN.md](./docs/PHASE0_PLAN.md) | Step-by-step revival plan currently in progress |
| [DATABASE_AND_RAG.md](./docs/DATABASE_AND_RAG.md) | Schema and retrieval design |
| [API_SPECIFICATION.md](./docs/API_SPECIFICATION.md) | AI consultant API |
| [SECURITY.md](./SECURITY.md) | Vulnerability disclosure |

## Team

| Person | GitHub | Owns |
| :--- | :--- | :--- |
| Shardul Chogale | [@shard-c6](https://github.com/shard-c6) | Team lead · AI/ML · NGO and faculty liaison |
| Rahul | [@rahulcodes-java](https://github.com/rahulcodes-java) | ML · Supabase · database and migrations |
| Mukta | [@Mukta01](https://github.com/Mukta01) | Cloud · DevOps · frontend |
| Ankita | [@ankita01209](https://github.com/ankita01209) | Full-stack · backend API |

Review routing is defined in [`.github/CODEOWNERS`](./.github/CODEOWNERS).

## Roadmap

Work is organised into [seven milestones](https://github.com/shard-c6/GreenGuard/milestones):

| Phase | Focus |
| :--- | :--- |
| **0** | Revive & stabilise — restore the database, version every migration, stop the AI fabricating answers |
| **1** | Geospatial core — fix the map properly; it is the feature closest to the NGO's mission |
| **2** | Production hardening — tests, CI gates, observability, backups, RLS correctness |
| **3** | Local plant identification — a model tuned to the species this NGO actually plants |
| **4** | Disease & remedy intelligence — sourced treatment knowledge, then field image diagnosis |
| **5** | Production hosting, domain, and the NGO's public website |
| **6** | Handover — runbooks, architecture docs, named owners |

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).

Pull requests need a passing CI run and a CODEOWNERS review. If you are reporting a security
issue, use [private advisories](https://github.com/shard-c6/GreenGuard/security/advisories/new)
rather than a public issue.

## License

[MIT](./LICENSE)
