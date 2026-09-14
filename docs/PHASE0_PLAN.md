# Phase 0 — Revive & Stabilise: Implementation Plan

**Status:** proposed, not yet executed
**Prereq for:** every other phase
**Estimated:** 5–7 working days

---

## Decisions locked before planning

| Question | Answer | Consequence |
| :--- | :--- | :--- |
| Data in the paused DB | **All test data** | We may rebuild the database clean — but only *after* capturing its schema (see S1) |
| Docker available | **Yes** (installed, daemon stopped) | Full local Supabase stack; migrations get tested before they touch hosted |
| Phase 0 scope | **Revival + the three P0 safety fixes** | Steps S7–S9 included |

**Target project:** `eopmwvdmgzxoaxqqfsdq` — "GreenGuard", `ap-south-1`, Postgres 17.6.1.084, created 2026-03-14, status `INACTIVE` (paused, recoverable).

### Detected local toolchain

| Tool | State | Action |
| :--- | :--- | :--- |
| Node | v26.4.0 | Pin via `.nvmrc` + `engines` (S10) |
| Docker | 29.4.1, **daemon stopped** | Start Docker Desktop |
| Supabase CLI | **not installed** | `brew install supabase/tap/supabase` |
| psql / pg_dump | 18.4 | Fine — newer client, older server is supported |
| gh | 2.100.0 | Used in S9 |

---

## The core problem Phase 0 solves

The repository's SQL files are **not** the schema. The real schema is the paused database, and it
differs from the repo in at least five known ways:

1. **`plant_knowledge` is created by no migration.** `hybrid_search_migration.sql:10` alters a
   table that nothing in the repo creates.
2. **The `vector` extension is enabled by no migration.** Only `postgis` and `pg_trgm` are.
3. **Storage buckets `plant-images`, `post-images`, `report-images` are created by no code.**
   Only the AI-scan bucket self-creates via `ensureAiScanBucket()`.
4. **`migration.sql` is not re-runnable.** 41 of 45 `CREATE POLICY` statements have no preceding
   `DROP POLICY IF EXISTS`, and Postgres `CREATE POLICY` has no `IF NOT EXISTS`. Re-running against
   a populated database aborts with `42710` partway through, leaving it half-migrated. The
   `IF NOT EXISTS` on the tables makes this *look* safe when it isn't.
5. **`posts_geo_migration.sql` is now entirely redundant** — every column and index it adds
   (`post_type`, `latitude`, `longitude`, `location`, `address`, both indexes) is already in
   `migration.sql`'s `posts` definition. It was a hotfix that was later folded into the base
   schema, and never deleted. `plants_geo_migration.sql` is *not* redundant — `migration.sql`'s
   `plants` table still lacks `latitude`/`longitude`.

Restoring the project is therefore not merely data recovery. **It is the only surviving copy of
the true schema**, and capturing it is the single irreplaceable step in this phase. Everything
else can be redone; this cannot.

---

## Step-by-step

### S0 — Prerequisites (30 min)

```bash
brew install supabase/tap/supabase
open -a Docker            # then wait for the daemon
docker info >/dev/null && echo "daemon up"
```

Free-tier note: all six of your Supabase projects are paused and the free tier permits **two
active**. Confirm the other five stay paused, or the restore will be refused.

---

### S1 — Restore and capture ground truth (half day) ⚠️ **irreplaceable**

Do not skip, reorder, or shortcut this. Nothing here is recoverable if the project is later purged.

1. Restore `eopmwvdmgzxoaxqqfsdq` from the Supabase dashboard. Wait for `ACTIVE_HEALTHY`.
2. Immediately capture everything, before any write:

```bash
mkdir -p docs/schema-snapshot && cd docs/schema-snapshot
supabase link --project-ref eopmwvdmgzxoaxqqfsdq

supabase db dump --schema public          -f 01_public_schema.sql   # DDL
supabase db dump --schema public --data-only -f 02_public_data.sql  # rows (audit trail)
supabase db dump --schema auth,storage    -f 03_auth_storage.sql
```

3. Record what cannot be dumped — extensions, buckets, and RLS as actually applied:

