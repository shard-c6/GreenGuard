# Production Plan — Hosting, Domain, Costs, and the AI Stack

**Prepared:** 2026-09-16
**Audience:** team + NGO, for budget approval
**Status:** proposal

Prices marked ✅ were verified against the vendor's pricing page on 2026-09-16.
Prices marked ≈ are close estimates — confirm before committing.
All INR figures use ₹88 ≈ $1.

---

## 1. Training our own plant identification model

You asked whether we can replace the PlantNet API with a model we train ourselves, covering "every plant PlantNet has", done in batches since time is not the constraint.

Two parts to that, and they have very different answers.

### The scope has to shrink, and here is the honest reason

PlantNet's production API covers roughly **45,000–50,000 species**, trained on tens of millions of images with continuous human-in-the-loop correction from their user base.

**That training data is not public.** What is public is **PlantNet-300K**: 306,146 images across **1,081 species**, about 31 GB. That is the realistic ceiling for anything we train from public PlantNet data — 1,081 species, not 50,000.

So "every plant PlantNet has" is not achievable, not because of time or skill, but because the data does not exist outside their organisation. Anyone claiming otherwise is describing a different dataset.

### What *is* achievable, and is genuinely valuable

> A model that is **excellent on the few hundred species this NGO actually plants**, with PlantNet API as fallback whenever local confidence is low.

This is better than it sounds. We can deliberately overfit to Indian species in a way a global model never will, and our growth-report feature already collects **time-series photos of known plants with known labels** — a proprietary dataset nobody else has. That is the real long-term asset.

### Doing it in batches — the part that needs a design decision

Naive batching does not work. If you fine-tune on species batch 1, then batch 2, the model **catastrophically forgets** batch 1. This is the single most common way this plan fails.

Two workable approaches:

**Option A — Embedding + nearest-neighbour classifier (recommended to start)**

Use a strong pretrained vision backbone (DINOv2 ViT-B) purely as a frozen feature extractor. Compute an embedding per image once, then classify by nearest-neighbour or a lightweight linear head over those embeddings.

- **Adding a species is genuinely incremental** — compute embeddings for the new images, add them to the index. No retraining, no forgetting.
- Works well with few images per species, which matters for rare Indian natives.
- Ships fastest, and is the honest answer to "can we do this in batches" — yes, *this* way.

**Option B — Periodic full fine-tune**

Fine-tune ConvNeXt-Tiny or EfficientNetV2-S on the full accumulated set, retraining from the pretrained backbone each time rather than incrementally. Higher ceiling accuracy, but each addition costs a full run.

Start with A, move to B once the species list stabilises.

### Cost — lower than you would expect

| Item | Estimate |
| :--- | :--- |
| Dataset storage (PlantNet-300K, 31 GB) | Local disk, free |
| One full fine-tune run (~10 GPU-hours on a rented A10G) | ≈ $10–30 (₹900–2,600) |
| Realistic experimentation budget (5–10 runs) | ≈ $100–300 (₹9,000–26,000) |
| **Production serving** | **$0 extra — CPU is enough** |

That last row matters. A fine-tuned ConvNeXt-Tiny exported to ONNX runs at roughly 200–500 ms per image on CPU. **We do not need a GPU in production**, only for training. Rent GPU by the hour (Kaggle gives 30 free GPU-hours/week; RunPod, Lambda and Vast are ≈$0.30–0.80/hr) rather than buying capacity.

### Expectation setting

Published baselines on PlantNet-300K land around **60–80% top-1**, because it is deliberately long-tailed and ambiguous. Report **per-class macro accuracy**, not top-1 — top-1 flatters you by rewarding the common species you already had covered.

Also build in **refusal**: the model must be able to say "I don't know" and defer to PlantNet. For a platform that gives medicinal-plant guidance, a confident wrong identification is far worse than an abstention.

Tracked in #222, #223, #224.

---

## 2. Custom domain — yes, and it is cheap

Straightforward. Both the NGO site and the platform can sit on a real domain with no vendor branding.

### Structure

