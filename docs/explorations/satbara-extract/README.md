# Satbara Extract — explored, NOT ADOPTED

> [!CAUTION]
> **Do not build from this.** This visual direction was explored in September 2026
> and deliberately **not adopted**. The shipped UI in `frontend/src/` is the one we
> are enhancing. `DESIGN.md` at the repository root documents that shipped system
> and is the only visual authority.
>
> Nothing in this folder supersedes anything. It is kept as reference, not as a plan.

## What this was

A replacement visual world based on the Maharashtra 7/12 land record
(*सातबारा उतारा*) — the document that answers *who is responsible for this land,
and what is growing on it*. The idea was to reissue that document for a single
tree: printed ruled columns, a named responsible party as the largest element on
a record, a violet endorsement stamp, and condition entries accumulating downward
the way cultivation entries do on a real extract.

`prototype.html` is a working eight-screen wireframe. It holds real state — you
can adopt a tree, file a condition entry, and approve an application, and the
counts move. Open it in a browser; screens are hash-routed
(`#found #near #rec #file #map #ngo #reg #apps`).

## Why it was not adopted

A timing decision, not a quality one. Converting the whole application to a new
visual system is weeks of work, and at the time of the decision Phase 0 was two
issues of thirteen complete, the database was unreachable, and secrets were
unrotated. Enhancing the existing UI is cheaper, lower-risk, and does not block
the handover.

## What came out of it that we ARE using

The UX findings below are **independent of any visual direction** and apply to the
existing UI exactly as much as they did to this one. They are filed as issues
against the shipped app:

- The NGO plant form asks a volunteer to type raw decimal latitude and longitude
  into two required number inputs. Nobody standing in a field does that correctly.
- Distance is not the primary sort on discovery, though proximity is the entire
  product mechanism — an adopter 40 km away waters nothing.
- Adopters and NGO staff share one dashboard that serves neither well.
- Plant health is carried by colour alone, which fails in direct sun and for
  colourblind users. It should be named, ordered words first.
- A plant with no growth reports has no empty state.
- Touch targets, focus management, and screen-reader announcements need a pass
  for one-handed outdoor use.

`PRODUCT.md` also came out of this work and remains current — product truth does
not depend on how the interface looks.

## Contents

| File | |
| :--- | :--- |
| `prototype.html` | The interactive wireframe, eight screens, self-contained |
| `screens/` | Captures of every screen at desktop and mobile |
| `direction-contract.md` | The written direction this was built against |
