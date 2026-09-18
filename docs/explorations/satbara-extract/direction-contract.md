---
version: 1
slug: "frontend-src-app"
primary_target: "frontend/src/app"
related_targets: []
---

# Surface brief — GreenGuard app + FUTUREGREENWORLD FOUNDATION site

## Scope and mode

Two surfaces, one visual world.
- **GreenGuard app** (`frontend/src/app/**`) — Operate. Adopters and NGO staff, role-separated.
- **Foundation website** (new, `www` host) — Persuade. Donors, volunteers, the public.

## Audience, job, task

Adopter: find a plant near me, commit to it, report on it over months. Phone, outdoors, one hand, bright sun, poor signal.
NGO staff: register plants in the field, review adoption applications, track survival. Daily work during drive periods.
Foundation visitor: understand what the Foundation does and decide to volunteer, donate, or adopt.

## Constraints

Next.js 16 / React 19 / Tailwind 4, Leaflet, Supabase. Bilingual (Devanagari + Latin) must not break layout. Outdoor legibility is a hard requirement, not a preference. No real users, no real survival data — every figure is synthetic and must be labelled.

## Direction contract

**THESIS.** One tree, one named person, one record of whether it lived. This surface is a public register of responsibility, not a feed. It refuses the category default — the soft-green gradient hero, the rounded impact-stat tiles, the photograph of hands holding a sapling — because those arrangements make the tree the subject and the person anonymous. Here the responsible party is printed in a column with their name in it.

**OWN-WORLD.** The Maharashtra 7/12 land extract. Security-tint form ground (#EEF1E6) under deep revenue-green rules and headers (#1F4D2E); stamp-violet (#4A2C6B) for endorsements and state; serial red (#B3261E) for record numbers and alerts; ink black (#14180F) for content. Structure is ruled columns with their names printed at the head, never inferred from position. Rules are hairline and unrounded; nothing has a soft shadow. Endorsements are stamped, set at a slight rotation, in violet. Every record carries a serial. Type is Noto Sans Devanagari across both scripts with tabular numerals throughout, chosen because bilingual Marathi/Hindi rendering is a product requirement. Recognizable with all content removed by: printed column headers, hairline rules, a serial in red at top-left, and a violet stamp.

**STORY.** The visitor understands that a specific tree at a specific place is now a specific person's responsibility, and that the platform records whether it survived. They believe it because the record looks like the document their family already trusts for land. They act by claiming a plant near them, or by filing the next condition entry.

**FIRST VIEWPORT.** App, plant record: serial number top-left in red at 13px tabular caps; beneath it the extract block fills the viewport — a hairline-ruled table whose four column heads print LOCATION / PLANTED / RESPONSIBLE · कब्जेदार / CONDITION in 11px revenue-green caps. The responsible column holds the adopter's name at 20px, the largest text on screen. A violet ADOPTED stamp sits rotated -4deg over the block's lower right with its date. The primary action — File condition entry — is a full-width revenue-green bar pinned at the thumb, not floating. Map and feed are secondary, reached from a printed index, never a tab bar of icons.

**FORM.** The Satbara Extract; candidate 3 of 7 on my ordered grounded list (herbarium sheet ranked first and is the category rut); seed key b4de4051, direction scope, operate mode, assigned card.

**FINISH.** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

AI consultant name (Marathi, undecided — #258). Whether the Foundation site and app share one nav or stay fully separate.
