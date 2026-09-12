# GreenGuard — Technical Audit & Forward Roadmap

**Prepared:** 2026-09-12
**Scope:** Full-repository scan (`frontend/`, `backend/`, `flora-genius-consultant/`, `docs/`, CI)
**Purpose:** (a) state honestly what is broken today, (b) lay out what it takes to go from a
semester-four social-service-internship project to a production platform an NGO can depend on,
plus a public NGO website.

---

## 0. What this project actually is

Strip away the README marketing and the system is three deployables plus a database:

| Service | Stack | Deployed to | Role |
| :--- | :--- | :--- | :--- |
| `frontend/` | Next.js 16, React 19, Tailwind 4, Leaflet | Vercel | User-facing app, also proxies AI calls |
| `backend/` | Express 5, Supabase JS | Hugging Face Space | REST API — auth, plants, adoptions, feed, NGO, admin |
| `flora-genius-consultant/` | Express 5, Gemini, PlantNet, Redis | Hugging Face Space | AI microservice — identification + RAG consultation |
| Supabase | Postgres + PostGIS + pgvector + Auth + Storage | Supabase cloud | Single source of truth |

The domain model is sound and is genuinely the interesting part: `profiles` → `ngo_profiles` →
`plants` → `adoptions` → `growth_reports`, with a social layer (`posts`, likes, bookmarks,
comments) and a moderation layer (`user_reports`, admin). 32 RLS policies are defined. That is
more thought than most student projects carry.

The problems are not architectural. They are **operational, correctness, and honesty** problems.

---

## PART A — What is broken right now

Ordered by severity. File references are clickable.

### A1. BLOCKER — The platform is dead because Supabase is paused

You already know this. What you may not know is how it fails: `backend/src/config/env.js`
calls `process.exit(1)` if any required env var is missing, and every controller assumes a live
Supabase. When the project is paused, the API returns 5xx on essentially every route and the
frontend's 401 interceptor bounces users to `/login` in a loop.

There is a `.github/workflows/supabase-keep-alive.yml` that pings every 3 days — Supabase's free
tier pauses after 7 days of inactivity, so the workflow is correct in principle. It failed
because a *paused* project rejects the ping, so once paused it can never un-pause itself. The
keep-alive only prevents pausing; it cannot reverse it.

**Fix:** restore the project from the Supabase dashboard, re-run every migration in
`backend/supabase/` in order, then rotate all keys (see A8).

### A2. HIGH — Edge geolocation is dead code; every user is centred on New Delhi

[`frontend/src/middleware.ts:19`](frontend/src/middleware.ts:19) reads `(request as any).geo`.
`NextRequest.geo` was **removed in Next.js 15**; this project is on Next 16. The cast to `any`
is what hides the breakage from TypeScript. So `geo` is always `{}`, and the code always takes
the fallback branch:

```ts
const lat = geo.latitude || '28.6139';   // always New Delhi
const lng = geo.longitude || '77.2090';
```

Every visitor in the world, including your Hyderabad and Mumbai plantation sites, opens the map
looking at Delhi. This is almost certainly the "geostationary mapping issue" you were sensing.

**Fix:** on Vercel, use `geolocation(request)` from `@vercel/functions`. Better, drop the
middleware entirely — server-side IP geolocation is coarse (city-level at best, wrong on mobile
networks and VPNs) and you already have a superior signal: the browser Geolocation API, which
the map's "Find My Location" button already calls. Recommended order: URL params → saved user
location on their profile → browser geolocation prompt → NGO's registered city → country centroid.

### A3. HIGH — The map's coordinate parser cannot parse what the database returns

[`frontend/src/components/map/LeafletMap.tsx:13`](frontend/src/components/map/LeafletMap.tsx:13):

```ts
const match = location.match(/POINT\(([^ ]+) ([^ ]+)\)/);
```

This expects human-readable WKT. PostgREST serialises a `geography(Point,4326)` column as
**hex EWKB** — `0101000020E6100000...`. The regex never matches, so `parseLngLat` always
returns `null`. The fallback path is dead.

It currently *appears* to work only because `plants_geo_migration.sql` and
`posts_geo_migration.sql` added redundant `latitude`/`longitude` double-precision columns which
the frontend reads first. So you have two sources of truth for the same fact, and the one the
map falls back to has never worked.

Compounding it, the guard is a truthiness check:

```ts
const coords = (lat && lng) ? [lat, lng] : parseLngLat(plant.location);
```

A plant at latitude `0` or longitude `0` is silently dropped. Not a concern for India, but it is
the kind of bug that surfaces the day someone seeds test data with zeros.

**Fix:** pick one source of truth. Either store only `lat`/`lng` doubles and generate the
geography column with a trigger, or return GeoJSON from the API (`ST_AsGeoJSON(location)`) and
parse that. Then delete the regex.

### A4. HIGH — AI services silently fabricate answers when keys are missing

This is the finding I would fix before anything else, because it is the one that can harm a real user.

[`flora-genius-consultant/src/services/plantnet.service.js:10`](flora-genius-consultant/src/services/plantnet.service.js:10) — with no `PLANTNET_API_KEY`, identification returns a
hardcoded result: *Holy Basil (Tulsi), Ocimum tenuiflorum, 94.5% confidence*. Every photo.
A precise-looking 94.5% on a fabricated answer.

[`flora-genius-consultant/src/services/gemini.service.js:120`](flora-genius-consultant/src/services/gemini.service.js:120) — when the Gemini call throws, `askExpert` returns a
fully-formatted fake consultation containing **specific treatment instructions** ("wipe the
leaves with a 1% neem oil solution", watering changes) under a heading called *Medical Profile*.
The only signal that it is fake is an italic note at the very bottom.

`getEmbedding` does the same thing — on failure it returns a deterministic pseudo-random
3072-dimension vector derived from `Math.sin()` of character codes. That vector is meaningless,
so RAG retrieval returns arbitrary documents, and the Gemini answer is then "grounded" in
irrelevant context while looking completely confident.

Given that your next planned feature is **plant disease diagnosis and medication**, and that your
dataset is Indian medicinal plants where people may act on the advice, silent fabrication is not
acceptable. These fallbacks were presumably added so demos never fail. That tradeoff is wrong
for production.

**Fix:** fail loudly. Return HTTP 503 with `{ code: "AI_UNAVAILABLE" }` and render a clear
"AI consultant is temporarily offline" state in the UI. If you want a demo mode, gate it behind
an explicit `DEMO_MODE=true` env var and render every response inside a visually unmistakable
"SIMULATED — NOT REAL ADVICE" banner.

### A5. HIGH — The API-key guard on the AI service fails open in production

[`flora-genius-consultant/src/middleware/apiKey.middleware.js:10`](flora-genius-consultant/src/middleware/apiKey.middleware.js:10):

```js
if (!expectedApiKey) {
  if (process.env.NODE_ENV !== 'production') console.warn('...Bypassing...');
  return next();          // ← runs in production too
}
```

The production check only suppresses the log line. The bypass itself is unconditional. If
`FLORA_CONSULTANT_API_KEY` is ever unset on the Hugging Face Space — a one-character typo in a
secret name is enough — your Gemini and PlantNet quota is open to the internet, with your
billing attached.

**Fix:** `if (!expectedApiKey && process.env.NODE_ENV === 'production') throw new Error(...)` at
boot. Fail closed, and fail at startup rather than per-request.

### A6. MEDIUM-HIGH — `supabaseAdmin` is a Proxy that silently changes identity

[`backend/src/config/supabase.js:29`](backend/src/config/supabase.js:29) exports `supabaseAdmin`
as a `Proxy` over the service-role client that, when an AsyncLocalStorage request context
exists, transparently substitutes *the caller's RLS-limited client instead*.

19 files import `supabaseAdmin`. Reading any of them, the name says "this bypasses RLS". The
runtime behaviour is the opposite inside a request. The two failure modes are symmetric and both bad:

- Inside a request, an operation that genuinely needs elevation (an admin ban, a cross-user
  notification insert) silently returns empty results or a permission error rather than working.
- Outside a request context — a background job, a `setTimeout`, a lost async context, a script —
  the same variable silently *is* service-role and bypasses RLS entirely.

`auth.controller.js` already worked around this by importing
`supabaseServiceRole: supabaseAdmin` explicitly, which tells you the footgun has been hit before.

**Fix:** delete the Proxy. Export three clearly-named clients — `supabaseAnon`,
`supabaseAsUser(req)`, `supabaseServiceRole` — and make every call site state which it means.
Then audit the 19 files. This is mechanical but it is the highest-value refactor in the backend,
because it is the difference between "RLS protects us" and "we think RLS protects us".

### A7. MEDIUM — `/api/notifications` is mounted twice

[`backend/app.js:100`](backend/app.js:100):

```js
app.use('/api/notifications', smartAlertRoutes);   // backend/routes/notifications.js
app.use('/api/notifications', notificationRoutes); // backend/src/routes/notification.routes.js
```

Express matches in order, so the first router wins for any overlapping path and the second is
only reached for paths the first does not handle. It happens to work because the two routers
define disjoint paths (`/generate`, `/dismiss/:plantId` vs `/`, `/unread-count`, `/read-all`,
`/:id/read`) — but `/dismiss/:plantId` and `/:id/read` are one refactor away from colliding.

Note also that `backend/routes/` and `backend/src/routes/` both exist, as do `backend/scripts/`
and `backend/src/admin/seed-admin.js`. Two parallel conventions in one service. Consolidate
under `src/` and mount the smart-alert routes at `/api/alerts`.

### A8. MEDIUM — Secrets hygiene

- [`frontend/src/app/api/consultant/[[...path]]/route.ts:4`](frontend/src/app/api/consultant/%5B%5B...path%5D%5D/route.ts:4)
  hardcodes a fallback key: `'gg_secret_consultant_key_2026'`. It is in git history and in a
  public repository. Treat it as compromised.
- The Supabase service-role key has been in CI secrets and in three deployment environments.
  Since you are restoring the project anyway, rotate **everything** at the same time: Supabase
  anon + service role, Gemini, PlantNet, the consultant key, the HF token.
- `SECURITY_AUDIT.md` exists and is thorough. Re-run it after the rotation and date the result.

### A9. MEDIUM — Zero automated tests, but the tooling is installed

`backend/package.json` declares `"test": "jest --verbose --forceExit"` and has `jest` and
`supertest` as devDependencies. There are no test files anywhere in the repository.
`flora-genius-consultant`'s test script is literally `exit 1`.

Meanwhile `.github/workflows/deploy-hf.yml` pushes to production on every `main` commit touching
`backend/**` or `flora-genius-consultant/**`, using `git push --force`, with **no build step, no
lint, no test, and no rollback**. A syntax error reaches production in under a minute.

### A10. MEDIUM — The map will not scale, and the RAG index does not exist

**Map:** [`backend/src/controllers/plant.controller.js:203`](backend/src/controllers/plant.controller.js:203)
`mapPlants` selects every plant with no bounding box, no pagination, no limit. Same for
`mapPlantations`. At the scale of one professor's friends' plantations this is invisible; at a
few thousand trees it is a multi-megabyte JSON payload and a few thousand DOM nodes, because
`LeafletMap` also renders one `<Marker>` per record with no clustering.

**RAG:** `hybrid_search_migration.sql:22` declares `query_embedding VECTOR(3072)`. pgvector's
HNSW and IVFFlat indexes support a **maximum of 2000 dimensions**. There is no vector index in
any migration, and there cannot be one at 3072. Every semantic search is therefore a sequential
scan computing cosine distance across the whole `plant_knowledge` table. Fine at a few hundred
rows; quadratically painful as the knowledge base grows — which is exactly what the disease
module will do.

**Fix:** request `outputDimensionality: 1536` (or 768) from `gemini-embedding-001` — it supports
Matryoshka truncation, so you lose very little quality — then add
`CREATE INDEX ... USING hnsw (embedding vector_cosine_ops)`. This requires re-embedding the
corpus, so do it before the corpus gets large.

### A11. LOW — Third-party usage-policy and asset-loading issues

- [`frontend/src/app/map/page.tsx:60`](frontend/src/app/map/page.tsx:60) injects Leaflet's CSS
  from `unpkg.com` at runtime via a `<link>` element. This causes a flash of unstyled map tiles,
  adds a third-party dependency to first paint, breaks under a strict CSP, and breaks entirely
  offline — which matters because you have a service worker and an "Add to Home Screen" prompt,
  i.e. you are shipping a PWA. `leaflet` is already a dependency: `import 'leaflet/dist/leaflet.css'`.
- `dashboard/ngo/plants/new/page.tsx:40` calls Nominatim directly from the browser with no
  identifying User-Agent. Nominatim's usage policy requires one and forbids heavy automated use
  from a single source; you will be rate-limited or blocked in production. Proxy it through your
  backend with a proper User-Agent and cache results, or move to a paid geocoder.
- OpenStreetMap's public tile server has the same policy constraint. For a real deployment use
  MapTiler, Stadia, or Protomaps.

### A12. LOW — Repository hygiene and claim accuracy

- Build output is committed: `frontend/lint_output.txt`, `tsc_output.txt`, `build_output.txt`,
  `eslint_output.txt`, `lint.json`, plus `.agent/skills/**/__pycache__/*.pyc`. Add to `.gitignore`
  and `git rm --cached`.
- `frontend/replace_emojis.py` and `fix_use_client.py` are one-off migration scripts sitting in
  the frontend root. Move to `scripts/` or delete.
- **Claim accuracy matters now.** The README badge says `BOTANICAL DATA 300+ SPECIES`; the
  roadmap says "Successfully reached 500+ validated botanical entries"; `data/plant_data.json`
  is ~316 KB. These cannot all be right. The moment this repo is attached to a real NGO and a
  paid engagement, an unverifiable number in a README is a liability, not marketing. Count the
  rows, state the real number, and say "entries" vs "species" precisely.
- The daily heartbeat commit workflow (`daily_contribution.yml`, `DAILY_LOG.md`, 18 KB of
  automated entries) inflates the contribution graph without adding information. Harmless for a
  student project; it reads poorly to a technical reviewer evaluating a handover. Consider
  retiring it.

---

## PART B — The forward roadmap

Six phases. Phases 0–2 are prerequisites for *anything* else, including the paid NGO website.
Phases 3–4 are the AI/ML work you described. Phase 5 is production. Phase 6 is the handover itself.

---

### Phase 0 — Revive and stabilise (1 week)

Nothing else is testable until this is done.

1. Restore the Supabase project; confirm PostGIS and pgvector extensions survived.
2. Re-run migrations in dependency order: `migration.sql` → `auth_trigger_migration.sql` →
   `plants_geo_migration.sql` → `posts_geo_migration.sql` → `comments_migration.sql` →
   `hybrid_search_migration.sql` → `src/admin/user_reports_migration.sql` →
   `scripts/migrations/*.sql`. **Write down the order** — right now it exists only in your head,
   and that is the single biggest handover risk in the repository.
3. Rotate every secret (A8). Re-seed admin via `backend/scripts/seed-admin.js`.
4. Adopt a real migration tool. The Supabase CLI gives you versioned, ordered, repeatable
   migrations and local development against a containerised Postgres. Hand-pasting SQL into the
   dashboard does not survive a handover.
5. Fix the keep-alive so it alerts you (email/webhook) when the ping fails, instead of failing
   silently for seven days.
6. Fill in `docs/GETTING_STARTED.md` with a verified end-to-end fresh-clone-to-running walkthrough.
   Actually run it on a clean machine.

**Exit criterion:** a new developer clones the repo and has all three services running against a
live database in under 30 minutes, following only the docs.

---

### Phase 1 — Fix the map properly (1–2 weeks)

This is the feature you flagged, and it is the feature closest to the NGO's actual mission —
"find people to adopt plants close to where they live" is *literally* a geospatial query.

**Data layer**
- Choose one source of truth. Recommended: keep `latitude`/`longitude` as the writable columns
  and make `location` a generated/trigger-maintained `geography(Point,4326)` so they can never drift.
- Add `ST_MakePoint(lng, lat)::geography` with an explicit SRID on write, not a raw
  `POINT(...)` string (`plant.controller.js:35`, `post.controller.js:30`).
- Add a `GET /api/plants/map?bbox=minLng,minLat,maxLng,maxLat&zoom=N` endpoint backed by
  `ST_Intersects` against the existing GiST index. Cap the result count and return a
  `truncated: true` flag.
- Server-side clustering at low zoom: `ST_SnapToGrid` or `ST_ClusterKMeans` so the client
  receives ~200 cluster records instead of 50,000 points.
- You already have a working `nearby_plants` RPC using `ST_DWithin` — that is the right
  primitive and it is the one the adoption flow should be built on.

**Client layer**
- `import 'leaflet/dist/leaflet.css'`; delete the runtime `<link>` injection.
- Add `leaflet.markercluster` (or render clusters from the server response).
- Refetch on `moveend`/`zoomend` with the new bounding box, debounced.
- Delete `parseLngLat` and the dead WKT path.
- Replace the truthiness guard with an explicit `Number.isFinite(lat) && Number.isFinite(lng)`
  and a `-90..90` / `-180..180` range check.
- Replace the middleware geo hack with the layered strategy in A2.

**UX layer** — this is where the real gain is:
- The NGO plant-creation form currently requires typing raw decimal latitude and longitude into
  two number inputs. No NGO volunteer will do this correctly. Replace it with a draggable map
  pin plus an address search box; derive the coordinates from the pin.
- Add **"plants near me"** as a first-class flow with a radius slider. The NGO's stated goal is
  matching adopters to nearby plants — that should be the primary call to action, not a
  by-product of browsing a map.
- Show the adopter's own adopted plants in a distinct colour, and draw the NGO's plantation
  polygon (not just a point) where one exists.
- Offline tiles for the PWA, since field volunteers in plantation areas will have poor connectivity.

---

### Phase 2 — Harden for production (2–3 weeks)

You cannot responsibly hand an NGO a system that force-pushes untested code to production.

- **Tests.** Priority order: (1) auth + role escalation — prove an `adopter` cannot create
  plants or approve adoptions; (2) RLS policies — test as each role against real Supabase,
  because RLS bugs are invisible in unit tests; (3) the adoption state machine
  (available → pending → adopted, and the rejection path); (4) geospatial queries with known
  fixtures; (5) frontend smoke tests with Playwright on the critical flows. Target the
  money paths, not a coverage percentage.
- **CI gate.** `lint → typecheck → test → build` must pass before `deploy-hf.yml` runs. Remove
  `--force` from the subtree push, or at minimum tag the previous commit so rollback is one command.
- **Fail closed everywhere.** A4, A5. No silent mocks; explicit `DEMO_MODE` if you want demos.
- **Delete the `supabaseAdmin` Proxy** and audit the 19 call sites (A6).
- **Observability.** Right now a production failure is invisible. Add Sentry (free tier) to all
  three services, structured JSON logging, and an uptime monitor on `/api/health` and the AI
  service root. You need to know the platform is down before the NGO tells you.
- **Backups.** Supabase free tier retains backups for 7 days only. A weekly `pg_dump` to object
  storage is cheap insurance and is the kind of thing an NGO will assume you already did.
- **Rate limiting at the right layer.** The consultant limit is 10 requests / 15 min — reasonable
  for cost control, harsh for a genuine user diagnosing several plants. Consider tiering it by
  role once NGOs are verified.

---

### Phase 3 — Self-hosted plant identification (4–8 weeks, the first real ML phase)

You said you want to train on the PlantNet dataset locally rather than call the API. Worth
being precise about what that means, because the tradeoff is not the one it looks like.

**The honest framing.** PlantNet's API is backed by a model trained on tens of millions of
images across ~50,000 species with continuous human-in-the-loop correction. A model you train
will very likely be **less accurate than the API on the open world**. The wins are real but they
are different ones: zero per-call cost, no rate limit, no network dependency (field use,
offline PWA), full control, and — the genuinely important one — **you can be markedly *better*
than PlantNet on the specific set of Indian species your NGO actually plants**, because you can
overfit deliberately to that distribution.

So the target should not be "replace PlantNet". It should be:

> A local model that is excellent on the ~100–300 species this NGO plants, with PlantNet as a
> fallback whenever local confidence is below threshold.

**Concrete path**

1. **Dataset.** PlantNet-300K is the public research release — ~306,000 images, 1,081 species,
   ~31 GB, explicitly built with a long-tailed, high-ambiguity distribution. Supplement with
   GBIF occurrence images and iNaturalist research-grade observations filtered to Indian species.
   Then collect your own: **every photo your users upload through the app is training data**,
   and your growth-report feature already collects time-series photos of known plants with
   known labels. That is a proprietary dataset no competitor has. Build the consent and
   labelling pipeline for it in Phase 2, not Phase 3 — retrofitting consent is much harder.
2. **Do not train from scratch.** Fine-tune a pretrained backbone. Start with a ConvNeXt-Tiny or
   an EfficientNetV2-S from `timm`, or a DINOv2 ViT-B feature extractor with a linear head —
   the latter is remarkably strong on fine-grained botanical tasks and trains in hours, not days.
3. **Handle the long tail.** Species frequency is brutally imbalanced. Use class-balanced
   sampling, LDAM or focal loss, and report **per-class macro accuracy**, not top-1 — top-1
   on a long-tailed set flatters you by rewarding the common classes you already knew.
4. **Multi-organ input.** PlantNet's own accuracy comes substantially from asking which organ
   the photo shows. Your service currently hardcodes `organs: 'leaf'` for every upload
   (`plantnet.service.js:41`), which quietly degrades accuracy on flower and bark photos. Ask
   the user, or train a cheap organ classifier first. **This is a same-day fix worth doing
   immediately, independent of everything else in this phase.**
5. **Calibration and refusal.** Softmax confidence is not probability. Apply temperature scaling
   on a held-out set, and make the model able to say *"I don't know"* — for a medicinal-plant
   app, a confident wrong species is far worse than an abstention.
6. **Serving.** Export to ONNX, serve from a FastAPI container with `onnxruntime`. A fine-tuned
   ConvNeXt-Tiny runs comfortably on CPU at ~200–500 ms per image, so **you do not need a GPU in
   production** — only for training. Rent GPU by the hour for training runs (Colab Pro, Kaggle's
   free 30 GPU-hours/week, Lightning, or a spot A10G) rather than buying capacity.
7. **Ship it as a shadow first.** Run the local model alongside PlantNet for a few weeks,
   logging disagreements, before it takes over. You will learn more from the disagreement set
   than from any benchmark.

**Deliverable:** a fourth service, `plant-id-service/`, with a documented training pipeline,
a versioned model registry, and a published per-class evaluation report.

---

### Phase 4 — Plant disease diagnosis and medication (6–10 weeks)

Two genuinely separate problems that are easy to conflate.

**4a. Disease detection from an image (a vision problem)**

The obvious dataset is PlantVillage — ~54,000 images, 38 classes, 14 crop species. Be aware of
its well-documented weakness: the images are single detached leaves on uniform lab backgrounds,
and models trained on it reach ~99% on its own test split while **collapsing to near-random on
real field photographs**. Published work has shown models keying on background texture rather
than lesions. If you train on PlantVillage alone and ship it, it will look superb in your report
and fail in a garden.

Mitigations: train on field datasets too (PlantDoc, Cassava Leaf Disease, the various
CVPR/FGVC plant-pathology challenge sets), apply heavy background/lighting augmentation, and
validate exclusively on field-collected photographs. Again: collect your own from day one.

Also note the crop mismatch — PlantVillage covers tomato, potato, maize, grape. Your corpus is
Tulsi, Neem, and Indian medicinal/native trees. **The overlap is close to zero.** Realistically,
image-based disease classification for *your* species requires a dataset that does not currently
exist publicly, which means Phase 4a is gated on Phase 3's data-collection pipeline. Plan for
that dependency rather than discovering it in month three.

**4b. Remedies and treatment (a knowledge + retrieval problem — start here)**

This half is tractable *now* with infrastructure you already have, and delivers most of the user
value. Your RAG stack (`plant_knowledge` + hybrid search + Gemini) works; it needs a second corpus.

Extend the schema:

```sql
CREATE TABLE plant_diseases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scientific_name   TEXT NOT NULL,     -- host species, joins your existing corpus
  disease_name      TEXT NOT NULL,
  pathogen_type     TEXT CHECK (pathogen_type IN
                      ('fungal','bacterial','viral','pest','nutrient','abiotic')),
  symptoms          TEXT NOT NULL,     -- what the user actually sees
  severity          TEXT CHECK (severity IN ('low','moderate','severe')),
  is_notifiable     BOOLEAN DEFAULT false,  -- your "flag specific diseases" requirement
  organic_remedy    TEXT,
  chemical_remedy   TEXT,
  preventive_care   TEXT,
  source_citation   TEXT NOT NULL,     -- ICAR / KVK / university extension. Mandatory.
  reviewed_by       TEXT,
  reviewed_at       TIMESTAMPTZ,
  embedding         VECTOR(1536)       -- 1536, so it can be HNSW-indexed (see A10)
);
```

Design notes that matter:

- **`source_citation` is `NOT NULL` on purpose.** Once you give treatment advice for plants
  people consume medicinally, every claim needs a traceable source. ICAR, state Krishi Vigyan
  Kendras, and agricultural-university extension bulletins are authoritative, free, and
  India-specific. This is also what turns the feature from "an LLM said so" into something the
  NGO can defend.
- **`is_notifiable` implements your "flag specific diseases" requirement** — quarantine-relevant
  or rapidly-spreading pathogens should trigger a distinct, escalated UI treatment and
  potentially notify the NGO, not sit in the same list as leaf spot.
- **Query flow:** user photo + symptom description → (optional) disease classifier → hybrid
  retrieval over `plant_diseases` filtered by host species → Gemini synthesises a grounded
  answer citing the retrieved rows → **UI renders the citations**. No citation, no answer.
- **Prefer organic remedies by default** for an environmental NGO, and never state a chemical
  dosage that is not quoted verbatim from a cited source.
- **Add a confidence floor and an escape hatch.** Below threshold, the answer should be
  "I'm not confident — here's how to reach an agronomist / your local KVK", not a guess.
- **Disclaimer, prominently.** Not legal boilerplate buried in a footer — an inline statement
  that this is horticultural guidance, not medical advice, especially given that your corpus's
  `medical_uses` field describes human consumption.

**Sequence:** 4b first (weeks 1–4, high value, low risk), then 4a (weeks 5–10, gated on data).

---

### Phase 5 — Production deployment, domain, and the NGO website

You asked specifically about cloud hosting and buying a domain. Here is the shape of it.

**Why Hugging Face Spaces is the wrong production host.** It is free and it works for demos, but
Spaces sleep on inactivity (cold starts of 30+ seconds), offer no SLA, no managed database, no
straightforward custom-domain story for an API, and no rollback. That is fine for a college
project and not fine for an NGO's public platform.

**Recommended topology**

| Component | Host | Rough monthly cost |
| :--- | :--- | :--- |
| NGO marketing website | Vercel / Cloudflare Pages (static) | Free |
| GreenGuard app (Next.js) | Vercel | Free → ~₹1,700 (Pro) |
| API + AI services | Railway, Render, or Fly.io | ~₹400–1,700 each |
| Database | Supabase Pro (backups, no pausing) | ~₹2,100 |
| Object storage | Supabase Storage or Cloudflare R2 | ~₹0–400 |
| Map tiles | MapTiler / Stadia free tier | Free at low volume |
| Domain | `.org` or `.org.in` | ~₹1,000–1,500 / year |
| ML training | Rented GPU, by the hour | ~₹0–4,000 per run |

**Realistic steady-state: roughly ₹3,000–6,000 / month**, dominated by Supabase Pro (which buys
you the "never pauses again" guarantee that caused this whole problem). Present it to the NGO as
an annual line item — around ₹40,000–70,000 a year — rather than a monthly surprise. An NGO can
usually budget an annual number.

Alternatives worth knowing: a single ₹800/month VPS (Hetzner, DigitalOcean) running everything
under Docker Compose is by far the cheapest and gives you one machine to reason about — but you
own the backups, the TLS renewal, and the 2 a.m. page. AWS/GCP credits via their nonprofit
programmes can cover a year or two, but lock-in and billing complexity are real costs for a
volunteer-maintained project. **For a handover to an NGO, managed services are worth their
premium** precisely because whoever inherits this will not be a systems administrator.

You mentioned someone connected to the project has cloud expertise and a domain. Use that — but
make sure the domain is registered to **the NGO as the legal owner**, not to an individual
student, and that the registrar account has at least two contacts with recovery access. Domains
silently expiring because the one person who owned the account graduated is one of the most
common ways small nonprofit sites die.

**Domain and structure**

- `greenguard.org` / `.org.in` — the `.org.in` is India-specific and cheap; `.ngo` is available
  but requires validation. Register for 2–3 years up front and enable auto-renew and WHOIS privacy.
- `www.<domain>` → the NGO's public website (mission, plantation sites, impact numbers, how to
  adopt, how to donate, contact). Static, fast, heavily SEO-optimised, in English plus at least
  Hindi and ideally Telugu/Marathi given Hyderabad and Mumbai.