| Host | Purpose |
| :--- | :--- |
| `www.greenguard.org.in` | NGO public website |
| `app.greenguard.org.in` | GreenGuard platform |
| `api.greenguard.org.in` | Backend API |
| `ai.greenguard.org.in` | AI consultant service |

One domain covers all of it — subdomains are free. No need to buy several.

### Cost

| TLD | Approx. annual | Notes |
| :--- | ---: | :--- |
| `.org.in` | ≈ ₹700–900 | India-specific, cheapest, well-suited to an Indian NGO |
| `.org` | ≈ ₹1,200–1,500 | The international nonprofit convention |
| `.ngo` | ≈ ₹3,500–4,500 | Requires validation; signals nonprofit status strongly |
| `.com` | ≈ ₹1,000–1,300 | Only if you want commercial framing |

**Recommendation:** register `.org.in` *and* `.org`, point one at the other. Under ₹2,500/year total, and it stops someone else taking the name later.

### Two things that are not optional

1. **Register it to the NGO as legal owner**, not to a student's personal account. Put at least two people on the registrar account with recovery access. Domains silently expiring after the one person who owned the account graduated is among the most common ways small nonprofit sites die.
2. **Auto-renew on, 2–3 years paid up front, WHOIS privacy on.**

---

## 3. Production hosting — what works, and what does not

### ⚠️ Hugging Face Spaces: stop using it for production

You asked directly, so directly: **no, HF Spaces is not suitable**, and it is also not the cheap option people assume.

Verified on their pricing docs ✅:
- Free CPU Basic Spaces **suspend after ~48 hours of inactivity**
- **Creating a Docker Space on compute now requires a paid HF plan** — free Docker Spaces are no longer a thing
- Keeping a Space always-on means CPU Upgrade at **$0.03/hour = ≈$21.60/month per Space**

Two services = **≈$43/month**, for a platform with no SLA, designed for ML demos, with no straightforward custom-domain story for an API. **We would be paying more than a proper host for something worse.**

### Recommended topology

| Component | Host | Monthly |
| :--- | :--- | ---: |
| NGO website (static) | **Cloudflare Pages** | **$0** ✅ |
| GreenGuard app (Next.js) | Vercel Pro — see warning below | $20 ✅ |
| Backend API (Node) | Render / Railway / Fly.io | ≈$7 |
| AI consultant (Node) | Render / Railway / Fly.io | ≈$7 |
| Database | **Supabase Pro** | **$25** ✅ |
| Redis cache | Upstash free tier | $0 |
| Object storage | Supabase Storage (included) | $0 |
| Map tiles | MapTiler free tier | $0 |
| **Total** | | **≈$59/mo ≈ ₹5,200** |

**Annual: ≈ ₹62,000.** Present it to the NGO as a yearly line item — nonprofits can usually budget an annual number far more easily than a recurring card charge.

### ⚠️ Vercel Hobby is not licensed for this

Verified ✅ — Vercel state plainly: *"Our Hobby plan is for personal, non-commercial use."*

An NGO platform is an organisation's site, not a personal project, and if it ever takes donations the question is settled. Two honest options:

- **Vercel Pro** — $20/mo, keeps everything as-is, zero migration work
- **Cloudflare Pages** — free tier permits commercial use, supports Next.js, and would take both the NGO site and the app to **$0**. Costs a migration effort.

Given the budget, I would put the **NGO marketing site on Cloudflare Pages regardless** (it is static, so this is easy), and decide Vercel Pro vs migrating the app separately.

### Supabase must go Pro

Verified ✅:

| | Free | Pro |
| :--- | :--- | :--- |
| Pauses on inactivity | **Yes, after 1 week** | No |
| Backups | **None** | Daily, 7-day retention |
| Database size | 500 MB | 8 GB |
| Active projects | 2 max | — |

The $25 is not optional. **The free tier's 1-week pause is the exact thing that killed this platform** and started this whole recovery. Pro also brings backups, which we currently do not have at all.

### The cheaper alternative, stated fairly

A single **₹800/month VPS** (Hetzner, DigitalOcean) running everything under Docker Compose is roughly a third of the cost. But you own the backups, the TLS renewal, the OS patching, and the 2 a.m. outage.

