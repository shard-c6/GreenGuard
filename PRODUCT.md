# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Adopters** — individuals who commit to caring for a specific planted tree near where they live. They are not gardeners or specialists; most adopt one or two plants. They open the platform occasionally: to find a plant near them, to check on the one they adopted, to post a growth update, or to ask what is wrong with it. Phone is the dominant device, often outdoors, standing next to the plant.

**NGO staff and volunteers** — the people running plantation drives. They register plants in the field (frequently on patchy mobile connectivity), review adoption applications, and track which trees are surviving. They use the platform as work, daily during drive periods.

**Platform administrators** — verify NGO organisations before they can list plants, and moderate user reports.

Adopters and NGO staff have genuinely different jobs. Confirmed decision: serve both, cleanly separated by role, rather than compromising a single shared surface.

## Product Purpose

Tree plantation drives plant trees; the hard part is keeping them alive afterwards. GreenGuard connects each planted tree to a specific person living close enough to actually care for it, and then supports that relationship over time — location-based discovery, an adoption commitment, growth reporting, and botanical help when the plant is struggling.

Success is not signups or trees planted. **Success is tree survival**, and adopters who keep reporting months after adopting.

## Positioning

Most environmental platforms stop at the planting event or at a donation. GreenGuard's mechanism is the **adoption relationship**: a named person, matched by geographic proximity, accountable for one identified plant, over time. Proximity is the core constraint — an adopter who lives 40 km away will not water anything.

## Operating Context

- Plantation drives run in **Navi Mumbai (Kharghar)** and **Mumbai**, with the stated ambition to expand across India.
- Plants are registered in the field, outdoors, on mobile, often with poor connectivity.
- Adopters check on plants outdoors, standing in front of them, phone in hand.
- NGOs must be verified before listing plants; onboarding collects registration details including Darpan ID.
- The adoption lifecycle is a state machine: `available` → `pending` (application submitted) → `adopted` or rejected.
- Growth reports capture health status, height, notes and photos over time, producing a per-plant timeline.

## Capabilities and Constraints

**Confirmed capabilities:** role-based auth (admin / ngo / adopter); plant registration with geolocation; geospatial discovery and an interactive map; adoption applications and NGO review; growth reports; a community feed with posts, likes, bookmarks, comments and follows; notifications and care alerts; NGO onboarding and admin verification; user reporting and moderation; plant identification from a photo; an AI botanical consultant answering questions grounded in a curated corpus.

**Technical constraints:** Next.js 16 / React 19 / Tailwind 4 frontend; Express 5 API; Supabase Postgres with PostGIS and pgvector; access enforced by row-level security. Leaflet for mapping. PWA groundwork exists (service worker, manifest, add-to-home-screen prompt), and offline capability matters for field use.

**Terminology:** *adopter*, *NGO*, *plant* (an individual tree, not a species), *growth report*, *plantation* (a drive or its location).

**Explicitly undecided:** the AI consultant is currently named "Flora Genius" and is being renamed to a Marathi name; no final name chosen.

**Maturity:** pre-alpha. Not serving real users. All current data is synthetic test data created by the team.

## Brand Commitments

- **FUTUREGREENWORLD FOUNDATION** is the NGO — the organisation, the legal entity, and the public-facing charity.
- **GreenGuard** is the community platform the Foundation operates. The team intends to formally protect the GreenGuard name as the Foundation's intellectual property.
- These are two distinct brands with two distinct audiences: the Foundation's website addresses donors, volunteers and the public; GreenGuard addresses adopters and NGO staff who have already decided to participate.
- Existing assets: `frontend/public/logo.png`, `frontend/public/leaf-pattern.png`, `frontend/public/leaf-skeleton.png`.
- No confirmed voice guidelines, tagline, or brand book exists yet.

## Evidence on Hand

- **Botanical corpus:** 588 knowledge entries covering 458 unique species, in `flora-genius-consultant/data/`, focused on Indian medicinal and native plants. Ingested and embedded.
- **Screenshots of the current build:** `docs/assets/` (landing page, feed, map, AI consultant).
- **Plantation locations:** Navi Mumbai (Kharghar) and Mumbai are real and confirmed.

**Absences future work must not fabricate:** there are no real adopters, no real plantation counts, no survival-rate data, no testimonials, no press coverage, no partner logos, and no donation figures. Every number and quote on any public-facing surface must be either real or visibly marked as placeholder. The platform has never served a real user.

## Product Principles

1. **Proximity is the product.** Anything that helps someone find and commit to a plant near them outranks anything else. Distance is the primary sort, filter and framing.
2. **Survival over signups.** Design for the adopter's second, fifth and twentieth visit, not the first. The growth timeline is the retention surface, not the feed.
3. **The field is the hard case.** One hand, bright sun, poor signal, standing next to a tree. If a flow only works seated at a laptop, it does not work.
4. **Two jobs, one platform.** Adopter and NGO experiences diverge deliberately. Never average them into a dashboard that serves neither.
5. **Never fabricate botanical certainty.** Identification and plant-health advice must show confidence and admit ignorance. Users act on this advice on living things.

## Accessibility & Inclusion

No formal standard has been adopted yet. Known product-specific needs: outdoor mobile use demands high contrast and large touch targets; the audience is multilingual, with Marathi and Hindi speakers in the Mumbai region, so the interface must tolerate longer translated strings and eventual localisation.