```sql
select extname, extversion from pg_extension order by 1;
select id, name, public, file_size_limit, allowed_mime_types from storage.buckets;
select tablename, policyname, cmd, qual, with_check
  from pg_policies where schemaname='public' order by tablename, policyname;
select table_name, column_name, data_type, udt_name
  from information_schema.columns
  where table_schema='public' and table_name='plant_knowledge' order by ordinal_position;
select count(*) from plant_knowledge;
select relname, n_live_tup from pg_stat_user_tables order by n_live_tup desc;
```

4. **Commit the snapshot to git.** This is the artifact that de-risks the whole project.
5. Report the row counts back before anything destructive — "all test data" should be *verified*,
   not assumed, and the `plant_knowledge` count tells us whether re-ingestion is even needed.

**Exit:** `docs/schema-snapshot/` committed; `plant_knowledge`'s real definition known.

---

### S2 — Author the true migration set (1–1.5 days)

Reconcile the snapshot against the repo SQL and produce one ordered, idempotent, replayable set.
Proposed `supabase/migrations/` layout — the **first correct statement of build order**, which has
until now existed only in your head:

| # | File | Contents | Depends on |
| :-- | :--- | :--- | :--- |
| 01 | `..._extensions.sql` | `postgis`, `pg_trgm`, **`vector`** ← currently missing | — |
| 02 | `..._core_schema.sql` | From `migration.sql`: profiles, ngo_profiles, plants, adoptions, growth_reports, posts, likes, bookmarks, follows, notifications + indexes | 01 |
| 03 | `..._core_policies.sql` | All 32 policies, each preceded by `DROP POLICY IF EXISTS` | 02 |
| 04 | `..._auth_trigger.sql` | `handle_new_user()` + `on_auth_user_created` (already idempotent) | 02 |
| 05 | `..._plants_geo.sql` | `latitude`/`longitude` on plants + backfill | 02 |
| 06 | `..._comments.sql` | comments table, counters, 3 policies | 02 |
| 07 | `..._user_reports.sql` | user_reports + 2 policies | 02 |
| 08 | `..._user_plants.sql` | From `add_notification_fields.sql` | 02 |
| 09 | `..._saved_plants.sql` | saved_plants + 4 policies | 02 |
| 10 | `..._plant_knowledge.sql` | **NEW — authored from the S1 snapshot** | 01 |
| 11 | `..._hybrid_search.sql` | `fts` column, GIN index, `hybrid_plant_search()` | 10 |
| 12 | `..._storage_buckets.sql` | The three buckets + their RLS, as code | 01 |