**For a handover to an NGO, managed services are worth the premium** — whoever inherits this will not be a systems administrator. That is the whole argument, and it is the right one here.

### Free money worth chasing

- **Google for Nonprofits** — includes Google Cloud credits, and the NGO likely qualifies
- **GitHub Education** — you are students; free Copilot and credits
- **Cloudflare Project Galileo** — free services for nonprofits
- **DigitalOcean / AWS nonprofit credit programmes**

Realistically these could cover the first year outright. Worth an afternoon of applications before paying anything.

---

## 4. Gemini API keys in production

You are right that the current setup will not hold. Here is the precise problem and the fix.

### What is actually wrong

Google AI Studio keys do not technically expire, but the **free tier is explicitly not for production**: aggressive rate limits, no SLA, no quota guarantees, and the key is bound to a personal Google account. When that account changes hands — which it will, at handover — the platform breaks.

### The fix: Vertex AI with a service account

| | AI Studio key (now) | **Vertex AI (recommended)** |
| :--- | :--- | :--- |
| Credential | String bound to a personal account | Service account, IAM-managed |
| Ownership | An individual | The NGO's GCP project |
| Rotation | Manual, breaks things | Standard IAM key rotation |
| Quotas | Fixed free-tier limits | Requestable, with billing |
| SLA | None | Yes |
| Survives handover | **No** | **Yes** |

This is the single most important property: **a service account belongs to the organisation, not a person.** Everything else follows from that.

### Alongside it

- **Secret manager** — GCP Secret Manager or the host's secret store. Never `.env` in production.
- **Billing alerts** — hard budget cap. An autonomous agent or a loop bug should not be able to run up an unbounded bill.
- **Cache aggressively** — Redis is already wired in. Identical plant queries should never hit Gemini twice.
- **Circuit breaker** — on repeated failures, stop calling and serve a clear "AI temporarily unavailable" state. This is exactly what #193 is about: fail loudly, never fabricate.
- **A second provider behind an interface** — so one vendor outage is a config change, not a rewrite.

Tracked in #196 (rotation) and #194 (fail-closed).

---

## 5. Renaming Flora Genius

You want an older Marathi name. Some candidates, with meanings:

| Name | Devanagari | Meaning | Fit |
| :--- | :--- | :--- | :--- |
| **Vruksha Vaidya** | वृक्ष वैद्य | "Tree physician" — *vaidya* is the traditional healer | Strongest fit. Directly describes diagnosis + remedy, which is exactly where the product is heading in Phase 4. |
| **Kalpataru** | कल्पतरू | The mythological wish-granting tree | Beautiful and memorable; evokes giving and abundance. Slightly grand for a diagnostic tool. |
| **Vanaspati** | वनस्पती | Plant / flora | Accurate but generic — it is the everyday word. |
| **Vanashri** | वनश्री | "Splendour of the forest" | Lyrical, better suited to the NGO's name than to a diagnostic assistant. |
| **Palvi** | पालवी | Tender new foliage | Warm and gentle; fits an adoption-and-growth product well. |

**My pick: Vruksha Vaidya** — it says what the thing does, it is rooted in a real tradition of plant and medicinal knowledge, and it will age well as disease diagnosis becomes the core feature.

⚠️ I am not a native Marathi speaker. **Check pronunciation, connotation and any regional baggage with the professor and local speakers before committing** — especially since this becomes a public-facing brand.

---

## Summary of what to spend

| Item | Annual |
| :--- | ---: |
| Domain (`.org.in` + `.org`) | ≈ ₹2,500 |
| Hosting (≈$59/mo) | ≈ ₹62,000 |
| ML training experiments (one-off) | ≈ ₹9,000–26,000 |
| Gemini/Vertex usage (low volume, with caching) | ≈ ₹5,000–15,000 |
| **Year one total** | **≈ ₹80,000–105,000** |

Apply for nonprofit credits first — that could cut it substantially.

**Nothing here should be spent until Phase 0 and Phase 2 are done.** Paying to host a platform that fabricates plant advice and has no tests, no backups and unrotated public keys would be spending money to make the problem more visible.