- `app.<domain>` → the GreenGuard platform.
- `api.<domain>`, `ai.<domain>` → services.

The public site is a genuinely separate deliverable from the platform, and should be built as
one — a small static site that a non-technical NGO staffer can update (Astro + a Git-based CMS
like Decap, or plain Next.js static export). Do not build it as another page inside the Next.js
app; coupling the NGO's public presence to the platform's uptime is a bad trade.

**Before going public, non-negotiable:** privacy policy and terms of service. You collect email,
phone, precise home-adjacent geolocation, and photographs. India's **DPDP Act 2023** applies:
you need stated purpose, consent, a retention policy, and a deletion mechanism. There is
currently no account-deletion flow in the codebase. Add one. If the NGO accepts donations
through the site, that brings 80G/12A receipting and payment-gateway KYC — out of scope for the
platform but it must be in the conversation before you promise a donation button.

---

### Phase 6 — Handover

The technical work is only half of a handover. The other half is making sure the project
survives you.

- **`docs/RUNBOOK.md`** — how to restore a backup, rotate a key, roll back a deploy, read the
  logs, add an NGO manually, unban a user. Written for someone who has never seen the code.
- **`docs/ARCHITECTURE.md`** — one diagram, the data model, and *why* each decision was made.
  The "why" is what you will not be around to explain.