Rules applied throughout:
- Every `CREATE POLICY` gets `DROP POLICY IF EXISTS` above it. Fixes defect #4.
- **Delete `posts_geo_migration.sql`** — provably redundant (defect #5). Note the deletion in the
  commit message so the reasoning survives.
- `migration.sql` and friends move to `backend/supabase/_legacy/` with a README pointing here.
  Do not delete them; they are the provenance for the reconciliation.

#### Decision point — embedding dimensions

`hybrid_search_migration.sql` declares `VECTOR(3072)`. pgvector's HNSW and IVFFlat indexes cap at
**2000 dimensions**, so no ANN index exists or can exist, and every semantic search is a sequential
scan.

Because you've chosen to rebuild clean, `plant_knowledge` gets re-ingested and **re-embedded
anyway** — the API spend is identical either way. That makes this the one moment where the fix is
free. I intend to author file 10 as `VECTOR(1536)` and add an HNSW index in file 11:

```sql
CREATE INDEX idx_plant_knowledge_embedding ON plant_knowledge
  USING hnsw (embedding vector_cosine_ops);
```

`gemini-embedding-001` supports Matryoshka truncation via `outputDimensionality`, so 1536 costs
very little retrieval quality. Requires changing `outputDimensionality: 3072 → 1536` in
`gemini.service.js` and `scripts/ingest_json.js`, and the RPC signature in file 11.

**Deferring this means paying the full re-embedding cost twice.** Say so if you'd rather not.

**Exit:** `supabase/migrations/` complete and ordered; `docs/MIGRATIONS.md` explains the order.

---

### S3 — Prove it from zero, locally (half day)

This is what Docker buys us, and it is the step that makes the migrations trustworthy.

```bash
supabase init
supabase start                 # local Postgres w/ postgis + pgvector
supabase db reset              # drop, replay every migration from empty
```

`db reset` replays from nothing, so it proves the set is complete and correctly ordered. Repeat it
until clean. Then run it **twice in a row** against the same database to prove idempotency — that
is the specific defect (#4) that would otherwise resurface.

Then verify against the S1 snapshot — the local schema should match the restored one, modulo our
deliberate changes (vector dims, added extension, buckets-as-code). Any *other* difference is drift
we failed to capture, and is a bug in S2.

**Exit:** `supabase db reset` is clean and repeatable; local schema reconciles with the snapshot.

---

### S4 — Rebuild the hosted database (half day)

Only after S3 passes.

```bash
supabase db reset --linked      # destructive; S1 snapshot is the safety net
```

Then re-seed:
```bash
node backend/scripts/seed-admin.js        # first admin
node backend/scripts/seed-test-data.js    # sample NGO/plants/posts
node flora-genius-consultant/scripts/ingest_json.js   # RAG corpus — needs GEMINI_API_KEY
```

Note `ingest_json.js` has the same silent mock-embedding fallback as the runtime service. **Fix it
in S7 before running it**, or you will populate the corpus with meaningless `Math.sin()` vectors
and the RAG will retrieve nonsense while appearing to work.

**Exit:** hosted DB rebuilt from versioned migrations; `/api/health` returns 200.

---

### S5 — Storage buckets as code (2 hours)

Fold the three hand-made buckets into migration 12 with explicit size limits, MIME allow-lists and
RLS. Then delete `ensureAiScanBucket()`'s runtime creation — bucket provisioning belongs in
migrations, not in a request path.

---

### S6 — Rotate every secret (half day) — *you execute, I prepare*

I can prepare the runbook, the `.env.example` files, and every code change. **I will not handle the
credential values themselves** — you rotate them in each dashboard and paste them into the
environment stores directly.

| Secret | Where | Why now |
| :--- | :--- | :--- |
| Supabase anon + service role | Supabase dashboard | Exposed across 3 deploy targets + CI |
| `gg_secret_consultant_key_2026` | HF Space + Vercel | **Hardcoded in git history — treat as public** |
| `GEMINI_API_KEY` | Google AI Studio | Rotate on principle |
| `PLANTNET_API_KEY` | PlantNet | Rotate on principle |
| `HF_TOKEN` | GitHub Actions secret | Has push access to production |

Consumers to update: GitHub Actions secrets, both HF Space secret panels, Vercel env vars, local `.env`.

---

### S7 — P0 Fix 1: no more silent fabrication (1 day)

The highest-value change in this phase. Four call sites currently invent data:

| File | Behaviour today |
| :--- | :--- |
| `plantnet.service.js:10` | No key → returns "Holy Basil, 94.5% confidence" for **every** image |
| `gemini.service.js:120` | API error → returns fabricated treatment advice under "Medical Profile" |
| `gemini.service.js:18` | Embedding error → returns a meaningless `Math.sin()` vector |
| `scripts/ingest_json.js:62` | Same mock vector, written **permanently into the corpus** |

Sketch:

```js
// src/errors.js
class AiUnavailableError extends Error {
  constructor(service, cause) {
    super(`${service} is unavailable`);
    this.code = 'AI_UNAVAILABLE';
    this.status = 503;
    this.service = service;
    this.cause = cause;
  }
}
```

- Each fallback becomes `throw new AiUnavailableError('plantnet', err)`.
- Error handler maps `status` → HTTP 503 with `{ success:false, error:{ code:'AI_UNAVAILABLE' } }`.
- Demo behaviour survives, but only behind `DEMO_MODE=true` **and** every demo response carries
  `"simulated": true` in the payload, which the UI renders as an unmissable banner — not an italic
  footnote at the bottom.
- `ingest_json.js` gets no demo path at all. It must **abort the run** rather than poison the corpus.
- Frontend: `identify/page.tsx` and `flora-genius-consultant/page.tsx` handle 503 with a clear
  "AI consultant is temporarily offline" state.

---

### S8 — P0 Fix 2: fail closed, and drop the hardcoded key (2 hours)

```js
// apiKey.middleware.js — today the prod check only silences the log; next() still runs
if (!expectedApiKey) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: FLORA_CONSULTANT_API_KEY unset in production');  // at boot
  }
  console.warn('...dev bypass...');
  return next();
}
```

Validate at startup, not per-request, so a missing secret fails the deploy instead of silently
opening your Gemini and PlantNet billing to the internet.

Same pass: delete the `|| 'gg_secret_consultant_key_2026'` fallback in the consultant proxy route
and fail loudly if unset. Use `crypto.timingSafeEqual` for the comparison.

---

### S9 — P0 Fix 3: organ hint + a keep-alive that actually alerts (3 hours)

**Organ.** `plantnet.service.js:41` hardcodes `organs: 'leaf'` for every upload, degrading accuracy
on flower, fruit and bark photos. Accept an `organ` field from the client, default to PlantNet's
`auto`, and add a small organ selector to the upload UI. *(Verify `auto` against current PlantNet v2
docs before relying on it — if unsupported, send one organ per image based on the user's choice.)*

**Keep-alive.** The existing workflow correctly prevents pausing but **cannot reverse it** — a
paused project rejects the ping, so once paused it fails silently forever. That is precisely how we
got here. Add `--fail` to curl, run it **daily** rather than every 3 days, and open a GitHub issue
via `gh` on failure so a dead platform is visible within 24 hours instead of never.

---

### S10 — Environment, reproducibility, documentation (1 day)

- **`.env.example` for all three services.** Only `backend/` has one, and it's already missing
  `REDIS_URL` and `GEMINI_API_KEY`. `frontend/` and `flora-genius-consultant/` have none at all —
  a new developer cannot currently start either service without reading the source. Full var list
  per service is already extracted and ready to write.
- **Pin Node.** No `engines` field or `.nvmrc` anywhere. Local is v26; HF Spaces runs something
  else. Note that `supabase.js`'s `ws` polyfill is dead code on Node ≥22, which has native
  `WebSocket` — harmless, but symptomatic of untracked runtime assumptions.
- **`docs/MIGRATIONS.md`** — the canonical ordered list from S2.
- **Rewrite `docs/GETTING_STARTED.md`** and then *actually verify it*: fresh clone into a temp
  directory, follow it literally, all three services up. Anything requiring knowledge not in the
  doc is a Phase 0 defect, not a note for later.
- **Repo hygiene:** `git rm --cached` the committed build output (`frontend/lint_output.txt`,
  `tsc_output.txt`, `build_output.txt`, `eslint_output.txt`, `lint.json`, `**/__pycache__`) and
  extend `.gitignore`.

---

## Exit criteria

Phase 0 is done when **all** of these hold:

1. `supabase db reset` runs clean from empty, twice in a row, locally and linked.
2. Hosted DB is rebuilt purely from versioned migrations — zero manual dashboard steps remain.
3. `docs/schema-snapshot/` is committed (the irreplaceable artifact).
4. Every secret rotated; no credential or fallback literal anywhere in the source.
5. No code path fabricates AI output outside explicit, clearly-labelled `DEMO_MODE`.
6. The AI service refuses to boot in production without its API key.
7. `.env.example` exists and is complete for all three services.
8. **A fresh clone reaches all-three-services-running in under 30 minutes using only the docs** —
   verified by actually doing it, not by inspection.
9. Keep-alive failure opens a GitHub issue within 24 hours.

---

## Risks

| Risk | Likelihood | Mitigation |
| :--- | :--- | :--- |
| Restore fails / free-tier 2-project cap blocks it | Medium | Confirm others stay paused; if the restore fails, **stop and report** — `plant_knowledge`'s schema must then be reconstructed from `ingest_json.js` inserts, and Phase 0 gets materially longer |
| Snapshot reveals further undocumented objects | **High** | Expected. S2 absorbs them; that is the point of doing S1 first |
| `db reset --linked` destroys something that mattered | Low | S1 snapshot precedes it; S1 step 5 verifies "test data only" before anything destructive |
| Re-ingestion burns Gemini quota | Medium | ~1,000 embedding calls. Do it once, at 1536 dims, after S7 |
| `PlantNet organs: 'auto'` unsupported | Medium | Verify against live docs; fall back to a user-selected organ |

---

## Open items for you

1. **Confirm the 3072 → 1536 embedding change** (S2 decision point). Free now, expensive later.
2. **S6 is yours to execute** — I prepare everything around the rotation; you handle the values.
3. **S1 step 5 is a checkpoint.** I'll report row counts before anything destructive runs, so
   "all test data" is confirmed rather than assumed.