- **`docs/MIGRATIONS.md`** — the canonical ordered migration list (Phase 0, item 2).
- **Credential handover** — a shared password manager owned by the NGO. Not a spreadsheet, not
  WhatsApp.
- **Named owners** for the domain, the Supabase org, the Vercel team, and the GitHub repository,
  with at least two people on each.
- **A support expectation in writing** — what you will maintain, for how long, and what happens
  after. Especially important given this becomes a paid engagement.
- **An `ADRs/` directory going forward** so the next set of decisions records its own reasoning.

---

## PART C — Suggested sequencing

| Priority | Work | Effort | Why now |
| :--- | :--- | :--- | :--- |
| **P0** | Restore Supabase, rotate secrets, document migration order | 1 wk | Nothing works until this is done |
| **P0** | Remove silent AI mock fallbacks (A4); fix fail-open API key (A5) | 2 days | Safety, and it costs almost nothing |
| **P0** | Fix `organs` hardcoding in PlantNet call | 1 hour | Free accuracy improvement |
| **P1** | Map: geolocation, EWKB parsing, bbox queries, clustering, pin-drop UX | 2 wks | Your stated pain, and the NGO's core mission |
| **P1** | Delete the `supabaseAdmin` Proxy, audit 19 call sites | 1 wk | Security correctness |
| **P1** | Test suite on auth/RLS/adoption + CI gate before deploy | 2 wks | Prerequisite for anyone else touching this |
| **P2** | Observability, backups, health alerts | 3 days | Know about failure before the NGO does |
| **P2** | Drop embeddings to 1536 dims + HNSW index; re-embed | 3 days | Do it before the corpus grows |
| **P2** | Disease + remedy knowledge base (Phase 4b) | 4 wks | High value, low risk, uses existing infra |
| **P3** | Production migration, domain, NGO public website | 3 wks | The paid deliverable |
| **P3** | Local plant-ID model (Phase 3) | 6–8 wks | The ambitious piece; gate on data pipeline |
| **P4** | Image-based disease classifier (Phase 4a) | 6–10 wks | Gated on collecting your own field dataset |

---

## PART D — Three things worth saying plainly

**1. The foundation is better than you think.** You described the structure as "very bad". It
isn't. The data model, the RLS policies, the service separation, the hybrid RRF search, the
PostGIS usage — these are deliberate, defensible choices. What is weak is the operational
layer: no tests, no CI gate, no observability, no backups, undocumented migrations, and silent
fallbacks that hide failure. That is a normal place for a student project to be, and it is
fixable in weeks, not months.

**2. The silent fallbacks are the thing to fix first.** They were added so demos never break.
That instinct is understandable and it is exactly backwards for production. A system that fails
visibly is trustworthy; a system that fabricates a 94.5%-confidence answer is not. Once real
adopters are acting on plant-health advice, that distinction stops being philosophical.

**3. Scope the AI ambition honestly.** "Train PlantNet locally so it identifies every plant
accurately" is not achievable — PlantNet itself does not achieve it, with vastly more data.
"Beat PlantNet on the 200 species this NGO actually plants, using our own photos, and fall back
to the API otherwise" **is** achievable, is more useful to the NGO, and is a far stronger story
in a report or a pitch. Same for disease: the remedy knowledge base (4b) delivers most of the
value at a fraction of the risk, and the image classifier is gated on a dataset that does not
exist yet and that only you can create.

Build the data-collection pipeline early. It is the one asset here that compounds.
